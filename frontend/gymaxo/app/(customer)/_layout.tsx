import { Feather } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Platform, View } from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";
import { scheduleReminders } from "@/lib/reminders";
import { isSubscriptionExpired } from "@/lib/subscription";
import { Subscription } from "@/lib/types";

export default function CustomerLayout() {
  const c = useColors();
  const { user, loading, getOwnerSubscription } = useAuth();
  const { customers } = useData();
  const [ownerSub, setOwnerSub] = useState<Subscription | null | undefined>(
    undefined,
  );

  const myCustomer = useMemo(() => {
    if (!user) return null;
    return (
      customers.find(
        (cm) => cm.userId === user.id || cm.phone === user.phone,
      ) ?? null
    );
  }, [user, customers]);

  useEffect(() => {
    let cancelled = false;
    if (!myCustomer) {
      setOwnerSub(null);
      return;
    }
    void getOwnerSubscription(myCustomer.ownerId).then((s) => {
      if (!cancelled) setOwnerSub(s);
    });
    return () => {
      cancelled = true;
    };
  }, [myCustomer, getOwnerSubscription]);

  useEffect(() => {
    if (!user || user.role !== "customer") return;
    void scheduleReminders({ user, myCustomer });
  }, [user, myCustomer]);

  if (loading) return null;
  if (!user) return <Redirect href="/login" />;
  if (user.role !== "customer") return <Redirect href="/(owner)" />;
  if (ownerSub === undefined) return null;
  if (ownerSub && isSubscriptionExpired(ownerSub)) {
    return <Redirect href="/subscription" />;
  }

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
          <View style={{ backgroundColor: c.card, flex: 1 }} />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Check in",
          tabBarIcon: ({ color }) => (
            <Feather name="maximize" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color }) => (
            <Feather name="calendar" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="payment"
        options={{
          title: "Payments",
          tabBarIcon: ({ color }) => (
            <Feather name="credit-card" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
