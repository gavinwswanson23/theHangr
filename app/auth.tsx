import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/providers/AuthProvider';

type AuthMode = 'signin' | 'signup' | 'forgot' | 'reset';

export default function AuthScreen() {
  const {
    authBusy,
    error,
    clearError,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendPasswordResetCode,
    verifyResetCodeAndUpdatePassword,
  } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [localMsg, setLocalMsg] = useState<string | null>(null);
  /** After sign-up → sign-in, don't clear the "check your email" message on the same mode transition */
  const skipClearOnNextModeChange = useRef(false);

  useEffect(() => {
    if (skipClearOnNextModeChange.current) {
      skipClearOnNextModeChange.current = false;
      return;
    }
    clearError();
    setLocalMsg(null);
  }, [mode, clearError]);

  const submitEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setLocalMsg('Enter your email and password.');
      return;
    }
    setLocalMsg(null);
    if (mode === 'signin') {
      await signInWithEmail(email.trim(), password);
      return;
    }
    if (password.length < 8) {
      setLocalMsg('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalMsg('Passwords do not match.');
      return;
    }
    const signUpResult = await signUpWithEmail(email.trim(), password);
    if (!signUpResult.ok) return;
    if (signUpResult.needsEmailConfirmation) {
      skipClearOnNextModeChange.current = true;
      setMode('signin');
      setPassword('');
      setConfirmPassword('');
      setLocalMsg('Check your email and tap the confirmation link, then sign in below.');
    } else {
      router.replace('/(tabs)');
    }
  };

  const sendReset = async () => {
    if (!email.trim()) {
      setLocalMsg('Enter your email first.');
      return;
    }
    setLocalMsg(null);
    await sendPasswordResetCode(email.trim());
    setMode('reset');
    setLocalMsg('One-time code sent. Check your email.');
  };

  const completeReset = async () => {
    if (!email.trim() || !resetCode.trim() || !newPassword.trim()) {
      setLocalMsg('Email, code, and new password are required.');
      return;
    }
    if (newPassword.length < 8) {
      setLocalMsg('New password must be at least 8 characters.');
      return;
    }
    setLocalMsg(null);
    await verifyResetCodeAndUpdatePassword(email.trim(), resetCode.trim(), newPassword);
    setMode('signin');
    setPassword('');
    setNewPassword('');
    setResetCode('');
    setLocalMsg('Password updated. Sign in with your new password.');
  };

  return (
    <SafeAreaView style={s.screen} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={s.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top}>
        <ScrollView
          style={s.scroll}
          contentContainerStyle={[
            s.scrollContent,
            {
              paddingBottom: Math.max(insets.bottom, 32) + 24,
              minHeight: Platform.OS === 'web' ? undefined : Math.max(windowHeight - insets.top - 8, 480),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          showsVerticalScrollIndicator={false}>
            <View style={s.wrap}>
              <Text style={s.logo}>DRIP</Text>
              <Text style={s.title}>Sign in to save your style board</Text>
              <Text style={s.subtitle}>Social login or email/password, all synced to your account.</Text>

        {(mode === 'signin' || mode === 'signup') && (
          <>
            <View style={s.inputWrap}>
              <TextInput
                style={s.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#8FA6C2"
              />
            </View>
            <View style={s.inputWrap}>
              <TextInput
                style={s.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry
                autoCapitalize="none"
                placeholderTextColor="#8FA6C2"
                textContentType={mode === 'signup' ? 'none' : 'password'}
                autoComplete={mode === 'signup' ? 'off' : 'password'}
              />
            </View>
            {mode === 'signup' && (
              <View style={s.inputWrap}>
                <TextInput
                  style={s.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm password"
                  secureTextEntry
                  autoCapitalize="none"
                  placeholderTextColor="#8FA6C2"
                  textContentType="none"
                  autoComplete="off"
                />
              </View>
            )}
            <TouchableOpacity onPress={submitEmailAuth} disabled={authBusy} style={[s.btn, authBusy && s.btnDisabled]} activeOpacity={0.85}>
              <Text style={s.btnText}>{mode === 'signin' ? 'Sign In With Email' : 'Create Account'}</Text>
            </TouchableOpacity>
          </>
        )}

        {mode === 'forgot' && (
          <>
            <View style={s.inputWrap}>
              <TextInput
                style={s.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email for reset code"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#8FA6C2"
              />
            </View>
            <TouchableOpacity onPress={sendReset} disabled={authBusy} style={[s.btn, authBusy && s.btnDisabled]} activeOpacity={0.85}>
              <Text style={s.btnText}>Send One-Time Code</Text>
            </TouchableOpacity>
          </>
        )}

        {mode === 'reset' && (
          <>
            <View style={s.inputWrap}>
              <TextInput
                style={s.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#8FA6C2"
              />
            </View>
            <View style={s.inputWrap}>
              <TextInput
                style={s.input}
                value={resetCode}
                onChangeText={setResetCode}
                placeholder="One-time code"
                autoCapitalize="none"
                placeholderTextColor="#8FA6C2"
              />
            </View>
            <View style={s.inputWrap}>
              <TextInput
                style={s.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New password"
                secureTextEntry
                autoCapitalize="none"
                placeholderTextColor="#8FA6C2"
                textContentType="none"
                autoComplete="off"
              />
            </View>
            <TouchableOpacity onPress={completeReset} disabled={authBusy} style={[s.btn, authBusy && s.btnDisabled]} activeOpacity={0.85}>
              <Text style={s.btnText}>Reset Password</Text>
            </TouchableOpacity>
          </>
        )}

        {(mode === 'signin' || mode === 'signup') && <Text style={s.divider}>OR</Text>}

        {(mode === 'signin' || mode === 'signup') && (
          <TouchableOpacity
            onPress={signInWithGoogle}
            disabled={authBusy}
            style={[s.btn, s.googleBtn, authBusy && s.btnDisabled]}
            activeOpacity={0.85}>
            <View style={s.googleBtnInner}>
              <MaterialCommunityIcons name="google" size={22} color="#4285F4" />
              <Text style={[s.btnText, s.googleBtnText]}>Continue with Google</Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={s.authNavRow}>
          {mode !== 'signin' && (
            <TouchableOpacity onPress={() => setMode('signin')}>
              <Text style={s.authNavLink}>Back To Sign In</Text>
            </TouchableOpacity>
          )}
          {(mode === 'signin' || mode === 'signup') && (
            <TouchableOpacity onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
              <Text style={s.authNavLink}>{mode === 'signin' ? 'Create account' : 'Already have an account?'}</Text>
            </TouchableOpacity>
          )}
        </View>
        {mode === 'signin' && (
          <TouchableOpacity onPress={() => setMode('forgot')}>
            <Text style={s.authNavLink}>Forgot password?</Text>
          </TouchableOpacity>
        )}
        {mode === 'forgot' && (
          <TouchableOpacity onPress={() => setMode('reset')}>
            <Text style={s.authNavLink}>Already have your code?</Text>
          </TouchableOpacity>
        )}

        {authBusy && <ActivityIndicator size="small" color="#6AA6FF" style={{ marginTop: 8 }} />}
        {!!localMsg && <Text style={s.info}>{localMsg}</Text>}
        {!!error && <Text style={s.error}>{error}</Text>}
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#EEF5FF' },
  keyboardAvoid: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    justifyContent: 'center',
  },
  wrap: { width: '100%' },
  logo: { fontSize: 44, fontWeight: '900', letterSpacing: 4, color: '#0B1620', marginBottom: 18, textAlign: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: '#0B1620', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#4B647D', textAlign: 'center', marginTop: 8, marginBottom: 24, lineHeight: 20 },
  inputWrap: { borderWidth: 1.4, borderColor: '#D9E6F7', borderRadius: 12, backgroundColor: '#FFFFFF', marginTop: 10, paddingHorizontal: 12 },
  input: { height: 46, color: '#0B1620', fontSize: 14 },
  btn: { backgroundColor: '#0B1620', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 18, marginTop: 10, alignItems: 'center' },
  googleBtn: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D9E6F7' },
  btnDisabled: { opacity: 0.6 },
  googleBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  btnText: { color: '#F7FAFF', fontSize: 13, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  googleBtnText: { color: '#0B1620', includeFontPadding: false },
  divider: { marginTop: 14, marginBottom: 2, textAlign: 'center', fontSize: 12, fontWeight: '700', color: '#8FA6C2', letterSpacing: 1 },
  authNavRow: { marginTop: 12, flexDirection: 'row', justifyContent: 'center' },
  authNavLink: { marginTop: 4, fontSize: 13, color: '#4B647D', textDecorationLine: 'underline', textAlign: 'center' },
  info: { color: '#4B647D', marginTop: 12, textAlign: 'center', fontSize: 12 },
  error: { color: '#E05C5C', marginTop: 14, textAlign: 'center', fontSize: 13 },
});
