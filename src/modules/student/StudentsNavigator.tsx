import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import StudentsScreen from "@modules/student/screens/StudentsScreen";
import StudentDetailScreen from "@modules/student/screens/StudentDetailScreen";
import StudentFormScreen from "@modules/student/screens/StudentFormScreen";
import StudentApproveScreen from "@modules/student/screens/StudentApproveScreen";

export type StudentStackParamList = {
  StudentsList: undefined;
  StudentDetail: { id: string };
  StudentForm: { id?: string } | undefined;
  StudentApprove: { id: string };
};

const Stack = createNativeStackNavigator<StudentStackParamList>();

export default function StudentsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudentsList" component={StudentsScreen} />
      <Stack.Screen name="StudentDetail" component={StudentDetailScreen} />
      <Stack.Screen name="StudentForm" component={StudentFormScreen} />
      <Stack.Screen name="StudentApprove" component={StudentApproveScreen} />
    </Stack.Navigator>
  );
}
