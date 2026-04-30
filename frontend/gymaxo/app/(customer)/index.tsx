import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ReminderBanner } from "@/components/ReminderBanner";
import { Badge, Card, DataSkeleton, EmptyState, Header } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";
import { computeBanner } from "@/lib/reminders";

export default function CustomerHome() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { loading, customers, plans, branches, attendance } = useData();

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

  const myAttendance = useMemo(
    () =>
      customer
        ? attendance
            .filter((a) => a.customerId === customer.id)
            .sort((a, b) => b.timestamp - a.timestamp)
        : [],
    [attendance, customer],
  );

  const today = new Date().toISOString().split("T")[0]!;
  const checkedInToday = myAttendance.some((a) => a.date === today);
  const banner = computeBanner({ user, myCustomer: customer ?? null });

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: c.background,
          paddingTop: insets.top + 8,
        }}
      >
        <Header
          title={`Hey, ${user?.name?.split(" ")[0] ?? "Member"}`}
          subtitle="Loading your membership"
        />
        <DataSkeleton title="Loading membership" cards={4} />
      </View>
    );
  }

  if (!customer) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: c.background,
          paddingTop: insets.top + 8,
        }}
      >
        <Header
          title={`Hey, ${user?.name?.split(" ")[0] ?? "Member"}`}
          subtitle="Welcome to GymPro"
        />
        <EmptyState
          icon="user-plus"
          title="No membership linked yet"
          description="Ask your gym owner to add you as a member using your phone number, then sign back in."
        />
      </View>
    );
  }

  const days = Math.ceil(
    (new Date(customer.endDate).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24),
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 100,
        }}
      >
        <Header
          title={`Hey, ${user?.name?.split(" ")[0] ?? "Member"}`}
          subtitle={branch?.name ?? "Your gym"}
        />

        <View style={{ paddingHorizontal: 20, gap: 14 }}>
          {banner ? (
            <ReminderBanner
              kind={banner.kind}
              title={banner.title}
              body={banner.body}
              ctaLabel="Renew"
            />
          ) : null}
          <View
            style={{
              borderRadius: c.radius,
              overflow: "hidden",
            }}
          >
            <LinearGradient
              colors={[c.primary, "#7AC700"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 22, gap: 16 }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: c.primaryForeground,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 13,
                    opacity: 0.7,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                  }}
                >
                  {plan?.name ?? "Membership"}
                </Text>
                <Feather
                  name="zap"
                  size={20}
                  color={c.primaryForeground}
                />
              </View>
              <View>
                <Text
                  style={{
                    color: c.primaryForeground,
                    fontFamily: "Inter_900Black",
                    fontSize: 64,
                    letterSpacing: -2.5,
                    lineHeight: 64,
                  }}
                >
                  {Math.max(0, days)}
                </Text>
                <Text
                  style={{
                    color: c.primaryForeground,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 14,
                    opacity: 0.85,
                  }}
                >
                  days remaining
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTopColor: c.primaryForeground + "33",
                  borderTopWidth: 1,
                  paddingTop: 14,
                }}
              >
                <View>
                  <Text
                    style={{
                      color: c.primaryForeground,
                      opacity: 0.7,
                      fontFamily: "Inter_500Medium",
                      fontSize: 11,
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                    }}
                  >
                    Member
                  </Text>
                  <Text
                    style={{
                      color: c.primaryForeground,
                      fontFamily: "Inter_700Bold",
                      fontSize: 14,
                    }}
                  >
                    {customer.name}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={{
                      color: c.primaryForeground,
                      opacity: 0.7,
                      fontFamily: "Inter_500Medium",
                      fontSize: 11,
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                    }}
                  >
                    Expires
                  </Text>
                  <Text
                    style={{
                      color: c.primaryForeground,
                      fontFamily: "Inter_700Bold",
                      fontSize: 14,
                    }}
                  >
                    {customer.endDate}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          <Pressable
            onPress={() => router.push("/(customer)/scan")}
            style={({ pressed }) => ({
              backgroundColor: checkedInToday ? c.muted : c.foreground,
              borderRadius: c.radius,
              padding: 20,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 14,
                  backgroundColor: checkedInToday ? c.success + "33" : c.primary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather
                  name={checkedInToday ? "check" : "maximize"}
                  size={22}
                  color={checkedInToday ? c.success : c.primaryForeground}
                />
              </View>
              <View>
                <Text
                  style={{
                    color: checkedInToday ? c.foreground : c.background,
                    fontFamily: "Inter_700Bold",
                    fontSize: 17,
                  }}
                >
                  {checkedInToday ? "Checked in today" : "Scan to check in"}
                </Text>
                <Text
                  style={{
                    color: checkedInToday ? c.mutedForeground : c.background,
                    opacity: checkedInToday ? 1 : 0.7,
                    fontFamily: "Inter_500Medium",
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  {checkedInToday
                    ? "See you tomorrow"
                    : "Scan branch QR at the front desk"}
                </Text>
              </View>
            </View>
            <Feather
              name="chevron-right"
              size={22}
              color={checkedInToday ? c.mutedForeground : c.background}
            />
          </Pressable>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <Card style={{ flex: 1 }}>
              <Text
                style={{
                  color: c.mutedForeground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 11,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                }}
              >
                This month
              </Text>
              <Text
                style={{
                  color: c.foreground,
                  fontFamily: "Inter_900Black",
                  fontSize: 32,
                  letterSpacing: -1,
                  marginTop: 4,
                }}
              >
                {
                  myAttendance.filter(
                    (a) => a.date.slice(0, 7) === today.slice(0, 7),
                  ).length
                }
              </Text>
              <Text
                style={{
                  color: c.mutedForeground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                }}
              >
                workouts
              </Text>
            </Card>
            <Card style={{ flex: 1 }}>
              <Text
                style={{
                  color: c.mutedForeground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 11,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                }}
              >
                All time
              </Text>
              <Text
                style={{
                  color: c.foreground,
                  fontFamily: "Inter_900Black",
                  fontSize: 32,
                  letterSpacing: -1,
                  marginTop: 4,
                }}
              >
                {myAttendance.length}
              </Text>
              <Text
                style={{
                  color: c.mutedForeground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                }}
              >
                check-ins
              </Text>
            </Card>
          </View>

          {days <= 7 && days >= 0 ? (
            <Card>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    backgroundColor: c.warning + "22",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Feather name="bell" size={18} color={c.warning} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: c.foreground,
                      fontFamily: "Inter_700Bold",
                      fontSize: 14,
                    }}
                  >
                    Renewal coming up
                  </Text>
                  <Text
                    style={{
                      color: c.mutedForeground,
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                    }}
                  >
                    Your membership expires in {days} day{days !== 1 ? "s" : ""}.
                  </Text>
                </View>
                <Pressable onPress={() => router.push("/(customer)/payment")}>
                  <Badge label="Renew" variant="primary" />
                </Pressable>
              </View>
            </Card>
          ) : null}

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
            {myAttendance.length === 0 ? (
              <Text
                style={{
                  color: c.mutedForeground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 13,
                }}
              >
                No visits yet. Scan your first QR.
              </Text>
            ) : (
              myAttendance.slice(0, 4).map((a) => (
                <View
                  key={a.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 8,
                    borderBottomColor: c.border,
                    borderBottomWidth: 0.5,
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
              ))
            )}
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}
