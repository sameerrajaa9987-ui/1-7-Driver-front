import React, { useEffect, useState } from "react";
import { View, Image, Pressable, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import {
  User,
  Phone,
  School,
  MapPin,
  Users,
  Camera,
} from "lucide-react-native";
import {
  useStudent,
  useCreateStudent,
  useUpdateStudent,
} from "@modules/student/hooks/useStudents";
import { StudentPayload } from "@modules/student/types";
import { apiErrorMessage, uploadImage } from "@api/apiClient";
import { mediaUrl } from "@shared/media";
import { palette, radius, accent } from "@shared/designSystem";
import { useAuthStore } from "@shared/store/useAuthStore";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  TextField,
  Avatar,
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
  const role = useAuthStore((s) => s.user?.role);

  // Child photo — starts as the default mockup portrait; parents can upload
  // their own from the gallery (stored via POST /media/upload).
  const [photo, setPhoto] = useState<string>("");
  const [photoErr, setPhotoErr] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickPhoto = async () => {
    setPhotoErr(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setPhotoErr("Photo library permission was denied.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    try {
      setUploading(true);
      const url = await uploadImage(result.assets[0].uri);
      setPhoto(url);
    } catch (e) {
      setPhotoErr(apiErrorMessage(e, "Could not upload the photo."));
    } finally {
      setUploading(false);
    }
  };

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
    if (student) setPhoto(student.photo || "");
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
      photo: photo || undefined,
      pickupPoint,
    };

    mut.mutate(payload, { onSuccess: () => navigation.goBack() });
  };

  const iconOf = (Icon: any) => (
    <Icon size={18} color={palette.text.tertiary} strokeWidth={1.8} />
  );

  return (
    <Screen
      overline={role === "parent" ? "Children" : "Students"}
      title={
        role === "parent"
          ? editing
            ? "Edit Child"
            : "Add Child"
          : editing
            ? "Edit student"
            : "Add student"
      }
      onBack={() => navigation.goBack()}
    >
      {mut.isError && (
        <View style={errorBox}>
          <Text variant="body-sm" tone="danger">
            {apiErrorMessage(mut.error)}
          </Text>
        </View>
      )}

      {/* Child photo — default mockup portrait until a photo is uploaded */}
      <Card style={{ marginBottom: 16 }}>
        <HStack gap={16} align="center">
          <View>
            {photo ? (
              <Image
                source={{ uri: mediaUrl(photo) }}
                style={photoStyles.preview}
              />
            ) : (
              <Avatar
                name={f.name || "New Child"}
                seed={id || "new-child"}
                size={72}
              />
            )}
            <Pressable
              onPress={pickPhoto}
              style={[photoStyles.badge, { backgroundColor: accent.main }]}
            >
              <Camera size={13} color="#FFFFFF" strokeWidth={2.2} />
            </Pressable>
          </View>
          <VStack gap={6} flex={1}>
            <Text variant="label-lg" tone="primary">
              Child photo
            </Text>
            <Text variant="body-sm" tone="tertiary">
              {photo
                ? "Photo uploaded — tap Upload to change it."
                : "Using the default picture. Upload your child's photo."}
            </Text>
            {photoErr ? (
              <Text variant="body-sm" tone="danger">
                {photoErr}
              </Text>
            ) : null}
            <Button
              label={uploading ? "Uploading…" : "Upload Photo"}
              variant="secondary"
              size="sm"
              fullWidth={false}
              loading={uploading}
              onPress={pickPhoto}
            />
          </VStack>
        </HStack>
      </Card>

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

const photoStyles = StyleSheet.create({
  preview: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: palette.ink[100],
  },
  badge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});

const errorBox = {
  padding: 14,
  borderRadius: radius.md,
  backgroundColor: palette.danger.bg,
  borderWidth: 1,
  borderColor: palette.danger.border,
  marginBottom: 16,
} as const;
