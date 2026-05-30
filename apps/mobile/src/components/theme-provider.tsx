import { VariableContextProvider } from "nativewind";
import { useEffect } from "react";
import { Appearance, useColorScheme } from "react-native";

import { theme } from "@repo/tailwind/theme-colors";

import { useConfigStore } from "@/lib/config";

function buildCSSVars(colorScheme: "light" | "dark"): Record<string, string> {
  return Object.fromEntries(
    Object.entries(theme[colorScheme]).map(([key, value]) => [
      `--${key}`,
      value,
    ]),
  );
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const preference = useConfigStore((store) => store.config?.theme ?? "system");
  const colorScheme = useColorScheme() ?? "light";

  useEffect(() => {
    Appearance.setColorScheme(
      preference === "system" ? "unspecified" : preference,
    );
  }, [preference]);

  const cssVars = buildCSSVars(colorScheme === "dark" ? "dark" : "light");

  return (
    <VariableContextProvider value={cssVars}>
      {children}
    </VariableContextProvider>
  );
}
