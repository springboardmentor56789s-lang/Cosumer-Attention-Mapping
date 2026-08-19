"""Prepare, train, validate, and install a YOLOv8 SKU-110K product detector.

The checked-in SKU-110K copy already uses YOLO labels.  This script validates
them, creates reproducible manifests using only image/label pairs, trains a
single-class YOLOv8n model, evaluates it on the held-out test split, and copies
the best checkpoint to backend/models/product_detector/best.pt.
"""

from __future__ import annotations

import argparse
import os
import random
import shutil
from pathlib import Path

# Keep Ultralytics metadata/cache inside the project, including on locked-down
# service accounts where the roaming AppData directory is not writable.
os.environ.setdefault("YOLO_CONFIG_DIR", str(Path(__file__).resolve().parents[1] / ".ultralytics"))

import torch
from ultralytics import YOLO


BACKEND = Path(__file__).resolve().parents[1]
DATASET = BACKEND / "datasets" / "archive (1)" / "SKU110K_fixed"
DATA_YAML = BACKEND / "datasets" / "sku110k.yaml"
MANIFESTS = DATASET / "splits"
OUTPUT_ROOT = BACKEND / "runs"
DEPLOYMENT_WEIGHTS = BACKEND / "models" / "product_detector" / "best.pt"
IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def image_label_pairs(split: str) -> list[Path]:
    """Return only images with a matching, non-empty YOLO label file."""
    image_dir = DATASET / "images" / split
    label_dir = DATASET / "labels" / split
    if not image_dir.is_dir() or not label_dir.is_dir():
        return []

    pairs = []
    for image in sorted(image_dir.iterdir()):
        if image.suffix.lower() not in IMAGE_SUFFIXES:
            continue
        label = label_dir / f"{image.stem}.txt"
        if label.is_file() and label.stat().st_size:
            pairs.append(image.resolve())
    return pairs


def write_manifest(name: str, images: list[Path]) -> Path:
    MANIFESTS.mkdir(parents=True, exist_ok=True)
    manifest = MANIFESTS / f"{name}.txt"
    manifest.write_text("\n".join(image.as_posix() for image in images) + "\n", encoding="utf-8")
    return manifest


def prepare_splits(seed: int, val_fraction: float) -> dict[str, int]:
    """Create train/validation/test manifests without treating missing labels as background."""
    train_pairs = image_label_pairs("train")
    test_pairs = image_label_pairs("test")
    if not train_pairs or not test_pairs:
        raise RuntimeError("No verified train/test image-label pairs found under the configured SKU-110K dataset.")

    # This project copy has validation images but no matching labels.  Split the
    # verified training pairs instead, while retaining SKU-110K's labelled test
    # set as an independent final evaluation set.
    rng = random.Random(seed)
    rng.shuffle(train_pairs)
    val_count = max(1, round(len(train_pairs) * val_fraction))
    val_pairs = sorted(train_pairs[:val_count])
    train_pairs = sorted(train_pairs[val_count:])

    write_manifest("train", train_pairs)
    write_manifest("val", val_pairs)
    write_manifest("test", sorted(test_pairs))
    return {"train": len(train_pairs), "val": len(val_pairs), "test": len(test_pairs)}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--epochs", type=int, default=100)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--batch", type=int, default=-1, help="-1 lets Ultralytics choose a safe batch size")
    parser.add_argument("--device", default="auto", help="'auto' uses CUDA when available, otherwise CPU")
    parser.add_argument("--workers", type=int, default=8)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--val-fraction", type=float, default=0.1)
    parser.add_argument("--prepare-only", action="store_true")
    args = parser.parse_args()
    device = 0 if args.device == "auto" and torch.cuda.is_available() else ("cpu" if args.device == "auto" else args.device)

    counts = prepare_splits(args.seed, args.val_fraction)
    print(f"Prepared verified SKU-110K manifests: {counts}")
    if args.prepare_only:
        return

    model = YOLO("yolov8n.pt")
    train_result = model.train(
        data=str(DATA_YAML), epochs=args.epochs, imgsz=args.imgsz, batch=args.batch,
        device=device, workers=args.workers, project=str(OUTPUT_ROOT),
        name="sku110k_yolov8n", exist_ok=True, seed=args.seed, pretrained=True,
    )
    best_path = Path(train_result.save_dir) / "weights" / "best.pt"
    if not best_path.is_file():
        raise RuntimeError(f"Training finished without a best checkpoint at {best_path}")

    best_model = YOLO(str(best_path))
    metrics = best_model.val(data=str(DATA_YAML), split="test", imgsz=args.imgsz, batch=args.batch, device=device)
    DEPLOYMENT_WEIGHTS.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(best_path, DEPLOYMENT_WEIGHTS)
    print(f"Validation complete: {metrics.results_dict}")
    print(f"Installed production weights: {DEPLOYMENT_WEIGHTS}")


if __name__ == "__main__":
    main()
