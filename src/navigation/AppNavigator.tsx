/**
 * AppNavigator — the signed-in app shell, built on React Navigation (the 2026
 * standard). A bottom-tab navigator holds the role's primary destinations plus
 * a Menu tab; each tab is a native-stack so sub-screens push with native
 * transitions, a working Android hardware-back, and web URLs. The visual tab
 * bar is our own `TabDock`, wired in via the `tabBar` prop.
 *
 * `useSectionNav()` is kept as a thin compat shim (`go(name)`) so existing
 * screens navigate without change: primary names switch tabs, everything else
 * opens inside the Menu stack.
 */
import React, { useCallback, useMemo } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { palette } from "@shared/designSystem";
import { useAuthStore } from "@shared/store/useAuthStore";
import type { Role } from "@shared/permissions";
import { NAV_BY_ROLE, type NavItem } from "./navItems";
import { TabDock, MENU_ROUTE } from "./TabDock";
import { MenuHubScreen } from "./MenuHubScreen";

const Tab = createBottomTabNavigator();

/** Primary destinations shown as tabs (max 4), rest live under the Menu tab. */
function splitItems(role: Role) {
  const items = NAV_BY_ROLE[role];
  return {
    items,
    primary: items.filter((i) => i.primary).slice(0, 4),
    secondary: items.filter((i) => !i.primary),
  };
}

/**
 * Compat shim for the old section navigator. `go(name)` sends primary names to
 * their tab and everything else into the Menu stack.
 */
export function useSectionNav() {
  const navigation = useNavigation<any>();
  const role = (useAuthStore((s) => s.user?.role) as Role) || "admin";
  return useCallback(
    (name: string) => {
      if (name === MENU_ROUTE || name === "Menu") {
        navigation.navigate("Menu");
        return;
      }
      const { primary } = splitItems(role);
      if (primary.some((p) => p.name === name)) navigation.navigate(name);
      else navigation.navigate("Menu", { screen: name });
    },
    [navigation, role],
  );
}

/** Our TabDock rendered as React Navigation's tab bar. */
function AppTabBar({
  state,
  navigation,
  primary,
}: BottomTabBarProps & { primary: NavItem[] }) {
  const activeName = state.routes[state.index]?.name;
  const active = activeName === "Menu" ? MENU_ROUTE : activeName;
  return (
    <TabDock
      items={primary}
      active={active}
      onNavigate={(name) =>
        navigation.navigate(name === MENU_ROUTE ? "Menu" : name)
      }
    />
  );
}

export default function AppNavigator() {
  const role = (useAuthStore((s) => s.user?.role) as Role) || "admin";

  // Stable tab + menu stack components per role (rebuilt only when role changes).
  const { primary, tabScreens, MenuStack } = useMemo(() => {
    const { items, primary, secondary } = splitItems(role);
    const Stack = createNativeStackNavigator();

    // Each primary tab is its own native-stack (so it can push sub-screens and
    // reports canGoBack === false at its root).
    const tabScreens = primary.map((item) => {
      const TabStack = () => (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name={`${item.name}Home`} component={item.component} />
        </Stack.Navigator>
      );
      return { name: item.name, component: TabStack };
    });

    // The Menu tab: the hub + every secondary destination as a pushable screen.
    const MenuStack = () => (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MenuHome">
          {({ navigation }) => (
            <MenuHubScreen
              items={items}
              onNavigate={(name) => navigation.navigate(name)}
            />
          )}
        </Stack.Screen>
        {secondary.map((s) => (
          <Stack.Screen key={s.name} name={s.name} component={s.component} />
        ))}
      </Stack.Navigator>
    );

    return { primary, tabScreens, MenuStack };
  }, [role]);

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <AppTabBar {...props} primary={primary} />}
      >
        {tabScreens.map((t) => (
          <Tab.Screen key={t.name} name={t.name} component={t.component} />
        ))}
        <Tab.Screen name="Menu" component={MenuStack} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.surface.secondary },
});
