import { Feather } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "../add-customer";
import { Card, Divider, EmptyState } from "@/components/ui";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";
import { apiRequest } from "@/lib/api";

export default function BranchDetail() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { branches, gyms, customers, attendance } = useData();
  const branch = branches.find((b) => b.id === id);
  const [qrPayload, setQrPayload] = useState<string>("");
  const [qrError, setQrError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0]!;
  const branchAttendance = useMemo(
    () =>
      attendance
        .filter((a) => a.branchId === id)
        .sort((a, b) => b.timestamp - a.timestamp),
    [attendance, id],
  );
  const todayCount = branchAttendance.filter((a) => a.date === today).length;
  const memberCount = customers.filter((c) => c.branchId === id).length;
  const gym = gyms.find((g) => g.id === branch?.gymId);

  useEffect(() => {
    let mounted = true;
    setQrPayload("");
    setQrError(null);

    if (!branch) return undefined;

    apiRequest<{ qrPayload: unknown }>(`/owner/branches/${branch.id}/qr`)
      .then((data) => {
        if (!mounted) return;
        setQrPayload(JSON.stringify(data.qrPayload));
      })
      .catch((error) => {
        if (!mounted) return;
        setQrError(error instanceof Error ? error.message : "Unable to load QR code");
      });

    return () => {
      mounted = false;
    };
  }, [branch]);

  if (!branch) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: c.background,
          paddingTop: insets.top + 8,
        }}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader title="Branch" onBack={() => router.back()} />
        <EmptyState icon="map-pin" title="Branch not found" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 100,
        }}
      >
        <ScreenHeader title="Branch" onBack={() => router.back()} />

        <View style={{ paddingHorizontal: 20, gap: 14 }}>
          <Card>
            <Text
              style={{
                color: c.mutedForeground,
                fontFamily: "Inter_500Medium",
                fontSize: 11,
                letterSpacing: 0.4,
                textTransform: "uppercase",
              }}
            >
              {gym?.name}
            </Text>
            <Text
              style={{
                color: c.foreground,
                fontFamily: "Inter_700Bold",
                fontSize: 22,
                marginTop: 2,
              }}
            >
              {branch.name}
            </Text>
            <Text
              style={{
                color: c.mutedForeground,
                fontFamily: "Inter_500Medium",
                fontSize: 13,
                marginTop: 2,
              }}
            >
              {branch.address}
            </Text>
            <Divider />
            <View style={{ flexDirection: "row", gap: 18 }}>
              <Stat label="Members" value={memberCount} />
              <Stat label="Today" value={todayCount} />
              <Stat label="All-time" value={branchAttendance.length} />
            </View>
          </Card>

          <Card>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <Text
                style={{
                  color: c.foreground,
                  fontFamily: "Inter_700Bold",
                  fontSize: 16,
                }}
              >
                Branch QR code
              </Text>
              <Feather name="maximize" size={16} color={c.mutedForeground} />
            </View>
            <View
              style={{
                alignItems: "center",
                padding: 22,
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
              }}
            >
              {qrPayload ? (
                <QRCode
                  value={qrPayload}
                  size={220}
                  color="#000000"
                  backgroundColor="#FFFFFF"
                />
              ) : (
                <View
                  style={{
                    width: 220,
                    height: 220,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#111827",
                      fontFamily: "Inter_500Medium",
                      fontSize: 13,
                      textAlign: "center",
                    }}
                  >
                    {qrError ?? "Loading QR code..."}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={{
                color: c.mutedForeground,
                fontFamily: "Inter_500Medium",
                fontSize: 12,
                textAlign: "center",
                marginTop: 14,
              }}
            >
              Members scan this QR from the app to mark attendance.
              Each branch has a unique, secure code.
            </Text>
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
              Recent check-ins
            </Text>
            {branchAttendance.length === 0 ? (
              <Text
                style={{
                  color: c.mutedForeground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 13,
                }}
              >
                No check-ins yet for this branch.
              </Text>
            ) : (
              branchAttendance.slice(0, 8).map((a, i) => {
                const cust = customers.find((c) => c.id === a.customerId);
                return (
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
                      <Text
                        style={{
                          color: c.foreground,
                          fontFamily: "Inter_500Medium",
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
                        }}
                      >
                        {a.date} {a.time}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  const c = useColors();
  return (
    <View style={{ flex: 1 }}>
      <Text
        style={{
          color: c.foreground,
          fontFamily: "Inter_900Black",
          fontSize: 26,
          letterSpacing: -1,
        }}
      >
        {value}
      </Text>
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
