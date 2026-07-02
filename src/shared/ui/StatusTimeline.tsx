import React from "react";
import { View, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";
import { palette, tints, TintName, radius } from "../designSystem";
import { Text } from "./Text";

export interface TimelineStep {
  key: string;
  label: string;
  time?: string;
  state: "done" | "active" | "pending";
  tint?: TintName;
}

/**
 * StatusTimeline — the vertical trip-journey stepper (spec §7). The single
 * niche UX pattern parents scan to answer "where is my child right now?":
 * completed steps filled + checked, the current step highlighted + pulsing,
 * upcoming steps muted.
 */
export function StatusTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <View>
      {steps.map((s, i) => {
        const isLast = i === steps.length - 1;
        const t = tints[s.tint || (s.state === "pending" ? "neutral" : "teal")];
        const active = s.state === "active";
        const done = s.state === "done";
        const nodeColor = done || active ? t.icon : palette.border.strong;

        return (
          <View key={s.key} style={styles.row}>
            <View style={styles.rail}>
              <View
                style={[
                  styles.node,
                  {
                    borderColor: nodeColor,
                    backgroundColor: done ? nodeColor : "#FFFFFF",
                  },
                  active && { backgroundColor: t.bg, borderWidth: 3 },
                ]}
              >
                {done ? (
                  <Check size={12} color="#FFFFFF" strokeWidth={3} />
                ) : null}
                {active ? (
                  <View style={[styles.pulse, { backgroundColor: t.icon }]} />
                ) : null}
              </View>
              {!isLast ? (
                <View
                  style={[
                    styles.line,
                    {
                      backgroundColor: done
                        ? nodeColor
                        : palette.border.default,
                    },
                  ]}
                />
              ) : null}
            </View>

            <View
              style={[
                styles.content,
                active && { backgroundColor: t.bg, borderColor: t.ring },
              ]}
            >
              <Text
                variant="label"
                weight={active ? "700" : "600"}
                tone={s.state === "pending" ? "tertiary" : "primary"}
              >
                {s.label}
              </Text>
              {s.time ? (
                <Text
                  variant="caption"
                  tone="tertiary"
                  style={{ marginTop: 2 }}
                >
                  {s.time}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12 },
  rail: { alignItems: "center", width: 24 },
  node: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  pulse: { width: 8, height: 8, borderRadius: 4 },
  line: { width: 2, flex: 1, minHeight: 22, marginVertical: 2 },
  content: {
    flex: 1,
    marginBottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "transparent",
  },
});
