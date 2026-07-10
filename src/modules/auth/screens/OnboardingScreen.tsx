/**
 * OnboardingScreen — the first-run intro (2026 best practice: 3 value-first
 * slides, benefits not how-to, a Skip for power users, shown once). Editorial
 * ink canvas, a swipeable carousel, marigold dot pager, and haptic page turns.
 * "Get started" marks it seen and drops to Login.
 */
import React, { useRef, useState } from "react";
import {
  Platform,
  View,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  FlatList,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  MapPin,
  BellRing,
  ShieldCheck,
  ArrowRight,
  type LucideIcon,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useOnboardingStore } from "@shared/store/useOnboardingStore";
import { palette, radius } from "@shared/designSystem";
import { Text, VStack, Button, BrandLogo } from "@shared/ui";

interface Slide {
  icon: LucideIcon;
  overline: string;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    icon: MapPin,
    overline: "Live tracking",
    title: "Know exactly where the van is",
    body: "Follow the school bus on a live map, with an arrival estimate for every pickup — the anxious “where is my child?” answered before you ask.",
  },
  {
    icon: BellRing,
    overline: "Verified & announced",
    title: "Every pickup and drop, confirmed",
    body: "QR-verified boarding and a message at each step — started, boarding, reached school, dropped safely. Nobody has to remember to send it.",
  },
  {
    icon: ShieldCheck,
    overline: "Money & safety, handled",
    title: "Every rupee tracked, every child safe",
    body: "Online and cash fees with receipts, driver compliance and safety scores, and one-tap SOS to the operator and driver. Peace of mind, built in.",
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);
  const complete = useOnboardingStore((s) => s.complete);

  const finish = () => {
    complete();
    navigation.replace("Login");
  };

  const onNext = () => {
    if (index < SLIDES.length - 1) {
      if (Platform.OS !== "web") Haptics.selectionAsync().catch(() => {});
      const next = index + 1;
      setIndex(next); // optimistic — keeps the CTA label correct on web too
      // scrollToOffset moves the content reliably on both web and native
      // (scrollToIndex is flaky on react-native-web).
      listRef.current?.scrollToOffset({ offset: next * width, animated: true });
    } else {
      finish();
    }
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  const isLast = index === SLIDES.length - 1;

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.dark }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        {/* Brand + Skip */}
        <View style={styles.topBar}>
          <View style={styles.brand}>
            <View style={styles.logo}>
              <BrandLogo size={22} tone="ink" />
            </View>
            <Text variant="label-lg" weight="700" style={{ color: "#FFFFFF" }}>
              SchoolRide Connect
            </Text>
          </View>
          {!isLast ? (
            <Pressable onPress={finish} hitSlop={10}>
              <Text
                variant="label"
                weight="600"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                Skip
              </Text>
            </Pressable>
          ) : null}
        </View>

        <FlatList
          ref={listRef}
          data={SLIDES}
          keyExtractor={(s) => s.title}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          renderItem={({ item }) => <SlideView slide={item} width={width} />}
        />

        {/* Pager dots */}
        <View style={styles.dots}>
          {SLIDES.map((s, i) => (
            <View
              key={s.title}
              style={[
                styles.dot,
                i === index ? styles.dotActive : styles.dotIdle,
              ]}
            />
          ))}
        </View>

        {/* CTA */}
        <View style={styles.cta}>
          <Button
            label={isLast ? "Get started" : "Next"}
            onPress={onNext}
            rightIcon={
              <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.4} />
            }
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function SlideView({ slide, width }: { slide: Slide; width: number }) {
  const Icon = slide.icon;
  return (
    <View style={[styles.slide, { width }]}>
      <View style={styles.iconTile}>
        <Icon size={40} color={palette.brand[400]} strokeWidth={1.9} />
      </View>
      <VStack gap={12} style={{ marginTop: 36 }}>
        <Text variant="overline" style={{ color: palette.brand[400] }}>
          {slide.overline}
        </Text>
        <Text variant="display-sm" style={{ color: "#FFFFFF" }}>
          {slide.title}
        </Text>
        <Text variant="body-lg" style={{ color: "rgba(255,255,255,0.72)" }}>
          {slide.body}
        </Text>
      </VStack>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 4,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 9 },
  logo: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: palette.brand[500],
    alignItems: "center",
    justifyContent: "center",
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  iconTile: {
    width: 92,
    height: 92,
    borderRadius: radius["2xl"],
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  dots: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginBottom: 20,
  },
  dot: { height: 8, borderRadius: 4 },
  dotActive: { width: 26, backgroundColor: palette.brand[400] },
  dotIdle: { width: 8, backgroundColor: "rgba(255,255,255,0.24)" },
  cta: { paddingHorizontal: 24, paddingBottom: 8 },
});
