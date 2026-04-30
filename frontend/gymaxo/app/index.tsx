import { Feather } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function Index() {
  const { user, loading } = useAuth();
  const c = useColors();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: c.background,
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 24,
            backgroundColor: c.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name="zap" size={40} color={c.primaryForeground} />
        </View>
        <Text
          style={{
            color: c.foreground,
            fontFamily: "Inter_900Black",
            fontSize: 24,
            letterSpacing: 1,
          }}
        >
          GYMPRO
        </Text>
        <ActivityIndicator color={c.primary} />
      </View>
    );
  }

  if (!user) return <Redirect href="/login" />;
  if (user.role === "owner") return <Redirect href="/(owner)" />;
  return <Redirect href="/(customer)" />;
}
