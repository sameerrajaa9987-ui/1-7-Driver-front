import React, { useState } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useRaiseComplaint } from "@modules/complaint/hooks/useComplaints";
import { ComplaintCategory } from "@modules/complaint/types";
import { useStudents } from "@modules/student/hooks/useStudents";
import { apiErrorMessage } from "@api/apiClient";
import { palette, radius } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  Card,
  Button,
  TextField,
  Select,
  SelectOption,
} from "@shared/ui";

const CATEGORY_OPTIONS: SelectOption[] = [
  { value: "late_pickup", label: "Late pickup" },
  { value: "driver", label: "Driver" },
  { value: "vehicle", label: "Vehicle" },
  { value: "fee", label: "Fee" },
  { value: "other", label: "Other" },
];

export default function ComplaintFormScreen() {
  const navigation = useNavigation<any>();
  const raiseMut = useRaiseComplaint();
  const { data: studentData } = useStudents({ limit: 200 });
  const studentOptions: SelectOption[] = (studentData?.data ?? []).map((s) => ({
    value: s.id,
    label: s.name,
  }));

  const [category, setCategory] = useState<ComplaintCategory | null>(null);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [studentId, setStudentId] = useState<string | null>(null);

  const submit = () => {
    if (!category || !subject.trim() || !description.trim()) return;
    raiseMut.mutate(
      {
        category,
        subject: subject.trim(),
        description: description.trim(),
        studentId: studentId || undefined,
      },
      { onSuccess: () => navigation.goBack() },
    );
  };

  const disabled = !category || !subject.trim() || !description.trim();

  return (
    <Screen
      overline="Support"
      title="Raise a complaint"
      onBack={() => navigation.goBack()}
    >
      {raiseMut.isError && (
        <View style={errorBox}>
          <Text variant="body-sm" tone="danger">
            {apiErrorMessage(raiseMut.error)}
          </Text>
        </View>
      )}

      <Card style={{ marginBottom: 16 }}>
        <VStack gap={16}>
          <Select
            label="Category"
            placeholder="Choose a category"
            value={category}
            options={CATEGORY_OPTIONS}
            onChange={(v) => setCategory(v as ComplaintCategory | null)}
          />
          <TextField
            label="Subject"
            value={subject}
            onChangeText={setSubject}
            placeholder="Short summary"
          />
          <TextField
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the issue in detail"
            multiline
            numberOfLines={5}
          />
          <Select
            label="Student (optional)"
            placeholder="Link a student"
            value={studentId}
            options={studentOptions}
            onChange={setStudentId}
            allowClear
          />
        </VStack>
      </Card>

      <Button
        label="Submit ticket"
        size="lg"
        disabled={disabled}
        loading={raiseMut.isPending}
        onPress={submit}
      />
    </Screen>
  );
}

const errorBox = {
  padding: 14,
  borderRadius: radius.md,
  backgroundColor: palette.danger.bg,
  borderWidth: 1,
  borderColor: palette.danger.border,
  marginBottom: 16,
} as const;
