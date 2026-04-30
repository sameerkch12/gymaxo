import { Feather } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "../add-customer";
import { AttendanceCalendar } from "@/components/Calendar";
import { Badge, Card, Divider, EmptyState } from "@/components/ui";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";

export default function CustomerDetail() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { customers, plans, branches, attendance } = useData();
  const customer = customers.find((c) => c.id === id);

  const memberAttendance = useMemo(
    () => attendance.filter((a) => a.customerId === id),
    [attendance, id],
  );
  const markedDates = useMemo(
    () => new Set(memberAttendance.map((a) => a.date)),
    [memberAttendance],
  );

  if (!customer) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: c.background,
          paddingTop: insets.top + 8,
        }}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader title="Member" onBack={() => router.back()} />
        <EmptyState
          icon="user-x"
          title="Member not found"
          description="This member may have been removed."
        />
      </View>
    );
  }

  const plan = plans.find((p) => p.id === customer.planId);
  const branch = branches.find((b) => b.id === customer.branchId);
  const days = Math.ceil(
    (new Date(customer.endDate).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24),
  );
  const status =
    !customer.active || days < 0
      ? { label: "Expired", v: "destructive" as const }
      : days <= 7
        ? { label: `${days}d left`, v: "warning" as const }
        : { label: "Active", v: "success" as const };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 100,
        }}
      >
        <ScreenHeader title="Member" onBack={() => router.back()} />

        <View style={{ paddingHorizontal: 20, gap: 14 }}>
          <Card>
            <View style={{ flexDirection: "row", gap: 14 }}>
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: c.primary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: c.primaryForeground,
                    fontFamily: "Inter_900Black",
                    fontSize: 22,
                  }}
                >
                  {customer.name
                    .split(" ")
                    .map((s) => s[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1, justifyContent: "center" }}>
                <Text
                  style={{
                    color: c.foreground,
                    fontFamily: "Inter_700Bold",
                    fontSize: 20,
                  }}
                >
                  {customer.name}
                </Text>
                <Text
                  style={{
                    color: c.mutedForeground,
                    fontFamily: "Inter_500Medium",
                    fontSize: 13,
                  }}
                >
                  {customer.phone}
                </Text>
                <View style={{ marginTop: 6 }}>
                  <Badge label={status.label} variant={status.v} />
                </View>
              </View>
            </View>

            <Divider />

            <Row icon="tag" label="Plan" value={plan?.name ?? "—"} />
            <Divider />
            <Row
              icon="map-pin"
              label="Branch"
              value={branch?.name ?? "—"}
            />
            <Divider />
            <Row
              icon="calendar"
              label="Started"
              value={customer.startDate}
            />
            <Divider />
            <Row icon="clock" label="Expires" value={customer.endDate} />
          </Card>

          <Card>
            <Text
              style={{
                color: c.foreground,
                fontFamily: "Inter_700Bold",
                fontSize: 16,
                marginBottom: 8,
              }}
            >
              Attendance
            </Text>
            <Text
              style={{
                color: c.mutedForeground,
                fontFamily: "Inter_500Medium",
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {memberAttendance.length} total check-in
              {memberAttendance.length !== 1 ? "s" : ""}
            </Text>
            <AttendanceCalendar markedDates={markedDates} />
          </Card>

          <Card>
            <Text
              style={{
                color: c.foreground,
                fontFamily: "Inter_700Bold",
                fontSize: 16,
                marginBottom: 8,
              }}
            >
              Recent visits
            </Text>
            {memberAttendance.length === 0 ? (
              <Text
                style={{
                  color: c.mutedForeground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 13,
                }}
              >
                No visits yet.
              </Text>
            ) : (
              memberAttendance.slice(0, 8).map((a, i) => (
                <View key={a.id}>
                  {i > 0 ? <Divider /> : null}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingVertical: 4,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Feather name="check-circle" size={14} color={c.primary} />
                      <Text
                        style={{
                          color: c.foreground,
                          fontFamily: "Inter_500Medium",
                          fontSize: 14,
                        }}
                      >
                        {a.date}
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: c.mutedForeground,
                        fontFamily: "Inter_500Medium",
                        fontSize: 13,
                      }}
                    >
                      {a.time}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </Card>
        </View>
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
