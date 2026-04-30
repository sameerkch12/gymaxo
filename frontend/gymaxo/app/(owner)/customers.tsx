import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Badge, Button, Card, DataSkeleton, EmptyState, Header } from "@/components/ui";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";

export default function CustomersScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { loading, customers, plans, branches, gyms } = useData();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "expiring" | "expired">(
    "all",
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return customers
      .filter((cm) => {
        if (q && !cm.name.toLowerCase().includes(q) && !cm.phone.includes(q))
          return false;
        const days =
          (new Date(cm.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        if (filter === "active") return cm.active && days > 7;
        if (filter === "expiring") return cm.active && days >= 0 && days <= 7;
        if (filter === "expired") return !cm.active || days < 0;
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [customers, query, filter]);

  const emptyAction =
    gyms.length === 0 ? (
      <Button title="Add gym" onPress={() => router.push("/(owner)/add-gym")} size="sm" icon="plus" />
    ) : branches.length === 0 ? (
      <Button title="Add branch" onPress={() => router.push("/(owner)/add-branch")} size="sm" icon="plus" />
    ) : plans.length === 0 ? (
      <Button title="Add plan" onPress={() => router.push("/(owner)/more")} size="sm" icon="plus" />
    ) : (
      <Button title="Add member" onPress={() => router.push("/(owner)/add-customer")} size="sm" icon="plus" />
    );

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ paddingTop: insets.top + 8 }}>
        <Header
          title="Members"
          subtitle={`${customers.length} total`}
          right={
            <Pressable
              onPress={() => router.push("/(owner)/add-customer")}
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
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              backgroundColor: c.secondary,
              borderRadius: c.radius - 4,
              paddingHorizontal: 14,
            }}
          >
            <Feather name="search" size={18} color={c.mutedForeground} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search by name or phone"
              placeholderTextColor={c.mutedForeground}
              style={{
                flex: 1,
                paddingVertical: 12,
                color: c.foreground,
                fontFamily: "Inter_500Medium",
                fontSize: 15,
              }}
            />
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {(["all", "active", "expiring", "expired"] as const).map((f) => (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 999,
                  backgroundColor: filter === f ? c.foreground : c.muted,
                }}
              >
                <Text
                  style={{
                    color: filter === f ? c.background : c.mutedForeground,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 12,
                    textTransform: "capitalize",
                  }}
                >
                  {f}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {loading ? (
        <DataSkeleton title="Loading members" cards={6} />
      ) : (
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 110,
          gap: 10,
        }}
        scrollEnabled={filtered.length > 0}
        ListEmptyComponent={
          <EmptyState
            icon="users"
            title="No members found"
            description="Try a different filter or add a new member."
            action={emptyAction}
          />
        }
        renderItem={({ item }) => {
          const plan = plans.find((p) => p.id === item.planId);
          const branch = branches.find((b) => b.id === item.branchId);
          const days = Math.ceil(
            (new Date(item.endDate).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24),
          );
          const status =
            !item.active || days < 0
              ? { label: "Expired", v: "destructive" as const }
              : days <= 7
                ? { label: `${days}d left`, v: "warning" as const }
                : { label: "Active", v: "success" as const };
          return (
            <Card
              onPress={() =>
                router.push({
                  pathname: "/(owner)/customer/[id]",
                  params: { id: item.id },
                })
              }
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: c.muted,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: c.foreground,
                      fontFamily: "Inter_700Bold",
                      fontSize: 15,
                    }}
                  >
                    {item.name
                      .split(" ")
                      .map((s) => s[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: c.foreground,
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 15,
                    }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      color: c.mutedForeground,
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    {plan?.name} • {branch?.name}
                  </Text>
                </View>
                <Badge label={status.label} variant={status.v} />
              </View>
            </Card>
          );
        }}
      />
      )}
    </View>
  );
}
