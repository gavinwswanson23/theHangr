//eyoooo
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  createBoardSprite,
  deleteBoardSprite,
  ensurePrimaryBoard,
  fetchBoardSprites,
  saveZOrder,
  updateBoardSpriteTransform,
  uploadSpriteImage,
} from '@/lib/board-store';
import { useAuth } from '@/providers/AuthProvider';

const { width: SW, height: SH } = Dimensions.get('window');

// ─── TOKENS (mellow blue) ─────────────────────────────────────────
const C = {
  black: '#0B1620',
  white: '#F7FAFF',
  offwhite: '#EEF5FF',
  grey1: '#D9E6F7',
  grey2: '#8FA6C2',
  grey3: '#4B647D',
  accent: '#6AA6FF',
  success: '#4FA3C7',
  danger: '#E05C5C',
};

// ─── FEEDBACK CHIPS ───────────────────────────────────────────────
const LIKE_CHIPS = ['Love this fit', 'Great colors', 'Perfect style', 'Clean look', 'Very me'];
const DISLIKE_CHIPS = ['Too formal', 'Too casual', 'Wrong colors', 'Too bulky', 'Not my style', 'Too loud'];

type CatalogItem = {
  id: string;
  name: string;
  brand: string;
  price: number;
  img: string;
};

type Outfit = {
  id: string;
  vibe: string;
  items: {
    top: CatalogItem;
    outer: CatalogItem;
    bottom: CatalogItem;
    shoes: CatalogItem;
  };
};

// ─── MOCK OUTFIT CATALOG ──────────────────────────────────────────
const CATALOG: Outfit[] = [
  {
    id: 'outfit1',
    vibe: 'Smart Casual',
    items: {
      top: {
        id: 't1',
        name: 'Slim Oxford Shirt',
        brand: 'COS',
        price: 89,
        img: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=1200&q=80&auto=format&fit=crop',
      },
      outer: {
        id: 'o1',
        name: 'Relaxed Overcoat',
        brand: 'Massimo Dutti',
        price: 279,
        img: 'https://images.unsplash.com/photo-1520975682071-a7c642fe26b0?w=1200&q=80&auto=format&fit=crop',
      },
      bottom: {
        id: 'b1',
        name: 'Tapered Chino',
        brand: 'Uniqlo',
        price: 59,
        img: 'https://images.unsplash.com/photo-1520975661595-6453be3f7070?w=1200&q=80&auto=format&fit=crop',
      },
      shoes: {
        id: 's2',
        name: 'Derby Leather',
        brand: 'Thursday Boot',
        price: 199,
        img: 'https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?w=1200&q=80&auto=format&fit=crop',
      },
    },
  },
  {
    id: 'outfit2',
    vibe: 'Streetwear',
    items: {
      top: {
        id: 't3',
        name: 'Linen Overshirt',
        brand: 'Arket',
        price: 95,
        img: 'https://images.unsplash.com/photo-1520975681960-7bb0f59bb4b8?w=1200&q=80&auto=format&fit=crop',
      },
      outer: {
        id: 'o2',
        name: 'Harrington Jacket',
        brand: 'Baracuta',
        price: 395,
        img: 'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=1200&q=80&auto=format&fit=crop',
      },
      bottom: {
        id: 'b3',
        name: 'Raw Selvedge Denim',
        brand: 'Naked & Famous',
        price: 185,
        img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=1200&q=80&auto=format&fit=crop',
      },
      shoes: {
        id: 's1',
        name: 'Clean Runner',
        brand: 'New Balance',
        price: 130,
        img: 'https://images.unsplash.com/photo-1528701800489-20be3c0ea1a9?w=1200&q=80&auto=format&fit=crop',
      },
    },
  },
  {
    id: 'outfit3',
    vibe: 'Minimal',
    items: {
      top: {
        id: 't2',
        name: 'Merino Crewneck',
        brand: 'Everlane',
        price: 110,
        img: 'https://images.unsplash.com/photo-1520975688048-1b6c93a0f5b0?w=1200&q=80&auto=format&fit=crop',
      },
      outer: {
        id: 'o3',
        name: 'Quilted Vest',
        brand: 'Barbour',
        price: 169,
        img: 'https://images.unsplash.com/photo-1520975689162-ded191b8c1b8?w=1200&q=80&auto=format&fit=crop',
      },
      bottom: {
        id: 'b2',
        name: 'Slim Wool Trouser',
        brand: 'COS',
        price: 129,
        img: 'https://images.unsplash.com/photo-1520975685637-b3bbd0e07b2d?w=1200&q=80&auto=format&fit=crop',
      },
      shoes: {
        id: 's3',
        name: 'Slip-On Canvas',
        brand: 'Common Projects',
        price: 245,
        img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80&auto=format&fit=crop',
      },
    },
  },
  {
    id: 'outfit4',
    vibe: 'Business Casual',
    items: {
      top: {
        id: 't4',
        name: 'White Poplin Shirt',
        brand: 'Everlane',
        price: 78,
        img: 'https://images.unsplash.com/photo-1520975908241-2756b0a0f2f4?w=1200&q=80&auto=format&fit=crop',
      },
      outer: {
        id: 'o4',
        name: 'Slim Fit Blazer',
        brand: 'COS',
        price: 249,
        img: 'https://images.unsplash.com/photo-1520975917467-68d26d3e3f1d?w=1200&q=80&auto=format&fit=crop',
      },
      bottom: {
        id: 'b4',
        name: 'Pleated Trousers',
        brand: 'Arket',
        price: 139,
        img: 'https://images.unsplash.com/photo-1520975933390-3f3f0b5b7d85?w=1200&q=80&auto=format&fit=crop',
      },
      shoes: {
        id: 's4',
        name: 'Chelsea Boot',
        brand: 'Thursday Boot',
        price: 229,
        img: 'https://images.unsplash.com/photo-1612296727718-0a9f7c4ad6a1?w=1200&q=80&auto=format&fit=crop',
      },
    },
  },
  {
    id: 'outfit5',
    vibe: 'Weekend',
    items: {
      top: {
        id: 't5',
        name: 'Washed Graphic Tee',
        brand: 'Uniqlo',
        price: 29,
        img: 'https://images.unsplash.com/photo-1520975920749-8bdb5f2b9f3b?w=1200&q=80&auto=format&fit=crop',
      },
      outer: {
        id: 'o5',
        name: 'Fleece Zip-Up',
        brand: 'Patagonia',
        price: 149,
        img: 'https://images.unsplash.com/photo-1520975922343-7bd9d4a35a1c?w=1200&q=80&auto=format&fit=crop',
      },
      bottom: {
        id: 'b5',
        name: 'Cargo Pants',
        brand: 'Carhartt',
        price: 89,
        img: 'https://images.unsplash.com/photo-1520975922343-7bd9d4a35a1c?w=1200&q=80&auto=format&fit=crop',
      },
      shoes: {
        id: 's5',
        name: 'Trail Runner',
        brand: 'Salomon',
        price: 160,
        img: 'https://images.unsplash.com/photo-1528701800489-20be3c0ea1a9?w=1200&q=80&auto=format&fit=crop',
      },
    },
  },
];

// ─── SHARED BUTTONS ───────────────────────────────────────────────
function BtnPrimary({
  label,
  onPress,
  disabled,
  style,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: object;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    onPress?.();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity
        onPress={press}
        disabled={disabled}
        activeOpacity={0.85}
        style={[s.btnPrimary, disabled && { backgroundColor: C.grey2, borderColor: C.grey2 }]}>
        <Text style={s.btnPrimaryTxt}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function BtnOutline({
  label,
  onPress,
  style,
  textColor,
}: {
  label: string;
  onPress?: () => void;
  style?: object;
  textColor?: string;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[s.btnOutline, style]}>
      <Text style={[s.btnOutlineTxt, textColor ? { color: textColor } : null]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── SPLASH ───────────────────────────────────────────────────────
function SplashScreen({ onNext }: { onNext: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]).start();
    const t = setTimeout(onNext, 2800);
    return () => clearTimeout(t);
  }, [onNext, opacity, translateY]);

  return (
    <View style={[s.fill, { backgroundColor: C.black, alignItems: 'center', justifyContent: 'center' }]}>
      <StatusBar barStyle="light-content" />
      <Animated.Text style={[s.splashLogo, { opacity, transform: [{ translateY }] }]}>DRIP</Animated.Text>
      <Animated.Text style={[s.splashSub, { opacity, transform: [{ translateY }] }]}>
        style, found instantly
      </Animated.Text>
      <Animated.View style={[s.splashLine, { opacity }]} />
    </View>
  );
}

// ─── WELCOME ──────────────────────────────────────────────────────
function WelcomeScreen({ onStart }: { onStart: () => void }) {
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, [fade]);

  return (
    <SafeAreaView style={[s.fill, { backgroundColor: C.offwhite }]}>
      <StatusBar barStyle="dark-content" />

      <View style={s.welcomeHero}>
        {['Top', 'Bottom', 'Shoes', 'Outer'].map((tag, i) => (
          <Animated.View
            key={tag}
            style={[
              s.floatingTag,
              {
                opacity: fade,
                top: i < 2 ? 60 + i * 70 : 190 + (i - 2) * 70,
                left: i % 2 === 0 ? 8 : undefined,
                right: i % 2 !== 0 ? 8 : undefined,
              },
            ]}>
            <Text style={s.floatingTagTxt}>{tag}</Text>
          </Animated.View>
        ))}

        <Animated.View style={{ opacity: fade, alignItems: 'center', paddingHorizontal: 32 }}>
          <Text style={s.heroSub}>your wardrobe, reimagined</Text>
          <Text style={s.heroTitle}>
            {'Dress\n'}
            <Text style={s.heroItalic}>better,</Text>
            {'\neffortlessly.'}
          </Text>
        </Animated.View>
      </View>

      <View style={s.welcomePanel}>
        <Text style={s.welcomeHeading}>Upload a look. Get a wardrobe.</Text>
        <Text style={s.welcomeBody}>
          DRIP scans your style and surfaces in-stock items from top brands — assembled on you.
        </Text>
        <View style={s.welcomeBtns}>
          <BtnPrimary label="Get Started" onPress={onStart} style={{ flex: 1 }} />
          <BtnOutline label="Sign In" onPress={() => {}} style={{ flex: 1 }} />
        </View>
        <Text style={s.welcomeNote}>5 free outfit builds per day · No card required</Text>
      </View>
    </SafeAreaView>
  );
}

// ─── UPLOAD ───────────────────────────────────────────────────────
function UploadScreen({ onDetected, onBack }: { onDetected: (spriteUri: string) => void; onBack: () => void }) {
  const [phase, setPhase] = useState<'idle' | 'detecting' | 'done'>('idle');
  const [imgUri, setImgUri] = useState<string | null>(null);
  const [spriteUri, setSpriteUri] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  const pickImage = async () => {
    setErrorMsg(null);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (result.canceled) return;
    const picked = result.assets[0]?.uri;
    if (!picked) return;
    setImgUri(picked);
    setSpriteUri(null);
    setPhase('idle');
  };

  const takePhoto = async () => {
    setErrorMsg(null);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setErrorMsg('Camera permission is required to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (result.canceled) return;
    const captured = result.assets[0]?.uri;
    if (!captured) return;
    setImgUri(captured);
    setSpriteUri(null);
    setPhase('idle');
  };

  const blobToDataUri = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read image blob.'));
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

  const removeBackground = async () => {
    if (!imgUri) return;
    const apiKey = process.env.EXPO_PUBLIC_REMOVEBG_API_KEY;
    if (!apiKey) {
      setErrorMsg('Set EXPO_PUBLIC_REMOVEBG_API_KEY in your environment to enable background removal.');
      return;
    }

    try {
      setErrorMsg(null);
      setPhase('detecting');
      loopRef.current = Animated.loop(Animated.timing(spinAnim, { toValue: 1, duration: 700, useNativeDriver: true }));
      loopRef.current.start();

      const formData = new FormData();
      formData.append(
        'image_file',
        {
          uri: imgUri,
          name: `upload-${Date.now()}.jpg`,
          type: 'image/jpeg',
        } as never
      );
      formData.append('size', 'auto');
      formData.append('format', 'png');

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: { 'X-Api-Key': apiKey },
        body: formData,
      });

      if (!response.ok) {
        const errTxt = await response.text();
        throw new Error(errTxt || 'Background removal failed.');
      }

      const pngBlob = await response.blob();
      const dataUri = await blobToDataUri(pngBlob);
      setSpriteUri(dataUri);
      setPhase('done');
    } catch {
      setPhase('idle');
      setErrorMsg('Could not remove background. Check API key and try again.');
    } finally {
      loopRef.current?.stop();
      spinAnim.setValue(0);
    }
  };

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <SafeAreaView style={[s.fill, { backgroundColor: C.offwhite }]}>
      <StatusBar barStyle="dark-content" />

      <View style={s.nav}>
        <TouchableOpacity onPress={onBack} style={{ width: 70 }}>
          <Text style={s.navBackTxt}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.navTitle}>DRIP</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, gap: 20 }} showsVerticalScrollIndicator={false}>
        <Text style={s.screenTitle}>{'Upload\nyour style.'}</Text>
        <Text style={s.screenSub}>A photo of an outfit you love — we’ll find every piece.</Text>

        <TouchableOpacity onPress={pickImage} activeOpacity={0.8} style={s.dropZone}>
          {!imgUri ? (
            <View style={{ alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 40, color: C.grey3 }}>＋</Text>
              <Text style={s.dropZoneMain}>Tap to upload a photo</Text>
              <Text style={s.dropZoneSub}>JPG · PNG supported</Text>
            </View>
          ) : (
            <View style={s.fill}>
              <Image source={{ uri: spriteUri ?? imgUri }} style={s.uploadPreview} resizeMode="contain" />
              {phase === 'detecting' && (
                <View style={s.detectingOverlay}>
                  <Animated.View style={[s.spinner, { transform: [{ rotate: spin }] }]} />
                  <Text style={s.detectingTxt}>Removing background…</Text>
                </View>
              )}
              {phase === 'done' && (
                <View style={s.detectingOverlay}>
                  <View style={s.successCircle}>
                    <Text style={{ color: C.white, fontSize: 24 }}>✓</Text>
                  </View>
                  <Text style={s.detectingTxt}>Sprite ready</Text>
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <BtnOutline label="Camera Roll" onPress={pickImage} style={{ flex: 1 }} />
          <BtnOutline label="Take Photo" onPress={takePhoto} style={{ flex: 1 }} />
        </View>

        {!!imgUri && phase !== 'detecting' && (
          <>
            {!spriteUri ? (
              <BtnPrimary label="Remove Background" onPress={removeBackground} />
            ) : (
              <BtnPrimary label="Open Vision Board →" onPress={() => spriteUri && onDetected(spriteUri)} />
            )}
            <TouchableOpacity
              onPress={() => {
                setPhase('idle');
                setImgUri(null);
                setSpriteUri(null);
                setErrorMsg(null);
              }}
              style={{ alignItems: 'center', paddingVertical: 8 }}>
              <Text style={{ fontSize: 12, color: C.grey3, letterSpacing: 1, textTransform: 'uppercase' }}>
                Try a different photo
              </Text>
            </TouchableOpacity>
          </>
        )}
        {errorMsg && <Text style={{ fontSize: 12, color: C.danger }}>{errorMsg}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

type BoardSprite = { id: string; uri: string; x: number; y: number; scale: number; zIndex: number };

const LOCAL_SPRITE_ID_PREFIX = 'local-';
const isLocalSpriteId = (id: string) => id.startsWith(LOCAL_SPRITE_ID_PREFIX);

function DraggableSprite({
  uri,
  startX,
  startY,
  initialScale,
  maxCanvasHeight,
  trashRect,
  onDropToTrash,
  onTransformCommit,
  onPressIn,
  selected,
}: {
  uri: string;
  startX: number;
  startY: number;
  initialScale: number;
  maxCanvasHeight: number;
  trashRect: { x: number; y: number; w: number; h: number } | null;
  onDropToTrash: () => void;
  onTransformCommit?: (next: { x: number; y: number; scale: number }) => void;
  onPressIn?: () => void;
  selected?: boolean;
}) {
  const pan = useRef(new Animated.ValueXY({ x: startX, y: startY })).current;
  const [scale, setScale] = useState(initialScale);
  const scaleRef = useRef(initialScale);
  const posRef = useRef({ x: startX, y: startY });
  const pinchStartDistanceRef = useRef<number | null>(null);
  const pinchStartScaleRef = useRef(1);
  const pinchStartMidRef = useRef<{ x: number; y: number } | null>(null);
  const pinchStartPosRef = useRef({ x: startX, y: startY });
  const dragStartTouchRef = useRef<{ x: number; y: number } | null>(null);
  const dragStartPosRef = useRef({ x: startX, y: startY });
  const baseSpriteW = SW * 0.28;
  const baseSpriteH = baseSpriteW / 0.65;
  const minScale = Math.max(10 / baseSpriteW, 10 / baseSpriteH);
  const maxScale = Math.max(1, maxCanvasHeight / baseSpriteH);
  const spriteW = baseSpriteW * scale;
  const spriteH = baseSpriteH * scale;

  const clampScale = (next: number) => Math.min(maxScale, Math.max(minScale, next));
  const touchDistance = (a: { pageX: number; pageY: number }, b: { pageX: number; pageY: number }) =>
    Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
  const touchMidpoint = (a: { pageX: number; pageY: number }, b: { pageX: number; pageY: number }) => ({
    x: (a.pageX + b.pageX) / 2,
    y: (a.pageY + b.pageY) / 2,
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pinchStartDistanceRef.current = null;
        pinchStartMidRef.current = null;
        dragStartTouchRef.current = null;
        onPressIn?.();
      },
      onPanResponderMove: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length >= 2) {
          dragStartTouchRef.current = null;
          const d = touchDistance(touches[0], touches[1]);
          const mid = touchMidpoint(touches[0], touches[1]);
          if (!pinchStartDistanceRef.current) {
            pinchStartDistanceRef.current = d;
            pinchStartScaleRef.current = scaleRef.current;
            pinchStartMidRef.current = mid;
            pinchStartPosRef.current = { ...posRef.current };
            return;
          }
          const ratio = d / pinchStartDistanceRef.current;
          const nextScale = clampScale(pinchStartScaleRef.current * ratio);
          scaleRef.current = nextScale;
          setScale(nextScale);
          const startMid = pinchStartMidRef.current ?? mid;
          const nextX = pinchStartPosRef.current.x + (mid.x - startMid.x);
          const nextY = pinchStartPosRef.current.y + (mid.y - startMid.y);
          posRef.current = { x: nextX, y: nextY };
          pan.setValue(posRef.current);
          return;
        }
        const touch = touches[0];
        if (!touch) return;
        pinchStartDistanceRef.current = null;
        pinchStartMidRef.current = null;
        if (!dragStartTouchRef.current) {
          dragStartTouchRef.current = { x: touch.pageX, y: touch.pageY };
          dragStartPosRef.current = { ...posRef.current };
          return;
        }
        const nextX = dragStartPosRef.current.x + (touch.pageX - dragStartTouchRef.current.x);
        const nextY = dragStartPosRef.current.y + (touch.pageY - dragStartTouchRef.current.y);
        posRef.current = { x: nextX, y: nextY };
        pan.setValue(posRef.current);
      },
      onPanResponderRelease: () => {
        pinchStartDistanceRef.current = null;
        pinchStartMidRef.current = null;
        dragStartTouchRef.current = null;
        const x = posRef.current.x;
        const y = posRef.current.y;
        if (trashRect) {
          const cx = x + (baseSpriteW * scaleRef.current) / 2;
          const cy = y + (baseSpriteH * scaleRef.current) / 2;
          const insideX = cx >= trashRect.x && cx <= trashRect.x + trashRect.w;
          const insideY = cy >= trashRect.y && cy <= trashRect.y + trashRect.h;
          if (insideX && insideY) onDropToTrash();
        }
        onTransformCommit?.({ x, y, scale: scaleRef.current });
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        s.spriteWrap,
        {
          width: spriteW,
          height: spriteH,
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        },
        selected && s.spriteSelected,
      ]}>
      <View {...panResponder.panHandlers} style={s.spriteTouchArea}>
        <Image source={{ uri }} style={s.spriteImg} resizeMode="contain" />
      </View>
    </Animated.View>
  );
}

function VisionBoardScreen({
  onBack,
  sprites = [],
  onAddSprite = () => {},
  onDeleteSprite = () => {},
  onBringToFront = () => {},
  onSendToBack = () => {},
  onTransformCommit = () => {},
  boardSyncMsg,
}: {
  onBack: () => void;
  sprites?: BoardSprite[];
  onAddSprite?: (uri: string) => void;
  onDeleteSprite?: (id: string) => void;
  onBringToFront?: (id: string) => void;
  onSendToBack?: (id: string) => void;
  onTransformCommit?: (spriteId: string, next: { x: number; y: number; scale: number }) => void;
  boardSyncMsg?: string | null;
}) {
  const [trashRect, setTrashRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [canvasHeight, setCanvasHeight] = useState(SH * 0.7);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [selectedSpriteId, setSelectedSpriteId] = useState<string | null>(null);
  const spriteList = Array.isArray(sprites) ? sprites : [];

  const blobToDataUri = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read image blob.'));
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

  const addAsSprite = async (uri: string) => {
    const apiKey = process.env.EXPO_PUBLIC_REMOVEBG_API_KEY;
    if (!apiKey) {
      onAddSprite(uri);
      return;
    }

    try {
      setAdding(true);
      setAddError(null);
      const formData = new FormData();
      formData.append(
        'image_file',
        {
          uri,
          name: `board-${Date.now()}.jpg`,
          type: 'image/jpeg',
        } as never
      );
      formData.append('size', 'auto');
      formData.append('format', 'png');

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: { 'X-Api-Key': apiKey },
        body: formData,
      });
      if (!response.ok) {
        const errTxt = await response.text();
        throw new Error(errTxt || 'Background removal failed.');
      }
      const pngBlob = await response.blob();
      const dataUri = await blobToDataUri(pngBlob);
      onAddSprite(dataUri);
    } catch {
      onAddSprite(uri);
      setAddError('Added original photo (background removal failed).');
    } finally {
      setAdding(false);
    }
  };

  const pickBoardImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (result.canceled) return;
    const picked = result.assets[0]?.uri;
    if (picked) await addAsSprite(picked);
  };

  const takeBoardPhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (result.canceled) return;
    const captured = result.assets[0]?.uri;
    if (captured) await addAsSprite(captured);
  };

  return (
    <SafeAreaView style={[s.fill, { backgroundColor: C.offwhite }]}>
      <StatusBar barStyle="dark-content" />
      <View style={s.nav}>
        <TouchableOpacity onPress={onBack} style={{ width: 70 }}>
          <Text style={s.navBackTxt}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.navTitle}>BOARD</Text>
        <TouchableOpacity onPress={pickBoardImage} style={{ width: 70, alignItems: 'flex-end' }}>
          <Text style={s.navBackTxt}>+ Add</Text>
        </TouchableOpacity>
      </View>
      <View style={s.boardActions}>
        <BtnOutline label="Camera Roll" onPress={pickBoardImage} style={{ flex: 1 }} />
        <BtnOutline label="Take Photo" onPress={takeBoardPhoto} style={{ flex: 1 }} />
      </View>
      {adding && <Text style={s.boardStatus}>Processing sprite...</Text>}
      {!!boardSyncMsg && <Text style={s.boardStatus}>{boardSyncMsg}</Text>}
      {addError && <Text style={s.boardError}>{addError}</Text>}
      <View
        style={s.boardCanvas}
        onLayout={(e) => {
          setCanvasHeight(e.nativeEvent.layout.height);
        }}>
        <Text style={s.boardHint}>Drag your clothing sprite anywhere</Text>
        {spriteList.length > 0 ? (
          spriteList.map((sprite) => (
            <DraggableSprite
              key={sprite.id}
              uri={sprite.uri}
              startX={sprite.x}
              startY={sprite.y}
              initialScale={sprite.scale}
              maxCanvasHeight={canvasHeight}
              trashRect={trashRect}
              onDropToTrash={() => onDeleteSprite(sprite.id)}
              onTransformCommit={(next) => onTransformCommit(sprite.id, next)}
              onPressIn={() => setSelectedSpriteId(sprite.id)}
              selected={selectedSpriteId === sprite.id}
            />
          ))
        ) : (
          <Text style={s.boardEmpty}>Upload and process an image first.</Text>
        )}
        <View
          style={s.trashZone}
          onLayout={(e) => {
            const { x, y, width, height } = e.nativeEvent.layout;
            setTrashRect({ x, y, w: width, h: height });
          }}>
          <Text style={s.trashIcon}>🗑</Text>
        </View>
        <View style={s.layerActions}>
          <BtnOutline
            label="Back"
            onPress={() => {
              if (!selectedSpriteId) return;
              onSendToBack(selectedSpriteId);
            }}
            style={s.layerBtn}
            textColor={selectedSpriteId ? C.black : C.grey2}
          />
          <BtnOutline
            label="Front"
            onPress={() => {
              if (!selectedSpriteId) return;
              onBringToFront(selectedSpriteId);
            }}
            style={s.layerBtn}
            textColor={selectedSpriteId ? C.black : C.grey2}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── OUTFIT CARD (slot + feedback) ────────────────────────────────
function OutfitCard({
  outfit,
  onFeedback,
  onAddToCart,
  cart,
}: {
  outfit: Outfit;
  onFeedback: (fb: { liked: string[]; disliked: string[]; text: string }) => void;
  onAddToCart: (item: CatalogItem) => void;
  cart: CatalogItem[];
}) {
  const SLOTS = useMemo(() => ['top', 'outer', 'bottom', 'shoes'] as const, []);
  const LABELS: Record<(typeof SLOTS)[number], string> = { top: 'Top', outer: 'Outer', bottom: 'Bottom', shoes: 'Shoes' };

  const anims = useRef(
    SLOTS.map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(-80),
      scale: new Animated.Value(0.85),
    }))
  ).current;

  const [revealed, setRevealed] = useState([false, false, false, false]);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [likedChips, setLikedChips] = useState<string[]>([]);
  const [dislikedChips, setDislikedChips] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    anims.forEach((a) => {
      a.opacity.setValue(0);
      a.translateY.setValue(-80);
      a.scale.setValue(0.85);
    });
    setRevealed([false, false, false, false]);
    setFeedbackOpen(false);
    setFeedbackText('');
    setLikedChips([]);
    setDislikedChips([]);
    setSubmitted(false);

    const timers: ReturnType<typeof setTimeout>[] = [];
    SLOTS.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          Animated.parallel([
            Animated.spring(anims[i].translateY, { toValue: 0, friction: 8, tension: 70, useNativeDriver: true }),
            Animated.timing(anims[i].opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
            Animated.spring(anims[i].scale, { toValue: 1, friction: 7, tension: 70, useNativeDriver: true }),
          ]).start();
          setRevealed((p) => {
            const n = [...p];
            n[i] = true;
            return n;
          });
        }, i * 500)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [outfit.id, anims, SLOTS]);

  const toggleLike = (c: string) => setLikedChips((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));
  const toggleDislike = (c: string) =>
    setDislikedChips((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));

  const submitFeedback = () => {
    onFeedback({ liked: likedChips, disliked: dislikedChips, text: feedbackText });
    setSubmitted(true);
    setTimeout(() => setFeedbackOpen(false), 900);
  };

  const total = SLOTS.reduce((s, k) => s + outfit.items[k].price, 0);

  return (
    <View style={{ marginHorizontal: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Text style={s.vibeTxt}>{outfit.vibe}</Text>
        <Text style={s.totalPriceLg}>${total}</Text>
      </View>

      <View style={s.slotGrid}>
        {SLOTS.map((key, i) => {
          const item = outfit.items[key];
          const inCart = !!cart.find((x) => x.id === item.id);
          return (
            <Animated.View
              key={key}
              style={[
                s.slotCell,
                {
                  opacity: anims[i].opacity,
                  transform: [{ translateY: anims[i].translateY }, { scale: anims[i].scale }],
                },
              ]}>
              <View style={s.slotImgWrap}>
                {!revealed[i] && <View style={[StyleSheet.absoluteFill, { backgroundColor: C.grey1 }]} />}
                <Image source={{ uri: item.img }} style={s.slotImg} resizeMode="cover" />
                <View style={s.slotBadge}>
                  <Text style={s.slotBadgeTxt}>{LABELS[key]}</Text>
                </View>
              </View>
              <View style={s.slotInfo}>
                <Text style={s.itemBrand}>{item.brand}</Text>
                <Text style={s.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <Text style={s.itemPrice}>${item.price}</Text>
                  <TouchableOpacity onPress={() => onAddToCart(item)} style={[s.addBtn, inCart && { backgroundColor: C.success }]}>
                    <Text style={s.addBtnTxt}>{inCart ? '✓' : 'Add'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          );
        })}
      </View>

      {!feedbackOpen && !submitted && (
        <TouchableOpacity onPress={() => setFeedbackOpen(true)} style={s.feedbackTrigger}>
          <Text style={s.feedbackTriggerTxt}>Tell us what to change</Text>
        </TouchableOpacity>
      )}

      {submitted && (
        <View style={s.feedbackTrigger}>
          <Text style={[s.feedbackTriggerTxt, { color: C.success }]}>✓ Got it — refining your next outfit</Text>
        </View>
      )}

      {feedbackOpen && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={s.feedbackPanel}>
            <Text style={s.chipLabel}>What do you like?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', gap: 8, paddingRight: 16 }}>
                {LIKE_CHIPS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => toggleLike(c)}
                    style={[s.chip, { borderColor: C.success }, likedChips.includes(c) && { backgroundColor: C.success }]}>
                    <Text style={[s.chipTxt, likedChips.includes(c) && { color: C.white }]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={s.chipLabel}>What would you change?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', gap: 8, paddingRight: 16 }}>
                {DISLIKE_CHIPS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => toggleDislike(c)}
                    style={[s.chip, { borderColor: C.danger }, dislikedChips.includes(c) && { backgroundColor: C.danger }]}>
                    <Text style={[s.chipTxt, dislikedChips.includes(c) && { color: C.white }]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={s.textInputWrap}>
              <TextInput
                style={s.textInput}
                placeholder="Or describe exactly what you want changed…"
                placeholderTextColor={C.grey2}
                value={feedbackText}
                onChangeText={setFeedbackText}
                multiline
                maxLength={220}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12, alignItems: 'center' }}>
              <BtnPrimary label="Refine →" onPress={submitFeedback} style={{ flex: 1 }} />
              <TouchableOpacity onPress={() => setFeedbackOpen(false)} style={{ paddingHorizontal: 12, paddingVertical: 10 }}>
                <Text style={{ fontSize: 12, color: C.grey3 }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

// ─── FEED SCREEN (vertical swipe) ─────────────────────────────────
function FeedScreen({ onBack, onShuffle, scrambles }: { onBack: () => void; onShuffle: () => void; scrambles: number }) {
  const [index, setIndex] = useState(0);
  const [cart, setCart] = useState<CatalogItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const navigate = (dir: -1 | 1) => {
    const next = index + (dir === -1 ? 1 : -1);
    if (next < 0 || next >= CATALOG.length) return;
    Animated.timing(slideAnim, { toValue: dir * SH, duration: 280, useNativeDriver: true }).start(() => {
      slideAnim.setValue(-dir * SH);
      setIndex(next);
      Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: true }).start();
    });
    if (dir === -1) onShuffle();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 12 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderRelease: (_, g) => {
        if (g.dy < -60) navigate(-1);
        else if (g.dy > 60) navigate(1);
      },
    })
  ).current;

  const toggleCart = (item: CatalogItem) =>
    setCart((p) => (p.find((i) => i.id === item.id) ? p.filter((i) => i.id !== item.id) : [...p, item]));

  const cartTotal = cart.reduce((s, i) => s + i.price, 0);

  return (
    <SafeAreaView style={[s.fill, { backgroundColor: C.black }]}>
      <StatusBar barStyle="light-content" />

      <View style={s.feedNav}>
        <TouchableOpacity onPress={onBack} style={{ width: 70 }}>
          <Text style={s.feedNavTxt}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.feedNavLogo}>DRIP</Text>
        <TouchableOpacity onPress={() => setCartOpen(true)} style={{ width: 70, alignItems: 'flex-end' }}>
          <Text style={[s.feedNavTxt, cart.length > 0 && { color: C.accent }]}>
            Bag{cart.length > 0 ? ` (${cart.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[s.fill, { transform: [{ translateY: slideAnim }] }]} {...panResponder.panHandlers}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 72, paddingBottom: 160 }}>
          <OutfitCard outfit={CATALOG[index]} onFeedback={() => {}} onAddToCart={toggleCart} cart={cart} />
        </ScrollView>
      </Animated.View>

      <View style={s.feedBottom}>
        <View style={s.dotRow}>
          {CATALOG.map((_, i) => (
            <View key={i} style={[s.dot, i === index && s.dotActive]} />
          ))}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 12, justifyContent: 'center' }}>
          {[...Array(5)].map((_, i) => (
            <View key={i} style={[s.scramblePip, { backgroundColor: i < scrambles ? C.white : 'rgba(247,250,255,0.18)' }]} />
          ))}
          <Text style={{ fontSize: 10, color: C.grey2, marginLeft: 6 }}>{scrambles} shuffles</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 24 }}>
          <TouchableOpacity onPress={() => navigate(1)} style={[s.btnOutline, { flex: 1, borderColor: 'rgba(247,250,255,0.35)' }]}>
            <Text style={[s.btnOutlineTxt, { color: C.white }]}>↑ Prev</Text>
          </TouchableOpacity>
          <BtnPrimary label={scrambles > 0 ? 'Next ↓' : 'No shuffles left'} onPress={() => navigate(-1)} disabled={scrambles <= 0} style={{ flex: 2 }} />
        </View>
      </View>

      <Modal visible={cartOpen} animationType="slide" transparent onRequestClose={() => setCartOpen(false)}>
        <TouchableOpacity style={s.modalBackdrop} activeOpacity={1} onPress={() => setCartOpen(false)} />
        <View style={s.cartSheet}>
          <View style={s.cartHandle} />
          <Text style={s.cartTitle}>Your Bag</Text>
          <ScrollView style={{ maxHeight: SH * 0.38 }} showsVerticalScrollIndicator={false}>
            {cart.length === 0 ? (
              <Text style={{ fontSize: 13, color: C.grey3, textAlign: 'center', padding: 32 }}>Nothing added yet.</Text>
            ) : (
              cart.map((item) => (
                <View key={item.id} style={s.cartRow}>
                  <Image source={{ uri: item.img }} style={s.cartThumb} resizeMode="cover" />
                  <View style={{ flex: 1 }}>
                    <Text style={s.itemBrand}>{item.brand}</Text>
                    <Text style={s.itemName}>{item.name}</Text>
                  </View>
                  <Text style={s.itemPrice}>${item.price}</Text>
                  <TouchableOpacity onPress={() => toggleCart(item)} style={{ padding: 6 }}>
                    <Text style={{ fontSize: 18, color: C.grey3 }}>×</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
          {cart.length > 0 && <BtnPrimary label={`Checkout · $${cartTotal}`} onPress={() => {}} style={{ marginTop: 16 }} />}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────
export default function HomeScreen() {
  const { user } = useAuth();
  const [screen, setScreen] = useState<'splash' | 'welcome' | 'upload' | 'feed' | 'board'>('splash');
  const [scrambles, setScrambles] = useState(5);
  const [boardSprites, setBoardSprites] = useState<BoardSprite[]>([]);
  const [boardId, setBoardId] = useState<string | null>(null);
  const [boardSyncMsg, setBoardSyncMsg] = useState<string | null>(null);

  const createLocalSprite = (uri: string, zIndex: number): BoardSprite => ({
    id: `${LOCAL_SPRITE_ID_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2)}`,
    uri,
    x: 20 + (zIndex % 3) * 55,
    y: 64 + Math.floor(zIndex / 3) * 70,
    scale: 1,
    zIndex,
  });

  useEffect(() => {
    const loadBoard = async () => {
      if (!user?.id) return;
      try {
        setBoardSyncMsg('Loading your board...');
        const nextBoardId = await ensurePrimaryBoard(user.id);
        setBoardId(nextBoardId);
        const rows = await fetchBoardSprites(nextBoardId, user.id);
        setBoardSprites(
          rows.map((row) => ({
            id: row.id,
            uri: row.image_url,
            x: row.x,
            y: row.y,
            scale: row.scale,
            zIndex: row.z_index,
          }))
        );
      } catch {
        setBoardSyncMsg('Could not load board from database.');
      } finally {
        setTimeout(() => setBoardSyncMsg(null), 1200);
      }
    };
    loadBoard();
  }, [user?.id]);

  const addSpriteToBoard = async (uri: string) => {
    if (!user?.id) {
      setBoardSprites((prev) => [...prev, createLocalSprite(uri, prev.length)]);
      return;
    }
    try {
      setBoardSyncMsg('Saving sprite...');
      const targetBoardId = boardId ?? (await ensurePrimaryBoard(user.id));
      if (!boardId) setBoardId(targetBoardId);
      const imageUrl = await uploadSpriteImage(user.id, uri);
      const zIndex = boardSprites.length;
      const created = await createBoardSprite({
        boardId: targetBoardId,
        userId: user.id,
        imageUrl,
        x: 20 + (zIndex % 3) * 55,
        y: 64 + Math.floor(zIndex / 3) * 70,
        scale: 1,
        zIndex,
      });
      setBoardSprites((prev) => [
        ...prev,
        { id: created.id, uri: created.image_url, x: created.x, y: created.y, scale: created.scale, zIndex: created.z_index },
      ]);
    } catch {
      setBoardSyncMsg('Failed to save sprite.');
    } finally {
      setTimeout(() => setBoardSyncMsg(null), 1100);
    }
  };

  const deleteSpriteFromBoard = async (id: string) => {
    setBoardSprites((prev) => prev.filter((sprite) => sprite.id !== id));
    if (!user?.id || isLocalSpriteId(id)) return;
    try {
      await deleteBoardSprite(id, user.id);
    } catch {
      setBoardSyncMsg('Could not delete sprite in database.');
      setTimeout(() => setBoardSyncMsg(null), 1200);
    }
  };

  const persistOrder = async (items: BoardSprite[]) => {
    if (!user?.id) return;
    const dbItems = items.filter((spt) => !isLocalSpriteId(spt.id));
    if (dbItems.length === 0) return;
    try {
      await saveZOrder({ userId: user.id, items: dbItems.map((spt, idx) => ({ id: spt.id, zIndex: idx })) });
    } catch {
      setBoardSyncMsg('Could not save layer order.');
      setTimeout(() => setBoardSyncMsg(null), 1200);
    }
  };

  return (
    <View style={s.fill}>
      {screen === 'splash' && <SplashScreen onNext={() => setScreen('welcome')} />}
      {screen === 'welcome' && <WelcomeScreen onStart={() => setScreen('upload')} />}
      {screen === 'upload' && (
        <UploadScreen
          onDetected={(spriteUri) => {
            addSpriteToBoard(spriteUri);
            setScreen('board');
          }}
          onBack={() => setScreen('welcome')}
        />
      )}
      {screen === 'board' && (
        <VisionBoardScreen
          onBack={() => setScreen('upload')}
          sprites={boardSprites}
          onAddSprite={addSpriteToBoard}
          onDeleteSprite={deleteSpriteFromBoard}
          boardSyncMsg={boardSyncMsg}
          onTransformCommit={(spriteId, next) => {
            setBoardSprites((prev) =>
              prev.map((spt) => (spt.id === spriteId ? { ...spt, x: next.x, y: next.y, scale: next.scale } : spt))
            );
            if (!user?.id || isLocalSpriteId(spriteId)) return;
            updateBoardSpriteTransform({
              spriteId,
              userId: user.id,
              x: next.x,
              y: next.y,
              scale: next.scale,
            }).catch(() => {
              setBoardSyncMsg('Could not save sprite position.');
              setTimeout(() => setBoardSyncMsg(null), 1200);
            });
          }}
          onBringToFront={(id) =>
            setBoardSprites((prev) => {
              const idx = prev.findIndex((spt) => spt.id === id);
              if (idx < 0 || idx === prev.length - 1) return prev;
              const next = [...prev];
              const [picked] = next.splice(idx, 1);
              next.push(picked);
              const normalized = next.map((spt, i) => ({ ...spt, zIndex: i }));
              persistOrder(normalized);
              return normalized;
            })
          }
          onSendToBack={(id) =>
            setBoardSprites((prev) => {
              const idx = prev.findIndex((spt) => spt.id === id);
              if (idx <= 0) return prev;
              const next = [...prev];
              const [picked] = next.splice(idx, 1);
              next.unshift(picked);
              const normalized = next.map((spt, i) => ({ ...spt, zIndex: i }));
              persistOrder(normalized);
              return normalized;
            })
          }
        />
      )}
      {screen === 'feed' && (
        <FeedScreen onBack={() => setScreen('upload')} onShuffle={() => setScrambles((p) => Math.max(0, p - 1))} scrambles={scrambles} />
      )}
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────
const s = StyleSheet.create({
  fill: { flex: 1 },

  // Splash
  splashLogo: { fontSize: 64, fontWeight: '800', color: C.white, letterSpacing: 6 },
  splashSub: { fontSize: 11, color: C.grey2, letterSpacing: 5, textTransform: 'uppercase', marginTop: 8 },
  splashLine: { width: 1, height: 40, backgroundColor: C.grey2, marginTop: 40 },

  // Welcome
  welcomeHero: { flex: 1, backgroundColor: '#DCEBFF', alignItems: 'center', justifyContent: 'center' },
  heroSub: { fontSize: 11, color: C.grey3, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 12, fontWeight: '600' },
  heroTitle: { fontSize: 52, fontWeight: '800', color: C.black, lineHeight: 58, textAlign: 'center' },
  heroItalic: { fontStyle: 'italic', fontWeight: '800' },
  floatingTag: {
    position: 'absolute',
    backgroundColor: C.white,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  floatingTagTxt: { fontSize: 10, fontWeight: '700', color: C.grey3, letterSpacing: 2, textTransform: 'uppercase' },
  welcomePanel: { backgroundColor: C.white, padding: 24, paddingBottom: 34, gap: 12 },
  welcomeHeading: { fontSize: 15, fontWeight: '800', color: C.black },
  welcomeBody: { fontSize: 13, color: C.grey3, lineHeight: 20 },
  welcomeBtns: { flexDirection: 'row', gap: 10, marginTop: 6 },
  welcomeNote: { fontSize: 11, color: C.grey2, textAlign: 'center', letterSpacing: 0.4, marginTop: 6 },

  // Nav
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 10, paddingBottom: 6 },
  navBackTxt: { fontSize: 12, color: C.grey3, letterSpacing: 0.4 },
  navTitle: { fontSize: 18, fontWeight: '800', letterSpacing: 3.5, color: C.black },

  // Buttons
  btnPrimary: { backgroundColor: C.black, borderWidth: 1.5, borderColor: C.black, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center' },
  btnPrimaryTxt: { fontSize: 12, fontWeight: '800', color: C.white, letterSpacing: 2, textTransform: 'uppercase' },
  btnOutline: { borderWidth: 1.5, borderColor: C.black, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center' },
  btnOutlineTxt: { fontSize: 12, fontWeight: '800', color: C.black, letterSpacing: 2, textTransform: 'uppercase' },

  // Upload
  screenTitle: { fontSize: 32, fontWeight: '900', color: C.black, lineHeight: 36 },
  screenSub: { fontSize: 13, color: C.grey3, lineHeight: 20 },
  dropZone: { borderWidth: 2, borderColor: C.grey1, borderStyle: 'dashed', borderRadius: 16, height: 320, overflow: 'hidden', backgroundColor: C.white },
  dropZoneMain: { fontSize: 14, fontWeight: '700', color: C.black },
  dropZoneSub: { fontSize: 12, color: C.grey2 },
  uploadPreview: { width: '100%', height: '100%', position: 'absolute' },
  detectingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11,22,32,0.35)', alignItems: 'center', justifyContent: 'center', gap: 10 },
  spinner: { width: 36, height: 36, borderRadius: 18, borderWidth: 3, borderColor: C.white, borderTopColor: 'transparent' },
  detectingTxt: { fontSize: 11, color: C.white, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  successCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.success, alignItems: 'center', justifyContent: 'center' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  detectedTag: { backgroundColor: C.black, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  detectedTagTxt: { fontSize: 10, fontWeight: '800', color: C.white, letterSpacing: 1.5, textTransform: 'uppercase' },
  boardCanvas: { flex: 1, margin: 20, borderWidth: 2, borderColor: C.grey1, borderStyle: 'dashed', borderRadius: 16, backgroundColor: C.white, overflow: 'hidden' },
  boardActions: { flexDirection: 'row', gap: 10, marginHorizontal: 20, marginTop: 8 },
  layerActions: { position: 'absolute', left: 12, bottom: 12, flexDirection: 'row', gap: 8, zIndex: 40 },
  layerBtn: { paddingVertical: 9, paddingHorizontal: 10, borderRadius: 10, backgroundColor: C.offwhite },
  boardHint: { fontSize: 11, color: C.grey2, textAlign: 'center', letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 12 },
  boardStatus: { fontSize: 12, color: C.grey3, textAlign: 'center', marginTop: 8 },
  boardError: { fontSize: 12, color: C.danger, textAlign: 'center', marginTop: 6 },
  boardEmpty: { fontSize: 13, color: C.grey3, textAlign: 'center', marginTop: 36 },
  spriteWrap: { position: 'absolute' },
  spriteSelected: {},
  spriteTouchArea: { margin: 20, flex: 1 },
  spriteImg: { width: '100%', height: '100%' },
  trashZone: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    borderColor: C.grey1,
    backgroundColor: C.offwhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trashIcon: { fontSize: 28 },

  // Feed
  feedNav: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 8, paddingBottom: 8 },
  feedNavTxt: { fontSize: 12, color: C.white, letterSpacing: 0.4, fontWeight: '700' },
  feedNavLogo: { fontSize: 18, fontWeight: '900', color: C.white, letterSpacing: 4 },
  feedBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 24 : 16, backgroundColor: 'rgba(11,22,32,0.78)' },
  dotRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(247,250,255,0.25)' },
  dotActive: { backgroundColor: C.white, width: 18 },
  scramblePip: { width: 22, height: 3, borderRadius: 2 },

  // Outfit card
  vibeTxt: { fontSize: 22, fontWeight: '800', color: C.white },
  totalPriceLg: { fontSize: 20, fontWeight: '900', color: C.accent },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  slotCell: { width: (SW - 52) / 2, backgroundColor: C.white, borderRadius: 16, overflow: 'hidden' },
  slotImgWrap: { width: '100%', aspectRatio: 0.85, position: 'relative' },
  slotImg: { width: '100%', height: '100%', position: 'absolute' },
  slotBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: C.black, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  slotBadgeTxt: { fontSize: 9, fontWeight: '800', color: C.white, letterSpacing: 1.8, textTransform: 'uppercase' },
  slotInfo: { padding: 12 },
  itemBrand: { fontSize: 9, color: C.grey3, letterSpacing: 2, textTransform: 'uppercase' },
  itemName: { fontSize: 12, fontWeight: '800', color: C.black, lineHeight: 16, marginTop: 4 },
  itemPrice: { fontSize: 15, fontWeight: '900', color: C.black },
  addBtn: { backgroundColor: C.black, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, minWidth: 44, alignItems: 'center' },
  addBtnTxt: { fontSize: 9, fontWeight: '900', color: C.white, letterSpacing: 1.2, textTransform: 'uppercase' },

  // Feedback
  feedbackTrigger: { backgroundColor: 'rgba(247,250,255,0.10)', borderWidth: 1, borderColor: 'rgba(247,250,255,0.18)', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, marginBottom: 16 },
  feedbackTriggerTxt: { fontSize: 13, color: C.grey1, fontWeight: '700' },
  feedbackPanel: { backgroundColor: C.white, borderRadius: 16, padding: 16, marginBottom: 16 },
  chipLabel: { fontSize: 10, fontWeight: '900', color: C.grey3, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1.5, backgroundColor: 'transparent' },
  chipTxt: { fontSize: 11, fontWeight: '700', color: C.black },
  textInputWrap: { borderWidth: 1.5, borderColor: C.grey1, borderRadius: 14, padding: 12, backgroundColor: C.offwhite },
  textInput: { fontSize: 13, color: C.black, lineHeight: 20, minHeight: 56 },

  // Cart
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(11,22,32,0.55)' },
  cartSheet: { backgroundColor: C.white, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 20, paddingTop: 12 },
  cartHandle: { width: 44, height: 5, borderRadius: 3, backgroundColor: C.grey1, alignSelf: 'center', marginBottom: 12 },
  cartTitle: { fontSize: 20, fontWeight: '900', color: C.black, textAlign: 'center', marginBottom: 12 },
  cartRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  cartThumb: { width: 56, height: 56, borderRadius: 12, backgroundColor: C.grey1 },
});

