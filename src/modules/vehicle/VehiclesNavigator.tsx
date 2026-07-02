import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import VehiclesScreen from "@modules/vehicle/screens/VehiclesScreen";
import VehicleFormScreen from "@modules/vehicle/screens/VehicleFormScreen";

export type VehicleStackParamList = {
  VehiclesList: undefined;
  VehicleForm: { id?: string } | undefined;
};

const Stack = createNativeStackNavigator<VehicleStackParamList>();

export default function VehiclesNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VehiclesList" component={VehiclesScreen} />
      <Stack.Screen name="VehicleForm" component={VehicleFormScreen} />
    </Stack.Navigator>
  );
}
