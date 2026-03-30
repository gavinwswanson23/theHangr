import { StyleSheet, Text, View } from 'react-native';

export default function CalendarTab() {
  return (
    <View style={styles.page}>
      <Text style={styles.label}>Calendar Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#111111',
    fontSize: 18,
    fontWeight: '600',
  },
});
