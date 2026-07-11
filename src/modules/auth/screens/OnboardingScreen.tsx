/**
 * OnboardingScreen — first-run intro (client mockup): a light 4-slide carousel
 * (Welcome → Live Tracking → Safety First → Payments) with flat on-brand
 * illustrations, a Skip, a dot pager, "Get Started" on the welcome slide and a
 * round next-arrow on the rest. Finishing drops to the role picker.
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
  ShieldCheck,
  Wallet,
  ArrowRight,
  ShieldCheck as ShieldGlyph,
  BadgeCheck,
  Lock,
  type LucideIcon,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useOnboardingStore } from "@shared/store/useOnboardingStore";
import { palette, radius, tints, accent } from "@shared/designSystem";
import {
  Text,
  VStack,
  HStack,
  Button,
  WelcomeBusScene,
  TrackingScene,
  SafetyScene,
  PaymentScene,
} from "@shared/ui";

type Scene = (props: { size?: number }) => React.ReactElement;

interface Slide {
  variant: "welcome" | "value";
  Scene: Scene;
  icon?: LucideIcon;
  tint?: keyof typeof tints;
  title?: string;
  body?: string;
}

const SLIDES: Slide[] = [
  { variant: "welcome", Scene: WelcomeBusScene },
  {
    variant: "value",
    Scene: TrackingScene,
    icon: MapPin,
    tint: "violet",
    title: "Live Tracking",
    body: "Track the school bus in real time and stay updated at every step of your child’s journey.",
  },
  {
    variant: "value",
    Scene: SafetyScene,
    icon: ShieldCheck,
    tint: "blue",
    title: "Safety First",
    body: "SOS alerts, verified attendance and instant notifications ensure your child’s complete safety.",
  },
  {
    variant: "value",
    Scene: PaymentScene,
    icon: Wallet,
    tint: "green",
    title: "Easy & Transparent Payments",
    body: "Pay fees securely, get instant receipts and complete transparency in every transaction.",
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

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.secondary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        {/* Skip */}
        <View style={styles.topBar}>
          <Pressable onPress={finish} hitSlop={10}>
            <Text variant="label" weight="600" tone="tertiary">
              Skip
            </Text>
          </Pressable>
        </View>

        <FlatList
          ref={listRef}
          data={SLIDES}
          keyExtractor={(_, i) => String(i)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          renderItem={({ item }) => <SlideView slide={item} width={width} />}
        />

        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === index ? styles.dotActive : styles.dotIdle,
              ]}
            />
          ))}
        </View>

        {/* CTA */}
        <View style={styles.cta}>
          {index === 0 ? (
            <VStack gap={16} align="center">
              <Button
                label="Get Started"
                onPress={finish}
                rightIcon={
                  <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.4} />
                }
              />
              <Text variant="caption" tone="tertiary">
                Trusted by Parents, Schools &amp; Operators
              </Text>
              <HStack gap={16} justify="center">
                <ShieldGlyph
                  size={18}
                  color={palette.text.tertiary}
                  strokeWidth={1.9}
                />
                <BadgeCheck
                  size={18}
                  color={palette.text.tertiary}
                  strokeWidth={1.9}
                />
                <Lock
                  size={18}
                  color={palette.text.tertiary}
                  strokeWidth={1.9}
                />
              </HStack>
            </VStack>
          ) : (
            <View style={{ alignItems: "center" }}>
              <Pressable
                onPress={goNext}
                style={({ pressed }) => [
                  styles.roundBtn,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <ArrowRight size={22} color="#FFFFFF" strokeWidth={2.6} />
              </Pressable>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

function SlideView({ slide, width }: { slide: Slide; width: number }) {
  const { Scene } = slide;
  if (slide.variant === "welcome") {
    return (
      <View style={[styles.slide, { width }]}>
        <VStack gap={6}>
          <Text variant="label-lg" weight="600" tone="tertiary">
            Welcome to
          </Text>
          <Text variant="display-sm" tone="primary" style={{ lineHeight: 40 }}>
            SchoolRide
          </Text>
          <Text
            variant="display-sm"
            style={{ color: accent.main, lineHeight: 40 }}
          >
            Connect
          </Text>
          <Text
            variant="label-lg"
            weight="700"
            style={{ color: accent.main, marginTop: 4 }}
          >
            Smart. Safe. Connected.
          </Text>
          <Text
            variant="body"
            tone="secondary"
            style={{ marginTop: 8, maxWidth: 320 }}
          >
            The all-in-one solution for school transport tracking, attendance,
            payments and safety.
          </Text>
        </VStack>
        <View style={{ alignItems: "center", marginTop: 24 }}>
          <Scene size={240} />
        </View>
      </View>
    );
  }

  const Icon = slide.icon!;
  const t = tints[slide.tint ?? "violet"];
  return (
    <View style={[styles.slide, { width, justifyContent: "center" }]}>
      <View style={{ alignItems: "center" }}>
        <Scene size={230} />
        <View style={[styles.iconTile, { backgroundColor: t.bg }]}>
          <Icon size={26} color={t.icon} strokeWidth={2} />
        </View>
        <Text
          variant="h1"
          tone="primary"
          align="center"
          style={{ marginTop: 18 }}
        >
          {slide.title}
        </Text>
        <Text
          variant="body-lg"
          tone="secondary"
          align="center"
          style={{ marginTop: 10, maxWidth: 320 }}
        >
          {slide.body}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 4,
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  iconTile: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 26,
  },
  dots: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginBottom: 22,
  },
  dot: { height: 8, borderRadius: 4 },
  dotActive: { width: 26, backgroundColor: accent.main },
  dotIdle: { width: 8, backgroundColor: palette.border.strong },
  cta: { paddingHorizontal: 24, paddingBottom: 10 },
  roundBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: accent.main,
    alignItems: "center",
    justifyContent: "center",
  },
});
