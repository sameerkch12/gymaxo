import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Badge, Button, Card, DataSkeleton, Divider, Header } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useColors } from "@/hooks/useColors";
import { ThemePref } from "@/lib/types";

export default function ProfileScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { pref, setPref } = useTheme();
  const { loading, customers, plans, branches, gyms, attendance } = useData();

  const customer = useMemo(
    () =>
      customers.find(
        (cm) => cm.userId === user?.id || cm.phone === user?.phone,
      ),
    [customers, user],
  );
  const plan = customer ? plans.find((p) => p.id === customer.planId) : null;
  const branch = customer
    ? branches.find((b) => b.id === customer.branchId)
    : null;
  const gym = customer ? gyms.find((g) => g.id === customer.gymId) : null;
  const myCount = customer
    ? attendance.filter((a) => a.customerId === customer.id).length
    : 0;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 100,
        }}
      >
        <Header title="Profile" />

        {loading ? (
          <DataSkeleton title="Loading profile" cards={4} />
        ) : (
        <View style={{ paddingHorizontal: 20, gap: 14 }}>
          <Card>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: c.primary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: c.primaryForeground,
                    fontFamily: "Inter_900Black",
                    fontSize: 24,
                  }}
                >
                  {user?.name
                    ?.split(" ")
                    .map((s) => s[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() ?? "M"}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: c.foreground,
                    fontFamily: "Inter_700Bold",
                    fontSize: 22,
                  }}
                >
                  {user?.name}
                </Text>
                <Text
                  style={{
                    color: c.mutedForeground,
                    fontFamily: "Inter_500Medium",
                    fontSize: 13,
                  }}
                >
                  {user?.phone}
                </Text>
                <View style={{ marginTop: 6 }}>
                  <Badge label="Member" variant="primary" />
                </View>
              </View>
            </View>
          </Card>

          {customer ? (
            <Card>
              <Text
                style={{
                  color: c.foreground,
                  fontFamily: "Inter_700Bold",
                  fontSize: 16,
                  marginBottom: 12,
                }}
              >
                Membership
              </Text>
              <Row icon="zap" label="Gym" value={gym?.name ?? "—"} />
              <Divider />
              <Row icon="map-pin" label="Branch" value={branch?.name ?? "—"} />
              <Divider />
              <Row icon="tag" label="Plan" value={plan?.name ?? "—"} />
              <Divider />
              <Row icon="calendar" label="Started" value={customer.startDate} />
              <Divider />
              <Row icon="clock" label="Expires" value={customer.endDate} />
              <Divider />
              <Row
                icon="activity"
                label="Total check-ins"
                value={String(myCount)}
              />
            </Card>
          ) : (
            <Card>
              <Text
                style={{
                  color: c.mutedForeground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 13,
                }}
              >
                No active membership linked to this account.
              </Text>
            </Card>
          )}

          <Card>
            <Text
              style={{
                color: c.foreground,
                fontFamily: "Inter_700Bold",
                fontSize: 16,
                marginBottom: 4,
              }}
            >
              Theme
            </Text>
            <Text
              style={{
                color: c.mutedForeground,
                fontFamily: "Inter_500Medium",
                fontSize: 12,
                marginBottom: 12,
              }}
            >
              Light or dark — your call.
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {(
                [
                  { value: "system", label: "System", icon: "smartphone" },
                  { value: "light", label: "Light", icon: "sun" },
                  { value: "dark", label: "Dark", icon: "moon" },
                ] as { value: ThemePref; label: string; icon: keyof typeof Feather.glyphMap }[]
              ).map((opt) => {
                const active = pref === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => void setPref(opt.value)}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 12,
                      alignItems: "center",
                      gap: 6,
                      backgroundColor: active ? c.foreground : c.muted,
                    }}
                  >
                    <Feather
                      name={opt.icon}
                      size={16}
                      color={active ? c.background : c.mutedForeground}
                    />
                    <Text
                      style={{
                        color: active ? c.background : c.foreground,
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 12,
                      }}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          <Card>
            <Text
              style={{
                color: c.foreground,
                fontFamily: "Inter_700Bold",
                fontSize: 16,
                marginBottom: 12,
              }}
            >
              Notifications
            </Text>
            <ToggleRow
              icon="bell"
              label="Renewal reminders"
              description="3 alerts/day for 3 days before expiry"
              on
            />
            <Divider />
            <ToggleRow
              icon="check-circle"
              label="Check-in confirmations"
              description="Get a ping after you scan in"
              on
            />
            <Divider />
            <ToggleRow
              icon="credit-card"
              label="Payment status updates"
              description="When the owner reviews your request"
              on
            />
          </Card>

          <Button
            title="Sign out"
            variant="ghost"
            icon="log-out"
            onPress={async () => {
              await logout();
              router.replace("/login");
            }}
            fullWidth
          />
        </View>
        )}
      </ScrollView>
    </View>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string;
}) {
  const c = useColors();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 6,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Feather name={icon} size={14} color={c.mutedForeground} />
        <Text
          style={{
            color: c.mutedForeground,
            fontFamily: "Inter_500Medium",
            fontSize: 13,
          }}
        >
          {label}
        </Text>
      </View>
      <Text
        style={{
          color: c.foreground,
          fontFamily: "Inter_600SemiBold",
          fontSize: 14,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function ToggleRow({
  icon,
  label,
  description,
  on,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  description: string;
  on: boolean;
}) {
  const c = useColors();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 6,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: c.muted,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Feather name={icon} size={16} color={c.foreground} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: c.foreground,
            fontFamily: "Inter_600SemiBold",
            fontSize: 14,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            color: c.mutedForeground,
            fontFamily: "Inter_500Medium",
            fontSize: 12,
          }}
        >
          {description}
        </Text>
      </View>
      <View
        style={{
          width: 40,
          height: 24,
          borderRadius: 12,
          backgroundColor: on ? c.primary : c.muted,
          padding: 2,
          alignItems: on ? "flex-end" : "flex-start",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: on ? c.primaryForeground : c.background,
          }}
        />
      </View>
    </View>
  );
}
