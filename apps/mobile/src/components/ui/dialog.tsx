import * as DialogPrimitive from "@rn-primitives/dialog";
import * as React from "react";
import { View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

function DialogOverlay({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof DialogPrimitive.Overlay>, "asChild"> & {
  children?: React.ReactNode;
}) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "bg-overlay absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center p-2",
        className,
      )}
      {...props}
      asChild
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
      >
        {children}
      </Animated.View>
    </DialogPrimitive.Overlay>
  );
}
function DialogContent({
  className,
  portalHost,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  portalHost?: string;
}) {
  return (
    <DialogPortal hostName={portalHost}>
      <DialogOverlay>
        <DialogPrimitive.Content
          className={cn(
            "bg-background rounded-base border-border shadow-shadow z-50 mx-auto flex w-full max-w-[calc(100%-2rem)] flex-col gap-4 border-2 p-6 sm:max-w-lg",
            className,
          )}
          {...props}
          asChild
        >
          <Animated.View
            entering={FadeIn.delay(50)}
            exiting={FadeOut.duration(150)}
          >
            {children}
            <DialogPrimitive.Close
              className={cn("rounded-base absolute top-4 right-4 opacity-100")}
              hitSlop={12}
            >
              <Icon name="X" />
              <Text className="sr-only">Close</Text>
            </DialogPrimitive.Close>
          </Animated.View>
        </DialogPrimitive.Content>
      </DialogOverlay>
    </DialogPortal>
  );
}

function DialogHeader({
  className,
  ...props
}: React.ComponentProps<typeof View>) {
  return (
    <View
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  ...props
}: React.ComponentProps<typeof View>) {
  return (
    <View
      className={cn(
        "flex flex-col-reverse gap-3 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn(
        "font-heading text-foreground text-lg leading-none tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("font-base text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
