import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { User, Phone, School, MapPin, Users } from "lucide-react-native";
import {
  useStudent,
  useCreateStudent,
  useUpdateStudent,
} from "@modules/student/hooks/useStudents";
import { StudentPayload } from "@modules/student/types";
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
} from "@shared/ui";

export default function StudentFormScreen() {
  const navigation = useNavigation<any>();
  const nav = useRoute<any>();
  const id = nav.params?.id as string | undefined;
  const editing = Boolean(id);

  const { data: student } = useStudent(id || "");
  const createMut = useCreateStudent();
  const updateMut = useUpdateStudent(id || "");
  const mut = editing ? updateMut : createMut;

  const [f, setF] = useState({
    name: "",
    mobile: "",
    gender: "",
    schoolName: "",
    className: "",
    section: "",
    homeAddress: "",
    pickupTime: "",
    dropTime: "",
    fatherName: "",
    motherName: "",
    alternateNumber: "",
    whatsappNumber: "",
    lat: "",
    lng: "",
  });

  useEffect(() => {
    if (student)
      setF({
        name: student.name,
        mobile: student.mobile,
        gender: student.gender,
        schoolName: student.schoolName,
        className: student.className,
        section: student.section,
        homeAddress: student.homeAddress,
        pickupTime: student.pickupTime,
        dropTime: student.dropTime,
        fatherName: student.fatherName,
        motherName: student.motherName,
        alternateNumber: student.alternateNumber,
        whatsappNumber: student.whatsappNumber,
        lat: student.pickupPoint ? String(student.pickupPoint.lat) : "",
        lng: student.pickupPoint ? String(student.pickupPoint.lng) : "",
      });
  }, [student]);

  const set = (k: keyof typeof f) => (v: string) =>
    setF((s) => ({ ...s, [k]: v }));

  const submit = () => {
    if (!f.name.trim()) return;
    const lat = parseFloat(f.lat);
    const lng = parseFloat(f.lng);
    const pickupPoint =
      Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : undefined;

    const payload: StudentPayload = {
      name: f.name.trim(),
      mobile: f.mobile.trim() || undefined,
      gender: f.gender.trim() || undefined,
      schoolName: f.schoolName.trim() || undefined,
      className: f.className.trim() || undefined,
      section: f.section.trim() || undefined,
      homeAddress: f.homeAddress.trim() || undefined,
      pickupTime: f.pickupTime.trim() || undefined,
      dropTime: f.dropTime.trim() || undefined,
      fatherName: f.fatherName.trim() || undefined,
      motherName: f.motherName.trim() || undefined,
      alternateNumber: f.alternateNumber.trim() || undefined,
      whatsappNumber: f.whatsappNumber.trim() || undefined,
      pickupPoint,
    };

    mut.mutate(payload, { onSuccess: () => navigation.goBack() });
  };

  const iconOf = (Icon: any) => (
    <Icon size={18} color={palette.text.tertiary} strokeWidth={1.8} />
  );

  return (
    <Screen
      overline="Students"
      title={editing ? "Edit student" : "Add student"}
      onBack={() => navigation.goBack()}
    >
      {mut.isError && (
        <View style={errorBox}>
          <Text variant="body-sm" tone="danger">
            {apiErrorMessage(mut.error)}
          </Text>
        </View>
      )}

      <Card style={{ marginBottom: 16 }}>
        <VStack gap={16}>
          <Text variant="h4" tone="primary">
            Student
          </Text>
          <TextField
            label="Name"
            leading={iconOf(User)}
            value={f.name}
            onChangeText={set("name")}
            placeholder="Student name"
          />
          <TextField
            label="Mobile"
            leading={iconOf(Phone)}
            value={f.mobile}
            onChangeText={set("mobile")}
            keyboardType="phone-pad"
            placeholder="9876543210"
          />
          <TextField
            label="Gender (optional)"
            value={f.gender}
            onChangeText={set("gender")}
            placeholder="male / female / other"
            autoCapitalize="none"
          />
        </VStack>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <VStack gap={16}>
          <Text variant="h4" tone="primary">
            School
          </Text>
          <TextField
            label="School name (optional)"
            leading={iconOf(School)}
            value={f.schoolName}
            onChangeText={set("schoolName")}
          />
          <HStack gap={12}>
            <View style={{ flex: 1 }}>
              <TextField
                label="Class (optional)"
                value={f.className}
                onChangeText={set("className")}
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextField
                label="Section (optional)"
                value={f.section}
                onChangeText={set("section")}
              />
            </View>
          </HStack>
        </VStack>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <VStack gap={16}>
          <Text variant="h4" tone="primary">
            Parent
          </Text>
          <TextField
            label="Father name (optional)"
            leading={iconOf(Users)}
            value={f.fatherName}
            onChangeText={set("fatherName")}
          />
          <TextField
            label="Mother name (optional)"
            leading={iconOf(Users)}
            value={f.motherName}
            onChangeText={set("motherName")}
          />
          <TextField
            label="Alternate number (optional)"
            leading={iconOf(Phone)}
            value={f.alternateNumber}
            onChangeText={set("alternateNumber")}
            keyboardType="phone-pad"
          />
          <TextField
            label="WhatsApp number (optional)"
            leading={iconOf(Phone)}
            value={f.whatsappNumber}
            onChangeText={set("whatsappNumber")}
            keyboardType="phone-pad"
          />
        </VStack>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <VStack gap={16}>
          <Text variant="h4" tone="primary">
            Pickup & drop
          </Text>
          <TextField
            label="Home address (optional)"
            leading={iconOf(MapPin)}
            value={f.homeAddress}
            onChangeText={set("homeAddress")}
          />
          <HStack gap={12}>
            <View style={{ flex: 1 }}>
              <TextField
                label="Pickup lat (optional)"
                value={f.lat}
                onChangeText={set("lat")}
                keyboardType="numeric"
                placeholder="12.9716"
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextField
                label="Pickup lng (optional)"
                value={f.lng}
                onChangeText={set("lng")}
                keyboardType="numeric"
                placeholder="77.5946"
              />
            </View>
          </HStack>
          <HStack gap={12}>
            <View style={{ flex: 1 }}>
              <TextField
                label="Pickup time (optional)"
                value={f.pickupTime}
                onChangeText={set("pickupTime")}
                placeholder="07:30 AM"
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextField
                label="Drop time (optional)"
                value={f.dropTime}
                onChangeText={set("dropTime")}
                placeholder="02:30 PM"
              />
            </View>
          </HStack>
        </VStack>
      </Card>

      <Button
        label={editing ? "Save changes" : "Add student"}
        size="lg"
        loading={mut.isPending}
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
