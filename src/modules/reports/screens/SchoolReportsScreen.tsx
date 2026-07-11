/**
 * SchoolReportsScreen — the school's report hub (client mockup): a list of
 * report rows that open the screen holding that data (attendance report, trip
 * board, movement timeline, live utilisation) or the CSV export. Read-only.
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import {
  ClipboardCheck,
  Bus,
  Footprints,
  Gauge,
  CalendarRange,
  Download,
  ChevronRight,
  type LucideIcon,
} from "lucide-react-native";
import { useSectionNav } from "@navigation/AppNavigator";
import { palette, radius, tints, type TintName } from "@shared/designSystem";
import { Screen, Text, VStack, HStack, Card } from "@shared/ui";

type Report = {
  icon: LucideIcon;
  tint: TintName;
  title: string;
  sub: string;
  go: string;
};

const REPORTS: Report[] = [
  {
    icon: ClipboardCheck,
    tint: "violet",
    title: "Daily Attendance Report",
    sub: "View daily student attendance summary",
    go: "AttendanceReport",
  },
  {
    icon: Bus,
    tint: "blue",
    title: "Trip Summary Report",
    sub: "View trip-wise student summary",
    go: "Trips",
  },
  {
    icon: Footprints,
    tint: "green",
    title: "Student Movement Report",
    sub: "Track student movement history",
    go: "Attendance",
  },
  {
    icon: Gauge,
    tint: "amber",
    title: "Transport Utilization Report",
    sub: "Vehicle and route utilization",
    go: "Tracking",
  },
  {
    icon: CalendarRange,
    tint: "teal",
    title: "Monthly Attendance Report",
    sub: "Monthly attendance statistics",
    go: "AttendanceReport",
  },
  {
    icon: Download,
    tint: "violet",
    title: "Export All Reports",
    sub: "Download reports in Excel / CSV",
    go: "AttendanceReport",
  },
];

export default function SchoolReportsScreen() {
  const go = useSectionNav();
  return (
    <Screen title="School Reports">
      <VStack gap={12}>
        {REPORTS.map((r) => {
          const t = tints[r.tint];
          return (
            <Card key={r.title} onPress={() => go(r.go)} elevation="base">
              <HStack gap={14} align="center">
                <View style={[styles.icon, { backgroundColor: t.bg }]}>
                  <r.icon size={20} color={t.icon} strokeWidth={2} />
                </View>
                <VStack gap={2} flex={1}>
                  <Text variant="label-lg" weight="600" tone="primary">
                    {r.title}
                  </Text>
                  <Text variant="body-sm" tone="tertiary" numberOfLines={1}>
                    {r.sub}
                  </Text>
                </VStack>
                <ChevronRight
                  size={18}
                  color={palette.text.tertiary}
                  strokeWidth={2}
                />
              </HStack>
            </Card>
          );
        })}
      </VStack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
