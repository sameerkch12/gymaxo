import {
  addMonths,
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
} from "date-fns";
import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  markedDates: Set<string>;
  missedDates?: Set<string>;
}

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

export function AttendanceCalendar({ markedDates, missedDates }: Props) {
  const c = useColors();
  const [cursor, setCursor] = useState(new Date());

  const cells = useMemo(() => {
    const start = startOfMonth(cursor);
    const end = endOfMonth(cursor);
    const startWeekday = start.getDay();
    const daysInMonth = end.getDate();
    const arr: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      arr.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    }
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [cursor]);

  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <View style={{ gap: 12 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pressable
          onPress={() => setCursor(subMonths(cursor, 1))}
          hitSlop={10}
          style={{
            padding: 6,
            borderRadius: 8,
            backgroundColor: c.muted,
          }}
        >
          <Feather name="chevron-left" size={18} color={c.foreground} />
        </Pressable>
        <Text
          style={{
            color: c.foreground,
            fontFamily: "Inter_600SemiBold",
            fontSize: 16,
          }}
        >
          {format(cursor, "MMMM yyyy")}
        </Text>
        <Pressable
          onPress={() => setCursor(addMonths(cursor, 1))}
          hitSlop={10}
          style={{
            padding: 6,
            borderRadius: 8,
            backgroundColor: c.muted,
          }}
        >
          <Feather name="chevron-right" size={18} color={c.foreground} />
        </Pressable>
      </View>

      <View style={{ flexDirection: "row" }}>
        {DAYS.map((d, i) => (
          <View key={i} style={{ flex: 1, alignItems: "center" }}>
            <Text
              style={{
                color: c.mutedForeground,
                fontFamily: "Inter_500Medium",
                fontSize: 11,
                letterSpacing: 0.5,
              }}
            >
              {d}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {cells.map((d, i) => {
          if (!d) {
            return <View key={i} style={{ width: `${100 / 7}%`, height: 40 }} />;
          }
          const iso = format(d, "yyyy-MM-dd");
          const isToday = iso === today;
          const marked = markedDates.has(iso);
          const missed = missedDates?.has(iso) ?? false;
          const bg = marked
            ? c.primary
            : missed
              ? c.destructive + "33"
              : "transparent";
          const fg = marked
            ? c.primaryForeground
            : missed
              ? c.destructive
              : c.foreground;
          return (
            <View
              key={i}
              style={{
                width: `${100 / 7}%`,
                height: 40,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: bg,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: isToday && !marked ? 1.5 : 0,
                  borderColor: c.foreground,
                }}
              >
                <Text
                  style={{
                    color: fg,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 13,
                  }}
                >
                  {d.getDate()}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function DatePickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const c = useColors();
  const [open, setOpen] = useState(false);

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
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => ({
          minHeight: 48,
          borderRadius: c.radius - 4,
          borderWidth: 1,
          borderColor: c.border,
          backgroundColor: c.secondary,
          paddingHorizontal: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: pressed ? 0.82 : 1,
        })}
      >
        <Text
          style={{
            color: c.foreground,
            fontFamily: "Inter_600SemiBold",
            fontSize: 15,
          }}
        >
          {value}
        </Text>
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: c.background,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name="calendar" size={17} color={c.primary} />
        </View>
      </Pressable>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          onPress={() => setOpen(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.35)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={{
              borderRadius: c.radius,
              backgroundColor: c.card,
              borderWidth: 1,
              borderColor: c.border,
              padding: 16,
              gap: 14,
            }}
          >
            <DatePickerCalendar
              value={value}
              onChange={(next) => {
                onChange(next);
                setOpen(false);
              }}
            />
            <Pressable
              onPress={() => setOpen(false)}
              style={({ pressed }) => ({
                minHeight: 42,
                borderRadius: c.radius - 4,
                borderWidth: 1,
                borderColor: c.border,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <Text
                style={{
                  color: c.foreground,
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                }}
              >
                Close
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function DatePickerCalendar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const c = useColors();
  const selected = new Date(`${value}T00:00:00`);
  const [cursor, setCursor] = useState(Number.isNaN(selected.getTime()) ? new Date() : selected);

  const cells = useMemo(() => {
    const start = startOfMonth(cursor);
    const end = endOfMonth(cursor);
    const arr: (Date | null)[] = [];
    for (let i = 0; i < start.getDay(); i++) arr.push(null);
    for (let d = 1; d <= end.getDate(); d++) {
      arr.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    }
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [cursor]);

  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Pressable
          onPress={() => setCursor(subMonths(cursor, 1))}
          hitSlop={10}
          style={{ padding: 8, borderRadius: 10, backgroundColor: c.muted }}
        >
          <Feather name="chevron-left" size={18} color={c.foreground} />
        </Pressable>
        <Text style={{ color: c.foreground, fontFamily: "Inter_700Bold", fontSize: 16 }}>
          {format(cursor, "MMMM yyyy")}
        </Text>
        <Pressable
          onPress={() => setCursor(addMonths(cursor, 1))}
          hitSlop={10}
          style={{ padding: 8, borderRadius: 10, backgroundColor: c.muted }}
        >
          <Feather name="chevron-right" size={18} color={c.foreground} />
        </Pressable>
      </View>

      <View style={{ flexDirection: "row" }}>
        {DAYS.map((day, index) => (
          <View key={`${day}-${index}`} style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ color: c.mutedForeground, fontFamily: "Inter_600SemiBold", fontSize: 11 }}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {cells.map((date, index) => {
          if (!date) return <View key={index} style={{ width: `${100 / 7}%`, height: 42 }} />;
          const iso = format(date, "yyyy-MM-dd");
          const active = iso === value;
          const isToday = iso === today;
          return (
            <View key={iso} style={{ width: `${100 / 7}%`, height: 42, alignItems: "center", justifyContent: "center" }}>
              <Pressable
                onPress={() => onChange(iso)}
                style={({ pressed }) => ({
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: active ? c.primary : "transparent",
                  borderWidth: isToday && !active ? 1.5 : 0,
                  borderColor: c.foreground,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.72 : 1,
                })}
              >
                <Text
                  style={{
                    color: active ? c.primaryForeground : c.foreground,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 13,
                  }}
                >
                  {date.getDate()}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}
