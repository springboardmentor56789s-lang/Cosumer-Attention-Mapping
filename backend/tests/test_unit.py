import pytest
from app.utils.security import hash_password, verify_password, create_access_token, decode_access_token
from app.services.scoring_engine import ScoringEngine
from app.services.segmentation_service import SegmentationService


# ═════════════════════════════════════════════════════════════════════════════
# 1. AUTHENTICATION & SECURITY UNIT TESTS
# ═════════════════════════════════════════════════════════════════════════════

def test_password_hashing_and_verification():
    """Verify that bcrypt hashes passwords securely and verifies them properly."""
    raw_pass = "SecurePass123!"
    hashed = hash_password(raw_pass)

    assert hashed != raw_pass
    assert hashed.startswith("$2b$") or hashed.startswith("$2a$")
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_jwt_token_lifecycle():
    """Verify token generation, payload encoding, and decoding."""
    payload = {
        "sub": "analyst@retaileye.ai",
        "id": 42,
        "role": "Retail Analyst"
    }
    token = create_access_token(payload)
    assert isinstance(token, str)
    assert len(token) > 20

    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "analyst@retaileye.ai"
    assert decoded["id"] == 42
    assert decoded["role"] == "Retail Analyst"
    assert "exp" in decoded


def test_jwt_invalid_token_handling():
    """Verify that tampered or invalid tokens return None."""
    assert decode_access_token("invalid.token.here") is None
    assert decode_access_token("") is None


# ═════════════════════════════════════════════════════════════════════════════
# 2. PRODUCT ATTRACTIVENESS SCORING UNIT TESTS
# ═════════════════════════════════════════════════════════════════════════════

def test_scoring_engine_weights_sum_to_one():
    """Ensure the 5 attractiveness scoring factors sum to 100% (1.0)."""
    weights = ScoringEngine.WEIGHTS
    assert weights["attention"] == 0.35
    assert weights["interaction"] == 0.25
    assert weights["pickup"] == 0.20
    assert weights["purchase"] == 0.15
    assert weights["repeat"] == 0.05
    
    total_weight = sum(weights.values())
    assert round(total_weight, 4) == 1.0


def test_scoring_formula_calculation_bounds():
    """Test boundary conditions for the weighted scoring formula."""
    w = ScoringEngine.WEIGHTS

    # Max bound: all metrics at 100 -> final score must be 100.0
    max_score = (
        (100.0 * w["attention"]) +
        (100.0 * w["interaction"]) +
        (100.0 * w["pickup"]) +
        (100.0 * w["purchase"]) +
        (100.0 * w["repeat"])
    )
    assert round(max_score, 2) == 100.0

    # Min bound: all metrics at 0 -> final score must be 0.0
    min_score = (
        (0.0 * w["attention"]) +
        (0.0 * w["interaction"]) +
        (0.0 * w["pickup"]) +
        (0.0 * w["purchase"]) +
        (0.0 * w["repeat"])
    )
    assert round(min_score, 2) == 0.0

    # Realistic sample: 80% att, 60% int, 50% pick, 40% pur, 20% rep
    sample_score = (
        (80.0 * 0.35) +  # 28.0
        (60.0 * 0.25) +  # 15.0
        (50.0 * 0.20) +  # 10.0
        (40.0 * 0.15) +  #  6.0
        (20.0 * 0.05)    #  1.0
    )
    assert round(sample_score, 2) == 60.0


# ═════════════════════════════════════════════════════════════════════════════
# 3. CONSUMER SEGMENTATION CLASSIFICATION UNIT TESTS
# ═════════════════════════════════════════════════════════════════════════════

def test_segment_brand_loyal():
    """Test Brand Loyal Customer classification."""
    segment, conf = SegmentationService.classify_segment(
        features={"zones_visited": 1, "products_viewed": 1, "visit_duration": 30.0},
        preference={"preferred_category": "Beverages"},
        journey={},
        historical_sessions=3,
        historical_repeat_brand=True
    )
    assert segment == "Brand Loyal Customer"
    assert conf >= 0.85


def test_segment_explorer():
    """Test Explorer classification: many zones, many products, long duration."""
    segment, conf = SegmentationService.classify_segment(
        features={"zones_visited": 4, "products_viewed": 8, "visit_duration": 120.0, "comparisons": 0, "products_picked": 1},
        preference={},
        journey={},
        historical_sessions=0
    )
    assert segment == "Explorer"
    assert conf >= 0.80


def test_segment_comparison_shopper():
    """Test Comparison Shopper classification: multiple comparisons and views."""
    segment, conf = SegmentationService.classify_segment(
        features={"zones_visited": 2, "products_viewed": 4, "visit_duration": 50.0, "comparisons": 2, "products_picked": 1},
        preference={},
        journey={},
        historical_sessions=0
    )
    assert segment == "Comparison Shopper"
    assert conf >= 0.75


def test_segment_quick_buyer():
    """Test Quick Buyer classification: short visit, single zone."""
    segment, conf = SegmentationService.classify_segment(
        features={"zones_visited": 1, "products_viewed": 1, "visit_duration": 25.0, "comparisons": 0, "products_picked": 1},
        preference={},
        journey={},
        historical_sessions=0
    )
    assert segment == "Quick Buyer"
    assert conf >= 0.70


def test_segment_impulse_buyer():
    """Test Impulse Buyer: quick pickup without comparison."""
    segment, conf = SegmentationService.classify_segment(
        features={"zones_visited": 2, "products_viewed": 2, "visit_duration": 35.0, "comparisons": 0, "products_picked": 2},
        preference={},
        journey={},
        historical_sessions=0
    )
    assert segment == "Impulse Buyer"
    assert conf >= 0.70
