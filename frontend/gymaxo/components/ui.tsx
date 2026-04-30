import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";

import { useColors } from "@/hooks/useColors";

type FeatherIcon = React.ComponentProps<typeof Feather>["name"];

export function Button({
  title,
  onPress,
  variant = "primary",
  loading,
  disabled,
  icon,
  fullWidth,
  size = "md",
}: {
  title: string;
  onPress: () => void | Promise<void>;
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  loading?: boolean;
  disabled?: boolean;
  icon?: FeatherIcon;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const c = useColors();
  const bg =
    variant === "primary"
      ? c.primary
      : variant === "secondary"
        ? c.secondary
        : variant === "destructive"
          ? c.destructive
          : "transparent";
  const fg =
    variant === "primary"
      ? c.primaryForeground
      : variant === "secondary"
        ? c.secondaryForeground
        : variant === "destructive"
          ? c.destructiveForeground
          : c.foreground;
  const padV = size === "lg" ? 16 : size === "sm" ? 8 : 13;
  const padH = size === "lg" ? 22 : size === "sm" ? 12 : 18;
  const fontSize = size === "lg" ? 16 : size === "sm" ? 13 : 15;

  return (
    <Pressable
      onPress={async () => {
        if (loading || disabled) return;
        if (Platform.OS !== "web")
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await onPress();
      }}
      disabled={loading || disabled}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          paddingVertical: padV,
          paddingHorizontal: padH,
          borderRadius: c.radius - 2,
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          alignSelf: fullWidth ? "stretch" : "auto",
          borderWidth: variant === "ghost" ? 1 : 0,
          borderColor: c.border,
          boxShadow:
            variant === "ghost"
              ? "none"
              : "0 6px 16px rgba(0, 0, 0, 0.12)",
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} size="small" />
      ) : (
        <>
          {icon ? <Feather name={icon} size={fontSize + 2} color={fg} /> : null}
          <Text
            style={{
              color: fg,
              fontFamily: "Inter_600SemiBold",
              fontSize,
              letterSpacing: 0.2,
            }}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

export function Card({
  children,
  style,
  padded = true,
  onPress,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
  onPress?: () => void;
}) {
  const c = useColors();
  const Wrapper: React.ComponentType<{
    children: React.ReactNode;
    style?: ViewStyle;
  }> = onPress ? PressableWrap(onPress) : ViewWrap;

  return (
    <Wrapper
      style={{
        backgroundColor: c.card,
        borderRadius: c.radius,
        borderWidth: 1,
        borderColor: c.border,
        padding: padded ? 16 : 0,
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.10)",
        ...style,
      }}
    >
      {children}
    </Wrapper>
  );
}

const ViewWrap: React.ComponentType<{
  children: React.ReactNode;
  style?: ViewStyle;
}> = ({ children, style }) => <View style={style}>{children}</View>;

function PressableWrap(onPress: () => void) {
  const Component: React.ComponentType<{
    children: React.ReactNode;
    style?: ViewStyle;
  }> = ({ children, style }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [style, { opacity: pressed ? 0.9 : 1 }]}
    >
      {children}
    </Pressable>
  );
  return Component;
}

export function Input({
  label,
  error,
  ...rest
}: TextInputProps & { label?: string; error?: string | null }) {
  const c = useColors();
  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Text
          style={{
            color: c.mutedForeground,
            fontFamily: "Inter_500Medium",
            fontSize: 12,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={c.mutedForeground}
        {...rest}
        style={[
          {
            backgroundColor: c.secondary,
            borderRadius: c.radius - 4,
            borderWidth: 1,
            borderColor: error ? c.destructive : c.border,
            color: c.foreground,
            fontFamily: "Inter_500Medium",
            paddingHorizontal: 14,
            paddingVertical: Platform.OS === "ios" ? 14 : 10,
            fontSize: 15,
            boxShadow: error ? "0 0 0 0 transparent" : "inset 0 1px 2px rgba(0, 0, 0, 0.04)",
          },
          rest.style,
        ]}
      />
      {error ? (
        <Text
          style={{
            color: c.destructive,
            fontFamily: "Inter_500Medium",
            fontSize: 12,
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export function Header({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  const c = useColors();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 16,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: c.foreground,
            fontFamily: "Inter_700Bold",
            fontSize: 28,
            letterSpacing: -0.5,
          }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={{
              color: c.mutedForeground,
              fontFamily: "Inter_500Medium",
              fontSize: 14,
              marginTop: 2,
            }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export function StatCard({
  label,
  value,
  icon,
  tint,
}: {
  label: string;
  value: string | number;
  icon: FeatherIcon;
  tint?: string;
}) {
  const c = useColors();
  const accent = tint ?? c.primary;
  return (
    <Card style={{ flex: 1 }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: accent + "22",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <Feather name={icon} size={18} color={accent} />
      </View>
      <Text
        style={{
          color: c.foreground,
          fontFamily: "Inter_700Bold",
          fontSize: 26,
          letterSpacing: -0.5,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          color: c.mutedForeground,
          fontFamily: "Inter_500Medium",
          fontSize: 12,
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </Card>
  );
}

export function Badge({
  label,
  variant = "default",
}: {
  label: string;
  variant?: "default" | "success" | "warning" | "destructive" | "primary";
}) {
  const c = useColors();
  const map: Record<string, { bg: string; fg: string }> = {
    default: { bg: c.muted, fg: c.mutedForeground },
    success: { bg: c.success + "22", fg: c.success },
    warning: { bg: c.warning + "22", fg: c.warning },
    destructive: { bg: c.destructive + "22", fg: c.destructive },
    primary: { bg: c.primary + "33", fg: c.primary },
  };
  const v = map[variant]!;
  return (
    <View
      style={{
        backgroundColor: v.bg,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        alignSelf: "flex-start",
      }}
    >
      <Text
        style={{
          color: v.fg,
          fontFamily: "Inter_600SemiBold",
          fontSize: 11,
          letterSpacing: 0.4,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: FeatherIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  const c = useColors();
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
        paddingHorizontal: 24,
        gap: 12,
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: c.muted,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Feather name={icon} size={28} color={c.mutedForeground} />
      </View>
      <Text
        style={{
          color: c.foreground,
          fontFamily: "Inter_600SemiBold",
          fontSize: 17,
          textAlign: "center",
        }}
      >
        {title}
      </Text>
      {description ? (
        <Text
          style={{
            color: c.mutedForeground,
            fontFamily: "Inter_400Regular",
            fontSize: 14,
            textAlign: "center",
            lineHeight: 20,
          }}
        >
          {description}
        </Text>
      ) : null}
      {action}
    </View>
  );
}

export function SkeletonBlock({
  width = "100%",
  height = 18,
  radius = 8,
}: {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
}) {
  const c = useColors();
  return (
    <View
      style={{
        width,
        height,
        borderRadius: radius,
        backgroundColor: c.muted,
        opacity: 0.75,
      }}
    />
  );
}

export function SkeletonCard({
  lines = 3,
  tall,
}: {
  lines?: number;
  tall?: boolean;
}) {
  const c = useColors();
  return (
    <Card>
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: c.muted,
              opacity: 0.75,
            }}
          />
          <View style={{ flex: 1, gap: 8 }}>
            <SkeletonBlock width="70%" height={16} />
            <SkeletonBlock width="45%" height={12} />
          </View>
        </View>
        {tall ? <SkeletonBlock height={80} radius={12} /> : null}
        {Array.from({ length: Math.max(0, lines - 2) }).map((_, index) => (
          <SkeletonBlock
            key={index}
            width={index % 2 === 0 ? "92%" : "58%"}
            height={12}
          />
        ))}
      </View>
    </Card>
  );
}

export function DataSkeleton({
  title = "Loading data",
  cards = 4,
}: {
  title?: string;
  cards?: number;
}) {
  const c = useColors();
  return (
    <View style={{ paddingHorizontal: 20, gap: 14 }}>
      <Text
        style={{
          color: c.mutedForeground,
          fontFamily: "Inter_600SemiBold",
          fontSize: 13,
          letterSpacing: 0.4,
          textTransform: "uppercase",
        }}
      >
        {title}
      </Text>
      {Array.from({ length: cards }).map((_, index) => (
        <SkeletonCard key={index} tall={index === 0} lines={index === 0 ? 3 : 2} />
      ))}
    </View>
  );
}

export function Divider() {
  const c = useColors();
  return (
    <View style={{ height: 1, backgroundColor: c.border, marginVertical: 12 }} />
  );
}

export const screenStyles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 120, gap: 14 },
});
