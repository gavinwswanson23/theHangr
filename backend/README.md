# Drip AI Backend (MVP)

This is a FastAPI MVP backend for:
- image upload
- clothing detection (stub, YOLO-ready)
- parallel approved-partner product search (mock adapters)

## Run

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

> **Important:** Use `--host 0.0.0.0` so the server accepts connections from your phone. Without it, only `localhost` can connect and you'll get a network timeout on device.

Health:

```bash
curl http://localhost:8000/health
```

Main endpoint:

```bash
POST /api/v1/detect-search
multipart form-data:
  image: <file>
```

## Frontend integration

Set this in app `.env`:

```bash
EXPO_PUBLIC_AI_BACKEND_URL=http://localhost:8000
```

For physical phone testing, use your LAN IP:

```bash
EXPO_PUBLIC_AI_BACKEND_URL=http://YOUR_COMPUTER_IP:8000
```

## Next steps

- Replace `app/services/detection.py` stub with YOLOv8 model inference.
- Replace `app/services/partners.py` mock with approved partner adapters.
- Add Redis cache for image hash and embedding cache.
