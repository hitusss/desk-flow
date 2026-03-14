import type { VariantProps } from "class-variance-authority";

import { cva } from "class-variance-authority";
import { useMemo } from "react";
import { View } from "react-native";

import { Label } from "@/components/ui/label";
import { Text, TextClassContext } from "@/components/ui/text";
import { cn } from "@/lib/utils";

function FieldSet({ className, ...props }: React.ComponentProps<typeof View>) {
  return <View className={cn("flex flex-col gap-4", className)} {...props} />;
}

function FieldLegend({
  className,
  variant = "legend",
  ...props
}: Omit<React.ComponentProps<typeof Text>, "variant"> & {
  variant?: "legend" | "label";
}) {
  return (
    <Text
      className={cn(
        "mb-1.5 font-medium",
        variant === "label" ? "text-sm" : "text-base",
        className,
      )}
      {...props}
    />
  );
}

function FieldGroup({
  className,
  ...props
}: React.ComponentProps<typeof View>) {
  return (
    <View className={cn("flex w-full flex-col gap-5", className)} {...props} />
  );
}

const fieldVariants = cva("gap-2 flex w-full", {
  variants: {
    orientation: {
      vertical: "flex-col",
      horizontal: "flex-row items-center",
      responsive: "flex-col md:flex-row md:items-center",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof View> & VariantProps<typeof fieldVariants>) {
  return (
    <View
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
}

function FieldContent({
  className,
  ...props
}: React.ComponentProps<typeof View>) {
  return (
    <TextClassContext value="leading-snug">
      <View className={cn("flex flex-col gap-0.5", className)} {...props} />
    </TextClassContext>
  );
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return <Label className={cn("w-fit leading-snug", className)} {...props} />;
}

function FieldTitle({
  className,
  ...props
}: React.ComponentProps<typeof Text>) {
  return (
    <Text
      className={cn(
        "flex w-fit items-center gap-2 text-sm leading-snug font-medium",
        className,
      )}
      {...props}
    />
  );
}

function FieldDescription({
  className,
  ...props
}: React.ComponentProps<typeof Text>) {
  return (
    <Text
      className={cn("text-muted-foreground text-left text-sm", className)}
      {...props}
    />
  );
}

function FieldError({
  children,
  errors,
  ...props
}: React.ComponentProps<typeof View> & {
  errors?: Array<{ message?: string } | undefined>;
}) {
  const content = useMemo(() => {
    if (children) {
      return children;
    }

    if (!errors?.length) {
      return null;
    }

    const uniqueErrors = [
      ...new Map(errors.map((error) => [error?.message, error])).values(),
    ];

    if (uniqueErrors.length === 1) {
      return uniqueErrors[0]?.message ?? null;
    }

    return (
      <View className="ml-4 flex flex-col gap-1">
        {uniqueErrors.map((error, index) =>
          error?.message ? <Text key={index}>{error.message}</Text> : null,
        )}
      </View>
    );
  }, [children, errors]);

  if (!content) {
    return null;
  }

  return (
    <TextClassContext value="text-destructive text-sm">
      <View role="alert" {...props}>
        {typeof content === "string" ? <Text>{content}</Text> : content}
      </View>
    </TextClassContext>
  );
}

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
};
