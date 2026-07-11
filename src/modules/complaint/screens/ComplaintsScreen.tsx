import React from "react";
import { useNavigation } from "@react-navigation/native";
import { Plus, MessageSquareWarning, ChevronRight } from "lucide-react-native";
import { useComplaints } from "@modules/complaint/hooks/useComplaints";
import { Complaint, ComplaintStatus } from "@modules/complaint/types";
import { useAuthStore } from "@shared/store/useAuthStore";
import { palette } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  StatusChip,
  ChipsRow,
  EmptyState,
  SupportScene,
} from "@shared/ui";

type ChipTone = "success" | "warning" | "danger" | "info" | "neutral";

const STATUS_TONE: Record<ComplaintStatus, ChipTone> = {
  open: "warning",
  in_progress: "info",
  resolved: "success",
  closed: "neutral",
};

const STATUS_LABEL: Record<ComplaintStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  closed: "Closed",
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In progress" },
  { key: "resolved", label: "Resolved" },
  { key: "closed", label: "Closed" },
];

export default function ComplaintsScreen() {
  const navigation = useNavigation<any>();
  const role = useAuthStore((s) => s.user?.role);
  const isParent = role === "parent";

  const [filter, setFilter] = React.useState("all");
  const { data, isLoading, refetch, isRefetching } = useComplaints(
    filter === "all" ? undefined : { status: filter as ComplaintStatus },
  );
  const complaints = data?.data ?? [];

  return (
    <Screen
      overline="Support"
      title="Complaints"
      subtitle={`${data?.meta?.total ?? 0} tickets`}
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
    >
      {isParent ? (
        <>
          {/* "Have an issue?" hero — the primary parent CTA (mockup). */}
          <Card style={{ alignItems: "center", paddingVertical: 24 }}>
            <SupportScene size={150} />
            <Text
              variant="h2"
              tone="primary"
              align="center"
              style={{ marginTop: 8 }}
            >
              Have an issue?
            </Text>
            <Text
              variant="body-sm"
              tone="tertiary"
              align="center"
              style={{ marginTop: 6, maxWidth: 280 }}
            >
              Raise a complaint and we&apos;ll resolve it as soon as possible.
            </Text>
            <Button
              label="New Complaint"
              icon={<Plus size={18} color="#FFFFFF" strokeWidth={2.2} />}
              onPress={() => navigation.navigate("ComplaintForm")}
              style={{ marginTop: 16 }}
            />
          </Card>

          <Text
            variant="h3"
            tone="primary"
            style={{ marginTop: 24, marginBottom: 12 }}
          >
            Recent Complaints
          </Text>
          {complaints.length === 0 ? (
            <Text variant="body-sm" tone="tertiary">
              {isLoading
                ? "Loading…"
                : "You haven’t raised any complaints yet."}
            </Text>
          ) : (
            <VStack gap={12}>
              {complaints.map((c) => (
                <ComplaintRow
                  key={c.id}
                  complaint={c}
                  onPress={() =>
                    navigation.navigate("ComplaintDetail", { id: c.id })
                  }
                />
              ))}
            </VStack>
          )}
        </>
      ) : (
        <>
          <ChipsRow chips={FILTERS} active={filter} onChange={setFilter} />
          {complaints.length === 0 ? (
            <EmptyState
              icon={MessageSquareWarning}
              illustration={<SupportScene size={150} />}
              title={isLoading ? "Loading…" : "No complaints"}
              message="No complaints have been raised yet."
            />
          ) : (
            <VStack gap={12} style={{ marginTop: 16 }}>
              {complaints.map((c) => (
                <ComplaintRow
                  key={c.id}
                  complaint={c}
                  onPress={() =>
                    navigation.navigate("ComplaintDetail", { id: c.id })
                  }
                />
              ))}
            </VStack>
          )}
        </>
      )}
    </Screen>
  );
}

function ComplaintRow({
  complaint,
  onPress,
}: {
  complaint: Complaint;
  onPress: () => void;
}) {
  return (
    <Card onPress={onPress} elevation="base">
      <HStack gap={12} align="center">
        <VStack gap={6} flex={1}>
          <HStack gap={8} align="center">
            <Text variant="label-sm" tone="tertiary">
              {complaint.ticketNumber}
            </Text>
            <StatusChip
              label={STATUS_LABEL[complaint.status]}
              tone={STATUS_TONE[complaint.status]}
            />
          </HStack>
          <Text variant="label-lg" tone="primary" numberOfLines={1}>
            {complaint.subject}
          </Text>
          <Text variant="body-sm" tone="tertiary" numberOfLines={1}>
            {complaint.raisedByName}
          </Text>
        </VStack>
        <ChevronRight size={18} color={palette.text.tertiary} strokeWidth={2} />
      </HStack>
    </Card>
  );
}
