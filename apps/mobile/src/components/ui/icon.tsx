import * as icons from "lucide-react-native/icons";
import { styled } from "nativewind";
import { use } from "react";

import { TextClassContext } from "@/components/ui/text";
import { cn } from "@/lib/utils";

export const Icon = styled(
  ({
    name,
    className,
    size = 16,
    ...props
  }: { name: keyof typeof icons } & React.ComponentProps<
    (typeof icons)[keyof typeof icons]
  >) => {
    const textClass = use(TextClassContext);

    const LucideIcon = icons[name];
    return (
      <LucideIcon className={cn(textClass, className)} size={size} {...props} />
    );
  },
  {
    className: {
      target: "style",
      // @ts-expect-error - nativeStyleToProp will be deprecated, need to migrate to nativeStyleMapping in the future
      nativeStyleToProp: {
        height: true,
        width: true,
        size: true,
        color: true,
        fill: true,
        stroke: true,
        strokeWidth: true,
      },
    },
  },
);
