import React, { useState } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { Bus, Mail, Lock, Phone, ShieldCheck } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { Text, TextField, Button, VStack, HStack } from "@shared/ui";
import { palette, radius, shadows } from "@shared/designSystem";
import { apiErrorMessage } from "@api/apiClient";
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
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.surface.secondary }}
      contentContainerStyle={styles.container}
    >
      <View style={styles.card}>
        <View style={styles.logo}>
          <Bus size={26} color="#FFFFFF" strokeWidth={2.2} />
        </View>
        <Text variant="h2" tone="primary" align="center">
          SchoolRide
        </Text>
        <Text
          variant="body-sm"
          tone="tertiary"
          align="center"
          style={{ marginBottom: 18 }}
        >
          Safe, tracked school-van rides
        </Text>

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
      <Text variant="label" weight="600" tone={active ? "accent" : "tertiary"}>
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
      { identifier: identifier.trim(), password },
      { onError: (e) => setError(apiErrorMessage(e, "Sign in failed")) },
    );
  };

  return (
    <VStack gap={14}>
      <TextField
        label="Email or mobile"
        placeholder="you@example.com or +9198…"
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

  const sendCode = () => {
    setError("");
    request.mutate(phone.trim(), {
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
      { phone: phone.trim(), code: code.trim() },
      { onError: (e) => setError(apiErrorMessage(e, "Invalid code")) },
    );
  };

  return (
    <VStack gap={14}>
      <TextField
        label="Mobile number"
        placeholder="+9198…"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        editable={!sent}
        leading={<Phone size={18} color={palette.text.tertiary} />}
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
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: palette.surface.primary,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border.default,
    padding: 26,
    ...shadows.md,
  },
  logo: {
    alignSelf: "center",
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: palette.teal[600],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: palette.surface.secondary,
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
    backgroundColor: palette.surface.primary,
    ...shadows.xs,
  },
});
