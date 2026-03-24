export type ProductHit = {
  title: string;
  image_url: string;
  affiliate_url: string;
  source: string;
  price?: string;
  score?: number;
};

export type DetectedItem = {
  category: string;
  confidence: number;
  bbox: { x1: number; y1: number; x2: number; y2: number };
  products: ProductHit[];
};

export type DetectSearchResponse = {
  request_id: string;
  total_ms: number;
  items: DetectedItem[];
};

const MOCK_PRODUCTS: Record<string, ProductHit[]> = {
  top: [
    {
      title: 'Relaxed Cotton Tee',
      image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
      affiliate_url: 'https://example.com/shop/top/tee',
      source: 'Demo Shop',
      price: '$34',
      score: 0.95,
    },
    {
      title: 'Oversized Rib Tank',
      image_url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600',
      affiliate_url: 'https://example.com/shop/top/tank',
      source: 'Demo Shop',
      price: '$29',
      score: 0.9,
    },
  ],
  bottom: [
    {
      title: 'Wide-Leg Trouser',
      image_url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600',
      affiliate_url: 'https://example.com/shop/bottom/trouser',
      source: 'Demo Shop',
      price: '$64',
      score: 0.94,
    },
    {
      title: 'Tailored Chino',
      image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600',
      affiliate_url: 'https://example.com/shop/bottom/chino',
      source: 'Demo Shop',
      price: '$58',
      score: 0.89,
    },
  ],
  shoes: [
    {
      title: 'Clean White Sneaker',
      image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
      affiliate_url: 'https://example.com/shop/shoes/sneaker',
      source: 'Demo Shop',
      price: '$79',
      score: 0.96,
    },
    {
      title: 'Leather Derby',
      image_url: 'https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?w=600',
      affiliate_url: 'https://example.com/shop/shoes/derby',
      source: 'Demo Shop',
      price: '$120',
      score: 0.88,
    },
  ],
};

const MOCK_ITEMS: DetectedItem[] = [
  {
    category: 'top',
    confidence: 0.93,
    bbox: { x1: 68, y1: 60, x2: 280, y2: 292 },
    products: MOCK_PRODUCTS.top,
  },
  {
    category: 'bottom',
    confidence: 0.9,
    bbox: { x1: 78, y1: 250, x2: 300, y2: 520 },
    products: MOCK_PRODUCTS.bottom,
  },
  {
    category: 'shoes',
    confidence: 0.86,
    bbox: { x1: 88, y1: 510, x2: 280, y2: 680 },
    products: MOCK_PRODUCTS.shoes,
  },
];

export async function detectAndSearchFromImageUri(imageUri: string): Promise<DetectSearchResponse> {
  if (!imageUri) throw new Error('Please choose an image first.');
  const started = Date.now();
  await new Promise((resolve) => setTimeout(resolve, 450));
  return {
    request_id: `local-${Date.now()}`,
    total_ms: Date.now() - started,
    items: MOCK_ITEMS,
  };
}
