import io
import time
import uuid
import asyncio
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

from .schemas import DetectSearchResponse
from .services.detection import detect_clothing_items
from .services.partners import search_products_for_category


app = FastAPI(title="Drip AI Detect+Search", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"ok": True}


@app.post("/api/v1/detect-search", response_model=DetectSearchResponse)
async def detect_search(image: UploadFile = File(...)):
    start = time.perf_counter()
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="image upload required")

    raw = await image.read()
    if not raw:
        raise HTTPException(status_code=400, detail="empty image upload")

    try:
        pil = Image.open(io.BytesIO(raw)).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"invalid image: {exc}") from exc

    detections = detect_clothing_items(pil)

    async def attach_products(item):
        products = await search_products_for_category(item["category"])
        return {
            "category": item["category"],
            "confidence": item["confidence"],
            "bbox": item["bbox"],
            "products": products[:6],
        }

    items = await asyncio.gather(*(attach_products(d) for d in detections))
    elapsed_ms = int((time.perf_counter() - start) * 1000)
    return {
        "request_id": str(uuid.uuid4()),
        "total_ms": elapsed_ms,
        "items": items,
    }
