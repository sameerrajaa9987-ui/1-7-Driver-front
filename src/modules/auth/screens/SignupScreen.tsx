import React, { useState } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft } from "lucide-react-native";
import { Text, TextField, Button, VStack, HStack, Select } from "@shared/ui";
import { palette, radius, shadows } from "@shared/designSystem";
import { apiErrorMessage } from "@api/apiClient";
import { useSignup } from "@modules/auth/hooks/useAuth";

export default function SignupScreen() {
  const navigation = useNavigation<any>();
  const signup = useSignup();
  const [form, setForm] = useState({
    organizationName: "",
    firstName: "",
    email: "",
    phone: "",
    city: "",
    password: "",
    businessType: "solo" as "solo" | "fleet",
  });
  const [error, setError] = useState("");
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    setError("");
    signup.mutate(form, {
      onError: (e) => setError(apiErrorMessage(e, "Sign up failed")),
    });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.surface.secondary }}
      contentContainerStyle={styles.container}
    >
      <View style={styles.card}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={{ marginBottom: 12 }}
        >
          <HStack gap={6} align="center">
            <ArrowLeft size={18} color={palette.text.tertiary} />
            <Text variant="body-sm" tone="tertiary">
              Back to sign in
            </Text>
          </HStack>
        </Pressable>
        <Text variant="h2" tone="primary">
          Create your operator account
        </Text>
        <Text variant="body-sm" tone="tertiary" style={{ marginBottom: 18 }}>
          Run your school-van business from one place.
        </Text>

        <VStack gap={14}>
          <TextField
            label="Business name"
            placeholder="Sunrise School Vans"
            value={form.organizationName}
            onChangeText={(v) => set("organizationName", v)}
          />
          <TextField
            label="Your name"
            placeholder="Asha Menon"
            value={form.firstName}
            onChangeText={(v) => set("firstName", v)}
          />
          <TextField
            label="Email"
            placeholder="you@example.com"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(v) => set("email", v)}
          />
          <TextField
            label="Mobile (optional)"
            placeholder="+9198…"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(v) => set("phone", v)}
          />
          <Select
            label="Setup"
            value={form.businessType}
            onChange={(v) => set("businessType", (v as string) || "solo")}
            options={[
              { value: "solo", label: "Solo — I own and drive the van" },
              { value: "fleet", label: "Fleet — I manage drivers & vans" },
            ]}
          />
          <TextField
            label="Password"
            placeholder="At least 6 characters"
            secureTextEntry
            value={form.password}
            onChangeText={(v) => set("password", v)}
          />
          {error ? (
            <Text variant="caption" tone="danger">
              {error}
            </Text>
          ) : null}
          <Button
            label="Create account"
            onPress={submit}
            loading={signup.isPending}
          />
        </VStack>
      </View>
    </ScrollView>
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
    maxWidth: 460,
    backgroundColor: palette.surface.primary,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border.default,
    padding: 26,
    ...shadows.md,
  },
});
