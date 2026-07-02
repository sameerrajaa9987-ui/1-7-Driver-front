import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  useComplaint,
  useUpdateComplaintStatus,
} from "@modules/complaint/hooks/useComplaints";
import { ComplaintStatus } from "@modules/complaint/types";
import { useAuthStore } from "@shared/store/useAuthStore";
import { apiErrorMessage } from "@api/apiClient";
import { palette, radius } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  TextField,
  Select,
  StatusChip,
  SelectOption,
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

const CATEGORY_LABEL: Record<string, string> = {
  late_pickup: "Late pickup",
  driver: "Driver",
  vehicle: "Vehicle",
  fee: "Fee",
  other: "Other",
};

const STATUS_OPTIONS: SelectOption[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ComplaintDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const id = route.params?.id as string;

  const { data: complaint, isLoading } = useComplaint(id);
  const updateMut = useUpdateComplaintStatus(id);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const admin = isAdmin();

  const [status, setStatus] = useState<ComplaintStatus | null>(null);
  const [resolution, setResolution] = useState("");

  useEffect(() => {
    if (complaint) {
      setStatus(complaint.status);
      setResolution(complaint.resolution ?? "");
    }
  }, [complaint]);

  const submit = () => {
    if (!status) return;
    updateMut.mutate({
      status,
      resolution: resolution.trim() || undefined,
    });
  };

  return (
    <Screen
      overline="Support"
      title="Ticket"
      onBack={() => navigation.goBack()}
    >
      {!complaint ? (
        <Text variant="body-sm" tone="tertiary">
          {isLoading ? "Loading…" : "Ticket not found."}
        </Text>
      ) : (
        <VStack gap={16}>
          <Card>
            <VStack gap={12}>
              <HStack gap={8} align="center" justify="space-between">
                <Text variant="label-sm" tone="tertiary">
                  {complaint.ticketNumber}
                </Text>
                <StatusChip
                  label={STATUS_LABEL[complaint.status]}
                  tone={STATUS_TONE[complaint.status]}
                />
              </HStack>
              <Text variant="h3" tone="primary">
                {complaint.subject}
              </Text>
              <HStack gap={8} align="center">
                <StatusChip
                  label={
                    CATEGORY_LABEL[complaint.category] ?? complaint.category
                  }
                  tone="neutral"
                />
                <Text variant="body-sm" tone="tertiary">
                  {complaint.raisedByName}
                </Text>
              </HStack>
              <Field label="Description" value={complaint.description} />
              <Field
                label="Raised on"
                value={formatDate(complaint.createdAt)}
              />
              {complaint.resolvedAt ? (
                <Field
                  label="Resolved on"
                  value={formatDate(complaint.resolvedAt)}
                />
              ) : null}
            </VStack>
          </Card>

          {admin ? (
            <Card>
              <VStack gap={16}>
                <Text variant="h4" tone="primary">
                  Update ticket
                </Text>
                {updateMut.isError && (
                  <View style={errorBox}>
                    <Text variant="body-sm" tone="danger">
                      {apiErrorMessage(updateMut.error)}
                    </Text>
                  </View>
                )}
                {updateMut.isSuccess && (
                  <Text variant="body-sm" tone="success">
                    Ticket updated.
                  </Text>
                )}
                <Select
                  label="Status"
                  value={status}
                  options={STATUS_OPTIONS}
                  onChange={(v) => setStatus(v as ComplaintStatus | null)}
                />
                <TextField
                  label="Resolution"
                  value={resolution}
                  onChangeText={setResolution}
                  placeholder="How was this resolved?"
                  multiline
                  numberOfLines={4}
                />
                <Button
                  label="Update"
                  size="lg"
                  loading={updateMut.isPending}
                  onPress={submit}
                />
              </VStack>
            </Card>
          ) : (
            <Card>
              <VStack gap={12}>
                <Field label="Status" value={STATUS_LABEL[complaint.status]} />
                <Field
                  label="Resolution"
                  value={complaint.resolution || "No resolution yet."}
                />
              </VStack>
            </Card>
          )}
        </VStack>
      )}
    </Screen>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <VStack gap={4}>
      <Text variant="label-sm" tone="tertiary">
        {label}
      </Text>
      <Text variant="body" tone="primary">
        {value}
      </Text>
    </VStack>
  );
}

const errorBox = {
  padding: 14,
  borderRadius: radius.md,
  backgroundColor: palette.danger.bg,
  borderWidth: 1,
  borderColor: palette.danger.border,
} as const;
