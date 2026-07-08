import React, { useState } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Bus, Mail, Lock, Phone, ShieldCheck } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { Text, TextField, Button, VStack, HStack, HeroGlow } from "@shared/ui";
import { palette, radius, shadows, gradients } from "@shared/designSystem";
import { apiErrorMessage } from "@api/apiClient";
import {
  localMobileDigits,
  toIndianE164,
  isValidIndianMobile,
  normalizeLoginIdentifier,
} from "@shared/phone";
import {
  useLogin,
  useRequestOtp,
  useVerifyOtp,
} from "@modules/auth/hooks/useAuth";

type Mode = "staff" | "parent";

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [mode, setMode] = useState<Mode>("staff");

  return (
    <LinearGradient
      colors={[...gradients.hero] as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <HeroGlow />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand — amber bus mark on midnight (bus-livery identity) */}
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Bus size={26} color={palette.ink[900]} strokeWidth={2.4} />
          </View>
          <Text variant="h1" align="center" style={{ color: "#FFFFFF" }}>
            SchoolRide Connect
          </Text>
          <Text
            variant="body-sm"
            align="center"
            style={{ color: "rgba(255,255,255,0.66)" }}
          >
            Safe students. Connected parents. Empowered drivers.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.tabs}>
            <Tab
              label="Operator / Driver"
              active={mode === "staff"}
              onPress={() => setMode("staff")}
            />
            <Tab
              label="Parent"
              active={mode === "parent"}
              onPress={() => setMode("parent")}
            />
          </View>

          {mode === "staff" ? (
            <StaffLogin onSignup={() => navigation.navigate("Signup")} />
          ) : (
            <ParentLogin />
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function Tab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tab, active && styles.tabActive]}
    >
      <Text
        variant="label"
        weight="600"
        style={{
          color: active ? palette.ink[900] : palette.text.tertiary,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function StaffLogin({ onSignup }: { onSignup: () => void }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useLogin();

  const submit = () => {
    setError("");
    login.mutate(
      // Emails pass through; a bare 10-digit mobile becomes +91… for the driver.
      { identifier: normalizeLoginIdentifier(identifier), password },
      { onError: (e) => setError(apiErrorMessage(e, "Sign in failed")) },
    );
  };

  return (
    <VStack gap={14}>
      <TextField
        label="Email or mobile"
        placeholder="you@example.com or 98765 43210"
        autoCapitalize="none"
        value={identifier}
        onChangeText={setIdentifier}
        leading={<Mail size={18} color={palette.text.tertiary} />}
      />
      <TextField
        label="Password"
        placeholder="••••••••"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        leading={<Lock size={18} color={palette.text.tertiary} />}
      />
      {error ? (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      ) : null}
      <Button label="Sign in" onPress={submit} loading={login.isPending} />
      <HStack justify="center" gap={4}>
        <Text variant="body-sm" tone="tertiary">
          New operator?
        </Text>
        <Pressable onPress={onSignup}>
          <Text variant="body-sm" tone="accent" weight="600">
            Create an account
          </Text>
        </Pressable>
      </HStack>
    </VStack>
  );
}

function ParentLogin() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [hint, setHint] = useState("");
  const [error, setError] = useState("");
  const request = useRequestOtp();
  const verify = useVerifyOtp();

  const e164 = toIndianE164(phone); // "" until 10 valid digits
  const validPhone = isValidIndianMobile(phone);

  const sendCode = () => {
    setError("");
    request.mutate(e164, {
      onSuccess: (res) => {
        setSent(true);
        if (res.data?.devCode) setHint(`Dev code: ${res.data.devCode}`);
      },
      onError: (e) => setError(apiErrorMessage(e, "Could not send code")),
    });
  };

  const submit = () => {
    setError("");
    verify.mutate(
      { phone: e164, code: code.trim() },
      { onError: (e) => setError(apiErrorMessage(e, "Invalid code")) },
    );
  };

  return (
    <VStack gap={14}>
      <TextField
        label="Mobile number"
        placeholder="98765 43210"
        keyboardType="phone-pad"
        // Store only the local 10 digits; +91 is shown as a fixed prefix.
        value={localMobileDigits(phone)}
        onChangeText={(t) => setPhone(localMobileDigits(t))}
        maxLength={10}
        editable={!sent}
        leading={
          <HStack gap={6} align="center">
            <Phone size={18} color={palette.text.tertiary} />
            <Text variant="body" tone="secondary" weight="600">
              +91
            </Text>
          </HStack>
        }
      />
      {sent && (
        <TextField
          label="6-digit code"
          placeholder="123456"
          keyboardType="number-pad"
          value={code}
          onChangeText={setCode}
          hint={hint}
          leading={<ShieldCheck size={18} color={palette.text.tertiary} />}
        />
      )}
      {error ? (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      ) : null}
      {!sent ? (
        <Button
          label="Send code"
          onPress={sendCode}
          loading={request.isPending}
          disabled={!validPhone}
        />
      ) : (
        <VStack gap={8}>
          <Button
            label="Verify & sign in"
            onPress={submit}
            loading={verify.isPending}
          />
          <Button
            label="Change number"
            variant="ghost"
            onPress={() => {
              setSent(false);
              setCode("");
              setHint("");
            }}
          />
        </VStack>
      )}
    </VStack>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  brand: {
    alignItems: "center",
    gap: 4,
    marginBottom: 22,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    backgroundColor: palette.brand[500],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    ...shadows.lg,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: palette.surface.primary,
    borderRadius: radius["2xl"],
    padding: 26,
    ...shadows.xl,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: palette.surface.tertiary,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.sm,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: palette.brand[400],
    ...shadows.xs,
  },
});
