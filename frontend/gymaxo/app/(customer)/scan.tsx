import { Feather } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Card, DataSkeleton, Header } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";

interface QRPayload {
  type: string;
  gymId: string;
  branchId: string;
  secret: string;
}

export default function ScanScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { loading, customers, branches, markAttendance } = useData();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    message: string;
    branch?: string;
  } | null>(null);
  const cooldownRef = useRef<number>(0);

  const customer = useMemo(
    () =>
      customers.find(
        (cm) => cm.userId === user?.id || cm.phone === user?.phone,
      ),
    [customers, user],
  );

  const handleScanned = async (data: string) => {
    const now = Date.now();
    if (now - cooldownRef.current < 2000) return;
    cooldownRef.current = now;

    if (!customer) {
      setResult({
        ok: false,
        message: "No membership found for your account.",
      });
      return;
    }

    let payload: QRPayload | null = null;
    try {
      payload = JSON.parse(data) as QRPayload;
    } catch {
      setResult({ ok: false, message: "Invalid QR code." });
      return;
    }

    if (payload.type !== "gympro_attendance") {
      setResult({ ok: false, message: "This QR code isn't a GymPro code." });
      return;
    }

    const branch = branches.find((b) => b.id === payload?.branchId);

    const res = await markAttendance({
      customerId: customer.id,
      gymId: payload.gymId,
      branchId: payload.branchId,
      secret: payload.secret,
    });

    if (res.ok) {
      if (Platform.OS !== "web")
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setResult({
        ok: true,
        message: "Check-in successful",
        branch: branch?.name,
      });
      setScanning(false);
    } else {
      if (Platform.OS !== "web")
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setResult({ ok: false, message: res.error ?? "Check-in failed" });
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
        <Header
          title="Check in"
          subtitle="Scan your branch QR to mark attendance"
        />

        {loading ? (
          <DataSkeleton title="Loading scanner details" cards={3} />
        ) : (
        <View style={{ paddingHorizontal: 20, gap: 14 }}>
          {!scanning ? (
            <Card>
              <View
                style={{
                  alignItems: "center",
                  paddingVertical: 30,
                  gap: 16,
                }}
              >
                <View
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 30,
                    backgroundColor: c.primary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Feather
                    name="maximize"
                    size={48}
                    color={c.primaryForeground}
                  />
                </View>
                <View style={{ alignItems: "center", gap: 4 }}>
                  <Text
                    style={{
                      color: c.foreground,
                      fontFamily: "Inter_700Bold",
                      fontSize: 20,
                    }}
                  >
                    Ready to train?
                  </Text>
                  <Text
                    style={{
                      color: c.mutedForeground,
                      fontFamily: "Inter_500Medium",
                      fontSize: 13,
                      textAlign: "center",
                      paddingHorizontal: 20,
                    }}
                  >
                    Find the QR poster at your branch entrance and tap below
                    to scan.
                  </Text>
                </View>
                <Button
                  title="Open scanner"
                  icon="camera"
                  onPress={async () => {
                    if (!permission?.granted) {
                      const r = await requestPermission();
                      if (!r.granted) {
                        setResult({
                          ok: false,
                          message: "Camera permission is required to scan.",
                        });
                        return;
                      }
                    }
                    setResult(null);
                    setScanning(true);
                  }}
                  size="lg"
                  fullWidth
                />
              </View>
            </Card>
          ) : (
            <View
              style={{
                aspectRatio: 1,
                borderRadius: c.radius,
                overflow: "hidden",
                backgroundColor: "#000",
              }}
            >
              {Platform.OS === "web" ? (
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 20,
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontFamily: "Inter_500Medium",
                      fontSize: 13,
                      textAlign: "center",
                    }}
                  >
                    Live QR scanning works on iOS and Android. Use the
                    simulate button below to test on web.
                  </Text>
                </View>
              ) : (
                <CameraView
                  style={{ flex: 1 }}
                  facing="back"
                  barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                  onBarcodeScanned={(e) => handleScanned(e.data)}
                />
              )}
              <View
                style={{
                  position: "absolute",
                  inset: 24,
                  borderColor: c.primary,
                  borderWidth: 3,
                  borderRadius: 18,
                }}
              />
              <Pressable
                onPress={() => setScanning(false)}
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="x" size={18} color="#FFFFFF" />
              </Pressable>
            </View>
          )}

          {result ? (
            <Card
              style={{
                borderColor: result.ok ? c.primary : c.destructive,
                borderWidth: 1.5,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: result.ok
                      ? c.primary + "33"
                      : c.destructive + "22",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Feather
                    name={result.ok ? "check" : "alert-circle"}
                    size={20}
                    color={result.ok ? c.primary : c.destructive}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: c.foreground,
                      fontFamily: "Inter_700Bold",
                      fontSize: 15,
                    }}
                  >
                    {result.message}
                  </Text>
                  {result.branch ? (
                    <Text
                      style={{
                        color: c.mutedForeground,
                        fontFamily: "Inter_500Medium",
                        fontSize: 12,
                      }}
                    >
                      {result.branch}
                    </Text>
                  ) : null}
                </View>
              </View>
              {result.ok ? (
                <View style={{ marginTop: 12 }}>
                  <Button
                    title="View history"
                    variant="secondary"
                    icon="calendar"
                    onPress={() => router.push("/(customer)/history")}
                    fullWidth
                  />
                </View>
              ) : null}
            </Card>
          ) : null}

          {customer ? (
            <Card>
              <Text
                style={{
                  color: c.mutedForeground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 11,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                }}
              >
                Your assigned branch
              </Text>
              <Text
                style={{
                  color: c.foreground,
                  fontFamily: "Inter_700Bold",
                  fontSize: 16,
                  marginTop: 4,
                }}
              >
                {branches.find((b) => b.id === customer.branchId)?.name ?? "—"}
              </Text>
              <Text
                style={{
                  color: c.mutedForeground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                You can only check in at this branch.
              </Text>
            </Card>
          ) : null}
        </View>
        )}
      </ScrollView>
    </View>
  );
}
