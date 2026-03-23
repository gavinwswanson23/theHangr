import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useRouter, useSegments } from 'expo-router';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';

import { createSessionFromUrl, getAuthRedirectUri } from '@/lib/supabase-auth-session';
import { supabase } from '@/lib/supabase';
import { upsertProfileFromUser } from '@/lib/user-profile';

WebBrowser.maybeCompleteAuthSession();

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  authBusy: boolean;
  error: string | null;
  clearError: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string
  ) => Promise<{ ok: boolean; needsEmailConfirmation?: boolean }>;
  sendPasswordResetCode: (email: string) => Promise<void>;
  verifyResetCodeAndUpdatePassword: (email: string, code: string, newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const authErrMessage = (err: unknown) => {
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
    return (err as { message: string }).message;
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong.';
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const segments = useSegments();

  const isAuthed = !!session?.user;
  const inAuthRoute = segments[0] === 'auth';

  useEffect(() => {
    const bootstrap = async () => {
      const { data, error: sessErr } = await supabase.auth.getSession();
      if (sessErr) setError(sessErr.message);
      setSession(data.session);
      setLoading(false);
    };
    bootstrap();

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) upsertProfileFromUser(nextSession.user);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  /** Email confirmation / magic links / OAuth cold start — Supabase deep-link pattern */
  useEffect(() => {
    const handleUrl = async (url: string) => {
      const result = await createSessionFromUrl(url);
      if (!result.ok && result.error) {
        console.warn('[auth] Deep link session:', result.error);
      }
    };

    void Linking.getInitialURL().then((url) => {
      if (url) void handleUrl(url);
    });

    const sub = Linking.addEventListener('url', ({ url }) => {
      void handleUrl(url);
    });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!isAuthed && !inAuthRoute) router.replace('/auth');
    if (isAuthed && inAuthRoute) router.replace('/(tabs)');
  }, [inAuthRoute, isAuthed, loading, router]);

  const signInWithGoogle = useCallback(async () => {
    try {
      setAuthBusy(true);
      setError(null);
      const redirectTo = getAuthRedirectUri();
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      });

      if (oauthError) throw oauthError;
      if (!data?.url) throw new Error('Could not start OAuth flow.');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type !== 'success' || !result.url) return;

      const sessionResult = await createSessionFromUrl(result.url);
      if (!sessionResult.ok) {
        throw new Error(sessionResult.error ?? 'Could not complete Google sign-in.');
      }
    } catch (err) {
      setError(authErrMessage(err) || 'Auth failed.');
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setAuthBusy(true);
      setError(null);
      const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });
      if (authErr) throw authErr;
    } catch (err) {
      setError(authErrMessage(err) || 'Email sign in failed.');
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setAuthBusy(true);
      setError(null);
      const redirectTo = getAuthRedirectUri();
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo },
      });
      if (signUpErr) throw signUpErr;
      if (!data.user) {
        setError('Sign up did not complete. Check that Email provider is enabled in Supabase.');
        return { ok: false };
      }
      if (data.session) await upsertProfileFromUser(data.user);
      return {
        ok: true,
        needsEmailConfirmation: !data.session,
      };
    } catch (err) {
      setError(authErrMessage(err) || 'Email sign up failed.');
      return { ok: false };
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const sendPasswordResetCode = useCallback(async (email: string) => {
    try {
      setAuthBusy(true);
      setError(null);
      const { error: otpErr } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });
      if (otpErr) throw otpErr;
    } catch (err) {
      setError(authErrMessage(err) || 'Failed to send reset code.');
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const verifyResetCodeAndUpdatePassword = useCallback(async (email: string, code: string, newPassword: string) => {
    try {
      setAuthBusy(true);
      setError(null);
      const { error: verifyErr } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      });
      if (verifyErr) throw verifyErr;
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });
      if (updateErr) throw updateErr;
    } catch (err) {
      setError(authErrMessage(err) || 'Could not reset password.');
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const signOut = useCallback(async () => {
    const { error: signoutErr } = await supabase.auth.signOut();
    if (signoutErr) setError(signoutErr.message);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      authBusy,
      error,
      clearError,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      sendPasswordResetCode,
      verifyResetCodeAndUpdatePassword,
      signOut,
    }),
    [
      authBusy,
      clearError,
      error,
      loading,
      sendPasswordResetCode,
      session,
      signInWithEmail,
      signInWithGoogle,
      signOut,
      signUpWithEmail,
      verifyResetCodeAndUpdatePassword,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider.');
  return ctx;
};
