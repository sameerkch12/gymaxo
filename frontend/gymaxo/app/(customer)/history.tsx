import { Feather } from "@expo/vector-icons";
import { format, subDays } from "date-fns";
import React, { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AttendanceCalendar } from "@/components/Calendar";
import { Card, DataSkeleton, Divider, EmptyState, Header } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";

export default function HistoryScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { loading, customers, attendance, branches } = useData();

  const customer = useMemo(
    () =>
      customers.find(
        (cm) => cm.userId === user?.id || cm.phone === user?.phone,
      ),
    [customers, user],
  );

  const my = useMemo(
    () =>
      customer
        ? attendance
            .filter((a) => a.customerId === customer.id)
            .sort((a, b) => b.timestamp - a.timestamp)
        : [],
    [attendance, customer],
  );

  const markedDates = useMemo(
    () => new Set(my.map((a) => a.date)),
    [my],
  );

  const missedDates = useMemo(() => {
    const set = new Set<string>();
    if (!customer) return set;
    const start = new Date(
      Math.max(
        new Date(customer.startDate).getTime(),
        subDays(new Date(), 60).getTime(),
      ),
    );
    const today = new Date();
    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      const iso = format(d, "yyyy-MM-dd");
      if (!markedDates.has(iso)) set.add(iso);
    }
    return set;
  }, [customer, markedDates]);

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 100,
        }}
      >
        <Header
          title="Attendance"
          subtitle={`${my.length} workout${my.length !== 1 ? "s" : ""} so far`}
        />

        {loading ? (
          <DataSkeleton title="Loading history" cards={5} />
        ) : !customer ? (
          <EmptyState icon="calendar" title="No membership linked" />
        ) : (
          <View style={{ paddingHorizontal: 20, gap: 14 }}>
            <Card>
              <View
                style={{
                  flexDirection: "row",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <Stat label="This month" value={
                  my.filter(
                    (a) => a.date.slice(0, 7) === format(new Date(), "yyyy-MM"),
                  ).length
                } />
                <Stat label="This week" value={
                  my.filter(
                    (a) =>
                      new Date(a.date) >= subDays(new Date(), 7),
                  ).length
                } />
                <Stat label="Missed (60d)" value={missedDates.size} tint={c.destructive} />
              </View>
              <AttendanceCalendar
                markedDates={markedDates}
                missedDates={missedDates}
              />
              <View
                style={{
                  flexDirection: "row",
                  gap: 14,
                  marginTop: 14,
                  justifyContent: "center",
                }}
              >
                <Legend color={c.primary} label="Checked in" />
                <Legend color={c.destructive + "33"} label="Missed" />
              </View>
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
                History
              </Text>
              {my.length === 0 ? (
                <Text
                  style={{
                    color: c.mutedForeground,
                    fontFamily: "Inter_500Medium",
                    fontSize: 13,
                  }}
                >
                  No check-ins yet.
                </Text>
              ) : (
                my.slice(0, 25).map((a, i) => {
                  const branch = branches.find((b) => b.id === a.branchId);
                  return (
                    <View key={a.id}>
                      {i > 0 ? <Divider /> : null}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          paddingVertical: 6,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <Feather
                            name="check-circle"
                            size={14}
                            color={c.primary}
                          />
                          <View>
                            <Text
                              style={{
                                color: c.foreground,
                                fontFamily: "Inter_600SemiBold",
                                fontSize: 14,
                              }}
                            >
                              {a.date}
                            </Text>
                            <Text
                              style={{
                                color: c.mutedForeground,
                                fontFamily: "Inter_500Medium",
                                fontSize: 12,
                                marginTop: 2,
                              }}
                            >
                              {branch?.name ?? "Branch"}
                            </Text>
                          </View>
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
                  );
                })
              )}
            </Card>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function Stat({
  label,
  value,
  tint,
}: {
  label: string;
  value: number;
  tint?: string;
}) {
  const c = useColors();
  return (
    <View style={{ flex: 1 }}>
      <Text
        style={{
          color: tint ?? c.foreground,
          fontFamily: "Inter_900Black",
          fontSize: 28,
          letterSpacing: -1,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          color: c.mutedForeground,
          fontFamily: "Inter_500Medium",
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

function Legend({ color, label }: { color: string; label: string }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View
        style={{
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: color,
        }}
      />
      <Text
        style={{
          color: c.mutedForeground,
          fontFamily: "Inter_500Medium",
          fontSize: 12,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
