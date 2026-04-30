import colors from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * Returns the design tokens for the active color scheme based on the
 * user's theme preference (system / light / dark) from ThemeContext.
 */
export function useColors() {
  const { scheme } = useTheme();
  const palette = scheme === "light" ? colors.light : colors.dark;
  return { ...palette, radius: colors.radius };
}
