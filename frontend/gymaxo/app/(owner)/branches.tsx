import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Card, DataSkeleton, EmptyState, Header } from "@/components/ui";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";

export default function BranchesScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { loading, gyms, branches, customers } = useData();

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 100,
        }}
      >
        <Header
          title="Branches"
          subtitle={`${gyms.length} gym${gyms.length !== 1 ? "s" : ""}, ${branches.length} branch${branches.length !== 1 ? "es" : ""}`}
          right={
            <Pressable
              onPress={() => router.push("/(owner)/add-branch")}
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: c.primary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather name="plus" size={20} color={c.primaryForeground} />
            </Pressable>
          }
        />

        {loading ? (
          <DataSkeleton title="Loading gyms and branches" cards={5} />
        ) : (
        <View style={{ paddingHorizontal: 20, gap: 16 }}>
          {gyms.length === 0 ? (
            <EmptyState
              icon="home"
              title="No gym yet"
              description="Add your first gym to start managing branches."
              action={<Button title="Add gym" onPress={() => router.push("/(owner)/add-gym")} size="sm" icon="plus" />}
            />
          ) : null}

          {gyms.map((gym) => {
            const gymBranches = branches.filter((b) => b.gymId === gym.id);
            return (
              <View key={gym.id} style={{ gap: 10 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: c.primary,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Feather name="zap" size={18} color={c.primaryForeground} />
                    </View>
                    <View>
                      <Text
                        style={{
                          color: c.foreground,
                          fontFamily: "Inter_700Bold",
                          fontSize: 17,
                        }}
                      >
                        {gym.name}
                      </Text>
                      <Text
                        style={{
                          color: c.mutedForeground,
                          fontFamily: "Inter_500Medium",
                          fontSize: 12,
                        }}
                      >
                        {gym.address}
                      </Text>
                    </View>
                  </View>
                </View>

                {gymBranches.length === 0 ? (
                  <Card>
                    <View style={{ gap: 10, alignItems: "flex-start" }}>
                      <Text
                        style={{
                          color: c.mutedForeground,
                          fontFamily: "Inter_500Medium",
                          fontSize: 13,
                        }}
                      >
                        No branches yet for this gym.
                      </Text>
                      <Button
                        title="Add branch"
                        onPress={() => router.push("/(owner)/add-branch")}
                        size="sm"
                        icon="plus"
                      />
                    </View>
                  </Card>
                ) : (
                  gymBranches.map((b) => {
                    const memberCount = customers.filter(
                      (c) => c.branchId === b.id,
                    ).length;
                    return (
                      <Card
                        key={b.id}
                        onPress={() =>
                          router.push({
                            pathname: "/(owner)/branch/[id]",
                            params: { id: b.id },
                          })
                        }
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
                              borderRadius: 12,
                              backgroundColor: c.muted,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Feather
                              name="map-pin"
                              size={18}
                              color={c.foreground}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text
                              style={{
                                color: c.foreground,
                                fontFamily: "Inter_600SemiBold",
                                fontSize: 15,
                              }}
                            >
                              {b.name}
                            </Text>
                            <Text
                              style={{
                                color: c.mutedForeground,
                                fontFamily: "Inter_500Medium",
                                fontSize: 12,
                                marginTop: 2,
                              }}
                            >
                              {b.address} • {memberCount} member
                              {memberCount !== 1 ? "s" : ""}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Feather
                              name="maximize"
                              size={14}
                              color={c.primary}
                            />
                            <Text
                              style={{
                                color: c.primary,
                                fontFamily: "Inter_600SemiBold",
                                fontSize: 12,
                              }}
                            >
                              QR
                            </Text>
                          </View>
                        </View>
                      </Card>
                    );
                  })
                )}
              </View>
            );
          })}

          <Pressable
            onPress={() => router.push("/(owner)/add-gym")}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: 14,
              borderRadius: c.radius,
              borderWidth: 1,
              borderStyle: "dashed",
              borderColor: c.border,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Feather name="plus" size={16} color={c.foreground} />
            <Text
              style={{
                color: c.foreground,
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
              }}
            >
              Add another gym
            </Text>
          </Pressable>
        </View>
        )}
      </ScrollView>
    </View>
  );
}
