import { Feather } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "./add-customer";
import { Button, Card, Input } from "@/components/ui";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";

export default function AddGymScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { addGym, gyms, branches, customers } = useData();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    if (!name.trim()) {
      setError("Gym name is required");
      return;
    }
    setLoading(true);
    try {
      const { gym, branch } = await addGym({ name: name.trim(), address: address.trim() });
      setName("");
      setAddress("");
      setSuccess(`${gym.name} added with ${branch.name}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gym creation failed");
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
        <ScreenHeader title="New gym" onBack={() => router.back()} />
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
              Gym details
            </Text>
            <View style={{ gap: 12 }}>
              <Input
                label="Gym name"
                value={name}
                onChangeText={setName}
                placeholder="e.g. Iron Pulse Fitness"
                autoCapitalize="words"
              />
              <Input
                label="Headquarters / address"
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
            title="Create gym"
            onPress={handleSave}
            loading={loading}
            fullWidth
            size="lg"
            icon="check"
          />
          {success ? (
            <Text
              style={{
                color: c.success,
                fontFamily: "Inter_600SemiBold",
                fontSize: 13,
                textAlign: "center",
              }}
            >
              {success}
            </Text>
          ) : null}

          <View style={{ gap: 10, marginTop: 6 }}>
            <Text
              style={{
                color: c.foreground,
                fontFamily: "Inter_700Bold",
                fontSize: 17,
              }}
            >
              Added gyms
            </Text>
            {gyms.length === 0 ? (
              <Card>
                <Text
                  style={{
                    color: c.mutedForeground,
                    fontFamily: "Inter_500Medium",
                    fontSize: 13,
                  }}
                >
                  No gym added yet.
                </Text>
              </Card>
            ) : (
              gyms.map((gym) => {
                const branchCount = branches.filter((branch) => branch.gymId === gym.id).length;
                const memberCount = customers.filter((customer) => customer.gymId === gym.id).length;
                return (
                  <Card key={gym.id}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          backgroundColor: c.primary + "22",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Feather name="home" size={19} color={c.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: c.foreground,
                            fontFamily: "Inter_700Bold",
                            fontSize: 15,
                          }}
                        >
                          {gym.name}
                        </Text>
                        <Text
                          style={{
                            color: c.mutedForeground,
                            fontFamily: "Inter_500Medium",
                            fontSize: 12,
                            marginTop: 2,
                          }}
                        >
                          {gym.address || "No address"} • {branchCount} branch
                          {branchCount !== 1 ? "es" : ""} • {memberCount} member
                          {memberCount !== 1 ? "s" : ""}
                        </Text>
                      </View>
                    </View>
                  </Card>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
