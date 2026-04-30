import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";

import { readJSON, STORAGE_KEYS, writeJSON } from "@/lib/storage";
import { ThemePref } from "@/lib/types";

interface ThemeContextValue {
  pref: ThemePref;
  scheme: "light" | "dark";
  setPref: (p: ThemePref) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [pref, setPrefState] = useState<ThemePref>("dark");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await readJSON<ThemePref | null>(
        STORAGE_KEYS.themePref,
        null,
      );
      if (stored === "light" || stored === "dark" || stored === "system") {
        setPrefState(stored);
      }
      setLoaded(true);
    })();
  }, []);

  const setPref = useCallback(async (p: ThemePref) => {
    setPrefState(p);
    await writeJSON(STORAGE_KEYS.themePref, p);
  }, []);

  const scheme: "light" | "dark" =
    pref === "system" ? (systemScheme === "light" ? "light" : "dark") : pref;

  const value = useMemo<ThemeContextValue>(
    () => ({ pref, scheme, setPref }),
    [pref, scheme, setPref],
  );

  if (!loaded) return null;
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      pref: "dark",
      scheme: "dark",
      setPref: async () => {},
    };
  }
  return ctx;
}
