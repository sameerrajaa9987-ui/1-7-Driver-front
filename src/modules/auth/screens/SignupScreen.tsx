import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { Text, TextField, Button, VStack, Select, AppHeader } from "@shared/ui";
import { palette, radius, shadows, gradients } from "@shared/designSystem";
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
    <LinearGradient
      colors={[...gradients.hero] as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <AppHeader
          title="Create account"
          subtitle="Run your school-van business from one place"
          onBack={() => navigation.goBack()}
          tone="dark"
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
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
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 24,
    paddingTop: 8,
  },
  card: {
    width: "100%",
    maxWidth: 460,
    backgroundColor: palette.surface.primary,
    borderRadius: radius["2xl"],
    padding: 26,
    ...shadows.xl,
  },
});
