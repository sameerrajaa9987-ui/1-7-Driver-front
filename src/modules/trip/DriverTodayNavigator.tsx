import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DriverTodayScreen from "@modules/trip/screens/DriverTodayScreen";
import RunTripScreen from "@modules/trip/screens/RunTripScreen";

export type DriverTodayStackParamList = {
  DriverToday: undefined;
  RunTrip: { tripId: string };
};

const Stack = createNativeStackNavigator<DriverTodayStackParamList>();

export default function DriverTodayNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DriverToday" component={DriverTodayScreen} />
      <Stack.Screen name="RunTrip" component={RunTripScreen} />
    </Stack.Navigator>
  );
}
