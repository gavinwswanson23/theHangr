# BoardDrop

Visual closet app for uploading clothing items to an interactive board and trying outfits quickly.

## Quick start (for collaborators)

1. Clone and install:

```bash
git clone https://github.com/gavinwswanson23/BoardDrop.git
cd BoardDrop
npm install
```

2. Create local env file:

```bash
cp .env.example .env
```

3. Fill `.env` values:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_REMOVEBG_API_KEY` (optional for background removal quality)

4. Run app:

```bash
npx expo start -c
```

## Notes

- The AI tab currently runs a local mock flow (no backend required).
- `.env` is local only and should not be committed.
