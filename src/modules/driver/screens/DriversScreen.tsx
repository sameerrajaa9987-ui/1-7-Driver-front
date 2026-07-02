import React, { useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  Search,
  Plus,
  IdCard,
  Phone,
  ChevronRight,
  AlertTriangle,
} from "lucide-react-native";
import { useDrivers } from "@modules/driver/hooks/useDrivers";
import { Driver } from "@modules/driver/types";
import { useAuthStore } from "@shared/store/useAuthStore";
import { PERMISSIONS } from "@shared/permissions";
import { palette, radius, outline, tints } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Avatar,
  Button,
  StatusChip,
  EmptyState,
} from "@shared/ui";

export default function DriversScreen() {
  const navigation = useNavigation<any>();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canWrite = hasPermission(PERMISSIONS.DRIVERS_MANAGE);
  const [search, setSearch] = useState("");
  const { data, isLoading, refetch, isRefetching } = useDrivers(
    search.trim() ? { search: search.trim() } : undefined,
  );
  const drivers = data?.data ?? [];

  // Licence-expiry alerts (spec §12) — expired or expiring within 30 days.
  const expiring = drivers.filter((d) => {
    const days = licenseDaysLeft(d);
    return days !== null && days <= 30;
  });

  return (
    <Screen
      overline="Fleet"
      title="Drivers"
      subtitle={`${data?.meta?.total ?? 0} drivers`}
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
      right={
        canWrite ? (
          <Button
            label="Add driver"
            size="sm"
            fullWidth={false}
            icon={<Plus size={18} color="#FFFFFF" strokeWidth={2.2} />}
            onPress={() => navigation.navigate("DriverForm")}
          />
        ) : undefined
      }
    >
      <View style={styles.searchWrap}>
        <Search size={18} color={palette.text.tertiary} strokeWidth={1.8} />
        <TextInput
          placeholder="Search by name or mobile"
          placeholderTextColor={palette.text.tertiary}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          autoCapitalize="none"
        />
      </View>

      {expiring.length > 0 ? (
        <Card
          style={{
            marginTop: 16,
            backgroundColor: tints.amber.bg,
            borderColor: tints.amber.ring,
          }}
        >
          <HStack gap={12} align="center">
            <AlertTriangle
              size={20}
              color={tints.amber.icon}
              strokeWidth={2.2}
            />
            <VStack gap={2} flex={1}>
              <Text
                variant="label"
                weight="700"
                style={{ color: tints.amber.fg }}
              >
                Licence check needed
              </Text>
              <Text variant="body-sm" style={{ color: tints.amber.fg }}>
                {expiring
                  .map((d) => {
                    const days = licenseDaysLeft(d) ?? 0;
                    return `${d.fullName} — ${days < 0 ? "expired" : `${days}d left`}`;
                  })
                  .join(" · ")}
              </Text>
            </VStack>
          </HStack>
        </Card>
      ) : null}

      {drivers.length === 0 ? (
        <EmptyState
          icon={IdCard}
          title={isLoading ? "Loading…" : "No drivers yet"}
          message="Add drivers to assign them to vehicles and routes."
        />
      ) : (
        <VStack gap={12} style={{ marginTop: 16 }}>
          {drivers.map((d) => (
            <DriverRow
              key={d.id}
              driver={d}
              onPress={() => navigation.navigate("DriverForm", { id: d.id })}
            />
          ))}
        </VStack>
      )}
    </Screen>
  );
}

/** Days until the licence expires (negative = expired), or null if unset. */
function licenseDaysLeft(driver: Driver): number | null {
  if (!driver.licenseExpiry) return null;
  const ms = new Date(driver.licenseExpiry).getTime() - Date.now();
  return Math.floor(ms / 86_400_000);
}

function DriverRow({
  driver,
  onPress,
}: {
  driver: Driver;
  onPress: () => void;
}) {
  const days = licenseDaysLeft(driver);
  const dlTone =
    days !== null && days < 0
      ? ("danger" as const)
      : days !== null && days <= 30
        ? ("warning" as const)
        : ("neutral" as const);
  const dlLabel =
    days !== null && days < 0
      ? `DL expired`
      : days !== null && days <= 30
        ? `DL expires in ${days}d`
        : driver.licenseNumber
          ? `DL ${driver.licenseNumber}`
          : "";

  return (
    <Card onPress={onPress} elevation="base">
      <HStack gap={14} align="center">
        <Avatar name={driver.fullName} size={46} />
        <VStack gap={4} flex={1}>
          <Text variant="label-lg" tone="primary" numberOfLines={1}>
            {driver.fullName}
          </Text>
          <HStack gap={6} align="center">
            {driver.mobile ? (
              <>
                <Phone
                  size={13}
                  color={palette.text.tertiary}
                  strokeWidth={1.9}
                />
                <Text variant="body-sm" tone="tertiary">
                  {driver.mobile}
                </Text>
              </>
            ) : (
              <Text variant="body-sm" tone="tertiary">
                No mobile
              </Text>
            )}
          </HStack>
          {dlLabel ? <StatusChip label={dlLabel} tone={dlTone} /> : null}
        </VStack>
        {!driver.isActive ? (
          <StatusChip label="Inactive" tone="danger" />
        ) : null}
        <ChevronRight size={18} color={palette.text.tertiary} strokeWidth={2} />
      </HStack>
    </Card>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: radius.md,
    borderWidth: outline.width,
    borderColor: outline.color,
    backgroundColor: palette.surface.primary,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: palette.text.primary,
    paddingVertical: 0,
  },
});
