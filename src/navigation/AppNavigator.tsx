/**
 * AppNavigator — responsive, role-aware app shell. Wide screens get a permanent
 * Sidebar; phones get a top app bar + slide-over drawer. The visible sections
 * come from NAV_BY_ROLE for the signed-in user's role (admin / driver / parent).
 */
import React, { useState, createContext, useContext } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  Modal,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Menu, Bus } from "lucide-react-native";
import { palette, layout, radius } from "@shared/designSystem";
import { Text, HStack } from "@shared/ui";
import { useAuthStore } from "@shared/store/useAuthStore";
import { Sidebar } from "./Sidebar";
import { NAV_BY_ROLE } from "./navItems";

export const SectionNav = createContext<(name: string) => void>(() => {});
export const useSectionNav = () => useContext(SectionNav);

export default function AppNavigator() {
  const { width } = useWindowDimensions();
  const isWide = width >= layout.wideBreakpoint;
  const role = useAuthStore((s) => s.user?.role) || "admin";
  const items = NAV_BY_ROLE[role];
  const [active, setActive] = useState(items[0]?.name);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = (name: string) => {
    setActive(name);
    setMenuOpen(false);
  };

  const current = items.find((i) => i.name === active) || items[0];
  const ActiveScreen = current.component;

  return (
    <SectionNav.Provider value={navigate}>
      <View style={styles.root}>
        {isWide && <Sidebar activeRoute={active} onNavigate={navigate} />}

        <View style={{ flex: 1 }}>
          {!isWide && (
            <SafeAreaView edges={["top"]} style={styles.appBarSafe}>
              <HStack align="center" gap={12} style={styles.appBar}>
                <Pressable
                  onPress={() => setMenuOpen(true)}
                  hitSlop={8}
                  style={styles.menuBtn}
                >
                  <Menu
                    size={22}
                    color={palette.text.primary}
                    strokeWidth={2}
                  />
                </Pressable>
                <View style={styles.appBarLogo}>
                  <Bus size={16} color="#FFFFFF" strokeWidth={2.4} />
                </View>
                <Text variant="h4" tone="primary">
                  {current.label}
                </Text>
              </HStack>
            </SafeAreaView>
          )}

          <View style={{ flex: 1 }}>
            <ActiveScreen />
          </View>
        </View>

        {!isWide && (
          <Modal
            visible={menuOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setMenuOpen(false)}
          >
            <Pressable
              style={styles.backdrop}
              onPress={() => setMenuOpen(false)}
            >
              <Pressable
                style={styles.drawer}
                onPress={(e) => e.stopPropagation()}
              >
                <Sidebar activeRoute={active} onNavigate={navigate} />
              </Pressable>
            </Pressable>
          </Modal>
        )}
      </View>
    </SectionNav.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: palette.surface.secondary,
  },
  appBarSafe: { backgroundColor: palette.surface.primary },
  appBar: {
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: palette.surface.primary,
    borderBottomWidth: 1,
    borderBottomColor: palette.border.default,
  },
  menuBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  appBarLogo: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: palette.teal[600],
    alignItems: "center",
    justifyContent: "center",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.4)",
    flexDirection: "row",
  },
  drawer: { width: layout.sidebarWidth, height: "100%" },
});
