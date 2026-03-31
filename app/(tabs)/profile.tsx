import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

type ProfileSection = 'shared' | 'closet' | 'items' | 'favorites';

const SECTION_ORDER: ProfileSection[] = ['shared', 'closet', 'items', 'favorites'];
const CLOSET_SECTIONS = [
  { id: 'work', title: 'Work' },
  { id: 'weekend', title: 'Weekend' },
  { id: 'party', title: 'Party' },
];

export default function ProfileTab() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [activeSection, setActiveSection] = useState<ProfileSection>('shared');
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);

  const goToSection = (section: ProfileSection) => {
    const index = SECTION_ORDER.indexOf(section);
    setActiveSection(section);
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
  };

  const pickProfilePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Photos permission needed', 'Allow photo access to set your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setProfileImageUri(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.topRow}>
        <Pressable style={({ pressed }) => [styles.topBtn, pressed && styles.pressed]}>
          <FontAwesome5 name="share-alt" size={13} color="#111827" />
          <Text style={styles.topBtnText}>Share profile</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
          <FontAwesome5 name="cog" size={18} color="#111827" />
        </Pressable>
      </View>

      <View style={styles.profileBlock}>
        <Pressable
          onPress={pickProfilePhoto}
          style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}
          accessibilityLabel="Change profile photo"
        >
          {profileImageUri ? (
            <Image source={{ uri: profileImageUri }} style={styles.avatarImage} />
          ) : (
            <FontAwesome5 name="user" size={36} color="#9CA3AF" />
          )}
          <View style={styles.avatarBadge}>
            <FontAwesome5 name="camera" size={10} color="#FFFFFF" />
          </View>
        </Pressable>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statCount}>12</Text>
            <Text style={styles.statLabel}>Outfits shared</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statCount}>248</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statCount}>180</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>

      <Text style={styles.username}>@yourusername</Text>

      <Pressable style={({ pressed }) => [styles.editBtn, pressed && styles.pressed]}>
        <Text style={styles.editBtnText}>Edit profile</Text>
      </Pressable>

      <View style={styles.iconTabsRow}>
        <Pressable
          style={styles.iconTab}
          onPress={() => goToSection('shared')}
        >
          <FontAwesome5
            name="th"
            size={18}
            color={activeSection === 'shared' ? '#111827' : '#9CA3AF'}
          />
        </Pressable>
        <Pressable style={styles.iconTab} onPress={() => goToSection('closet')}>
          <FontAwesome5
            name="door-closed"
            size={18}
            color={activeSection === 'closet' ? '#111827' : '#9CA3AF'}
          />
        </Pressable>
        <Pressable style={styles.iconTab} onPress={() => goToSection('items')}>
          <FontAwesome5
            name="tshirt"
            size={18}
            color={activeSection === 'items' ? '#111827' : '#9CA3AF'}
          />
        </Pressable>
        <Pressable style={styles.iconTab} onPress={() => goToSection('favorites')}>
          <FontAwesome5
            name="heart"
            size={18}
            color={activeSection === 'favorites' ? '#111827' : '#9CA3AF'}
          />
        </Pressable>
      </View>

      <View style={styles.tabUnderline} />

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveSection(SECTION_ORDER[index] ?? 'shared');
        }}
      >
        <ScrollView
          style={{ width }}
          contentContainerStyle={styles.sectionPage}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          <Text style={styles.sectionTitle}>Shared</Text>
          <Text style={styles.sectionHint}>Posts and outfits you share will show here.</Text>
        </ScrollView>

        <ScrollView
          style={{ width }}
          contentContainerStyle={styles.sectionPage}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          <Text style={styles.sectionTitle}>My Closet</Text>
          {CLOSET_SECTIONS.map((section) => (
            <View key={section.id} style={styles.closetSection}>
              <Pressable
                style={({ pressed }) => [
                  styles.closetHeaderRow,
                  pressed && styles.pressed,
                ]}
                onPress={() => router.push('/(tabs)/collections')}
              >
                <Text style={styles.closetHeaderText}>{section.title}</Text>
                <FontAwesome5 name="chevron-right" size={14} color="#111827" />
              </Pressable>

              <View style={styles.closetCardsRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.closetAddCard,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => router.push('/(tabs)/collections')}
                >
                  <FontAwesome5 name="plus" size={18} color="#6B7280" />
                </Pressable>
                <View style={styles.closetCardPlaceholder}>
                  <Text style={styles.cardHint}>Add to {section.title}</Text>
                </View>
                <View style={styles.closetCardPlaceholder}>
                  <Text style={styles.cardHint}>Add to {section.title}</Text>
                </View>
                <View style={styles.closetCardPlaceholder}>
                  <Text style={styles.cardHint}>Add to {section.title}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        <ScrollView
          style={{ width }}
          contentContainerStyle={styles.sectionPage}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          <Text style={styles.sectionTitle}>My Items</Text>
          <Text style={styles.sectionHint}>Your individual clothing items will appear here.</Text>
        </ScrollView>

        <ScrollView
          style={{ width }}
          contentContainerStyle={styles.sectionPage}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          <Text style={styles.sectionTitle}>Favorites</Text>
          <Text style={styles.sectionHint}>Your liked outfits and saves will appear here.</Text>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topRow: {
    paddingHorizontal: 20,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 9,
  },
  topBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  iconBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
  },
  profileBlock: {
    paddingHorizontal: 20,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 14,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E5E7EB',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statCount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  statLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  username: {
    marginTop: 10,
    marginHorizontal: 20,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  editBtn: {
    marginTop: 12,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  editBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  iconTabsRow: {
    marginTop: 18,
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconTab: {
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  tabUnderline: {
    marginTop: 10,
    marginHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionPage: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  sectionHint: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  closetSection: {
    marginTop: 14,
  },
  closetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  closetHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  closetCardsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  closetAddCard: {
    width: 78,
    height: 102,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closetCardPlaceholder: {
    width: 78,
    height: 102,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
    padding: 8,
    justifyContent: 'center',
  },
  cardHint: {
    fontSize: 11,
    lineHeight: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '600',
  },
  linkBtn: {
    marginTop: 14,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#F9FAFB',
  },
  linkBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  pressed: {
    opacity: 0.7,
  },
});
