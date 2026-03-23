import asyncio


MOCK_PRODUCTS = {
    "shirt": [
        ("Relaxed Oxford Shirt", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600"),
        ("Cotton Fit Tee", "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600"),
    ],
    "pants": [
        ("Tailored Chino", "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600"),
        ("Wide Leg Trouser", "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600"),
    ],
    "shoes": [
        ("Clean White Sneaker", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"),
        ("Leather Derby", "https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?w=600"),
    ],
    "outerwear": [
        ("Wool Overcoat", "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600"),
        ("Minimal Bomber Jacket", "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600"),
    ],
    "accessory": [
        ("Leather Crossbody Bag", "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600"),
        ("Classic Watch", "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600"),
    ],
}


async def search_partner_catalog(category: str, partner: str):
    """Mock approved-partner search adapter.

    Replace with real adapter per approved partner API/site contract.
    """
    await asyncio.sleep(0.12)
    rows = MOCK_PRODUCTS.get(category, [])[:2]
    results = []
    for idx, (title, image_url) in enumerate(rows):
        results.append(
            {
                "title": f"{title} ({partner})",
                "image_url": image_url,
                "affiliate_url": f"https://partner.example/{partner}/{category}/{idx + 1}",
                "source": partner,
                "price": f"${49 + idx * 25}",
                "score": round(0.93 - idx * 0.06, 2),
            }
        )
    return results


async def search_products_for_category(category: str):
    partners = ["approved_store_a", "approved_store_b"]
    fanout = await asyncio.gather(*(search_partner_catalog(category, p) for p in partners))
    merged = [item for batch in fanout for item in batch]
    return sorted(merged, key=lambda x: x.get("score", 0), reverse=True)
