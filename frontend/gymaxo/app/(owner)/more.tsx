import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Badge, Button, Card, DataSkeleton, Divider, Header, Input } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useColors } from "@/hooks/useColors";
import {
  daysUntilDue,
  isSubscriptionExpired,
} from "@/lib/subscription";
import { OWNER_MONTHLY_FEE, PLAN_DAYS, PlanType, ThemePref } from "@/lib/types";

export default function MoreScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { pref, setPref } = useTheme();
  const {
    loading,
    plans,
    customers,
    branches,
    attendance,
    ownerPaymentUpiId,
    addPlan,
    deletePlan,
    updateOwnerPaymentUpi,
  } = useData();
  const sub = user?.subscription;
  const subDays = daysUntilDue(sub);
  const subExpired = isSubscriptionExpired(sub);
  const subActive = Boolean(sub?.active && !subExpired);

  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [planType, setPlanType] = useState<PlanType>("monthly");
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [upiId, setUpiId] = useState(ownerPaymentUpiId);
  const [savingUpi, setSavingUpi] = useState(false);
  const [upiMessage, setUpiMessage] = useState<string | null>(null);

  useEffect(() => {
    setUpiId(ownerPaymentUpiId);
  }, [ownerPaymentUpiId]);

  const branchStats = useMemo(
    () =>
      branches.map((b) => {
        const members = customers.filter((c) => c.branchId === b.id);
        const today = new Date().toISOString().split("T")[0]!;
        const checkins = attendance.filter(
          (a) => a.branchId === b.id && a.date === today,
        ).length;
        return { branch: b, members: members.length, checkins };
      }),
    [branches, customers, attendance],
  );

  const planStats = useMemo(
    () =>
      plans.map((p) => {
        const count = customers.filter((c) => c.planId === p.id).length;
        return { plan: p, count };
      }),
    [plans, customers],
  );

  const today = new Date().toISOString().split("T")[0]!;
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0]!;
  });
  const expectedCheckins = customers.filter((c) => c.active).length * 30 || 1;
  const actualCheckins = attendance.filter((a) =>
    last30.includes(a.date),
  ).length;
  const attendanceRate = Math.min(
    100,
    Math.round((actualCheckins / expectedCheckins) * 100),
  );

  const missedToday = customers
    .filter((c) => c.active)
    .filter(
      (c) => !attendance.some((a) => a.customerId === c.id && a.date === today),
    );

  const handleAddPlan = async () => {
    const price = Number(planPrice);
    if (!planName.trim() || !price || price <= 0) return;
    setPlanError(null);
    await addPlan({ name: planName, type: planType, price });
    setPlanName("");
    setPlanPrice("");
  };

  const handleDeletePlan = async (planId: string) => {
    setPlanError(null);
    setDeletingPlanId(planId);
    try {
      await deletePlan(planId);
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : "Plan delete failed");
    } finally {
      setDeletingPlanId(null);
    }
  };

  const handleSaveUpi = async () => {
    setUpiMessage(null);
    setSavingUpi(true);
    try {
      const saved = await updateOwnerPaymentUpi(upiId);
      setUpiId(saved);
      setUpiMessage("UPI saved. Customers will see this on payment screen.");
    } catch (err) {
      setUpiMessage(err instanceof Error ? err.message : "UPI save failed");
    } finally {
      setSavingUpi(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 100,
        }}
      >
        <Header title="More" subtitle="Reports • Plans • Settings" />

        {loading ? (
          <DataSkeleton title="Loading reports and plans" cards={6} />
        ) : (
        <View style={{ paddingHorizontal: 20, gap: 18 }}>
          {/* Subscription */}
          <View style={{ gap: 10 }}>
            <SectionTitle icon="zap" label="My subscription" />
            <Card>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: c.mutedForeground,
                      fontFamily: "Inter_500Medium",
                      fontSize: 11,
                      letterSpacing: 0.4,
                      textTransform: "uppercase",
                    }}
                  >
                    GymPro Owner Plan
                  </Text>
                  <Text
                    style={{
                      color: c.foreground,
                      fontFamily: "Inter_900Black",
                      fontSize: 28,
                      letterSpacing: -1,
                      marginTop: 2,
                    }}
                  >
                    {subActive ? `Rs. ${OWNER_MONTHLY_FEE}` : "Not activated"}
                    <Text
                      style={{
                        color: c.mutedForeground,
                        fontFamily: "Inter_500Medium",
                        fontSize: 14,
                      }}
                    >
                      {subActive ? " / month" : ""}
                    </Text>
                  </Text>
                  {subActive ? (
                    <Text
                      style={{
                        color: c.mutedForeground,
                        fontFamily: "Inter_500Medium",
                        fontSize: 12,
                        marginTop: 4,
                      }}
                    >
                      {`Active for ${subDays} day${subDays !== 1 ? "s" : ""} (${sub?.dueDate})`}
                    </Text>
                  ) : (
                    <Text
                      style={{
                        color: c.mutedForeground,
                        fontFamily: "Inter_500Medium",
                        fontSize: 12,
                        marginTop: 4,
                      }}
                    >
                      Platform admin has not enabled this subscription yet.
                    </Text>
                  )}
                </View>
                <Badge
                  label={!subActive ? "Off" : subDays <= 3 ? "Due soon" : "Active"}
                  variant={
                    !subActive
                      ? "destructive"
                      : subDays <= 3
                        ? "warning"
                        : "success"
                  }
                />
              </View>
              <View style={{ marginTop: 12 }}>
                <Button
                  title={subActive ? "Subscription active" : "Ask admin to activate"}
                  icon={subActive ? "check-circle" : "lock"}
                  onPress={() => {}}
                  fullWidth
                  variant="secondary"
                  disabled
                />
              </View>
            </Card>
          </View>

          {/* Appearance */}
          <View style={{ gap: 10 }}>
            <SectionTitle icon="moon" label="Appearance" />
            <Card>
              <Text
                style={{
                  color: c.foreground,
                  fontFamily: "Inter_700Bold",
                  fontSize: 14,
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
                Pick light, dark, or follow your phone.
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
          </View>

          {/* Reports */}
          <View style={{ gap: 10 }}>
            <SectionTitle icon="bar-chart-2" label="Reports" />

            <Card>
              <Text
                style={{
                  color: c.mutedForeground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                  letterSpacing: 0.4,
                  textTransform: "uppercase",
                }}
              >
                Attendance rate (30d)
              </Text>
              <Text
                style={{
                  color: c.foreground,
                  fontFamily: "Inter_900Black",
                  fontSize: 40,
                  letterSpacing: -1.5,
                  marginTop: 4,
                }}
              >
                {attendanceRate}%
              </Text>
              <View
                style={{
                  marginTop: 10,
                  height: 8,
                  backgroundColor: c.muted,
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    width: `${attendanceRate}%`,
                    height: "100%",
                    backgroundColor: c.primary,
                  }}
                />
              </View>
              <Text
                style={{
                  color: c.mutedForeground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                  marginTop: 8,
                }}
              >
                {actualCheckins} check-ins across {customers.filter((c) => c.active).length} active members
              </Text>
            </Card>

            <Card>
              <Text
                style={{
                  color: c.foreground,
                  fontFamily: "Inter_700Bold",
                  fontSize: 15,
                  marginBottom: 10,
                }}
              >
                Branch performance
              </Text>
              {branchStats.length === 0 ? (
                <Text
                  style={{
                    color: c.mutedForeground,
                    fontFamily: "Inter_500Medium",
                    fontSize: 13,
                  }}
                >
                  No branches yet.
                </Text>
              ) : (
                branchStats.map((s, i) => (
                  <View key={s.branch.id}>
                    {i > 0 ? <Divider /> : null}
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
                            fontSize: 14,
                          }}
                        >
                          {s.branch.name}
                        </Text>
                        <Text
                          style={{
                            color: c.mutedForeground,
                            fontFamily: "Inter_500Medium",
                            fontSize: 12,
                            marginTop: 2,
                          }}
                        >
                          {s.members} member{s.members !== 1 ? "s" : ""} •{" "}
                          {s.checkins} today
                        </Text>
                      </View>
                      <View
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          backgroundColor: c.primary + "22",
                          borderRadius: 999,
                        }}
                      >
                        <Text
                          style={{
                            color: c.primary,
                            fontFamily: "Inter_700Bold",
                            fontSize: 12,
                          }}
                        >
                          {s.checkins}/{s.members}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </Card>

            <Card>
              <Text
                style={{
                  color: c.foreground,
                  fontFamily: "Inter_700Bold",
                  fontSize: 15,
                  marginBottom: 10,
                }}
              >
                Plan distribution
              </Text>
              {planStats.map((s, i) => (
                <View key={s.plan.id}>
                  {i > 0 ? <Divider /> : null}
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
                          fontSize: 14,
                        }}
                      >
                        {s.plan.name}
                      </Text>
                      <Text
                        style={{
                          color: c.mutedForeground,
                          fontFamily: "Inter_500Medium",
                          fontSize: 12,
                          marginTop: 2,
                        }}
                      >
                        ${s.plan.price} • {s.plan.durationDays}d
                      </Text>
                    </View>
                    <Badge label={`${s.count} active`} variant="primary" />
                  </View>
                </View>
              ))}
            </Card>

            <Card>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    color: c.foreground,
                    fontFamily: "Inter_700Bold",
                    fontSize: 15,
                  }}
                >
                  Missed today
                </Text>
                <Badge
                  label={`${missedToday.length}`}
                  variant={missedToday.length > 0 ? "warning" : "success"}
                />
              </View>
              {missedToday.length === 0 ? (
                <Text
                  style={{
                    color: c.mutedForeground,
                    fontFamily: "Inter_500Medium",
                    fontSize: 13,
                  }}
                >
                  Everyone showed up. Great day.
                </Text>
              ) : (
                missedToday.slice(0, 5).map((m, i) => (
                  <View key={m.id}>
                    {i > 0 ? <Divider /> : null}
                    <Text
                      style={{
                        color: c.foreground,
                        fontFamily: "Inter_500Medium",
                        fontSize: 14,
                        paddingVertical: 4,
                      }}
                    >
                      {m.name}
                    </Text>
                  </View>
                ))
              )}
            </Card>
          </View>

          {/* Payment settings */}
          <View style={{ gap: 10 }}>
            <SectionTitle icon="smartphone" label="Payment UPI" />
            <Card>
              <View style={{ gap: 10 }}>
                <Input
                  label="Owner UPI ID"
                  value={upiId}
                  onChangeText={setUpiId}
                  autoCapitalize="none"
                  placeholder="yourname@upi"
                />
                {upiMessage ? (
                  <Text
                    style={{
                      color: upiMessage.includes("failed") ? c.destructive : c.success,
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                    }}
                  >
                    {upiMessage}
                  </Text>
                ) : null}
                <Button
                  title="Save UPI"
                  icon="save"
                  onPress={handleSaveUpi}
                  loading={savingUpi}
                  fullWidth
                />
              </View>
            </Card>
          </View>

          {/* Plans */}
          <View style={{ gap: 10 }}>
            <SectionTitle icon="tag" label="Membership plans" />
            {planError ? (
              <Text
                style={{
                  color: c.destructive,
                  fontFamily: "Inter_500Medium",
                  fontSize: 13,
                }}
              >
                {planError}
              </Text>
            ) : null}
            {plans.map((p) => (
              <Card key={p.id}>
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
                        fontFamily: "Inter_700Bold",
                        fontSize: 15,
                      }}
                    >
                      {p.name}
                    </Text>
                    <Text
                      style={{
                        color: c.mutedForeground,
                        fontFamily: "Inter_500Medium",
                        fontSize: 12,
                        textTransform: "capitalize",
                      }}
                    >
                      {p.type} • {p.durationDays} days
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: c.foreground,
                      fontFamily: "Inter_700Bold",
                      fontSize: 18,
                    }}
                  >
                    ${p.price}
                  </Text>
                </View>
                <View style={{ marginTop: 12 }}>
                  <Button
                    title="Delete plan"
                    icon="trash-2"
                    variant="destructive"
                    size="sm"
                    fullWidth
                    loading={deletingPlanId === p.id}
                    onPress={() => handleDeletePlan(p.id)}
                  />
                </View>
              </Card>
            ))}

            <Card>
              <Text
                style={{
                  color: c.foreground,
                  fontFamily: "Inter_700Bold",
                  fontSize: 15,
                  marginBottom: 10,
                }}
              >
                Add a new plan
              </Text>
              <View style={{ gap: 10 }}>
                <Input
                  label="Name"
                  value={planName}
                  onChangeText={setPlanName}
                  placeholder="e.g. Student monthly"
                />
                <Input
                  label="Price ($)"
                  value={planPrice}
                  onChangeText={setPlanPrice}
                  keyboardType="numeric"
                  placeholder="49"
                />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {(Object.keys(PLAN_DAYS) as PlanType[]).map((t) => (
                    <Pressable
                      key={t}
                      onPress={() => setPlanType(t)}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 10,
                        alignItems: "center",
                        backgroundColor:
                          planType === t ? c.foreground : c.muted,
                      }}
                    >
                      <Text
                        style={{
                          color:
                            planType === t ? c.background : c.mutedForeground,
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 12,
                          textTransform: "capitalize",
                        }}
                      >
                        {t}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Button
                  title="Add plan"
                  onPress={handleAddPlan}
                  fullWidth
                  icon="plus"
                />
              </View>
            </Card>
          </View>

          {/* Settings */}
          <View style={{ gap: 10 }}>
            <SectionTitle icon="settings" label="Settings" />
            <Card>
              <View style={{ gap: 4 }}>
                <Text
                  style={{
                    color: c.mutedForeground,
                    fontFamily: "Inter_500Medium",
                    fontSize: 11,
                    letterSpacing: 0.4,
                    textTransform: "uppercase",
                  }}
                >
                  Account
                </Text>
                <Text
                  style={{
                    color: c.foreground,
                    fontFamily: "Inter_700Bold",
                    fontSize: 18,
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
                  {user?.phone} • Owner
                </Text>
              </View>
            </Card>

            <UpgradeRow icon="zap" label="Real payment gateway" />
            <UpgradeRow icon="message-circle" label="WhatsApp reminders" />
            <UpgradeRow icon="trending-up" label="Advanced analytics" />
            <UpgradeRow icon="repeat" label="Auto renewal" />
            <UpgradeRow icon="user-check" label="Biometric attendance" />
            <UpgradeRow icon="shield" label="Super admin panel" />

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
        </View>
        )}
      </ScrollView>
    </View>
  );
}

function SectionTitle({
  icon,
  label,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
}) {
  const c = useColors();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Feather name={icon} size={16} color={c.foreground} />
      <Text
        style={{
          color: c.foreground,
          fontFamily: "Inter_700Bold",
          fontSize: 18,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function UpgradeRow({
  icon,
  label,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
}) {
  const c = useColors();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 14,
        backgroundColor: c.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: c.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Feather name={icon} size={16} color={c.mutedForeground} />
        <Text
          style={{
            color: c.foreground,
            fontFamily: "Inter_500Medium",
            fontSize: 14,
          }}
        >
          {label}
        </Text>
      </View>
      <Badge label="Soon" />
    </View>
  );
}
