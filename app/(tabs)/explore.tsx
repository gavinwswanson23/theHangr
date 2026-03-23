import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '@/providers/AuthProvider';

export default function TabTwoScreen() {
  const { signOut, user, authBusy } = useAuth();

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Account</Text>
      <Text style={styles.caption}>Signed in as</Text>
      <Text style={styles.email}>{user?.email ?? 'No email available'}</Text>

      <TouchableOpacity disabled={authBusy} onPress={signOut} style={[styles.signOutBtn, authBusy && styles.signOutBtnDisabled]}>
        <Text style={styles.signOutTxt}>{authBusy ? 'Working...' : 'Sign Out'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#EEF5FF', paddingHorizontal: 22, paddingTop: 48 },
  title: { fontSize: 32, fontWeight: '900', color: '#0B1620' },
  caption: { marginTop: 18, color: '#4B647D', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  email: { marginTop: 6, color: '#0B1620', fontSize: 16, fontWeight: '600' },
  signOutBtn: { marginTop: 26, backgroundColor: '#0B1620', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  signOutBtnDisabled: { opacity: 0.6 },
  signOutTxt: { color: '#F7FAFF', fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', fontSize: 12 },
});
