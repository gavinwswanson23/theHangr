import { FontAwesome5 } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useLayoutEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CATEGORIES = [
  'Tops',
  'Bottoms',
  'Shoes',
  'Dresses',
  'Outerwear',
  'Accessories',
  'Bags',
  'Other',
] as const;

export type AddCategory = (typeof CATEGORIES)[number];

export type AddSource = 'closet' | 'online' | 'local';

const SOURCES: {
  id: AddSource;
  title: string;
  description: string;
}[] = [
  {
    id: 'closet',
    title: 'My closet',
    description: 'Your saved images',
  },
  {
    id: 'online',
    title: 'Online',
    description: 'Partnered brands',
  },
  {
    id: 'local',
    title: 'Local',
    description: 'Stores near you',
  },
];

export default function AddItemTab() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState<AddCategory>('Tops');
  const [source, setSource] = useState<AddSource>('closet');

  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={openMenu}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.headerBtn}
          accessibilityLabel="Category and source"
        >
          <FontAwesome5 name="bars" size={20} color="#111827" />
        </Pressable>
      ),
    });
  }, [navigation, openMenu]);

  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={({ pressed }) => [
            styles.uploadBox,
            pressed && styles.uploadPressed,
          ]}
          onPress={() => {}}
          accessibilityRole="button"
          accessibilityLabel="Upload item photo"
        >
          <MaterialCommunityIcons
            name="cloud-upload-outline"
            size={44}
            color="#9CA3AF"
            style={styles.uploadIcon}
          />
          <Text style={styles.logoMark}>Hangr</Text>
          <Text style={styles.uploadHint}>Tap to add a photo</Text>
        </Pressable>

        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>Category</Text>
          <Text style={styles.summaryValue}>{category}</Text>
          <Text style={[styles.summaryLabel, styles.summarySpaced]}>Add from</Text>
          <Text style={styles.summaryValue}>
            {SOURCES.find((s) => s.id === source)?.title}
            {' — '}
            {SOURCES.find((s) => s.id === source)?.description}
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={closeMenu} />
          <View
            style={[
              styles.dropdown,
              { top: insets.top + 52, right: 12 },
            ]}
            pointerEvents="box-none"
          >
            <View style={styles.dropdownCard}>
              <Text style={styles.dropdownSectionTitle}>Category</Text>
              <ScrollView
                style={styles.categoryScroll}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
              >
                {CATEGORIES.map((c) => (
                  <Pressable
                    key={c}
                    style={({ pressed }) => [
                      styles.menuRow,
                      pressed && styles.menuRowPressed,
                    ]}
                    onPress={() => setCategory(c)}
                  >
                    <Text style={styles.menuRowText}>{c}</Text>
                    {category === c ? (
                      <FontAwesome5 name="check" size={14} color="#111827" />
                    ) : null}
                  </Pressable>
                ))}
              </ScrollView>

              <Text style={[styles.dropdownSectionTitle, styles.sourceTitle]}>
                Add from
              </Text>
              {SOURCES.map((s) => (
                <Pressable
                  key={s.id}
                  style={({ pressed }) => [
                    styles.sourceRow,
                    pressed && styles.menuRowPressed,
                  ]}
                  onPress={() => setSource(s.id)}
                >
                  <View style={styles.sourceRadioOuter}>
                    {source === s.id ? (
                      <View style={styles.sourceRadioInner} />
                    ) : null}
                  </View>
                  <View style={styles.sourceTextBlock}>
                    <Text style={styles.sourceTitleText}>{s.title}</Text>
                    <Text style={styles.sourceDesc}>{s.description}</Text>
                  </View>
                </Pressable>
              ))}

              <Pressable style={styles.doneBtn} onPress={closeMenu}>
                <Text style={styles.doneBtnText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  headerBtn: {
    paddingRight: 16,
    paddingVertical: 4,
  },
  uploadBox: {
    width: '100%',
    maxWidth: 320,
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  uploadPressed: {
    opacity: 0.92,
    backgroundColor: '#F3F4F6',
  },
  uploadIcon: {
    opacity: 0.45,
    marginBottom: 8,
  },
  logoMark: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    opacity: 0.12,
    letterSpacing: -0.5,
  },
  uploadHint: {
    marginTop: 12,
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  summary: {
    marginTop: 28,
    width: '100%',
    maxWidth: 320,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  summarySpaced: {
    marginTop: 12,
  },
  summaryValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  modalRoot: {
    flex: 1,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  dropdown: {
    position: 'absolute',
    left: 12,
    alignItems: 'flex-end',
  },
  dropdownCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  dropdownSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  sourceTitle: {
    marginTop: 12,
  },
  categoryScroll: {
    maxHeight: 200,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  menuRowPressed: {
    backgroundColor: '#F3F4F6',
  },
  menuRowText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  sourceRadioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#111827',
  },
  sourceTextBlock: {
    flex: 1,
  },
  sourceTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  sourceDesc: {
    marginTop: 2,
    fontSize: 13,
    color: '#6B7280',
  },
  doneBtn: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#111827',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
