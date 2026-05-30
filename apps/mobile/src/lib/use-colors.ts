import { useColorScheme } from "react-native";

import { theme } from "@repo/tailwind/theme-colors";

export function useColors() {
  const colorScheme = useColorScheme();
  return theme[colorScheme === "dark" ? "dark" : "light"];
}
