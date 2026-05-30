import type { Option } from "@/components/ui/select";
import type { Theme } from "@repo/config";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { configFormOpts, withForm } from "@/lib/config-form";

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export const AppPreferencesEditor = withForm({
  ...configFormOpts,
  props: {
    autoSubmit: false as boolean,
  },
  render: function Render({ form, autoSubmit }) {
    return (
      <Field>
        <FieldLabel>Theme</FieldLabel>
        <FieldDescription>
          Switch between system, light, and dark appearance.
        </FieldDescription>
        <form.Field name="theme">
          {(field) => {
            const selectedOption: Option | undefined = THEME_OPTIONS.find(
              (o) => o.value === field.state.value,
            );
            return (
              <Select
                value={
                  selectedOption
                    ? {
                        value: selectedOption.value,
                        label: selectedOption.label,
                      }
                    : undefined
                }
                onValueChange={(option) => {
                  if (option) {
                    field.handleChange(option.value as Theme);
                    if (autoSubmit) {
                      void form.handleSubmit();
                    }
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  {THEME_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      label={option.label}
                    />
                  ))}
                </SelectContent>
              </Select>
            );
          }}
        </form.Field>
      </Field>
    );
  },
});
