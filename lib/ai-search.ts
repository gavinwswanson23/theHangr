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

const baseUrl = process.env.EXPO_PUBLIC_AI_BACKEND_URL ?? 'http://localhost:8000';

const AI_REQUEST_TIMEOUT_MS = 60_000; // 60s for image upload + processing

export async function detectAndSearchFromImageUri(imageUri: string): Promise<DetectSearchResponse> {
  const formData = new FormData();
  formData.append(
    'image',
    {
      uri: imageUri,
      name: `upload-${Date.now()}.jpg`,
      type: 'image/jpeg',
    } as never
  );

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${baseUrl}/api/v1/detect-search`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || `AI request failed (${res.status})`);
    }
    return (await res.json()) as DetectSearchResponse;
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error('AI search timed out. Check that the backend is running and reachable.');
      }
      const msg = err.message?.toLowerCase() ?? '';
      if (
        msg.includes('network request failed') ||
        msg.includes('failed to fetch') ||
        msg.includes('timeout') ||
        msg.includes('connection refused')
      ) {
        throw new Error(
          `Cannot reach AI backend (${baseUrl}). Make sure the backend is running with: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
        );
      }
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
