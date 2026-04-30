import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ReminderBanner } from "@/components/ReminderBanner";
import { Badge, Card, DataSkeleton, Header, StatCard } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";
import { computeBanner } from "@/lib/reminders";

export default function OwnerDashboard() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { loading, customers, branches, gyms, attendance, payments, plans } = useData();
  const banner = computeBanner({ user });

  const today = new Date().toISOString().split("T")[0]!;
  const todayAttendance = attendance.filter((a) => a.date === today);
  const activeMembers = customers.filter((c) => c.active).length;
  const expiringSoon = customers.filter((cm) => {
    const days =
      (new Date(cm.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 7;
  });
  const pendingPayments = payments.filter((p) => p.status === "pending");

  const recent = useMemo(
    () =>
      attendance
        .slice()
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5),
    [attendance],
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Header
          title={`Hey, ${user?.name?.split(" ")[0] ?? "Owner"}`}
          subtitle={`${gyms[0]?.name ?? "Your gym"} • ${branches.length} branches`}
          right={
            <Pressable
              onPress={() => router.push("/(owner)/more")}
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: c.muted,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather name="settings" size={18} color={c.foreground} />
            </Pressable>
          }
        />

        {loading ? (
          <DataSkeleton title="Loading dashboard" cards={5} />
        ) : (
        <View style={{ paddingHorizontal: 20, gap: 14 }}>
          {banner ? (
            <ReminderBanner
              kind={banner.kind}
              title={banner.title}
              body={banner.body}
              ctaLabel={banner.kind === "owner-fee-expired" ? "Pay now" : "Pay"}
            />
          ) : null}

          <View
            style={{
              borderRadius: c.radius,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: c.border,
            }}
          >
            <LinearGradient
              colors={[c.primary, "#7AC700"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 20 }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View>
                  <Text
                    style={{
                      color: c.primaryForeground,
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                      opacity: 0.7,
                    }}
                  >
                    Today check-ins
                  </Text>
                  <Text
                    style={{
                      color: c.primaryForeground,
                      fontFamily: "Inter_900Black",
                      fontSize: 56,
                      letterSpacing: -2,
                      marginTop: 4,
                    }}
                  >
                    {todayAttendance.length}
                  </Text>
                  <Text
                    style={{
                      color: c.primaryForeground,
                      fontFamily: "Inter_500Medium",
                      fontSize: 13,
                      opacity: 0.8,
                    }}
                  >
                    of {activeMembers} active members
                  </Text>
                </View>
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: c.primaryForeground + "22",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Feather
                    name="activity"
                    size={32}
                    color={c.primaryForeground}
                  />
                </View>
              </View>
            </LinearGradient>
          </View>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <StatCard
              label="Active members"
              value={activeMembers}
              icon="users"
            />
            <StatCard
              label="Expiring (7d)"
              value={expiringSoon.length}
              icon="alert-circle"
              tint={c.warning}
            />
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <StatCard
              label="Branches"
              value={branches.length}
              icon="map-pin"
            />
            <StatCard
              label="Pending payments"
              value={pendingPayments.length}
              icon="credit-card"
              tint={c.accent}
            />
          </View>

          <View style={{ marginTop: 8 }}>
            <Text
              style={{
                color: c.foreground,
                fontFamily: "Inter_700Bold",
                fontSize: 18,
                marginBottom: 10,
              }}
            >
              Quick actions
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              <ActionTile
                icon="user-plus"
                label="Add member"
                onPress={() => router.push("/(owner)/add-customer")}
              />
              <ActionTile
                icon="map-pin"
                label="Add branch"
                onPress={() => router.push("/(owner)/add-branch")}
              />
              <ActionTile
                icon="home"
                label="Add gym"
                onPress={() => router.push("/(owner)/add-gym")}
              />
              <ActionTile
                icon="credit-card"
                label="Approvals"
                onPress={() => router.push("/(owner)/payments")}
                badge={pendingPayments.length || undefined}
              />
            </View>
          </View>

          <View style={{ marginTop: 8, gap: 10 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  color: c.foreground,
                  fontFamily: "Inter_700Bold",
                  fontSize: 18,
                }}
              >
                Expiring soon
              </Text>
              <Pressable onPress={() => router.push("/(owner)/customers")}>
                <Text
                  style={{
                    color: c.mutedForeground,
                    fontFamily: "Inter_500Medium",
                    fontSize: 13,
                  }}
                >
                  See all
                </Text>
              </Pressable>
            </View>
            {expiringSoon.length === 0 ? (
              <Card>
                <Text
                  style={{
                    color: c.mutedForeground,
                    fontFamily: "Inter_500Medium",
                    fontSize: 14,
                  }}
                >
                  No memberships expire in the next 7 days. You are good.
                </Text>
              </Card>
            ) : (
              expiringSoon.slice(0, 3).map((cust) => {
                const days = Math.ceil(
                  (new Date(cust.endDate).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24),
                );
                return (
                  <Card
                    key={cust.id}
                    onPress={() =>
                      router.push({
                        pathname: "/(owner)/customer/[id]",
                        params: { id: cust.id },
                      })
                    }
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: c.foreground,
                            fontFamily: "Inter_600SemiBold",
                            fontSize: 15,
                          }}
                        >
                          {cust.name}
                        </Text>
                        <Text
                          style={{
                            color: c.mutedForeground,
                            fontFamily: "Inter_500Medium",
                            fontSize: 12,
                            marginTop: 2,
                          }}
                        >
                          {plans.find((p) => p.id === cust.planId)?.name}
                        </Text>
                      </View>
                      <Badge
                        label={`${days}d left`}
                        variant={days <= 3 ? "destructive" : "warning"}
                      />
                    </View>
                  </Card>
                );
              })
            )}
          </View>

          <View style={{ marginTop: 8, gap: 10 }}>
            <Text
              style={{
                color: c.foreground,
                fontFamily: "Inter_700Bold",
                fontSize: 18,
              }}
            >
              Recent check-ins
            </Text>
            {recent.length === 0 ? (
              <Card>
                <Text
                  style={{
                    color: c.mutedForeground,
                    fontFamily: "Inter_500Medium",
                    fontSize: 14,
                  }}
                >
                  No check-ins yet today.
                </Text>
              </Card>
            ) : (
              recent.map((a) => {
                const cust = customers.find((c) => c.id === a.customerId);
                const branch = branches.find((b) => b.id === a.branchId);
                return (
                  <Card key={a.id}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <View
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 19,
                          backgroundColor: c.primary + "33",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Feather name="check" size={16} color={c.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: c.foreground,
                            fontFamily: "Inter_600SemiBold",
                            fontSize: 14,
                          }}
                        >
                          {cust?.name ?? "Member"}
                        </Text>
                        <Text
                          style={{
                            color: c.mutedForeground,
                            fontFamily: "Inter_500Medium",
                            fontSize: 12,
                            marginTop: 1,
                          }}
                        >
                          {branch?.name ?? "Branch"} • {a.date} {a.time}
                        </Text>
                      </View>
                    </View>
                  </Card>
                );
              })
            )}
          </View>
        </View>
        )}
      </ScrollView>
    </View>
  );
}

function ActionTile({
  icon,
  label,
  onPress,
  badge,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  onPress: () => void;
  badge?: number;
}) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: "48%",
        backgroundColor: c.card,
        borderRadius: c.radius,
        borderWidth: 1,
        borderColor: c.border,
        padding: 14,
        gap: 8,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: c.primary + "22",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name={icon} size={16} color={c.primary} />
        </View>
        {badge ? (
          <View
            style={{
              backgroundColor: c.accent,
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 999,
            }}
          >
            <Text
              style={{
                color: c.accentForeground,
                fontFamily: "Inter_700Bold",
                fontSize: 11,
              }}
            >
              {badge}
            </Text>
          </View>
        ) : null}
      </View>
      <Text
        style={{
          color: c.foreground,
          fontFamily: "Inter_600SemiBold",
          fontSize: 14,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
