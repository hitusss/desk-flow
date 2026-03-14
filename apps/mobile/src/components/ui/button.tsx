import type { VariantProps } from "class-variance-authority";

import { cva } from "class-variance-authority";
import { Pressable } from "react-native";

import { TextClassContext } from "@/components/ui/text";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group shrink-0 flex-row items-center justify-center gap-2 rounded-base duration-100 disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-main border-2 border-border shadow-shadow active:shadow-none active:translate-x-boxShadowX active:translate-y-boxShadowY",
        noShadow: "bg-main border-2 border-border",
        neutral:
          "bg-secondary border-2 border-border shadow-shadow active:shadow-none active:translate-x-boxShadowX active:translate-y-boxShadowY",
        reverse: `"bg-main border-2 border-border active:shadow-shadow active:translate-x-reverseBoxShadowX
        active:translate-y-reverseBoxShadowY"`,
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const buttonTextVariants = cva("text-foreground text-sm font-medium", {
  variants: {
    variant: {
      default: "text-main-foreground",
      noShadow: "text-main-foreground",
      neutral: "text-foreground",
      reverse: "text-main-foreground",
    },
    size: {
      default: "",
      sm: "",
      lg: "",
      icon: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

type ButtonProps = React.ComponentProps<typeof Pressable> &
  React.RefAttributes<typeof Pressable> &
  VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <TextClassContext value={buttonTextVariants({ variant, size })}>
      <Pressable
        className={cn(buttonVariants({ variant, size }), className)}
        role="button"
        {...props}
      />
    </TextClassContext>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
