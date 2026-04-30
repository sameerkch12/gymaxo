import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export function ReminderBanner({
  kind,
  title,
  body,
  ctaLabel,
  onPress,
}: {
  kind: "owner-fee" | "owner-fee-expired" | "membership" | "gym-locked";
  title: string;
  body: string;
  ctaLabel?: string;
  onPress?: () => void;
}) {
  const c = useColors();
  const isCritical = kind === "owner-fee-expired" || kind === "gym-locked";
  const tint = isCritical ? c.destructive : c.warning;

  return (
    <Pressable
      onPress={
        onPress ??
        (() => {
          if (kind === "owner-fee" || kind === "owner-fee-expired") {
            router.push("/subscription");
          } else if (kind === "membership") {
            router.push("/(customer)/payment");
          }
        })
      }
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 14,
        backgroundColor: tint + "1F",
        borderColor: tint + "55",
        borderWidth: 1,
        borderRadius: c.radius,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          backgroundColor: tint + "33",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Feather
          name={isCritical ? "alert-triangle" : "bell"}
          size={18}
          color={tint}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: c.foreground,
            fontFamily: "Inter_700Bold",
            fontSize: 14,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            color: c.mutedForeground,
            fontFamily: "Inter_500Medium",
            fontSize: 12,
            marginTop: 2,
          }}
        >
          {body}
        </Text>
      </View>
      {ctaLabel && kind !== "gym-locked" ? (
        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: tint,
            borderRadius: 999,
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontFamily: "Inter_700Bold",
              fontSize: 11,
              letterSpacing: 0.4,
              textTransform: "uppercase",
            }}
          >
            {ctaLabel}
          </Text>
        </View>
      ) : (
        <Feather name="chevron-right" size={18} color={tint} />
      )}
    </Pressable>
  );
}
