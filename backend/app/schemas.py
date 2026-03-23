from pydantic import BaseModel


class BoundingBox(BaseModel):
    x1: int
    y1: int
    x2: int
    y2: int


class ProductHit(BaseModel):
    title: str
    image_url: str
    affiliate_url: str
    source: str
    price: str | None = None
    score: float | None = None


class DetectedItem(BaseModel):
    category: str
    confidence: float
    bbox: BoundingBox
    products: list[ProductHit]


class DetectSearchResponse(BaseModel):
    request_id: str
    total_ms: int
    items: list[DetectedItem]
