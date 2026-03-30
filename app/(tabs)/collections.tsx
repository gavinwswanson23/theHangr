import { FontAwesome5 } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const CARD_W = 132;
const CARD_H = 168;
const GAP = 12;

type ClosetBox = {
  id: string;
  label: string;
  previewColor: string;
};

const DEFAULT_CLOSETS: ClosetBox[] = [
  { id: '1', label: 'Work', previewColor: '#E8E4F3' },
  { id: '2', label: 'Weekend', previewColor: '#D4E8E4' },
  { id: '3', label: 'Party', previewColor: '#F5E6D3' },
];

const PARTNER_PLACEHOLDERS = [
  { id: 'p1', name: 'Partner store' },
  { id: 'p2', name: 'Partner store' },
  { id: 'p3', name: 'Partner store' },
];

export default function CollectionsTab() {
  const [closets, setClosets] = useState<ClosetBox[]>(DEFAULT_CLOSETS);

  const addCloset = useCallback(() => {
    setClosets((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        label: 'New',
        previewColor: '#E5E7EB',
      },
    ]);
  }, []);

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.pageContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <Text style={[styles.sectionHeading, styles.sectionHeadingPad]}>My Closet</Text>
        <Text style={styles.sectionHint}>
          Tap a box to name it and set a preview image later.
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {closets.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.closetCard,
                pressed && styles.cardPressed,
              ]}
              onPress={() => {}}
            >
              <View
                style={[styles.preview, { backgroundColor: item.previewColor }]}
              />
              <View style={styles.labelBar}>
                <Text style={styles.labelText} numberOfLines={1}>
                  {item.label}
                </Text>
              </View>
            </Pressable>
          ))}
          <Pressable
            onPress={addCloset}
            style={({ pressed }) => [
              styles.addCard,
              pressed && styles.cardPressed,
            ]}
            accessibilityLabel="Add closet"
          >
            <FontAwesome5 name="plus" size={28} color="#6B7280" />
          </Pressable>
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.onlineTitleRow}>
          <Text style={styles.sectionHeading}>Online/</Text>
          <MaterialCommunityIcons
            name="star-four-points"
            size={20}
            color="#6366F1"
            style={styles.sparkle}
          />
          <Text style={styles.sectionHeading}>local</Text>
        </View>
        <Text style={styles.aiLine}>
          Partner shops + AI helper to pull looks and save them here.
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {PARTNER_PLACEHOLDERS.map((p) => (
            <Pressable
              key={p.id}
              style={({ pressed }) => [
                styles.partnerCard,
                pressed && styles.cardPressed,
              ]}
              onPress={() => {}}
            >
              <View style={styles.partnerPreview} />
              <Text style={styles.partnerName} numberOfLines={2}>
                {p.name}
              </Text>
              <Text style={styles.partnerSub}>Tap to browse</Text>
            </Pressable>
          ))}
          <Pressable
            style={({ pressed }) => [
              styles.addCard,
              pressed && styles.cardPressed,
            ]}
            onPress={() => {}}
            accessibilityLabel="Add from online or local"
          >
            <FontAwesome5 name="plus" size={28} color="#6B7280" />
          </Pressable>
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  pageContent: {
    paddingBottom: 32,
    paddingTop: 8,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  sectionHeadingPad: {
    paddingHorizontal: 20,
  },
  sectionHint: {
    marginTop: 6,
    marginBottom: 14,
    paddingHorizontal: 20,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  onlineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    flexWrap: 'wrap',
  },
  sparkle: {
    marginHorizontal: 2,
    marginTop: 2,
  },
  aiLine: {
    marginTop: 8,
    marginBottom: 14,
    paddingHorizontal: 20,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  row: {
    paddingHorizontal: 20,
    gap: GAP,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  closetCard: {
    width: CARD_W,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  preview: {
    height: CARD_H - 40,
    width: '100%',
  },
  labelBar: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  partnerCard: {
    width: CARD_W,
    minHeight: CARD_H,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 10,
    justifyContent: 'flex-end',
  },
  partnerPreview: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    bottom: 52,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  partnerName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  partnerSub: {
    marginTop: 4,
    fontSize: 11,
    color: '#9CA3AF',
  },
  addCard: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPressed: {
    opacity: 0.85,
  },
});
