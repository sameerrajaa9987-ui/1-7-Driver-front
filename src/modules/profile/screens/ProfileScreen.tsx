import React from "react";
import { View } from "react-native";
import {
  LogOut,
  Building2,
  Mail,
  Phone,
  BadgeCheck,
} from "lucide-react-native";
import { useAuthStore } from "@shared/store/useAuthStore";
import { useLogout } from "@modules/auth/hooks/useAuth";
import { ROLE_LABELS } from "@shared/permissions";
import { palette, radius } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Avatar,
  Button,
  StatusChip,
} from "@shared/ui";

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const organization = useAuthStore((s) => s.organization);
  const logout = useLogout();

  const roleLabel = ROLE_LABELS[user?.role ?? "parent"];

  return (
    <Screen overline="Account" title="Profile" subtitle="Your account details">
      {/* Identity */}
      <Card style={{ marginBottom: 20 }}>
        <HStack gap={16} align="center">
          <Avatar
            name={user?.fullName || "U"}
            size={60}
            tone={user?.role === "admin" ? "cobalt" : "teal"}
          />
          <VStack gap={5} flex={1}>
            <Text variant="h2" tone="primary" numberOfLines={1}>
              {user?.fullName || "—"}
            </Text>
            <HStack gap={6} align="center" wrap>
              <StatusChip
                label={roleLabel}
                tone={user?.role === "admin" ? "info" : "neutral"}
              />
            </HStack>
          </VStack>
        </HStack>
      </Card>

      {/* Organization */}
      {organization ? (
        <Card style={{ marginBottom: 20 }}>
          <HStack gap={12} align="center">
            <View style={iconWrap}>
              <Building2 size={18} color={palette.teal[600]} strokeWidth={2} />
            </View>
            <VStack gap={2} flex={1}>
              <Text variant="label-lg" tone="primary" numberOfLines={1}>
                {organization.name}
              </Text>
              <Text variant="caption" tone="tertiary">
                Workspace
              </Text>
            </VStack>
          </HStack>
        </Card>
      ) : null}

      {/* Contact */}
      <Text variant="h3" tone="primary" style={{ marginBottom: 12 }}>
        Contact
      </Text>
      <Card style={{ marginBottom: 20 }}>
        <VStack gap={16}>
          <ContactRow
            icon={<Mail size={18} color={palette.teal[600]} strokeWidth={2} />}
            label="Email"
            value={user?.email || "Not set"}
          />
          <ContactRow
            icon={<Phone size={18} color={palette.teal[600]} strokeWidth={2} />}
            label="Phone"
            value={user?.phone || "Not set"}
          />
          <ContactRow
            icon={
              <BadgeCheck size={18} color={palette.teal[600]} strokeWidth={2} />
            }
            label="Role"
            value={roleLabel}
          />
        </VStack>
      </Card>

      <Button
        label="Sign out"
        variant="destructive"
        icon={<LogOut size={18} color="#FFFFFF" strokeWidth={2} />}
        onPress={() => logout()}
      />
    </Screen>
  );
}

function ContactRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <HStack gap={12} align="center">
      <View style={iconWrap}>{icon}</View>
      <VStack gap={2} flex={1}>
        <Text variant="caption" tone="tertiary">
          {label}
        </Text>
        <Text variant="label-lg" tone="primary" numberOfLines={1}>
          {value}
        </Text>
      </VStack>
    </HStack>
  );
}

const iconWrap = {
  width: 40,
  height: 40,
  borderRadius: radius.md,
  backgroundColor: palette.teal[50],
  alignItems: "center" as const,
  justifyContent: "center" as const,
};
