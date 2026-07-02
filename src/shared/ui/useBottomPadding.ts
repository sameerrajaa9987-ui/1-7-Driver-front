import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { layout } from "../designSystem";

/**
 * Bottom padding that clears the safe-area inset for scroll content — and, on
 * narrow (phone) layouts, also clears the floating TabDock.
 */
export function useBottomPadding(extra = 24) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= layout.wideBreakpoint;
  return insets.bottom + extra + (isWide ? 0 : layout.tabBarClearance);
}

/** Bottom padding that also clears a floating tab bar (narrow layout). */
export function useTabBottomPadding(extra = 0) {
  const insets = useSafeAreaInsets();
  return insets.bottom + layout.tabBarClearance + extra;
}
