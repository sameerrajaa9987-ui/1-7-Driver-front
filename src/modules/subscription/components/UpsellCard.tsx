/**
 * UpsellCard — shown in place of a Premium feature when the org's plan
 * doesn't include it (deck: Driver Premium ₹999/mo). One tap goes to the
 * Subscription screen.
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import { Crown } from "lucide-react-native";
import { useSectionNav } from "@navigation/AppNavigator";
import { palette, radius } from "@shared/designSystem";
import { Text, VStack, HStack, Card, Button } from "@shared/ui";

export function UpsellCard({ feature }: { feature: string }) {
  const go = useSectionNav();
  return (
    <Card style={styles.card}>
      <VStack gap={12} align="center">
        <View style={styles.crown}>
          <Crown size={22} color={palette.ink[900]} strokeWidth={2.2} />
        </View>
        <Text variant="h4" tone="primary" align="center">
          {feature} is a Premium feature
        </Text>
        <Text variant="body-sm" tone="tertiary" align="center">
          Upgrade to Premium (₹999/mo) for fleet analytics, driver safety
          scorecards, and safety inventory.
        </Text>
        <HStack>
          <Button
            label="View plans"
            variant="accent"
            fullWidth={false}
            onPress={() => go("Subscription")}
          />
        </HStack>
      </VStack>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: palette.brand[200],
    backgroundColor: palette.brand[50],
  },
  crown: {
    width: 46,
    height: 46,
    borderRadius: radius.full,
    backgroundColor: palette.brand[400],
    alignItems: "center",
    justifyContent: "center",
  },
});
