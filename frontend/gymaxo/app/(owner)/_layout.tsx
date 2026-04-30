import { Feather } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import React, { useEffect } from "react";
import { Platform, View } from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";
import { scheduleReminders } from "@/lib/reminders";
import { isSubscriptionExpired } from "@/lib/subscription";

export default function OwnerLayout() {
  const c = useColors();
  const { user, loading } = useAuth();
  const { customers } = useData();

  useEffect(() => {
    if (!user || user.role !== "owner") return;
    void scheduleReminders({ user });
  }, [user]);

  if (loading) return null;
  if (!user) return <Redirect href="/login" />;
  if (user.role !== "owner") return <Redirect href="/(customer)" />;
  if (isSubscriptionExpired(user.subscription)) {
    return <Redirect href="/subscription" />;
  }
  void customers;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.mutedForeground,
        tabBarStyle: {
          backgroundColor: c.card,
          borderTopColor: c.border,
          borderTopWidth: 1,
          ...(Platform.OS === "web" ? { height: 84 } : { height: 86 }),
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: "Inter_600SemiBold",
          fontSize: 11,
          marginBottom: 6,
        },
        tabBarBackground: () => (
          <View
            style={{
              backgroundColor: c.card,
              flex: 1,
            }}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: "Members",
          tabBarIcon: ({ color }) => (
            <Feather name="users" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="branches"
        options={{
          title: "Branches",
          tabBarIcon: ({ color }) => (
            <Feather name="map-pin" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: "Payments",
          tabBarIcon: ({ color }) => (
            <Feather name="credit-card" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color }) => (
            <Feather name="grid" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="add-customer" options={{ href: null }} />
      <Tabs.Screen name="add-gym" options={{ href: null }} />
      <Tabs.Screen name="add-branch" options={{ href: null }} />
      <Tabs.Screen name="customer/[id]" options={{ href: null }} />
      <Tabs.Screen name="branch/[id]" options={{ href: null }} />
    </Tabs>
  );
}
