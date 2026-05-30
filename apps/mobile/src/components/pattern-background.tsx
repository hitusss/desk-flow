import { Platform, StyleSheet, useWindowDimensions, View } from "react-native";

import { useColors } from "@/lib/use-colors";
import { cn } from "@/lib/utils";

export function PatternBackground({
  children,
  className,
  contentClassName,
  size = 70,
}: React.ComponentProps<typeof View> & {
  contentClassName?: string;
  size?: number;
}) {
  const { height, width } = useWindowDimensions();
  const colors = useColors();

  if (Platform.OS === "web") {
    return (
      <View className={cn("bg-background bg-pattern flex-1", className)}>
        <View className={cn("flex-1", contentClassName)}>{children}</View>
      </View>
    );
  }

  const columns = Math.floor(width / size);
  const rows = Math.floor(height / size);
  const color = colors["muted-foreground"];

  return (
    <View className={cn("bg-background flex-1 overflow-hidden", className)}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {Array.from({ length: columns + 1 }, (_, index) => (
          <View
            key={`column-${index}`}
            style={{
              backgroundColor: color,
              bottom: 0,
              left: index * size,
              position: "absolute",
              top: 0,
              width: StyleSheet.hairlineWidth,
            }}
          />
        ))}
        {Array.from({ length: rows + 1 }, (_, index) => (
          <View
            key={`row-${index}`}
            style={{
              backgroundColor: color,
              height: StyleSheet.hairlineWidth,
              left: 0,
              position: "absolute",
              right: 0,
              top: index * size,
            }}
          />
        ))}
      </View>

      <View className={cn("flex-1", contentClassName)}>{children}</View>
    </View>
  );
}
