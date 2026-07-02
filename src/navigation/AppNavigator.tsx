/**
 * AppNavigator — responsive, role-aware app shell ("Midnight Transit").
 * Phones get a floating midnight TabDock (4 primary destinations + Menu hub);
 * wide screens get a slim midnight TopBar with nav pills. The old
 * hamburger/sidebar pattern is gone. Sections come from NAV_BY_ROLE for the
 * signed-in user's role (admin / driver / parent).
 */
import React, { useState, createContext, useContext } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { palette, layout } from "@shared/designSystem";
import { useAuthStore } from "@shared/store/useAuthStore";
import { NAV_BY_ROLE } from "./navItems";
import { TabDock, MENU_ROUTE } from "./TabDock";
import { TopBar } from "./TopBar";
import { MenuHubScreen } from "./MenuHubScreen";

export const SectionNav = createContext<(name: string) => void>(() => {});
export const useSectionNav = () => useContext(SectionNav);

export default function AppNavigator() {
  const { width } = useWindowDimensions();
  const isWide = width >= layout.wideBreakpoint;
  const role = useAuthStore((s) => s.user?.role) || "admin";
  const items = NAV_BY_ROLE[role];
  const primary = items.filter((i) => i.primary).slice(0, 4);
  const [active, setActive] = useState(primary[0]?.name || items[0]?.name);

  const navigate = (name: string) => setActive(name);

  const current = items.find((i) => i.name === active);
  const ActiveScreen = current?.component;

  // The dock highlights Menu whenever a non-primary section is open.
  const dockActive = primary.some((p) => p.name === active)
    ? active
    : MENU_ROUTE;

  const content =
    active === MENU_ROUTE || !ActiveScreen ? (
      <MenuHubScreen items={items} onNavigate={navigate} />
    ) : (
      <ActiveScreen />
    );

  return (
    <SectionNav.Provider value={navigate}>
      <View style={styles.root}>
        {isWide ? (
          <>
            <TopBar items={primary} active={active} onNavigate={navigate} />
            <View style={{ flex: 1 }}>{content}</View>
          </>
        ) : (
          <>
            <SafeAreaView edges={["top"]} style={styles.mobileSafe}>
              <View style={{ flex: 1 }}>{content}</View>
            </SafeAreaView>
            <TabDock
              items={primary}
              active={dockActive}
              onNavigate={navigate}
            />
          </>
        )}
      </View>
    </SectionNav.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.surface.secondary,
  },
  mobileSafe: {
    flex: 1,
    backgroundColor: palette.surface.secondary,
  },
});
