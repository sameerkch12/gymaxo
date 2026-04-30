import { Feather } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DatePickerField } from "@/components/Calendar";
import { Button, Card, Input } from "@/components/ui";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";

export default function AddCustomerScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { gyms, branches, plans, addCustomer } = useData();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gymId, setGymId] = useState<string>(gyms[0]?.id ?? "");
  const [branchId, setBranchId] = useState<string>(
    branches.find((branch) => branch.gymId === gyms[0]?.id)?.id ?? "",
  );
  const [planId, setPlanId] = useState<string>(plans[0]?.id ?? "");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]!);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const gymBranches = branches.filter((branch) => branch.gymId === gymId);
  const missingGym = gyms.length === 0;
  const missingBranch = !missingGym && gymBranches.length === 0;
  const missingPlan = plans.length === 0;

  useEffect(() => {
    if (!gymId && gyms[0]?.id) {
      const firstGymId = gyms[0].id;
      setGymId(firstGymId);
      setBranchId(branches.find((branch) => branch.gymId === firstGymId)?.id ?? "");
    }
  }, [branches, gymId, gyms]);

  useEffect(() => {
    if (gymId && branchId && !branches.some((branch) => branch.id === branchId && branch.gymId === gymId)) {
      setBranchId(branches.find((branch) => branch.gymId === gymId)?.id ?? "");
    }
  }, [branchId, branches, gymId]);

  useEffect(() => {
    if (!planId && plans[0]?.id) setPlanId(plans[0].id);
  }, [planId, plans]);

  const handleSave = async () => {
    setError(null);
    if (!name.trim() || !phone.trim()) {
      setError("Name and phone are required");
      return;
    }
    if (!gymId || !branchId || !planId) {
      setError("Pick a gym, branch and plan");
      return;
    }
    setLoading(true);
    try {
      await addCustomer({
        name,
        phone,
        gymId,
        branchId,
        planId,
        startDate,
      });
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
        <ScreenHeader title="Add member" onBack={() => router.back()} />

        <View style={{ paddingHorizontal: 20, gap: 14 }}>
          {missingGym || missingBranch || missingPlan ? (
            <Card>
              <Text
                style={{
                  color: c.foreground,
                  fontFamily: "Inter_700Bold",
                  fontSize: 16,
                  marginBottom: 10,
                }}
              >
                Setup needed
              </Text>
              <View style={{ gap: 10 }}>
                {missingGym ? (
                  <MissingSetupAction
                    title="No gym added"
                    description="Create a gym first, then add members."
                    button="Add gym"
                    onPress={() => router.push("/(owner)/add-gym")}
                  />
                ) : null}
                {missingBranch ? (
                  <MissingSetupAction
                    title="No branch in selected gym"
                    description="Create a branch for this gym."
                    button="Add branch"
                    onPress={() => router.push("/(owner)/add-branch")}
                  />
                ) : null}
                {missingPlan ? (
                  <MissingSetupAction
                    title="No membership plan"
                    description="Create a plan before adding members."
                    button="Add plan"
                    onPress={() => router.push("/(owner)/more")}
                  />
                ) : null}
              </View>
            </Card>
          ) : null}

          <Card>
            <Text
              style={{
                color: c.foreground,
                fontFamily: "Inter_700Bold",
                fontSize: 16,
                marginBottom: 12,
              }}
            >
              Member info
            </Text>
            <View style={{ gap: 12 }}>
              <Input
                label="Full name"
                value={name}
                onChangeText={setName}
                placeholder="Member's name"
                autoCapitalize="words"
              />
              <Input
                label="Phone"
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone number"
                keyboardType="phone-pad"
              />
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
              Assignment
            </Text>
            <View style={{ gap: 14 }}>
              <Picker
                label="Gym"
                value={gymId}
                onChange={(value) => {
                  setGymId(value);
                  setBranchId(branches.find((branch) => branch.gymId === value)?.id ?? "");
                }}
                options={gyms.map((gym) => ({ value: gym.id, label: gym.name }))}
                emptyAction={
                  <Button title="Add gym" onPress={() => router.push("/(owner)/add-gym")} size="sm" icon="plus" />
                }
              />
              <Picker
                label="Branch"
                value={branchId}
                onChange={setBranchId}
                options={gymBranches.map((branch) => ({
                  value: branch.id,
                  label: branch.name,
                }))}
                emptyAction={
                  <Button title="Add branch" onPress={() => router.push("/(owner)/add-branch")} size="sm" icon="plus" />
                }
              />
              <Picker
                label="Plan"
                value={planId}
                onChange={setPlanId}
                options={plans.map((plan) => ({
                  value: plan.id,
                  label: `${plan.name} - Rs. ${plan.price}`,
                }))}
                emptyAction={
                  <Button title="Add plan" onPress={() => router.push("/(owner)/more")} size="sm" icon="plus" />
                }
              />
              <DatePickerField label="Start date" value={startDate} onChange={setStartDate} />
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
            title="Save member"
            onPress={handleSave}
            loading={loading}
            disabled={missingGym || missingBranch || missingPlan}
            fullWidth
            size="lg"
            icon="check"
          />
        </View>
      </ScrollView>
    </View>
  );
}

export function ScreenHeader({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  const c = useColors();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 12,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          flex: 1,
        }}
      >
        {onBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={10}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: c.muted,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Feather name="arrow-left" size={18} color={c.foreground} />
          </Pressable>
        ) : null}
        <Text
          style={{
            color: c.foreground,
            fontFamily: "Inter_700Bold",
            fontSize: 22,
            letterSpacing: -0.4,
          }}
        >
          {title}
        </Text>
      </View>
      {right}
    </View>
  );
}

function Picker({
  label,
  value,
  onChange,
  options,
  emptyAction,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  emptyAction?: React.ReactNode;
}) {
  const c = useColors();
  return (
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
        {label}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {options.length === 0 ? (
          <View style={{ gap: 8, alignItems: "flex-start" }}>
            <Text
              style={{
                color: c.mutedForeground,
                fontFamily: "Inter_500Medium",
                fontSize: 13,
              }}
            >
              None available
            </Text>
            {emptyAction}
          </View>
        ) : (
          options.map((option) => {
            const active = option.value === value;
            return (
              <Pressable
                key={option.value}
                onPress={() => onChange(option.value)}
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
                  {option.label}
                </Text>
              </Pressable>
            );
          })
        )}
      </View>
    </View>
  );
}

function MissingSetupAction({
  title,
  description,
  button,
  onPress,
}: {
  title: string;
  description: string;
  button: string;
  onPress: () => void;
}) {
  const c = useColors();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 12,
        borderRadius: c.radius - 4,
        backgroundColor: c.secondary,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ color: c.foreground, fontFamily: "Inter_700Bold", fontSize: 14 }}>
          {title}
        </Text>
        <Text style={{ color: c.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 12, marginTop: 2 }}>
          {description}
        </Text>
      </View>
      <Button title={button} onPress={onPress} size="sm" icon="plus" />
    </View>
  );
}
