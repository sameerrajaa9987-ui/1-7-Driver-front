import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RoutesScreen from "@modules/route/screens/RoutesScreen";
import RouteFormScreen from "@modules/route/screens/RouteFormScreen";

export type RouteStackParamList = {
  RoutesList: undefined;
  RouteForm: { id?: string } | undefined;
};

const Stack = createNativeStackNavigator<RouteStackParamList>();

export default function RoutesNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RoutesList" component={RoutesScreen} />
      <Stack.Screen name="RouteForm" component={RouteFormScreen} />
    </Stack.Navigator>
  );
}
