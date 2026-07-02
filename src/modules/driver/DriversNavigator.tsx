import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DriversScreen from "@modules/driver/screens/DriversScreen";
import DriverFormScreen from "@modules/driver/screens/DriverFormScreen";

export type DriverStackParamList = {
  DriversList: undefined;
  DriverForm: { id?: string } | undefined;
};

const Stack = createNativeStackNavigator<DriverStackParamList>();

export default function DriversNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DriversList" component={DriversScreen} />
      <Stack.Screen name="DriverForm" component={DriverFormScreen} />
    </Stack.Navigator>
  );
}
