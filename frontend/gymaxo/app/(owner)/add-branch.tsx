import { Stack, router } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "./add-customer";
import { Button, Card, Input } from "@/components/ui";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";

export default function AddBranchScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { gyms, addBranch } = useData();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [gymId, setGymId] = useState<string>(gyms[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setError(null);
    if (!name.trim() || !gymId) {
      setError("Branch name and gym are required");
      return;
    }
    setLoading(true);
    try {
      await addBranch({ gymId, name, address });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 40,
        }}
      >
        <ScreenHeader title="New branch" onBack={() => router.back()} />
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
              Branch details
            </Text>
            <View style={{ gap: 12 }}>
              {gyms.length === 0 ? (
                <View style={{ gap: 10, alignItems: "flex-start" }}>
                  <Text
                    style={{
                      color: c.mutedForeground,
                      fontFamily: "Inter_500Medium",
                      fontSize: 13,
                    }}
                  >
                    Create a gym first.
                  </Text>
                  <Button title="Add gym" onPress={() => router.push("/(owner)/add-gym")} size="sm" icon="plus" />
                </View>
              ) : (
                <View style={{ gap: 8 }}>
                  <Text
                    style={{
                      color: c.mutedForeground,
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                    }}
                  >
                    Parent gym
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    {gyms.map((g) => {
                      const active = g.id === gymId;
                      return (
                        <Pressable
                          key={g.id}
                          onPress={() => setGymId(g.id)}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 999,
                            backgroundColor: active ? c.foreground : c.muted,
                          }}
                        >
                          <Text
                            style={{
                              color: active ? c.background : c.foreground,
                              fontFamily: "Inter_600SemiBold",
                              fontSize: 13,
                            }}
                          >
                            {g.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}
              <Input
                label="Branch name"
                value={name}
                onChangeText={setName}
                placeholder="e.g. Iron Pulse - Riverside"
                autoCapitalize="words"
              />
              <Input
                label="Address"
                value={address}
                onChangeText={setAddress}
                placeholder="Street, city"
              />
            </View>
          </Card>
          {error ? (
            <Text
              style={{
                color: c.destructive,
                fontFamily: "Inter_500Medium",
                fontSize: 13,
                textAlign: "center",
              }}
            >
              {error}
            </Text>
          ) : null}
          <Button
            title="Create branch"
            onPress={handleSave}
            loading={loading}
            disabled={gyms.length === 0}
            fullWidth
            size="lg"
            icon="check"
          />
        </View>
      </ScrollView>
    </View>
  );
}
