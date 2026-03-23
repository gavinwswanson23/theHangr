# Supabase setup (Email + Google)

Auth is handled by **Supabase Auth** from the Expo app (`EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY`). No separate auth server is required.

## 1. Apply database schema

In the Supabase Dashboard → **SQL Editor**, run the contents of [`schema.sql`](./schema.sql) (or use the Supabase CLI: `supabase db push` if linked).

## 2. Enable providers

Dashboard → **Authentication** → **Providers**:

- Enable **Email** (optionally disable “Confirm email” while developing).
- Enable **Google** and paste **Client ID** and **Client Secret** from Google Cloud.

## 3. Google OAuth (Google Cloud Console)

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → **Create OAuth 2.0 Client ID**.
2. Application type: **Web application**.
3. **Authorized redirect URIs**:  
   `https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback`  
   (replace `<YOUR_PROJECT_REF>` with your Supabase project reference from the project URL.)

## 4. Redirect URLs (aligned with Supabase + Expo deep linking)

**In Expo Go**, the app uses `exp://...` (not `dripapp://`). In a dev or production build, it uses `dripapp://auth/callback`.

Dashboard → **Authentication** → **URL Configuration**:

- **Site URL**: `dripapp://` (or your production URL).
- **Additional redirect URLs** (add all that apply):
  - `dripapp://**` — for dev/production builds with custom scheme
  - **Expo Go**: Add the URL printed in Metro when you open the auth screen — look for `[auth] Expo Go redirect URI`. It looks like `exp://192.168.x.x:8081/--/auth/callback` and changes if your IP changes.
  - Or add `exp://*` / `exp://**` if Supabase accepts wildcards (then any `exp://` URL works).

**Email confirmation** must redirect to a URL in this list. If you get "invalid link" after clicking Confirm in the email, the redirect URL in the link is not allowed — add the exact `exp://...` URL from Metro (when using Expo Go) to Supabase Redirect URLs.

## 5. Storage

The SQL creates the public **`sprites`** bucket and RLS policies. Uploads must use paths like `users/<user_id>/...` (as in `lib/board-store.ts`).

## 6. Sign-up issues (email confirmation + profiles)

If **Confirm email** is enabled in Supabase, new users have **no session** until they open the link in the email. The app cannot insert into `profiles` as `anon` (RLS requires `authenticated`).

`schema.sql` includes **`handle_new_user`**: a trigger on `auth.users` that creates the `profiles` row with `SECURITY DEFINER`. **Run or re-run** the `handle_new_user` function + `on_auth_user_created` trigger block from `schema.sql` if sign-up used to fail or profiles were missing.

For **local testing**, you can turn off **Confirm email** under Authentication → Providers → Email so users get a session immediately after sign-up.

The app now shows the real Supabase error if sign-up fails, and only shows success after a successful response.
