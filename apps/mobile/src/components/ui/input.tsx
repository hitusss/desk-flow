import type { TextInputProps } from "react-native";

import { TextInput, View } from "react-native";

import { cn } from "@/lib/utils";

function Input({
  className,
  ...props
}: TextInputProps & React.RefAttributes<TextInput>) {
  return (
    <View className="border-border rounded-base bg-secondary-background h-10 w-full border-2">
      <TextInput
        className={cn(
          "font-base text-foreground placeholder:text-foreground/50 h-10 w-full px-3 py-2 text-sm",
          props.editable === false && "opacity-50",
          className,
        )}
        {...props}
      />
    </View>
  );
}

export { Input };
