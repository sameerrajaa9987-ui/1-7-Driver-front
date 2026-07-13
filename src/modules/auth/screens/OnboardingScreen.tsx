/**
 * OnboardingScreen — first-run intro carousel. Matches the client's mockup: a
 * light screen with the transparent 3D illustration floating up top, a small
 * tinted icon tile, centred title + body, a dot pager and a circular next
 * arrow. Slide 1 is the branded welcome (left-aligned headline, a "Get Started"
 * button and trust badges); slides 2–4 use the arrow. Finishing → role picker.
 */
import React, { useRef, useState } from "react";
import {
  Platform,
  View,
  Image,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  FlatList,
  type ImageSourcePropType,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  ArrowRight,
  MapPin,
  ShieldCheck,
  Wallet,
  BadgeCheck,
  Bell,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useOnboardingStore } from "@shared/store/useOnboardingStore";
import { palette, radius, accent, tints } from "@shared/designSystem";
import { Text, Button } from "@shared/ui";

interface Slide {
  image: ImageSourcePropType;
  /** Small icon shown in the tinted tile under the art (slides 2–4). */
  icon?: React.ComponentType<{
    size?: number;
    color?: string;
    strokeWidth?: number;
  }>;
  eyebrow?: string;
  title: string;
  /** Optional accent tail on the headline (slide 1 → "Connect" in indigo). */
  titleAccent?: string;
  tagline?: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    image: require("../../../../assets/onboarding/01-bus.png"),
    eyebrow: "Welcome to",
    title: "SchoolRide",
    titleAccent: "Connect",
    tagline: "Smart. Safe. Connected.",
    body: "The all-in-one solution for school transport tracking, attendance, payments and safety.",
  },
  {
    image: require("../../../../assets/onboarding/02-live-tracking.png"),
    icon: MapPin,
    title: "Live Tracking",
    body: "Track the school bus in real time and stay updated at every step of your child’s journey.",
  },
  {
    image: require("../../../../assets/onboarding/03-shied.png"),
    icon: ShieldCheck,
    title: "Safety First",
    body: "SOS alerts, verified attendance and instant notifications ensure your child’s complete safety.",
  },
  {
    image: require("../../../../assets/onboarding/04-payment.png"),
    icon: Wallet,
    title: "Easy & Transparent Payments",
    body: "Pay fees securely, get instant receipts and complete transparency in every transaction.",
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);
  const complete = useOnboardingStore((s) => s.complete);

  // The art is ~1.46:1 — size by width and derive height so `contain` never
  // letterboxes it smaller. Slide 1 runs near full-bleed like the mockup.
  const ASPECT = 1.46;
  const artW = Math.min(width - 40, height * 0.36 * ASPECT);
  const welcomeArtW = Math.min(width - 16, height * 0.4 * ASPECT);

  const finish = () => {
    complete();
    navigation.replace("RolePicker");
  };

  const goNext = () => {
    if (index < SLIDES.length - 1) {
      if (Platform.OS !== "web") Haptics.selectionAsync().catch(() => {});
      const next = index + 1;
      setIndex(next);
      listRef.current?.scrollToOffset({ offset: next * width, animated: true });
    } else {
      finish();
    }
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  const Dots = () => (
    <View style={styles.dots}>
      {SLIDES.map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i === index ? styles.dotActive : styles.dotIdle]}
        />
      ))}
    </View>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item, index: i }) => {
          const Icon = item.icon;
          const welcome = i === 0;
          return (
            <View
              style={[
                styles.slide,
                {
                  width,
                  // Explicit height — flex:1 doesn't stretch inside a
                  // horizontal FlatList cell, which pins content to the top.
                  height: height - insets.top,
                  paddingBottom: insets.bottom + (welcome ? 170 : 140),
                },
              ]}
            >
              {welcome ? (
                /* Slide 1 — branded welcome (left-aligned headline). */
                <View style={styles.welcomeHead}>
                  <Text variant="h4" weight="700" tone="secondary">
                    {item.eyebrow}
                  </Text>
                  <Text style={styles.brand}>
                    {item.title}
                    {"\n"}
                    <Text style={[styles.brand, { color: accent.main }]}>
                      {item.titleAccent}
                    </Text>
                  </Text>
                  <Text
                    variant="h4"
                    weight="700"
                    style={{ color: accent.main, marginTop: 8 }}
                  >
                    {item.tagline}
                  </Text>
                  <Text
                    variant="body-lg"
                    tone="secondary"
                    style={{ marginTop: 14, lineHeight: 24 }}
                  >
                    {item.body}
                  </Text>
                </View>
              ) : null}

              {/* Art + copy travel as one centred group — no dead void
                  between the body text and the footer. */}
              <View style={styles.artWrap}>
                <Image
                  source={item.image}
                  style={{
                    width: welcome ? welcomeArtW : artW,
                    height: (welcome ? welcomeArtW : artW) / ASPECT,
                  }}
                  resizeMode="contain"
                />

                {!welcome ? (
                  /* Slides 2–4 — icon tile, centred title + body. */
                  <View style={styles.centerBlock}>
                    {Icon ? (
                      <View style={styles.iconTile}>
                        <Icon size={26} color={accent.main} strokeWidth={2.2} />
                      </View>
                    ) : null}
                    <Text
                      variant="h3"
                      weight="700"
                      tone="primary"
                      style={{ textAlign: "center", marginTop: 18 }}
                    >
                      {item.title}
                    </Text>
                    <Text
                      variant="body-lg"
                      tone="secondary"
                      style={{
                        textAlign: "center",
                        marginTop: 12,
                        lineHeight: 24,
                        maxWidth: 320,
                      }}
                    >
                      {item.body}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          );
        }}
      />

      {/* Skip */}
      <Pressable
        onPress={finish}
        hitSlop={10}
        style={[styles.skip, { top: insets.top + 8 }]}
      >
        <Text variant="label-lg" weight="600" tone="secondary">
          Skip
        </Text>
      </Pressable>

      {/* Footer — slide 1 gets the button + trust row; others get the arrow. */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 18 }]}>
        {index === 0 ? (
          <>
            <Dots />
            <View style={{ marginTop: 18 }}>
              <Button label="Get Started" onPress={goNext} />
            </View>
            <Text
              variant="label"
              weight="600"
              tone="tertiary"
              style={{ textAlign: "center", marginTop: 14 }}
            >
              Trusted by Parents, Schools & Operators
            </Text>
            <View style={styles.trustRow}>
              <ShieldCheck
                size={18}
                color={palette.text.tertiary}
                strokeWidth={2}
              />
              <BadgeCheck
                size={18}
                color={palette.text.tertiary}
                strokeWidth={2}
              />
              <Bell size={18} color={palette.text.tertiary} strokeWidth={2} />
            </View>
          </>
        ) : (
          <>
            <Dots />
            <Pressable onPress={goNext} style={styles.arrowBtn} hitSlop={8}>
              <ArrowRight size={22} color="#FFFFFF" strokeWidth={2.6} />
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  slide: {
    paddingHorizontal: 28,
    alignItems: "center",
  },
  welcomeHead: {
    width: "100%",
    marginTop: 24,
  },
  brand: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: "800",
    color: palette.text.primary,
    marginTop: 4,
  },
  artWrap: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  centerBlock: {
    alignItems: "center",
    width: "100%",
    marginTop: 28,
  },
  iconTile: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: tints.teal.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  skip: {
    position: "absolute",
    right: 22,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 28,
    paddingTop: 12,
    alignItems: "center",
  },
  dots: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  dot: { height: 7, borderRadius: 4 },
  dotActive: { width: 22, backgroundColor: accent.main },
  dotIdle: { width: 7, backgroundColor: palette.border.strong },
  arrowBtn: {
    marginTop: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: accent.main,
    alignItems: "center",
    justifyContent: "center",
  },
  trustRow: {
    flexDirection: "row",
    gap: 22,
    justifyContent: "center",
    marginTop: 12,
  },
});
