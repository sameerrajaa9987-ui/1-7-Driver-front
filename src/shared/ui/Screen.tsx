import React from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  StyleProp,
  ViewStyle,
} from "react-native";
import { palette, layout } from "../designSystem";
import { useBottomPadding } from "./useBottomPadding";
import { AppHeader } from "./AppHeader";

interface Props {
  title?: string;
  subtitle?: string;
  overline?: string;
  /** iOS-style circular chevron back button in the fixed header. */
  onBack?: () => void;
  right?: React.ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  contentStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/**
 * Screen — standard content container (doctor-app pattern). The header is a
 * FIXED AppHeader above the scroll region (back button, overline/title,
 * right action stay put while content scrolls). Content centers to a max
 * width on wide layouts. The surrounding shell (TopBar/TabDock) is provided
 * by the navigator.
 */
export function Screen({
  title,
  subtitle,
  overline,
  onBack,
  right,
  scroll = true,
  refreshing,
  onRefresh,
  contentStyle,
  children,
}: Props) {
  const bottom = useBottomPadding(32);
  const hasHeader = Boolean(title || right || onBack);

  const inner = (
    <View
      style={[
        {
          width: "100%",
          maxWidth: layout.contentMaxWidth,
          alignSelf: "center",
        },
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.secondary }}>
      {hasHeader ? (
        <AppHeader
          title={title}
          subtitle={subtitle}
          overline={overline}
          onBack={onBack}
          right={right}
        />
      ) : null}

      {scroll ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: hasHeader ? 6 : 20,
            paddingBottom: bottom,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={Boolean(refreshing)}
                onRefresh={onRefresh}
                tintColor={palette.brand[600]}
              />
            ) : undefined
          }
        >
          {inner}
        </ScrollView>
      ) : (
        <View
          style={{
            flex: 1,
            paddingHorizontal: 20,
            paddingTop: hasHeader ? 6 : 20,
            paddingBottom: 20,
          }}
        >
          {inner}
        </View>
      )}
    </View>
  );
}
