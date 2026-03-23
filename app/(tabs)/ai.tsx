import { useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { detectAndSearchFromImageUri, type DetectSearchResponse } from '@/lib/ai-search';

const C = {
  black: '#0B1620',
  white: '#F7FAFF',
  offwhite: '#EEF5FF',
  grey1: '#D9E6F7',
  grey2: '#8FA6C2',
  grey3: '#4B647D',
  accent: '#6AA6FF',
  danger: '#E05C5C',
};

function Btn({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={[s.btn, disabled && { opacity: 0.6 }]}>
      <Text style={s.btnTxt}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function AiTabScreen() {
  const insets = useSafeAreaInsets();
  const [pickedUri, setPickedUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DetectSearchResponse | null>(null);

  const totalHits = useMemo(() => result?.items.reduce((sum, item) => sum + item.products.length, 0) ?? 0, [result]);

  const pickImage = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
    });
    if (r.canceled) return;
    const uri = r.assets[0]?.uri;
    if (!uri) return;
    setPickedUri(uri);
    setResult(null);
    setError(null);
  };

  const runAi = async () => {
    if (!pickedUri) return;
    try {
      setLoading(true);
      setError(null);
      const response = await detectAndSearchFromImageUri(pickedUri);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI search failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.screen}>
      <ScrollView contentContainerStyle={[s.wrap, { paddingTop: insets.top + 12 }]}>
        <Text style={s.title}>AI Search</Text>
        <Text style={s.subtitle}>Upload an outfit photo and get detected items + affiliate matches.</Text>

        <TouchableOpacity style={s.drop} activeOpacity={0.85} onPress={pickImage}>
          {!pickedUri ? (
            <View style={{ alignItems: 'center', gap: 8 }}>
              <Text style={s.plus}>＋</Text>
              <Text style={s.dropTxt}>Tap to choose image</Text>
            </View>
          ) : (
            <Image source={{ uri: pickedUri }} style={s.preview} resizeMode="cover" />
          )}
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Btn label="Upload Image" onPress={pickImage} />
          <Btn label="Run AI Search" onPress={runAi} disabled={!pickedUri || loading} />
        </View>

        {loading && (
          <View style={s.loading}>
            <ActivityIndicator size="small" color={C.accent} />
            <Text style={s.loadingTxt}>Detecting and searching in parallel...</Text>
          </View>
        )}

        {!!error && <Text style={s.err}>{error}</Text>}

        {!!result && (
          <View style={{ gap: 10 }}>
            <Text style={s.metrics}>
              {result.items.length} items detected · {totalHits} products · {result.total_ms}ms
            </Text>
            {result.items.map((item, i) => (
              <View key={`${item.category}-${i}`} style={s.itemCard}>
                <Text style={s.itemTitle}>
                  {item.category} · {(item.confidence * 100).toFixed(0)}%
                </Text>
                <View style={{ gap: 8 }}>
                  {item.products.map((p, j) => (
                    <TouchableOpacity
                      key={`${p.affiliate_url}-${j}`}
                      style={s.product}
                      onPress={() => {}}
                      activeOpacity={0.85}>
                      <Image source={{ uri: p.image_url }} style={s.productImg} resizeMode="cover" />
                      <View style={{ flex: 1 }}>
                        <Text style={s.productTitle} numberOfLines={2}>
                          {p.title}
                        </Text>
                        <Text style={s.productMeta}>
                          {p.source}
                          {p.price ? ` · ${p.price}` : ''}
                        </Text>
                        <Text style={s.productLink} numberOfLines={1}>
                          {p.affiliate_url}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.offwhite },
  wrap: { padding: 18, gap: 14, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '900', color: C.black },
  subtitle: { fontSize: 13, color: C.grey3, lineHeight: 20 },
  drop: {
    height: 220,
    borderWidth: 2,
    borderColor: C.grey1,
    borderStyle: 'dashed',
    borderRadius: 16,
    backgroundColor: C.white,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: { fontSize: 38, color: C.grey3 },
  dropTxt: { color: C.grey3, fontSize: 13, fontWeight: '700' },
  preview: { width: '100%', height: '100%' },
  btn: {
    flex: 1,
    backgroundColor: C.black,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnTxt: { color: C.white, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadingTxt: { color: C.grey3, fontSize: 12 },
  err: { color: C.danger, fontSize: 12 },
  metrics: { color: C.grey3, fontSize: 12, fontWeight: '700' },
  itemCard: { backgroundColor: C.white, borderRadius: 14, borderWidth: 1, borderColor: C.grey1, padding: 12, gap: 8 },
  itemTitle: { fontSize: 14, fontWeight: '900', color: C.black, textTransform: 'capitalize' },
  product: { flexDirection: 'row', gap: 10 },
  productImg: { width: 56, height: 56, borderRadius: 10, backgroundColor: C.grey1 },
  productTitle: { fontSize: 12, fontWeight: '700', color: C.black },
  productMeta: { marginTop: 2, fontSize: 11, color: C.grey3 },
  productLink: { marginTop: 4, fontSize: 10, color: C.accent },
});
