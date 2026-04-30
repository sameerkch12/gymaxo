import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Badge, Button, Card, Divider } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";
import { scheduleReminders } from "@/lib/reminders";
import {
  daysUntilDue,
  isSubscriptionExpired,
} from "@/lib/subscription";
import { OWNER_MONTHLY_FEE, Subscription } from "@/lib/types";

export default function SubscriptionScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { user, renewSubscription, getOwnerSubscription, logout } = useAuth();
  const { customers } = useData();

  const [busy, setBusy] = useState(false);
  const [ownerSub, setOwnerSub] = useState<Subscription | null>(null);

  useEffect(() => {
    if (!user || user.role !== "customer") return;
    const myCustomer = customers.find(
      (cm) => cm.userId === user.id || cm.phone === user.phone,
    );
    if (!myCustomer) return;
    void getOwnerSubscription(myCustomer.ownerId).then(setOwnerSub);
  }, [user, customers, getOwnerSubscription]);

  if (!user) {
    router.replace("/login");
    return null;
  }

  if (user.role === "customer") {
    const expired =
      ownerSub === null ? false : isSubscriptionExpired(ownerSub);
    return (
      <View style={{ flex: 1, backgroundColor: c.background }}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: 20,
            gap: 16,
            flexGrow: 1,
            justifyContent: "center",
          }}
        >
          <View style={{ alignItems: "center", gap: 14 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: c.destructive + "22",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather name="lock" size={36} color={c.destructive} />
            </View>
            <Text
              style={{
                color: c.foreground,
                fontFamily: "Inter_900Black",
                fontSize: 26,
                textAlign: "center",
                letterSpacing: -0.5,
              }}
            >
              {expired ? "Gym is locked" : "Checking gym status…"}
            </Text>
            <Text
              style={{
                color: c.mutedForeground,
                fontFamily: "Inter_500Medium",
                fontSize: 14,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              {expired
                ? "Your gym owner has not paid the monthly GymPro subscription. Please ask them to renew so check-in and renewals work again."
                : "Hold on while we verify your gym's subscription."}
            </Text>
          </View>

          <Card>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  color: c.mutedForeground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                  letterSpacing: 0.4,
                  textTransform: "uppercase",
                }}
              >
                Owner subscription
              </Text>
              <Badge
                label={expired ? "Expired" : "Pending"}
                variant={expired ? "destructive" : "warning"}
              />
            </View>
            <Text
              style={{
                color: c.foreground,
                fontFamily: "Inter_700Bold",
                fontSize: 16,
                marginTop: 6,
              }}
            >
              ₹{OWNER_MONTHLY_FEE} / month
            </Text>
            {ownerSub ? (
              <Text
                style={{
                  color: c.mutedForeground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 13,
                  marginTop: 2,
                }}
              >
                Was due {ownerSub.dueDate}
              </Text>
            ) : null}
          </Card>

          <Button
            title="Sign out"
            variant="ghost"
            icon="log-out"
            fullWidth
            onPress={async () => {
              await logout();
              router.replace("/login");
            }}
          />
        </ScrollView>
      </View>
    );
  }

  const sub = user.subscription;
  const expired = isSubscriptionExpired(sub);
  const days = sub ? daysUntilDue(sub) : 0;

  const handlePay = async () => {
    setBusy(true);
    try {
      await renewSubscription();
      const myCustomer = customers.find(
        (cm) => cm.userId === user.id || cm.phone === user.phone,
      );
      await scheduleReminders({
        user: { ...user, subscription: { ...sub!, dueDate: "" } } as never,
        myCustomer,
      });
      Alert.alert(
        "Subscription active",
        "Your GymPro subscription is renewed for 30 days.",
      );
      router.replace("/(owner)");
    } catch (e) {
      Alert.alert(
        "Payment failed",
        e instanceof Error ? e.message : "Try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 20,
          gap: 16,
        }}
      >
        <View
          style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: c.muted,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Feather name="chevron-left" size={20} color={c.foreground} />
          </Pressable>
          <Text
            style={{
              color: c.foreground,
              fontFamily: "Inter_700Bold",
              fontSize: 22,
            }}
          >
            GymPro Subscription
          </Text>
        </View>

        <View
          style={{
            borderRadius: c.radius,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: c.border,
          }}
        >
          <LinearGradient
            colors={
              expired ? [c.destructive, "#B91C1C"] : [c.primary, "#7AC700"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 22, gap: 12 }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  color: expired ? "#FFFFFF" : c.primaryForeground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  opacity: 0.85,
                }}
              >
                {expired ? "Locked" : "Active"}
              </Text>
              <Feather
                name={expired ? "lock" : "zap"}
                size={20}
                color={expired ? "#FFFFFF" : c.primaryForeground}
              />
            </View>
            <View>
              <Text
                style={{
                  color: expired ? "#FFFFFF" : c.primaryForeground,
                  fontFamily: "Inter_900Black",
                  fontSize: 56,
                  letterSpacing: -2,
                }}
              >
                ₹{OWNER_MONTHLY_FEE}
              </Text>
              <Text
                style={{
                  color: expired ? "#FFFFFF" : c.primaryForeground,
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                  opacity: 0.9,
                }}
              >
                per month • all branches • unlimited members
              </Text>
            </View>
            {sub ? (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  borderTopWidth: 1,
                  borderTopColor: (expired ? "#FFFFFF" : c.primaryForeground) + "33",
                  paddingTop: 12,
                }}
              >
                <View>
                  <Text
                    style={{
                      color: expired ? "#FFFFFF" : c.primaryForeground,
                      opacity: 0.7,
                      fontFamily: "Inter_500Medium",
                      fontSize: 11,
                      letterSpacing: 0.4,
                      textTransform: "uppercase",
                    }}
                  >
                    {expired ? "Expired" : "Next due"}
                  </Text>
                  <Text
                    style={{
                      color: expired ? "#FFFFFF" : c.primaryForeground,
                      fontFamily: "Inter_700Bold",
                      fontSize: 14,
                    }}
                  >
                    {sub.dueDate}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={{
                      color: expired ? "#FFFFFF" : c.primaryForeground,
                      opacity: 0.7,
                      fontFamily: "Inter_500Medium",
                      fontSize: 11,
                      letterSpacing: 0.4,
                      textTransform: "uppercase",
                    }}
                  >
                    {expired ? "Days overdue" : "Days left"}
                  </Text>
                  <Text
                    style={{
                      color: expired ? "#FFFFFF" : c.primaryForeground,
                      fontFamily: "Inter_700Bold",
                      fontSize: 14,
                    }}
                  >
                    {Math.abs(days)}
                  </Text>
                </View>
              </View>
            ) : null}
          </LinearGradient>
        </View>

        <Card>
          <Text
            style={{
              color: c.foreground,
              fontFamily: "Inter_700Bold",
              fontSize: 16,
              marginBottom: 10,
            }}
          >
            What you get
          </Text>
          {[
            { icon: "users", label: "Unlimited members & branches" },
            { icon: "credit-card", label: "UPI UTR payment approvals" },
            { icon: "bar-chart-2", label: "Reports & attendance analytics" },
            { icon: "bell", label: "Renewal & fee reminders" },
            { icon: "shield", label: "Member app stays unlocked" },
          ].map((row, i) => (
            <View key={row.label}>
              {i > 0 ? <Divider /> : null}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  paddingVertical: 4,
                }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    backgroundColor: c.primary + "22",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Feather
                    name={row.icon as never}
                    size={14}
                    color={c.primary}
                  />
                </View>
                <Text
                  style={{
                    color: c.foreground,
                    fontFamily: "Inter_500Medium",
                    fontSize: 14,
                  }}
                >
                  {row.label}
                </Text>
              </View>
            </View>
          ))}
        </Card>

        {expired ? (
          <Card>
            <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: c.destructive + "22",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="alert-triangle" size={16} color={c.destructive} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: c.foreground,
                    fontFamily: "Inter_700Bold",
                    fontSize: 14,
                  }}
                >
                  Your gym is locked
                </Text>
                <Text
                  style={{
                    color: c.mutedForeground,
                    fontFamily: "Inter_500Medium",
                    fontSize: 12,
                  }}
                >
                  Members cannot check in or renew until you pay.
                </Text>
              </View>
            </View>
          </Card>
        ) : null}

        <Button
          title={busy ? "Processing…" : `Pay ₹${OWNER_MONTHLY_FEE} now`}
          icon="zap"
          onPress={handlePay}
          loading={busy}
          fullWidth
          size="lg"
        />

        <Text
          style={{
            color: c.mutedForeground,
            fontFamily: "Inter_400Regular",
            fontSize: 11,
            textAlign: "center",
          }}
        >
          Demo mode — no real charge. Unlocks the gym for 30 days.
        </Text>
      </ScrollView>
    </View>
  );
}
