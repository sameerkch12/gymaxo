import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Badge, Button, Card, DataSkeleton, EmptyState, Header, Input } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";

export default function PaymentScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { loading, customers, plans, payments, ownerPaymentUpiId, submitPayment } = useData();

  const customer = useMemo(
    () =>
      customers.find(
        (cm) => cm.userId === user?.id || cm.phone === user?.phone,
      ),
    [customers, user],
  );

  const myPayments = useMemo(
    () =>
      customer
        ? payments
            .filter((p) => p.customerId === customer.id)
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
        : [],
    [payments, customer],
  );

  const currentPlan = customer
    ? plans.find((p) => p.id === customer.planId)
    : null;
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    currentPlan?.id ?? plans[0]?.id ?? "",
  );
  const [utrNumber, setUtrNumber] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  useEffect(() => {
    const selectedStillExists = plans.some((plan) => plan.id === selectedPlanId);
    if ((!selectedPlanId || !selectedStillExists) && (currentPlan?.id || plans[0]?.id)) {
      setSelectedPlanId(currentPlan?.id ?? plans[0]!.id);
    }
  }, [currentPlan?.id, plans, selectedPlanId]);

  const handleSubmit = async () => {
    setError(null);
    if (!customer || !selectedPlan) return;
    if (!ownerPaymentUpiId.trim()) {
      setError("Owner has not added a UPI ID yet.");
      return;
    }
    if (!utrNumber.trim()) {
      setError("Please enter the UTR number after payment.");
      return;
    }
    setSubmitting(true);
    try {
      await submitPayment({
        customerId: customer.id,
        ownerId: customer.ownerId,
        planId: selectedPlan.id,
        amount: selectedPlan.price,
        utrNumber: utrNumber.trim(),
        ...(note.trim() ? { note: note.trim() } : {}),
      });
      setUtrNumber("");
      setNote("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 100,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Header
          title="Payments"
          subtitle="Renew your membership and track requests"
        />

        {loading ? (
          <DataSkeleton title="Loading payment details" cards={4} />
        ) : !customer ? (
          <EmptyState icon="credit-card" title="No membership linked" />
        ) : (
          <View style={{ paddingHorizontal: 20, gap: 14 }}>
            <Card>
              <Text
                style={{
                  color: c.foreground,
                  fontFamily: "Inter_700Bold",
                  fontSize: 16,
                  marginBottom: 12,
                }}
              >
                Pick a plan
              </Text>
              <View style={{ gap: 10 }}>
                {plans.map((p) => {
                  const active = p.id === selectedPlanId;
                  return (
                    <Pressable
                      key={p.id}
                      onPress={() => setSelectedPlanId(p.id)}
                      style={{
                        padding: 14,
                        borderRadius: 14,
                        borderWidth: 1.5,
                        borderColor: active ? c.primary : c.border,
                        backgroundColor: active ? c.primary + "11" : c.card,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <View>
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
                          fontFamily: "Inter_900Black",
                          fontSize: 22,
                        }}
                      >
                        ₹{p.price}
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
                Pay to owner
              </Text>
              <View
                style={{
                  backgroundColor: c.muted,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: c.border,
                  padding: 14,
                  gap: 6,
                }}
              >
                <Text
                  style={{
                    color: c.mutedForeground,
                    fontFamily: "Inter_500Medium",
                    fontSize: 11,
                    letterSpacing: 0.4,
                    textTransform: "uppercase",
                  }}
                >
                  UPI ID
                </Text>
                <Text
                  selectable
                  style={{
                    color: ownerPaymentUpiId ? c.foreground : c.destructive,
                    fontFamily: "Inter_700Bold",
                    fontSize: 18,
                  }}
                >
                  {ownerPaymentUpiId || "Owner has not added UPI yet"}
                </Text>
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
                Confirm payment
              </Text>
              <View style={{ marginTop: 12 }}>
                <Input
                  label="UTR number"
                  value={utrNumber}
                  onChangeText={setUtrNumber}
                  autoCapitalize="characters"
                  placeholder="Enter bank/UPI UTR number"
                />
              </View>

              <View style={{ marginTop: 12 }}>
                <Input
                  label="Note (optional)"
                  value={note}
                  onChangeText={setNote}
                  placeholder="UPI ref, transaction ID, etc."
                />
              </View>

              {error ? (
                <Text
                  style={{
                    color: c.destructive,
                    fontFamily: "Inter_500Medium",
                    fontSize: 12,
                    marginTop: 8,
                  }}
                >
                  {error}
                </Text>
              ) : null}

              <View style={{ marginTop: 12 }}>
                <Button
                  title={`Submit ${selectedPlan ? `₹${selectedPlan.price}` : ""} request`}
                  onPress={handleSubmit}
                  loading={submitting}
                  disabled={!ownerPaymentUpiId.trim()}
                  fullWidth
                  size="lg"
                  icon="send"
                />
              </View>
            </Card>

            <View style={{ gap: 10 }}>
              <Text
                style={{
                  color: c.foreground,
                  fontFamily: "Inter_700Bold",
                  fontSize: 18,
                  paddingHorizontal: 4,
                }}
              >
                Your requests
              </Text>
              {myPayments.length === 0 ? (
                <Card>
                  <Text
                    style={{
                      color: c.mutedForeground,
                      fontFamily: "Inter_500Medium",
                      fontSize: 13,
                    }}
                  >
                    No payment requests yet.
                  </Text>
                </Card>
              ) : (
                myPayments.map((p) => {
                  const plan = plans.find((pl) => pl.id === p.planId);
                  return (
                    <Card key={p.id}>
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
                              color: c.foreground,
                              fontFamily: "Inter_700Bold",
                              fontSize: 15,
                            }}
                          >
                            {plan?.name ?? "Plan"} • ₹{p.amount}
                          </Text>
                          {p.utrNumber ? (
                            <Text
                              selectable
                              style={{
                                color: c.mutedForeground,
                                fontFamily: "Inter_500Medium",
                                fontSize: 12,
                                marginTop: 2,
                              }}
                            >
                              UTR {p.utrNumber}
                            </Text>
                          ) : null}
                          <Text
                            style={{
                              color: c.mutedForeground,
                              fontFamily: "Inter_500Medium",
                              fontSize: 12,
                              marginTop: 2,
                            }}
                          >
                            {new Date(p.createdAt).toLocaleString()}
                          </Text>
                        </View>
                        <Badge
                          label={p.status}
                          variant={
                            p.status === "approved"
                              ? "success"
                              : p.status === "rejected"
                                ? "destructive"
                                : "warning"
                          }
                        />
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
