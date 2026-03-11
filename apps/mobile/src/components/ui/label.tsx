import * as LabelPrimitive from "@rn-primitives/label";

import { cn } from "@/lib/utils";

function Label({
  className,
  onPress,
  onLongPress,
  onPressIn,
  onPressOut,
  disabled,
  ...props
}: LabelPrimitive.TextProps & React.RefAttributes<LabelPrimitive.TextRef>) {
  return (
    <LabelPrimitive.Root
      className="flex flex-row items-center gap-2 select-none disabled:opacity-70"
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
    >
      <LabelPrimitive.Text
        className={cn("font-heading text-sm leading-none", className)}
        {...props}
      />
    </LabelPrimitive.Root>
  );
}

export { Label };
