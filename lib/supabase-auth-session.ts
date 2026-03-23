/**
 * Supabase Auth + Expo: OAuth return URL and deep links (email confirm, magic link).
 * @see https://supabase.com/docs/guides/auth/native-mobile-deep-linking
 */
import Constants from 'expo-constants';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { makeRedirectUri } from 'expo-auth-session';

import { supabase } from '@/lib/supabase';

/**
 * Redirect URI for OAuth, sign-up confirmation emails, and password recovery links.
 * - In Expo Go: uses exp:// so the link opens the app (add that URL to Supabase).
 * - In dev/production build: uses dripapp:// (custom scheme from app.json).
 */
export function getAuthRedirectUri() {
  const isExpoGo = Constants.appOwnership === 'expo';
  if (isExpoGo) {
    // Expo Go does not use dripapp:// — use default (exp://IP:port) so the link opens
    const uri = makeRedirectUri({ path: 'auth/callback' });
    if (__DEV__) {
      console.log('[auth] Expo Go redirect URI — add this to Supabase Redirect URLs:', uri);
    }
    return uri;
  }
  return makeRedirectUri({ scheme: 'dripapp', path: 'auth/callback' });
}

function errMsg(e: unknown): string {
  if (e && typeof e === 'object' && 'message' in e && typeof (e as { message: unknown }).message === 'string') {
    return (e as { message: string }).message;
  }
  if (e instanceof Error) return e.message;
  return 'Something went wrong.';
}

/**
 * Completes sign-in from OAuth browser session or from opening the app via email link.
 */
export async function createSessionFromUrl(url: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const { params, errorCode } = QueryParams.getQueryParams(url);
    if (errorCode) {
      return { ok: false, error: errorCode };
    }

    const code = params.code;
    const access_token = params.access_token;
    const refresh_token = params.refresh_token;

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    }

    if (access_token && refresh_token) {
      const { error } = await supabase.auth.setSession({ access_token, refresh_token });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    }

    // Hash fragment (#access_token=...) — some redirects omit query string
    const parsed = new URL(url);
    const hash = parsed.hash.replace(/^#/, '');
    if (hash) {
      const frag = new URLSearchParams(hash);
      const at = frag.get('access_token');
      const rt = frag.get('refresh_token');
      if (at && rt) {
        const { error } = await supabase.auth.setSession({ access_token: at, refresh_token: rt });
        if (error) return { ok: false, error: error.message };
        return { ok: true };
      }
      const fragCode = frag.get('code');
      if (fragCode) {
        const { error } = await supabase.auth.exchangeCodeForSession(fragCode);
        if (error) return { ok: false, error: error.message };
        return { ok: true };
      }
    }

    return { ok: false, error: 'No auth parameters in this link.' };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}
