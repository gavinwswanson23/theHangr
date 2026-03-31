import { FontAwesome5 } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export type DayOutfitEntry = {
  note: string;
  imageUri?: string | null;
};

function hasManualOutfit(entry: DayOutfitEntry | undefined): boolean {
  if (!entry) return false;
  return Boolean(entry.note?.trim() || entry.imageUri);
}

async function pickOutfitImage(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Photos',
      'Allow photo library access to attach an outfit picture.'
    );
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [3, 4],
    quality: 0.65,
  });
  if (result.canceled || !result.assets?.[0]?.uri) return null;
  return result.assets[0].uri;
}

const WEEK_HEADERS = ['S', 'M', 'T', 'W', 'TH', 'F', 'S'] as const;

type CollectionId = 'work' | 'weekend' | 'party';

const COLLECTIONS: { id: CollectionId; label: string; color: string }[] = [
  { id: 'work', label: 'Work', color: '#6366F1' },
  { id: 'weekend', label: 'Weekend', color: '#10B981' },
  { id: 'party', label: 'Party', color: '#F59E0B' },
];

type CollectionMeta = (typeof COLLECTIONS)[number];

function MiniOutfitPreview({
  entry,
  autoMeta,
}: {
  entry: DayOutfitEntry | undefined;
  autoMeta: CollectionMeta | null | undefined;
}) {
  const manual = hasManualOutfit(entry);
  const uri = entry?.imageUri;

  if (manual && uri) {
    return (
      <View style={styles.miniThumbWrap}>
        <Image source={{ uri }} style={styles.miniThumbImage} />
      </View>
    );
  }
  if (manual) {
    return (
      <View style={[styles.miniThumbWrap, styles.miniThumbPlanned]}>
        <FontAwesome5 name="tshirt" size={12} color="#9CA3AF" />
      </View>
    );
  }
  if (autoMeta) {
    return (
      <View
        style={[
          styles.miniThumbWrap,
          styles.miniThumbAuto,
          { backgroundColor: autoMeta.color + '33' },
        ]}
      >
        <FontAwesome5 name="tshirt" size={12} color={autoMeta.color} />
      </View>
    );
  }
  return (
    <View style={[styles.miniThumbWrap, styles.miniThumbEmpty]}>
      <MaterialCommunityIcons name="hanger" size={14} color="#D1D5DB" />
    </View>
  );
}

const DEFAULT_WEEKDAYS: Record<CollectionId, number[]> = {
  work: [1, 2, 3, 4, 5],
  weekend: [0, 6],
  party: [5, 6],
};

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function dateKey(y: number, m: number, day: number) {
  return `${y}-${pad2(m + 1)}-${pad2(day)}`;
}

function addDays(d: Date, amount: number) {
  const next = new Date(d);
  next.setDate(next.getDate() + amount);
  return next;
}

function parseKey(key: string): { y: number; m: number; d: number } | null {
  const m = key.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return {
    y: Number(m[1]),
    m: Number(m[2]) - 1,
    d: Number(m[3]),
  };
}

function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}

function firstWeekdayOfMonth(y: number, m: number) {
  return new Date(y, m, 1).getDay();
}

function isValidDateKey(key: string): boolean {
  const p = parseKey(key);
  if (!p) return false;
  const dim = daysInMonth(p.y, p.m);
  if (p.d < 1 || p.d > dim) return false;
  return true;
}

export default function CalendarTab() {
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [outfitByDay, setOutfitByDay] = useState<
    Record<string, DayOutfitEntry>
  >({});
  const [weekdaysByCollection, setWeekdaysByCollection] =
    useState<Record<CollectionId, number[]>>(DEFAULT_WEEKDAYS);

  const [dayModalKey, setDayModalKey] = useState<string | null>(null);
  const [dayModalText, setDayModalText] = useState('');
  const [dayModalImageUri, setDayModalImageUri] = useState<string | null>(null);
  const [weekViewerStartKey, setWeekViewerStartKey] = useState<string | null>(
    null
  );

  const [anyDateModalOpen, setAnyDateModalOpen] = useState(false);
  const [anyDateInput, setAnyDateInput] = useState('');
  const [anyDateOutfit, setAnyDateOutfit] = useState('');
  const [anyDateImageUri, setAnyDateImageUri] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const n = new Date();
      setViewYear(n.getFullYear());
      setViewMonth(n.getMonth());
    }, [])
  );

  const today = new Date();
  const todayKey = dateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const todayLabel = today.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const monthTitle = new Date(viewYear, viewMonth, 1).toLocaleDateString(
    undefined,
    { month: 'long', year: 'numeric' }
  );

  const goPrevMonth = () => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  };

  const goNextMonth = () => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  };

  const collectionForWeekday = useCallback(
    (weekday: number): CollectionId | null => {
      const match = COLLECTIONS.find((c) =>
        weekdaysByCollection[c.id].includes(weekday)
      );
      return match?.id ?? null;
    },
    [weekdaysByCollection]
  );

  const toggleCollectionWeekday = (cid: CollectionId, weekday: number) => {
    setWeekdaysByCollection((prev) => {
      const set = new Set(prev[cid]);
      if (set.has(weekday)) set.delete(weekday);
      else set.add(weekday);
      return { ...prev, [cid]: Array.from(set).sort((a, b) => a - b) };
    });
  };

  const openDay = (day: number) => {
    const key = dateKey(viewYear, viewMonth, day);
    const existing = outfitByDay[key];
    setDayModalText(existing?.note ?? '');
    setDayModalImageUri(existing?.imageUri ?? null);
    setDayModalKey(key);
  };

  const openDayByKey = (key: string) => {
    const existing = outfitByDay[key];
    setDayModalText(existing?.note ?? '');
    setDayModalImageUri(existing?.imageUri ?? null);
    setDayModalKey(key);
  };

  const openWeekViewer = (weekIndex: number) => {
    const startDate = new Date(viewYear, viewMonth, 1 - leading + weekIndex * 7);
    setWeekViewerStartKey(
      dateKey(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
    );
  };

  const saveDayOutfit = () => {
    if (!dayModalKey) return;
    const note = dayModalText.trim();
    const uri = dayModalImageUri?.trim() || null;
    setOutfitByDay((prev) => {
      const next = { ...prev };
      if (!note && !uri) delete next[dayModalKey];
      else next[dayModalKey] = { note, imageUri: uri || undefined };
      return next;
    });
    setDayModalKey(null);
  };

  const attachDayPhoto = async () => {
    const uri = await pickOutfitImage();
    if (uri) setDayModalImageUri(uri);
  };

  const openAnyDateModal = () => {
    const e = outfitByDay[todayKey];
    setAnyDateInput(todayKey);
    setAnyDateOutfit(e?.note ?? '');
    setAnyDateImageUri(e?.imageUri ?? null);
    setAnyDateModalOpen(true);
  };

  const saveAnyDateOutfit = () => {
    const key = anyDateInput.trim();
    if (!isValidDateKey(key)) {
      Alert.alert(
        'Invalid date',
        'Use YYYY-MM-DD with a real calendar day (e.g. 2026-03-30).'
      );
      return;
    }
    const note = anyDateOutfit.trim();
    const uri = anyDateImageUri?.trim() || null;
    const p = parseKey(key)!;
    setOutfitByDay((prev) => {
      const next = { ...prev };
      if (!note && !uri) delete next[key];
      else next[key] = { note, imageUri: uri || undefined };
      return next;
    });
    setViewYear(p.y);
    setViewMonth(p.m);
    setAnyDateModalOpen(false);
  };

  const attachAnyDatePhoto = async () => {
    const uri = await pickOutfitImage();
    if (uri) setAnyDateImageUri(uri);
  };

  const leading = firstWeekdayOfMonth(viewYear, viewMonth);
  const dim = daysInMonth(viewYear, viewMonth);
  const cells: (number | null)[] = [];
  for (let i = 0; i < leading; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  const weekStartParsed = weekViewerStartKey ? parseKey(weekViewerStartKey) : null;
  const weekDates = weekStartParsed
    ? Array.from({ length: 7 }).map((_, idx) =>
        addDays(new Date(weekStartParsed.y, weekStartParsed.m, weekStartParsed.d), idx)
      )
    : [];
  const pageWidth = Dimensions.get('window').width;
  const pageHeight = Dimensions.get('window').height - 150;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.page}
        contentContainerStyle={styles.pageContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBlock}>
          <Text style={styles.dateLeft}>{todayLabel}</Text>
          <Text style={styles.calendarTitle}>CALENDER</Text>
        </View>

        <View style={styles.monthNav}>
          <Pressable
            onPress={goPrevMonth}
            style={({ pressed }) => [styles.navBtn, pressed && styles.pressed]}
            accessibilityLabel="Previous month"
          >
            <FontAwesome5 name="chevron-left" size={18} color="#111827" />
          </Pressable>
          <Text style={styles.monthTitle}>{monthTitle}</Text>
          <Pressable
            onPress={goNextMonth}
            style={({ pressed }) => [styles.navBtn, pressed && styles.pressed]}
            accessibilityLabel="Next month"
          >
            <FontAwesome5 name="chevron-right" size={18} color="#111827" />
          </Pressable>
        </View>

        <View style={styles.weekHeaderWrap}>
          <View style={styles.weekArrowSlot} />
          <View style={styles.weekHeaderRow}>
            {WEEK_HEADERS.map((h, idx) => (
              <View key={`${h}-${idx}`} style={styles.weekHeaderCell}>
                <Text style={styles.weekHeaderText}>{h}</Text>
              </View>
            ))}
          </View>
        </View>

        {weeks.map((row, wi) => (
          <View key={wi} style={styles.weekRowWrap}>
            <Pressable
              onPress={() => openWeekViewer(wi)}
              style={({ pressed }) => [
                styles.weekArrowBtn,
                pressed && styles.pressed,
              ]}
              accessibilityLabel={`Open week ${wi + 1} detail view`}
            >
              <FontAwesome5 name="chevron-right" size={14} color="#6B7280" />
            </Pressable>
            <View style={styles.weekRow}>
              {row.map((day, di) => {
              if (day == null) {
                return <View key={`e-${wi}-${di}`} style={styles.dayCell} />;
              }
              const key = dateKey(viewYear, viewMonth, day);
              const isToday = key === todayKey;
              const entry = outfitByDay[key];
              const manual = hasManualOutfit(entry);
              const wd = new Date(viewYear, viewMonth, day).getDay();
              const autoId = manual ? null : collectionForWeekday(wd);
              const autoMeta = autoId
                ? COLLECTIONS.find((c) => c.id === autoId)
                : null;

              return (
                <Pressable
                  key={key}
                  style={({ pressed }) => [
                    styles.dayCell,
                    isToday && styles.dayToday,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => openDay(day)}
                >
                  <Text style={[styles.dayNum, isToday && styles.dayNumToday]}>
                    {day}
                  </Text>
                  <MiniOutfitPreview
                    entry={entry}
                    autoMeta={manual ? undefined : autoMeta}
                  />
                  {manual && entry?.note?.trim() ? (
                    <Text style={styles.dayOutfit} numberOfLines={2}>
                      {entry.note}
                    </Text>
                  ) : manual ? (
                    <Text style={styles.dayOutfitMuted} numberOfLines={1}>
                      Photo
                    </Text>
                  ) : autoMeta ? (
                    <View
                      style={[
                        styles.autoTag,
                        { backgroundColor: autoMeta.color + '22' },
                      ]}
                    >
                      <Text
                        style={[styles.autoTagText, { color: autoMeta.color }]}
                        numberOfLines={1}
                      >
                        {autoMeta.label}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.dayPlaceholder}>Outfit</Text>
                  )}
                </Pressable>
              );
              })}
            </View>
          </View>
        ))}

        <View style={styles.plusRow}>
          <View style={styles.weekArrowSlot} />
          <View style={styles.plusRowSpacer} />
          <Pressable
            onPress={openAnyDateModal}
            style={({ pressed }) => [
              styles.dayCell,
              styles.addDateCell,
              pressed && styles.pressed,
            ]}
            accessibilityLabel="Add or change outfit for any date"
          >
            <FontAwesome5 name="plus" size={22} color="#6B7280" />
          </Pressable>
        </View>

        <View style={styles.closetSection}>
          <Text style={styles.closetHeading}>Closet schedule</Text>
          <Text style={styles.closetSub}>
            Link Work, Weekend, and Party to days of the week. Matching days in
            the calendar update automatically (unless you set a custom outfit
            for that day).
          </Text>
          {COLLECTIONS.map((c) => (
            <View key={c.id} style={styles.collectionBlock}>
              <View style={styles.collectionTitleRow}>
                <View
                  style={[styles.collectionDot, { backgroundColor: c.color }]}
                />
                <Text style={styles.collectionLabel}>{c.label}</Text>
              </View>
              <View style={styles.weekdayChips}>
                {WEEK_HEADERS.map((label, weekday) => (
                  <Pressable
                    key={`${c.id}-${weekday}`}
                    onPress={() => toggleCollectionWeekday(c.id, weekday)}
                    style={({ pressed }) => [
                      styles.chip,
                      weekdaysByCollection[c.id].includes(weekday) &&
                        styles.chipOn,
                      weekdaysByCollection[c.id].includes(weekday) && {
                        borderColor: c.color,
                        backgroundColor: c.color + '18',
                      },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        weekdaysByCollection[c.id].includes(weekday) && {
                          color: c.color,
                          fontWeight: '700',
                        },
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={dayModalKey != null}
        transparent
        animationType="fade"
        onRequestClose={() => setDayModalKey(null)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setDayModalKey(null)}
          />
          <View style={styles.modalCardWrap} pointerEvents="box-none">
            <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {dayModalKey
                ? (() => {
                    const p = parseKey(dayModalKey);
                    if (!p) return 'Outfit';
                    const d = new Date(p.y, p.m, p.d);
                    return d.toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    });
                  })()
                : ''}
            </Text>
            <Text style={styles.modalHint}>
              Name this day’s outfit and add a preview photo. Clear both to use
              your closet schedule for that weekday.
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.photoBtn,
                pressed && styles.pressed,
              ]}
              onPress={attachDayPhoto}
            >
              <FontAwesome5 name="camera" size={14} color="#374151" />
              <Text style={styles.photoBtnText}>Add outfit photo</Text>
            </Pressable>
            {dayModalImageUri ? (
              <View style={styles.modalPreviewBlock}>
                <Image
                  source={{ uri: dayModalImageUri }}
                  style={styles.modalPreviewImg}
                />
                <Pressable onPress={() => setDayModalImageUri(null)}>
                  <Text style={styles.removePhoto}>Remove photo</Text>
                </Pressable>
              </View>
            ) : null}
            <TextInput
              value={dayModalText}
              onChangeText={setDayModalText}
              placeholder="e.g. Blue blazer + loafers"
              placeholderTextColor="#9CA3AF"
              style={[styles.input, styles.inputAfterHint]}
              multiline
            />
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalBtn, styles.modalBtnGhost]}
                onPress={() => setDayModalKey(null)}
              >
                <Text style={styles.modalBtnGhostText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                onPress={saveDayOutfit}
              >
                <Text style={styles.modalBtnPrimaryText}>Save</Text>
              </Pressable>
            </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={weekViewerStartKey != null}
        animationType="slide"
        onRequestClose={() => setWeekViewerStartKey(null)}
      >
        <SafeAreaView style={styles.weeklySafe}>
          <View style={styles.weeklyHeader}>
            <Text style={styles.weeklyTitle}>Week View</Text>
            <Pressable
              onPress={() => setWeekViewerStartKey(null)}
              style={({ pressed }) => [styles.weeklyClose, pressed && styles.pressed]}
              accessibilityLabel="Close week view"
            >
              <FontAwesome5 name="times" size={20} color="#111827" />
            </Pressable>
          </View>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            contentContainerStyle={styles.weeklyScrollContent}
          >
            {weekDates.map((d) => {
              const key = dateKey(d.getFullYear(), d.getMonth(), d.getDate());
              const entry = outfitByDay[key];
              const manual = hasManualOutfit(entry);
              const imageUri = entry?.imageUri ?? null;
              const autoId = manual ? null : collectionForWeekday(d.getDay());
              const autoMeta = autoId
                ? COLLECTIONS.find((c) => c.id === autoId)
                : null;
              return (
                <View
                  key={key}
                  style={[styles.weeklyPage, { width: pageWidth }]}
                >
                  <View style={[styles.weeklyCard, { height: pageHeight }]}>
                    {imageUri ? (
                      <Image source={{ uri: imageUri }} style={styles.weeklyBgImage} />
                    ) : (
                      <View style={styles.weeklyBgFallback}>
                        <MiniOutfitPreview entry={entry} autoMeta={autoMeta} />
                      </View>
                    )}
                    <View style={styles.weeklyOverlay} />
                    <View style={styles.weeklyInfo}>
                      <Text style={styles.weeklyDate}>
                        {d.toLocaleDateString(undefined, {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Text>
                      {manual && entry?.note ? (
                        <Text style={styles.weeklyNote}>{entry.note}</Text>
                      ) : autoMeta ? (
                        <Text style={styles.weeklyAuto}>
                          Auto: {autoMeta.label}
                        </Text>
                      ) : (
                        <Text style={styles.weeklyAuto}>No outfit yet</Text>
                      )}
                    </View>
                    <Pressable
                      onPress={() => openDayByKey(key)}
                      style={({ pressed }) => [
                        styles.weeklyEditBtn,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.weeklyEditText}>Set outfit</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={anyDateModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setAnyDateModalOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setAnyDateModalOpen(false)}
          />
          <View style={styles.modalCardWrap} pointerEvents="box-none">
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Any date outfit</Text>
              <Text style={styles.modalHint}>
                Pick a date, optional photo, and notes. Clear note and photo to
                remove a custom day. The calendar jumps to that month after you
                save.
              </Text>
              <Text style={styles.inputLabel}>Date (YYYY-MM-DD)</Text>
              <TextInput
                value={anyDateInput}
                onChangeText={setAnyDateInput}
                placeholder="2026-03-30"
                placeholderTextColor="#9CA3AF"
                style={styles.inputSingle}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={[styles.inputLabel, styles.inputLabelSpaced]}>
                Outfit photo
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.photoBtn,
                  pressed && styles.pressed,
                ]}
                onPress={attachAnyDatePhoto}
              >
                <FontAwesome5 name="camera" size={14} color="#374151" />
                <Text style={styles.photoBtnText}>Add outfit photo</Text>
              </Pressable>
              {anyDateImageUri ? (
                <View style={styles.modalPreviewBlock}>
                  <Image
                    source={{ uri: anyDateImageUri }}
                    style={styles.modalPreviewImg}
                  />
                  <Pressable onPress={() => setAnyDateImageUri(null)}>
                    <Text style={styles.removePhoto}>Remove photo</Text>
                  </Pressable>
                </View>
              ) : null}
              <Text style={[styles.inputLabel, styles.inputLabelSpaced]}>
                Outfit notes
              </Text>
              <TextInput
                value={anyDateOutfit}
                onChangeText={setAnyDateOutfit}
                placeholder="e.g. Rain jacket + boots"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                multiline
              />
              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalBtn, styles.modalBtnGhost]}
                  onPress={() => setAnyDateModalOpen(false)}
                >
                  <Text style={styles.modalBtnGhostText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalBtn, styles.modalBtnPrimary]}
                  onPress={saveAnyDateOutfit}
                >
                  <Text style={styles.modalBtnPrimaryText}>Save</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  page: {
    flex: 1,
  },
  pageContent: {
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  headerBlock: {
    marginBottom: 12,
  },
  dateLeft: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    alignSelf: 'flex-start',
  },
  calendarTitle: {
    marginTop: 6,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 3,
    color: '#111827',
    textAlign: 'center',
    width: '100%',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  navBtn: {
    padding: 12,
    borderRadius: 10,
  },
  pressed: {
    opacity: 0.7,
  },
  weekHeaderWrap: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  weekHeaderRow: {
    flexDirection: 'row',
    flex: 1,
    marginBottom: 4,
  },
  weekHeaderCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  weekHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  weekRow: {
    flexDirection: 'row',
    flex: 1,
    marginBottom: 4,
  },
  weekRowWrap: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  weekArrowBtn: {
    width: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  weekArrowSlot: {
    width: 26,
    marginRight: 2,
  },
  plusRow: {
    flexDirection: 'row',
    marginBottom: 8,
    marginTop: 2,
  },
  plusRowSpacer: {
    flex: 6,
    marginHorizontal: 2,
  },
  addDateCell: {
    flex: 1,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  miniThumbWrap: {
    width: '100%',
    height: 36,
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniThumbImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  miniThumbPlanned: {
    backgroundColor: '#E5E7EB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
  },
  miniThumbAuto: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  miniThumbEmpty: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  dayCell: {
    flex: 1,
    minHeight: 108,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 4,
    marginHorizontal: 2,
    backgroundColor: '#FAFAFA',
  },
  dayToday: {
    borderColor: '#111827',
    backgroundColor: '#F3F4F6',
  },
  dayNum: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  dayNumToday: {
    textDecorationLine: 'underline',
  },
  dayOutfit: {
    marginTop: 3,
    fontSize: 9,
    fontWeight: '600',
    color: '#374151',
    lineHeight: 12,
  },
  dayOutfitMuted: {
    marginTop: 3,
    fontSize: 9,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  autoTag: {
    marginTop: 3,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  autoTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  dayPlaceholder: {
    marginTop: 3,
    fontSize: 9,
    color: '#D1D5DB',
    fontWeight: '600',
  },
  closetSection: {
    marginTop: 28,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  closetHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.5,
  },
  closetSub: {
    marginTop: 8,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 16,
  },
  collectionBlock: {
    marginBottom: 18,
  },
  collectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  collectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  collectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  weekdayChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  chipOn: {
    borderWidth: 2,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalRoot: {
    flex: 1,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalCardWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  modalHint: {
    marginTop: 8,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  inputLabel: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  inputLabelSpaced: {
    marginTop: 14,
  },
  inputSingle: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  inputAfterHint: {
    marginTop: 14,
  },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#111827',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
  },
  modalBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  modalBtnGhost: {
    backgroundColor: '#F3F4F6',
  },
  modalBtnGhostText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  modalBtnPrimary: {
    backgroundColor: '#111827',
  },
  modalBtnPrimaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  weeklySafe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  weeklyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  weeklyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  weeklyClose: {
    padding: 8,
  },
  weeklyScrollContent: {
    paddingVertical: 18,
  },
  weeklyPage: {
    paddingHorizontal: 16,
  },
  weeklyCard: {
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'space-between',
    backgroundColor: '#111827',
  },
  weeklyBgImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  weeklyBgFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#374151',
  },
  weeklyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  weeklyInfo: {
    padding: 16,
  },
  weeklyDate: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  weeklyNote: {
    marginTop: 8,
    fontSize: 16,
    color: '#F9FAFB',
    fontWeight: '600',
  },
  weeklyAuto: {
    marginTop: 8,
    fontSize: 16,
    color: '#E5E7EB',
    fontWeight: '600',
  },
  weeklyEditBtn: {
    margin: 16,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#FFFFFF55',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  weeklyEditText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  photoBtn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  photoBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  modalPreviewBlock: {
    marginTop: 10,
  },
  modalPreviewImg: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    resizeMode: 'cover',
  },
  removePhoto: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
});
