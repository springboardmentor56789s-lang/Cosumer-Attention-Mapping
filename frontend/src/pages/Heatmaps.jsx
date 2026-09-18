
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../styles/Heatmaps.css";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
function Heatmap() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // =========================================================
  // FETCH ANALYTICS
  // =========================================================

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Please login first.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/analytics`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "HEATMAP ANALYTICS RESPONSE:",
        response.data
      );

      if (
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        setAnalytics(response.data[0]);
      } else {
        setAnalytics(null);
      }
    } catch (err) {
      console.error(
        "Heatmap analytics error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load heatmap analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SAFE BASE DATA
  // IMPORTANT:
  // Everything below is calculated BEFORE any early return.
  // This prevents React Hook conditional errors.
  // =========================================================

  const result = analytics?.result || {};

  const tracking = result.tracking || {};

  const video =
    tracking.video_analysis || {};

  const dwell =
    tracking.dwell_analysis || {};

  const entryExit =
    tracking.entry_exit || {};

  const pathTracking =
    tracking.path_tracking || {};

  const gazeAnalysis =
    tracking.gaze_analysis || {};

  const heatmap =
    tracking.heatmap ||
    result.heatmap ||
    analytics?.heatmap;

  const people =
    result.people || {};

  // =========================================================
  // ZONES
  // =========================================================

  const zones = useMemo(() => {
    return (
      result.shelf_zone_analysis?.zones ||
      {}
    );
  }, [result.shelf_zone_analysis]);

  // =========================================================
  // PRODUCTS
  // =========================================================

  const products = useMemo(() => {
    const productPreferences =
      result.product_preferences || {};

    const productAnalysis =
      result.product_analysis ||
      productPreferences ||
      {};

    return Array.isArray(
      productAnalysis.products
    )
      ? productAnalysis.products
      : [];
  }, [
    result.product_analysis,
    result.product_preferences,
  ]);

  // =========================================================
  // RECOMMENDATIONS
  // =========================================================

  const recommendations = useMemo(() => {
    const recommendationEngine =
      result.recommendation_engine || {};

    let data =
      result.recommendations ||
      recommendationEngine.recommendations ||
      result.optimization_recommendations ||
      [];

    if (!Array.isArray(data)) {
      data = [];
    }

    return data;
  }, [
    result.recommendations,
    result.recommendation_engine,
    result.optimization_recommendations,
  ]);

  // =========================================================
  // HELPERS
  // =========================================================

  const formatNumber = (value) => {
    const number = Number(value);

    if (Number.isNaN(number)) {
      return "0";
    }

    return number.toLocaleString();
  };

  const formatSeconds = (value) => {
    const number = Number(value);

    if (Number.isNaN(number)) {
      return "0 sec";
    }

    return `${number.toFixed(2)} sec`;
  };

  const getZoneShoppers = (zoneData) => {
    if (!zoneData) {
      return 0;
    }

    return Number(
      zoneData.unique_shoppers ??
        zoneData.shoppers ??
        zoneData.people_count ??
        zoneData.total_shoppers ??
        zoneData.visitors ??
        0
    );
  };

  const getProductCount = (product) => {
    return Number(
      product?.detections ??
        product?.attention_count ??
        product?.views ??
        product?.count ??
        0
    );
  };

  // =========================================================
  // NUMBERS
  // =========================================================

  const uniquePeople = Number(
    video.unique_people_tracked ??
      Object.keys(people).length ??
      0
  );

  const averageDwell = Number(
    dwell.average_dwell_time_seconds ?? 0
  );

  const maxDwell = Number(
    dwell.max_dwell_time_seconds ?? 0
  );

  const entryCount = Number(
    entryExit.entry_count ?? 0
  );

  const exitCount = Number(
    entryExit.exit_count ?? 0
  );

  // =========================================================
  // SORTED ZONES
  // =========================================================

  const sortedZones = useMemo(() => {
    return Object.entries(zones)
      .map(([name, data]) => ({
        name,
        value: getZoneShoppers(data),
      }))
      .sort(
        (a, b) =>
          b.value - a.value
      );
  }, [zones]);

  const maximumZoneValue = Math.max(
    ...sortedZones.map(
      (zone) => zone.value
    ),
    1
  );

  // =========================================================
  // PRODUCT DATA
  // =========================================================

  const sortedProducts = useMemo(() => {
    return [...products]
      .sort(
        (a, b) =>
          getProductCount(b) -
          getProductCount(a)
      )
      .slice(0, 8);
  }, [products]);

  const maximumProductValue = Math.max(
    ...sortedProducts.map(
      (product) =>
        getProductCount(product)
    ),
    1
  );

  // =========================================================
  // HOTTEST ZONE
  // =========================================================

  const hottestZoneData = useMemo(() => {
    let name = "No zone identified";
    let value = 0;

    Object.entries(zones).forEach(
      ([zoneName, zoneData]) => {
        const shopperCount =
          getZoneShoppers(zoneData);

        if (
          shopperCount >
          value
        ) {
          value = shopperCount;
          name = zoneName;
        }
      }
    );

    return {
      name,
      value,
    };
  }, [zones]);

  const hottestZone =
    hottestZoneData.name;

  const hottestZoneValue =
    hottestZoneData.value;

  // =========================================================
  // CUSTOMER TRAFFIC
  // =========================================================

  const trafficData = useMemo(() => {
    return [
      {
        label: "Entries",
        value: entryCount,
        icon: "↘",
      },
      {
        label: "Active shoppers",
        value: uniquePeople,
        icon: "👥",
      },
      {
        label: "Exits",
        value: exitCount,
        icon: "↗",
      },
    ];
  }, [
    entryCount,
    uniquePeople,
    exitCount,
  ]);

  const maximumTraffic = Math.max(
    ...trafficData.map(
      (item) => item.value
    ),
    1
  );

  // =========================================================
  // ENGAGEMENT SCORE
  // =========================================================

  const engagementScore =
    averageDwell >= 10
      ? 90
      : averageDwell >= 5
      ? 70
      : averageDwell >= 2
      ? 45
      : 25;

  const engagementLevel =
    averageDwell >= 10
      ? "Very High"
      : averageDwell >= 5
      ? "High"
      : averageDwell >= 2
      ? "Moderate"
      : "Low";

  // =========================================================
  // HEATMAP URL
  // =========================================================

  const heatmapUrl = heatmap
    ? String(heatmap).startsWith("http")
      ? heatmap
      : `${API_BASE_URL}${
          String(heatmap).startsWith("/")
            ? ""
            : "/"
        }${heatmap}`
    : null;

  // =========================================================
  // FALLBACK RECOMMENDATIONS
  // =========================================================

  const displayRecommendations =
    useMemo(() => {
      if (recommendations.length > 0) {
        return recommendations;
      }

      return generateFallbackRecommendations({
        uniquePeople,
        averageDwell,
        maxDwell,
        hottestZone,
        hottestZoneValue,
      });
    }, [
      recommendations,
      uniquePeople,
      averageDwell,
      maxDwell,
      hottestZone,
      hottestZoneValue,
    ]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="heatmap-page">
        <div className="heatmap-loading">
          <div className="loading-spinner" />
          <p>
            Loading shopper heatmaps...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="heatmap-page">
        <div className="heatmap-error">
          <div className="error-icon">
            ⚠️
          </div>

          <h2>
            Heatmap Error
          </h2>

          <p>{error}</p>

          <button
            className="heatmap-refresh-btn"
            onClick={fetchAnalytics}
          >
            ↻ Try Again
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // EMPTY
  // =========================================================

  if (!analytics) {
    return (
      <div className="heatmap-page">
        <div className="heatmap-empty">
          <div className="empty-icon">
            🔥
          </div>

          <h2>
            No Heatmap Available
          </h2>

          <p>
            Upload and analyze a video
            to generate shopper heatmap
            visualizations.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="heatmap-page">

      {/* HEADER */}

      <div className="heatmap-header">

        <div>
          <span className="heatmap-page-label">
            RETAIL INTELLIGENCE
          </span>

          <h1>
            Heatmap Intelligence
          </h1>

          <p>
            Visualize store traffic, shelf
            activity, product attention and
            shopper engagement.
          </p>
        </div>

        <button
          className="heatmap-refresh-btn"
          onClick={fetchAnalytics}
        >
          ↻ Refresh
        </button>

      </div>

      {/* VIDEO INFO */}

      <div className="heatmap-info-card">

        <div className="heatmap-info-main">

          <span>
            ANALYZED VIDEO
          </span>

          <h3>
            {analytics.filename ||
              result.filename ||
              "Unknown Video"}
          </h3>

        </div>

        <div className="heatmap-info-stats">

          <div>
            <span>SHOPPERS</span>
            <strong>
              {formatNumber(
                uniquePeople
              )}
            </strong>
          </div>

          <div>
            <span>AVG DWELL</span>
            <strong>
              {formatSeconds(
                averageDwell
              )}
            </strong>
          </div>

          <div>
            <span>ENTRIES</span>
            <strong>
              {formatNumber(
                entryCount
              )}
            </strong>
          </div>

          <div>
            <span>EXITS</span>
            <strong>
              {formatNumber(
                exitCount
              )}
            </strong>
          </div>

        </div>

      </div>

      {/* VISUALIZATION NAVIGATION */}

      <div className="heatmap-visualization-nav">

        <a href="#store-heatmap">
          <span>🔥</span>
          Store Heatmap
        </a>

        <a href="#shelf-heatmap">
          <span>🗄️</span>
          Shelf Heatmap
        </a>

        <a href="#product-heatmap">
          <span>📦</span>
          Product Attention
        </a>

        <a href="#traffic-heatmap">
          <span>👥</span>
          Customer Traffic
        </a>

        <a href="#engagement-heatmap">
          <span>🎯</span>
          Engagement Hotspots
        </a>

      </div>

      {/* =====================================================
          1. STORE HEATMAP
      ====================================================== */}

      <section
        id="store-heatmap"
        className="heatmap-card visualization-card"
      >

        <div className="heatmap-card-header">

          <div>
            <span className="heatmap-section-label">
              VISUALIZATION 01
            </span>

            <h2>
              Store Heatmap
            </h2>

            <p>
              Overall shopper movement and
              activity across the analyzed
              store environment.
            </p>
          </div>

          <div className="visualization-badge">
            STORE
          </div>

        </div>

        {heatmapUrl ? (
          <div className="store-heatmap-viewer">

            <img
              src={heatmapUrl}
              alt="Store shopper heatmap"
              className="store-heatmap-image"
            />

          </div>
        ) : (
          <EmptyVisualization
            icon="🔥"
            title="Store heatmap unavailable"
            text="Analyze a video to generate the store heatmap."
          />
        )}

      </section>

      {/* =====================================================
          2. SHELF HEATMAP
      ====================================================== */}

      <section
        id="shelf-heatmap"
        className="heatmap-card visualization-card"
      >

        <div className="heatmap-card-header">

          <div>
            <span className="heatmap-section-label">
              VISUALIZATION 02
            </span>

            <h2>
              Shelf Heatmap
            </h2>

            <p>
              Shopper activity distributed
              across shelf and store zones.
            </p>
          </div>

          <div className="visualization-badge">
            SHELF
          </div>

        </div>

        {sortedZones.length > 0 ? (

          <div className="shelf-heatmap-layout">

            <div className="shelf-store-grid">

              {sortedZones.map(
                (zone) => {

                  const intensity =
                    zone.value /
                    maximumZoneValue;

                  let level =
                    "shelf-low";

                  if (
                    intensity >= 0.75
                  ) {
                    level =
                      "shelf-hot";
                  } else if (
                    intensity >= 0.45
                  ) {
                    level =
                      "shelf-medium";
                  }

                  return (
                    <div
                      key={zone.name}
                      className={`shelf-zone ${level}`}
                    >

                      <span>
                        {zone.name
                          .replace(
                            /_/g,
                            " "
                          )
                          .toUpperCase()}
                      </span>

                      <strong>
                        {formatNumber(
                          zone.value
                        )}
                      </strong>

                      <small>
                        shopper observations
                      </small>

                      <div className="shelf-zone-glow" />

                    </div>
                  );
                }
              )}

            </div>

            <div className="shelf-ranking">

              <div className="mini-title">
                ZONE ACTIVITY RANKING
              </div>

              {sortedZones.map(
                (zone, index) => {

                  const width =
                    maximumZoneValue > 0
                      ? (
                          zone.value /
                          maximumZoneValue
                        ) *
                        100
                      : 0;

                  return (
                    <div
                      className="ranking-item"
                      key={zone.name}
                    >

                      <div className="ranking-top">

                        <span>
                          <b>
                            {index + 1}
                          </b>

                          {zone.name}
                        </span>

                        <strong>
                          {formatNumber(
                            zone.value
                          )}
                        </strong>

                      </div>

                      <div className="ranking-bar">

                        <div
                          className="ranking-fill"
                          style={{
                            width:
                              `${width}%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </div>

        ) : (

          <EmptyVisualization
            icon="🗄️"
            title="Shelf heatmap unavailable"
            text="Zone analysis data is not available for this video."
          />

        )}

      </section>

      {/* =====================================================
          3. PRODUCT ATTENTION
      ====================================================== */}

      <section
        id="product-heatmap"
        className="heatmap-card visualization-card"
      >

        <div className="heatmap-card-header">

          <div>
            <span className="heatmap-section-label">
              VISUALIZATION 03
            </span>

            <h2>
              Product Attention Heatmap
            </h2>

            <p>
              Products with the highest
              observed detection and shopper
              attention activity.
            </p>
          </div>

          <div className="visualization-badge">
            PRODUCT
          </div>

        </div>

        {sortedProducts.length > 0 ? (

          <div className="product-attention-layout">

            <div className="product-attention-grid">

              {sortedProducts.map(
                (product, index) => {

                  const count =
                    getProductCount(
                      product
                    );

                  const percentage =
                    (
                      count /
                      maximumProductValue
                    ) *
                    100;

                  return (
                    <div
                      className={`product-attention-item ${
                        index === 0
                          ? "product-top"
                          : ""
                      }`}
                      key={
                        product.product ||
                        product.class_name ||
                        index
                      }
                    >

                      <div className="product-attention-icon">
                        {index === 0
                          ? "🔥"
                          : "📦"}
                      </div>

                      <div className="product-attention-content">

                        <div className="product-attention-top">

                          <strong>
                            {product.product ||
                              product.class_name ||
                              "Unknown product"}
                          </strong>

                          <span>
                            {formatNumber(
                              count
                            )}
                          </span>

                        </div>

                        <div className="product-attention-bar">

                          <div
                            className="product-attention-fill"
                            style={{
                              width:
                                `${percentage}%`,
                            }}
                          />

                        </div>

                        <div className="product-attention-meta">

                          <span>
                            Detection activity
                          </span>

                          {product.average_confidence !==
                            undefined && (
                            <span>
                              Confidence:{" "}
                              {(
                                Number(
                                  product.average_confidence
                                ) * 100
                              ).toFixed(1)}
                              %
                            </span>
                          )}

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

            <div className="product-summary-panel">

              <div className="mini-title">
                PRODUCT INSIGHT
              </div>

              <div className="product-summary-icon">
                📦
              </div>

              <span className="summary-label">
                MOST ATTENTION
              </span>

              <h3>
                {sortedProducts[0].product ||
                  sortedProducts[0].class_name ||
                  "Unknown"}
              </h3>

              <p>
                This item has the highest
                observed product detection
                activity in the analyzed video.
              </p>

              <div className="summary-divider" />

              <div className="summary-row">
                <span>
                  Unique products
                </span>

                <strong>
                  {formatNumber(
                    sortedProducts.length
                  )}
                </strong>
              </div>

              <div className="summary-row">
                <span>
                  Total detections
                </span>

                <strong>
                  {formatNumber(
                    sortedProducts.reduce(
                      (
                        total,
                        product
                      ) =>
                        total +
                        getProductCount(
                          product
                        ),
                      0
                    )
                  )}
                </strong>
              </div>

            </div>

          </div>

        ) : (

          <EmptyVisualization
            icon="📦"
            title="Product attention data unavailable"
            text="No product-level detection data was returned by the current analysis."
          />

        )}

      </section>

      {/* =====================================================
          4. CUSTOMER TRAFFIC
      ====================================================== */}

      <section
        id="traffic-heatmap"
        className="heatmap-card visualization-card"
      >

        <div className="heatmap-card-header">

          <div>
            <span className="heatmap-section-label">
              VISUALIZATION 04
            </span>

            <h2>
              Customer Traffic Heatmap
            </h2>

            <p>
              Shopper flow represented through
              entry, active shopper and exit
              activity.
            </p>
          </div>

          <div className="visualization-badge">
            TRAFFIC
          </div>

        </div>

        <div className="traffic-visualization">

          <div className="traffic-flow">

            <TrafficNode
              icon="↘"
              title="Entry"
              value={entryCount}
              percentage={
                maximumTraffic > 0
                  ? (
                      entryCount /
                      maximumTraffic
                    ) *
                    100
                  : 0
              }
            />

            <div className="traffic-arrow">
              →
            </div>

            <TrafficNode
              icon="👥"
              title="Active shoppers"
              value={uniquePeople}
              percentage={
                maximumTraffic > 0
                  ? (
                      uniquePeople /
                      maximumTraffic
                    ) *
                    100
                  : 0
              }
              highlight
            />

            <div className="traffic-arrow">
              →
            </div>

            <TrafficNode
              icon="↗"
              title="Exit"
              value={exitCount}
              percentage={
                maximumTraffic > 0
                  ? (
                      exitCount /
                      maximumTraffic
                    ) *
                    100
                  : 0
              }
            />

          </div>

          <div className="traffic-bars">

            {trafficData.map(
              (item) => {

                const percentage =
                  maximumTraffic > 0
                    ? (
                        item.value /
                        maximumTraffic
                      ) *
                      100
                    : 0;

                return (
                  <div
                    className="traffic-bar-row"
                    key={item.label}
                  >

                    <div className="traffic-bar-label">

                      <span>
                        {item.icon}
                      </span>

                      <strong>
                        {item.label}
                      </strong>

                      <b>
                        {formatNumber(
                          item.value
                        )}
                      </b>

                    </div>

                    <div className="traffic-bar-track">

                      <div
                        className="traffic-bar-fill"
                        style={{
                          width:
                            `${percentage}%`,
                        }}
                      />

                    </div>

                  </div>
                );
              }
            )}

          </div>

          <div className="traffic-metrics">

            <div>
              <span>
                PATH TRACKING
              </span>

              <strong>
                {pathTracking
                  ? "Available"
                  : "Processed"}
              </strong>
            </div>

            <div>
              <span>
                GAZE ANALYSIS
              </span>

              <strong>
                {gazeAnalysis
                  ? "Available"
                  : "Processed"}
              </strong>
            </div>

            <div>
              <span>
                UNIQUE SHOPPERS
              </span>

              <strong>
                {formatNumber(
                  uniquePeople
                )}
              </strong>
            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          5. ENGAGEMENT
      ====================================================== */}

      <section
        id="engagement-heatmap"
        className="heatmap-card visualization-card"
      >

        <div className="heatmap-card-header">

          <div>
            <span className="heatmap-section-label">
              VISUALIZATION 05
            </span>

            <h2>
              Engagement Hotspot Analysis
            </h2>

            <p>
              Areas where shopper activity and
              dwell time indicate stronger
              engagement.
            </p>
          </div>

          <div className="visualization-badge">
            ENGAGEMENT
          </div>

        </div>

        <div className="engagement-layout">

          <div className="engagement-score-card">

            <div className="engagement-circle">

              <div>
                <strong>
                  {engagementScore}
                </strong>

                <span>
                  /100
                </span>
              </div>

            </div>

            <span className="summary-label">
              ENGAGEMENT LEVEL
            </span>

            <h3>
              {engagementLevel}
            </h3>

            <p>
              Based on average shopper dwell
              time observed in the analyzed
              video.
            </p>

          </div>

          <div className="hotspot-analysis">

            <div className="mini-title">
              TOP ENGAGEMENT HOTSPOTS
            </div>

            {sortedZones.length > 0 ? (

              sortedZones
                .slice(0, 5)
                .map(
                  (
                    zone,
                    index
                  ) => {

                    const width =
                      maximumZoneValue > 0
                        ? (
                            zone.value /
                            maximumZoneValue
                          ) *
                          100
                        : 0;

                    return (
                      <div
                        className="hotspot-row"
                        key={zone.name}
                      >

                        <div className="hotspot-rank">
                          {index + 1}
                        </div>

                        <div className="hotspot-content">

                          <div className="hotspot-top">

                            <strong>
                              {zone.name}
                            </strong>

                            <span>
                              {formatNumber(
                                zone.value
                              )}{" "}
                              shoppers
                            </span>

                          </div>

                          <div className="hotspot-track">

                            <div
                              className="hotspot-fill"
                              style={{
                                width:
                                  `${width}%`,
                              }}
                            />

                          </div>

                        </div>

                        {index === 0 && (
                          <span className="hotspot-tag">
                            HOT
                          </span>
                        )}

                      </div>
                    );
                  }
                )

            ) : (

              <div className="data-empty">
                No engagement hotspot data
                available.
              </div>

            )}

          </div>

        </div>

      </section>

      {/* =====================================================
          STORE BLUEPRINT
      ====================================================== */}

      <div className="heatmap-card blueprint-card">

        <div className="heatmap-card-header">

          <div>
            <span className="heatmap-section-label">
              STORE LAYOUT
            </span>

            <h2>
              Shopper Activity Blueprint
            </h2>

            <p>
              Zone-level shopper activity.
            </p>
          </div>

          <span className="blueprint-status">
            {Object.keys(zones).length} zones
          </span>

        </div>

        <div className="store-blueprint">

          <div className="blueprint-entry">
            ENTRY
          </div>

          <div className="blueprint-row">

            <BlueprintZone
              name="ZONE 1"
              value={getZoneShoppers(
                zones.zone_1 ||
                  zones.Zone_1
              )}
            />

            <BlueprintZone
              name="ZONE 2"
              value={getZoneShoppers(
                zones.zone_2 ||
                  zones.Zone_2
              )}
            />

            <BlueprintZone
              name="ZONE 3"
              value={getZoneShoppers(
                zones.zone_3 ||
                  zones.Zone_3
              )}
            />

          </div>

          <div className="blueprint-aisle">
            SHOPPER AISLE
          </div>

          <div className="blueprint-row">

            <BlueprintZone
              name="ZONE 4"
              value={getZoneShoppers(
                zones.zone_4 ||
                  zones.Zone_4
              )}
            />

            <BlueprintZone
              name="ZONE 5"
              value={getZoneShoppers(
                zones.zone_5 ||
                  zones.Zone_5
              )}
            />

            <BlueprintZone
              name="ZONE 6"
              value={getZoneShoppers(
                zones.zone_6 ||
                  zones.Zone_6
              )}
            />

          </div>

          <div className="blueprint-exit">
            EXIT
          </div>

        </div>

        <div className="blueprint-legend">

          <span>
            <i className="legend-low" />
            Lower traffic
          </span>

          <span>
            <i className="legend-medium" />
            Medium traffic
          </span>

          <span>
            <i className="legend-high" />
            Higher traffic
          </span>

        </div>

      </div>

      {/* INSIGHTS */}

      <div className="heatmap-insights-grid">

        <InsightCard
          icon="🔥"
          label="HOTTEST ZONE"
          value={hottestZone}
          text={
            hottestZoneValue > 0
              ? `${formatNumber(
                  hottestZoneValue
                )} shopper observations`
              : "Zone traffic unavailable"
          }
        />

        <InsightCard
          icon="⏱"
          label="ENGAGEMENT TIME"
          value={formatSeconds(
            averageDwell
          )}
          text="Average shopper dwell"
        />

        <InsightCard
          icon="👁"
          label="LONGEST ENGAGEMENT"
          value={formatSeconds(
            maxDwell
          )}
          text="Maximum observed dwell"
        />

        <InsightCard
          icon="👥"
          label="SHOPPER TRAFFIC"
          value={formatNumber(
            uniquePeople
          )}
          text="Unique shoppers tracked"
        />

      </div>

      {/* RECOMMENDATIONS */}

      <div className="heatmap-card recommendation-card">

        <div className="heatmap-card-header">

          <div>
            <span className="heatmap-section-label">
              AI OPTIMIZATION
            </span>

            <h2>
              Heatmap Recommendations
            </h2>

            <p>
              Optimization opportunities
              derived from shopper activity.
            </p>
          </div>

          <div className="recommendation-icon">
            ✦
          </div>

        </div>

        <div className="recommendation-list">

          {displayRecommendations.map(
            (
              recommendation,
              index
            ) => (

              <RecommendationItem
                key={index}
                recommendation={
                  recommendation
                }
                index={index}
              />

            )
          )}

        </div>

      </div>

    </div>
  );
}

// =============================================================
// EMPTY VISUALIZATION
// =============================================================

function EmptyVisualization({
  icon,
  title,
  text,
}) {
  return (
    <div className="visualization-empty">

      <div className="visualization-empty-icon">
        {icon}
      </div>

      <h3>
        {title}
      </h3>

      <p>
        {text}
      </p>

    </div>
  );
}

// =============================================================
// TRAFFIC NODE
// =============================================================

function TrafficNode({
  icon,
  title,
  value,
  percentage,
  highlight = false,
}) {
  return (
    <div
      className={`traffic-node ${
        highlight
          ? "traffic-node-highlight"
          : ""
      }`}
    >

      <div className="traffic-node-icon">
        {icon}
      </div>

      <span>
        {title}
      </span>

      <strong>
        {Number(value).toLocaleString()}
      </strong>

      <div className="traffic-node-progress">

        <div
          style={{
            width:
              `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}

// =============================================================
// BLUEPRINT ZONE
// =============================================================

function BlueprintZone({
  name,
  value,
}) {
  let level = "low";

  if (value >= 15) {
    level = "high";
  } else if (value >= 7) {
    level = "medium";
  }

  return (
    <div
      className={`blueprint-zone ${level}`}
    >

      <span>
        {name}
      </span>

      <strong>
        {value}
      </strong>

      <small>
        shoppers
      </small>

    </div>
  );
}

// =============================================================
// INSIGHT CARD
// =============================================================

function InsightCard({
  icon,
  label,
  value,
  text,
}) {
  return (
    <div className="insight-card">

      <div className="insight-icon">
        {icon}
      </div>

      <div>

        <span>
          {label}
        </span>

        <h3>
          {value}
        </h3>

        <p>
          {text}
        </p>

      </div>

    </div>
  );
}

// =============================================================
// RECOMMENDATION ITEM
// =============================================================

function RecommendationItem({
  recommendation,
  index,
}) {
  const icons = [
    "🔥",
    "📦",
    "📢",
    "👥",
    "🏬",
    "💡",
  ];

  return (
    <div className="recommendation-item">

      <div className="recommendation-number">
        {icons[
          index % icons.length
        ]}
      </div>

      <div className="recommendation-content">

        <strong>
          Recommendation {index + 1}
        </strong>

        <p>
          {typeof recommendation ===
          "object"
            ? recommendation.text ||
              recommendation.message ||
              JSON.stringify(
                recommendation
              )
            : String(
                recommendation
              )}
        </p>

      </div>

    </div>
  );
}

// =============================================================
// FALLBACK RECOMMENDATIONS
// =============================================================

function generateFallbackRecommendations({
  uniquePeople,
  averageDwell,
  maxDwell,
  hottestZone,
  hottestZoneValue,
}) {
  const recommendations = [];

  if (uniquePeople >= 20) {
    recommendations.push(
      "High shopper traffic detected. Review the identified activity hotspots for shelf and promotional optimization."
    );
  } else if (uniquePeople >= 10) {
    recommendations.push(
      "Moderate shopper traffic detected. Continue monitoring shopper movement across store zones."
    );
  } else {
    recommendations.push(
      "Low shopper traffic detected. Review store layout and shopper visibility."
    );
  }

  if (averageDwell >= 5) {
    recommendations.push(
      "High average dwell time detected. Consider improving engagement opportunities in high-activity areas."
    );
  } else if (averageDwell >= 2) {
    recommendations.push(
      "Moderate shopper dwell time detected. Monitor product engagement in active zones."
    );
  } else {
    recommendations.push(
      "Short shopper dwell times detected. Consider improving product visibility and shelf placement."
    );
  }

  if (hottestZoneValue > 0) {
    recommendations.push(
      `${hottestZone} shows the strongest shopper activity. Consider prioritizing this zone for product placement and promotional visibility.`
    );
  }

  if (maxDwell >= 8) {
    recommendations.push(
      "A long shopper dwell event was detected. Investigate the corresponding area for potential engagement opportunities."
    );
  }

  return recommendations;
}

export default Heatmap;
