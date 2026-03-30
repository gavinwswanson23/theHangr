import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const CARD_WIDTH = 132;
const CARD_HEIGHT = 168;
const CARD_GAP = 12;

type HomeSectionConfig = {
  id: string;
  title: string;
  subtitle?: string;
  href: Href;
  quickAddHref: Href;
  showQuickAdd: boolean;
  emptyHint: string;
};

const SECTIONS: HomeSectionConfig[] = [
  {
    id: 'recent-closets',
    title: 'Recent closets',
    href: '/(tabs)/collections',
    quickAddHref: '/(tabs)/add-item',
    showQuickAdd: true,
    emptyHint: 'Add outfits to your closets to see them here.',
  },
  {
    id: 'recent-items',
    title: 'Recent items',
    href: '/(tabs)/add-item',
    quickAddHref: '/(tabs)/add-item',
    showQuickAdd: true,
    emptyHint: 'Add pieces to your closet to see recent items here.',
  },
  {
    id: 'today-suggestions',
    title: "Today's suggestions",
    subtitle: 'Based on the weather',
    href: '/(tabs)/calendar',
    quickAddHref: '/(tabs)/add-item',
    showQuickAdd: false,
    emptyHint: 'Add items to your closet to get outfit ideas for today’s weather.',
  },
  {
    id: 'favorites',
    title: 'Favorites',
    href: '/(tabs)/collections',
    quickAddHref: '/(tabs)/add-item',
    showQuickAdd: false,
    emptyHint: 'Save favorites in your closet to see them here.',
  },
  {
    id: 'more',
    title: 'More for you',
    href: '/(tabs)/reels',
    quickAddHref: '/(tabs)/reels',
    showQuickAdd: false,
    emptyHint: 'Explore reels and inspiration — content will show here once available.',
  },
];

function QuickAddCard({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        styles.quickAddCard,
        pressed && styles.cardPressed,
      ]}
    >
      <FontAwesome5 name="plus" size={28} color="#6B7280" />
    </Pressable>
  );
}

function PlaceholderOutfitCard({ hint }: { hint: string }) {
  return (
    <View style={[styles.card, styles.placeholderCard]}>
      <Text style={styles.placeholderHint} numberOfLines={4}>
        {hint}
      </Text>
    </View>
  );
}

function SectionBlock({ config }: { config: HomeSectionConfig }) {
  const router = useRouter();
  const placeholderCount = config.showQuickAdd ? 3 : 4;

  return (
    <View style={styles.section}>
      <Pressable
        onPress={() => router.push(config.href)}
        style={({ pressed }) => [styles.sectionHeader, pressed && styles.headerPressed]}
        accessibilityRole="button"
        accessibilityLabel={`${config.title}, open`}
      >
        <View style={styles.sectionTitleBlock}>
          <Text style={styles.sectionTitle}>{config.title}</Text>
          {config.subtitle ? (
            <Text style={styles.sectionSubtitle}>{config.subtitle}</Text>
          ) : null}
        </View>
        <FontAwesome5 name="chevron-right" size={16} color="#111827" />
      </Pressable>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rowContent}
      >
        {config.showQuickAdd ? (
          <QuickAddCard onPress={() => router.push(config.quickAddHref)} />
        ) : null}
        {Array.from({ length: placeholderCount }).map((_, i) => (
          <PlaceholderOutfitCard key={i} hint={config.emptyHint} />
        ))}
      </ScrollView>
    </View>
  );
}

export default function HomeTab() {
  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.pageContent}
      showsVerticalScrollIndicator={false}
    >
      {SECTIONS.map((config) => (
        <SectionBlock key={config.id} config={config} />
      ))}
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 12,
  },
  headerPressed: {
    opacity: 0.65,
  },
  sectionTitleBlock: {
    flex: 1,
    paddingRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  sectionSubtitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  rowContent: {
    paddingHorizontal: 20,
    gap: CARD_GAP,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
  },
  quickAddCard: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderCard: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 10,
    justifyContent: 'center',
  },
  placeholderHint: {
    fontSize: 12,
    lineHeight: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  cardPressed: {
    opacity: 0.85,
  },
});
