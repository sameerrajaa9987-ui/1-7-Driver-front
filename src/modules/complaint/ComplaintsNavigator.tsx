import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ComplaintsScreen from "@modules/complaint/screens/ComplaintsScreen";
import ComplaintFormScreen from "@modules/complaint/screens/ComplaintFormScreen";
import ComplaintDetailScreen from "@modules/complaint/screens/ComplaintDetailScreen";

export type ComplaintStackParamList = {
  ComplaintsList: undefined;
  ComplaintForm: undefined;
  ComplaintDetail: { id: string };
};

const Stack = createNativeStackNavigator<ComplaintStackParamList>();

export default function ComplaintsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ComplaintsList" component={ComplaintsScreen} />
      <Stack.Screen name="ComplaintForm" component={ComplaintFormScreen} />
      <Stack.Screen name="ComplaintDetail" component={ComplaintDetailScreen} />
    </Stack.Navigator>
  );
}
