import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Badge, Button, Card, DataSkeleton, EmptyState, Header } from "@/components/ui";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";

export default function PaymentsScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { loading, payments, customers, plans, reviewPayment } = useData();
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">(
    "pending",
  );

  const filtered = payments.filter((p) => p.status === tab);

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 100,
        }}
      >
        <Header
          title="Payments"
          subtitle={`${payments.filter((p) => p.status === "pending").length} pending approval`}
        />
        {loading ? (
          <DataSkeleton title="Loading payments" cards={5} />
        ) : (
        <View style={{ paddingHorizontal: 20, gap: 14 }}>
          <View
            style={{
              flexDirection: "row",
              backgroundColor: c.secondary,
              padding: 4,
              borderRadius: 14,
            }}
          >
            {(["pending", "approved", "rejected"] as const).map((t) => (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  alignItems: "center",
                  borderRadius: 10,
                  backgroundColor: tab === t ? c.background : "transparent",
                }}
              >
                <Text
                  style={{
                    color: tab === t ? c.foreground : c.mutedForeground,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 13,
                    textTransform: "capitalize",
                  }}
                >
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>

          {filtered.length === 0 ? (
            <EmptyState
              icon="credit-card"
              title={`No ${tab} payments`}
              description={
                tab === "pending"
                  ? "When members submit UTR numbers, they will appear here."
                  : `Reviewed payments will be listed here.`
              }
            />
          ) : (
            filtered.map((p) => {
              const cust = customers.find((c) => c.id === p.customerId);
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
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: c.foreground,
                          fontFamily: "Inter_700Bold",
                          fontSize: 16,
                        }}
                      >
                        {cust?.name ?? "Unknown member"}
                      </Text>
                      <Text
                        style={{
                          color: c.mutedForeground,
                          fontFamily: "Inter_500Medium",
                          fontSize: 12,
                          marginTop: 2,
                        }}
                      >
                        {plan?.name} • ₹{p.amount}
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

                  {p.utrNumber ? (
                    <View
                      style={{
                        marginTop: 10,
                        padding: 12,
                        borderRadius: 12,
                        backgroundColor: c.muted,
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
                        UTR number
                      </Text>
                      <Text
                        selectable
                        style={{
                          color: c.foreground,
                          fontFamily: "Inter_700Bold",
                          fontSize: 16,
                          marginTop: 2,
                        }}
                      >
                        {p.utrNumber}
                      </Text>
                    </View>
                  ) : null}

                  {p.note ? (
                    <Text
                      style={{
                        color: c.mutedForeground,
                        fontFamily: "Inter_500Medium",
                        fontSize: 13,
                        marginTop: 10,
                      }}
                    >
                      {p.note}
                    </Text>
                  ) : null}

                  <Text
                    style={{
                      color: c.mutedForeground,
                      fontFamily: "Inter_400Regular",
                      fontSize: 11,
                      marginTop: 8,
                    }}
                  >
                    Submitted {new Date(p.createdAt).toLocaleString()}
                  </Text>

                  {p.status === "pending" ? (
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 10,
                        marginTop: 14,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Button
                          title="Reject"
                          variant="destructive"
                          onPress={() => reviewPayment(p.id, "rejected")}
                          fullWidth
                          icon="x"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Button
                          title="Approve"
                          onPress={() => reviewPayment(p.id, "approved")}
                          fullWidth
                          icon="check"
                        />
                      </View>
                    </View>
                  ) : null}
                </Card>
              );
            })
          )}
        </View>
        )}
      </ScrollView>
    </View>
  );
}
