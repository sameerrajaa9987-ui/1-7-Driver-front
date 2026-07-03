import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OnboardingScreen from "@modules/auth/screens/OnboardingScreen";
import LoginScreen from "@modules/auth/screens/LoginScreen";
import SignupScreen from "@modules/auth/screens/SignupScreen";
import { useOnboardingStore } from "@shared/store/useOnboardingStore";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  // First run shows the intro carousel; afterwards we go straight to Login.
  const seen = useOnboardingStore((s) => s.seen);

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={seen ? "Login" : "Onboarding"}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}
