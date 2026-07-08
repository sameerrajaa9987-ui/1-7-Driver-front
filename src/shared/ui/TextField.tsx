/** TextField — focus-aware, soft rounded. Password fields get a built-in
 *  show/hide (eye) toggle automatically whenever `secureTextEntry` is set. */
import React, { useState } from "react";
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  Pressable,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { palette, radius, outline } from "../designSystem";
import { Text } from "./Text";

interface Props extends Omit<TextInputProps, "style"> {
  label?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  error?: string;
  hint?: string;
}

export function TextField({
  label,
  leading,
  trailing,
  error,
  hint,
  ...inputProps
}: Props) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  // A secure field renders an eye toggle by default (unless the caller passed
  // its own trailing element). Tapping it reveals/hides the characters.
  const isSecureField = Boolean(inputProps.secureTextEntry);
  const effectiveSecure = isSecureField && !revealed;

  const borderColor = error
    ? palette.danger.text
    : focused
      ? palette.brand[500]
      : outline.color;

  const eyeToggle =
    isSecureField && !trailing ? (
      <Pressable
        hitSlop={10}
        onPress={() => setRevealed((v) => !v)}
        accessibilityLabel={revealed ? "Hide password" : "Show password"}
        accessibilityRole="button"
      >
        {revealed ? (
          <EyeOff size={18} color={palette.text.tertiary} strokeWidth={1.9} />
        ) : (
          <Eye size={18} color={palette.text.tertiary} strokeWidth={1.9} />
        )}
      </Pressable>
    ) : (
      trailing
    );

  return (
    <View>
      {label && (
        <Text variant="label" tone="secondary" style={{ marginBottom: 6 }}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.wrap,
          {
            borderColor,
            backgroundColor: palette.surface.primary,
            borderWidth: focused ? 1.5 : 1,
          },
        ]}
      >
        {leading && <View style={{ marginRight: 10 }}>{leading}</View>}
        <TextInput
          {...inputProps}
          secureTextEntry={effectiveSecure}
          placeholderTextColor={palette.text.tertiary}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
          // @ts-expect-error web-only outline reset
          style={[styles.input, { outlineStyle: "none" }]}
        />
        {eyeToggle ? <View style={{ marginLeft: 10 }}>{eyeToggle}</View> : null}
      </View>
      {error ? (
        <Text variant="caption" tone="danger" style={{ marginTop: 6 }}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" tone="tertiary" style={{ marginTop: 6 }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.md,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: palette.text.primary,
    paddingVertical: 13,
  },
});
