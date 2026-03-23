import random
from PIL import Image


PRIORITY_CATEGORIES = ["shirt", "pants", "shoes", "outerwear", "accessory"]


def detect_clothing_items(image: Image.Image):
    """MVP detector stub.

    Replace this with YOLOv8 inference once model weights/GPU are configured.
    """
    width, height = image.size
    if width <= 0 or height <= 0:
        return []

    random.seed(width * height)
    count = min(4, max(1, width // 300))
    items = []
    for i in range(count):
        cat = PRIORITY_CATEGORIES[i % len(PRIORITY_CATEGORIES)]
        x1 = int((i + 1) * width * 0.08)
        y1 = int((i + 1) * height * 0.1)
        box_w = int(width * 0.22)
        box_h = int(height * 0.28)
        x2 = min(width - 1, x1 + box_w)
        y2 = min(height - 1, y1 + box_h)
        items.append(
            {
                "category": cat,
                "confidence": round(0.78 + (i * 0.04), 2),
                "bbox": {"x1": x1, "y1": y1, "x2": x2, "y2": y2},
            }
        )
    return items
