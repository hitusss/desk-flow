import * as SelectPrimitive from "@rn-primitives/select";
import { Fragment, use } from "react";
import { Platform, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { Icon } from "@/components/ui/icon";
import { TextClassContext } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type Option = SelectPrimitive.Option;

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

function SelectValue({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value> & {
  className?: string;
}) {
  const textClass = use(TextClassContext);
  return (
    <SelectPrimitive.Value
      ref={ref}
      className={cn(textClass, "flex flex-row items-center gap-2", className)}
      {...props}
    />
  );
}

function SelectTrigger({
  ref,
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  children?: React.ReactNode;
}) {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        "rounded-base border-border bg-main font-base text-main-foreground flex h-10 flex-row items-center justify-between gap-2 border-2 px-3 py-2 text-sm",
        className,
      )}
      {...props}
    >
      <>{children}</>
      <Icon name="ChevronDown" aria-hidden={true} className="size-4" />
    </SelectPrimitive.Trigger>
  );
}

const FullWindowOverlay = Fragment;

function SelectContent({
  className,
  children,
  position = "popper",
  portalHost,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content> & {
  className?: string;
  portalHost?: string;
}) {
  return (
    <SelectPrimitive.Portal hostName={portalHost}>
      <FullWindowOverlay>
        <SelectPrimitive.Overlay
          style={Platform.select({ native: StyleSheet.absoluteFill })}
        >
          <TextClassContext value="text-main-foreground">
            <Animated.View className="z-50" entering={FadeIn} exiting={FadeOut}>
              <SelectPrimitive.Content
                className={cn(
                  "rounded-base border-border bg-main text-main-foreground z-50 min-w-32 border-2",
                  className,
                )}
                position={position}
                {...props}
              >
                <SelectPrimitive.Viewport
                  className={cn("p-1", position === "popper" && "w-full")}
                >
                  {children}
                </SelectPrimitive.Viewport>
              </SelectPrimitive.Content>
            </Animated.View>
          </TextClassContext>
        </SelectPrimitive.Overlay>
      </FullWindowOverlay>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      className={cn(
        "font-base text-main-foreground/80 border-2 border-transparent py-1.5 pr-8 pl-2 text-sm",
        className,
      )}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "group rounded-base flex w-full flex-row items-center gap-2 border-2 border-transparent py-1.5 pr-8 pl-2",
        props.disabled && "opacity-50",
        className,
      )}
      {...props}
    >
      <View className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Icon name="Check" className="size-4 shrink-0" />
        </SelectPrimitive.ItemIndicator>
      </View>
      <SelectPrimitive.ItemText className="text-foreground font-base text-sm" />
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

export {
  type Option,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
