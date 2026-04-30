import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { Button, Input } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { Role } from "@/lib/types";

export default function LoginScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { login, requestEmailOtp, verifyEmailOtp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<Role>("customer");
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetOtp = () => {
    setOtpSent(false);
    setCode("");
    setError(null);
  };

  const goHome = () => {
    router.replace(role === "owner" ? "/(owner)" : "/(customer)");
  };

  const handleLogin = async () => {
    setError(null);
    if (!identifier.trim() || !password.trim()) {
      setError("Gmail/phone and password are required");
      return;
    }

    setLoading(true);
    try {
      const res = await login(identifier.trim(), password, role);
      if (!res.ok) setError(res.error ?? "Login failed");
      else goHome();
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    setError(null);
    if (!email.trim() || !name.trim() || !phone.trim() || !password.trim()) {
      setError("Gmail, name, phone and password are required");
      return;
    }

    setLoading(true);
    try {
      const res = await requestEmailOtp(email.trim().toLowerCase(), role);
      if (!res.ok) setError(res.error ?? "OTP send failed");
      else setOtpSent(true);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError(null);
    if (!code.trim()) {
      setError("OTP is required");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyEmailOtp({
        email: email.trim().toLowerCase(),
        code: code.trim(),
        role,
        name: name.trim(),
        phone: phone.trim(),
        password,
      });
      if (!res.ok) setError(res.error ?? "Signup failed");
      else goHome();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <LinearGradient
        colors={[c.primary + "33", c.background]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 320,
        }}
      />
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={{
          padding: 24,
          paddingTop: insets.top + 60,
          paddingBottom: insets.bottom + 40,
          gap: 24,
        }}
        bottomOffset={20}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              backgroundColor: c.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Feather name={mode === "signup" ? "mail" : "lock"} size={32} color={c.primaryForeground} />
          </View>
          <Text
            style={{
              color: c.foreground,
              fontFamily: "Inter_900Black",
              fontSize: 32,
              letterSpacing: 1,
            }}
          >
            GYMPRO
          </Text>
          <Text
            style={{
              color: c.mutedForeground,
              fontFamily: "Inter_500Medium",
              fontSize: 14,
              textAlign: "center",
            }}
          >
            {mode === "signup"
              ? "Sign up with Gmail OTP, then use password to login."
              : "Login with Gmail or phone number and password."}
          </Text>
        </View>

        <View style={{ gap: 10 }}>
          <View
            style={{
              flexDirection: "row",
              backgroundColor: c.secondary,
              padding: 4,
              borderRadius: 14,
            }}
          >
            {(["customer", "owner"] as Role[]).map((r) => (
              <Pressable
                key={r}
                onPress={() => {
                  setRole(r);
                  resetOtp();
                }}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  alignItems: "center",
                  borderRadius: 10,
                  backgroundColor: role === r ? c.primary : "transparent",
                }}
              >
                <Text
                  style={{
                    color: role === r ? c.foreground : c.mutedForeground,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 14,
                    textTransform: "capitalize",
                  }}
                >
                  {r === "customer" ? "Member" : "Owner"}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ gap: 14 }}>
          {mode === "login" ? (
            <>
              <Input
                label="Gmail or phone"
                value={identifier}
                onChangeText={setIdentifier}
                placeholder="you@gmail.com or phone"
                autoCapitalize="none"
              />
              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry
              />
            </>
          ) : (
            <>
              <Input
                label="Gmail"
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  resetOtp();
                }}
                placeholder="you@gmail.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Input
                label="Full name"
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                autoCapitalize="words"
              />
              <Input
                label="Phone"
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone number"
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Create password"
                secureTextEntry
              />
              {otpSent ? (
                <Input
                  label="OTP"
                  value={code}
                  onChangeText={setCode}
                  placeholder="6 digit code"
                  keyboardType="number-pad"
                  autoCapitalize="none"
                />
              ) : null}
            </>
          )}

          {error ? (
            <Text
              style={{
                color: c.destructive,
                fontFamily: "Inter_500Medium",
                fontSize: 13,
              }}
            >
              {error}
            </Text>
          ) : null}
          <Button
            title={mode === "login" ? "Login" : otpSent ? "Verify OTP & sign up" : "Send OTP"}
            onPress={mode === "login" ? handleLogin : otpSent ? verifyOtp : sendOtp}
            loading={loading}
            fullWidth
            size="lg"
          />
          {mode === "signup" && otpSent ? (
            <Pressable onPress={sendOtp} style={{ alignItems: "center", padding: 8 }}>
              <Text
                style={{
                  color: c.mutedForeground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 13,
                }}
              >
                Did not get code? <Text style={{ color: c.foreground }}>Resend OTP</Text>
              </Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={() => {
              setMode(mode === "login" ? "signup" : "login");
              resetOtp();
            }}
            style={{ alignItems: "center", paddingTop: 6, paddingBottom: 2 }}
          >
            <Text
              style={{
                color: c.mutedForeground,
                fontFamily: "Inter_500Medium",
                fontSize: 13,
                textAlign: "center",
              }}
            >
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <Text style={{ color: c.destructive, fontFamily: "Inter_700Bold" }}>
                {mode === "login" ? "Sign up" : "Login"}
              </Text>
            </Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}
