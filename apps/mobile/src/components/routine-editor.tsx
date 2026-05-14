import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react-native";
import { View } from "react-native";

import { createRoutine } from "@repo/config";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { configFormOpts, withForm } from "@/lib/config-form";

export const RoutineEditor = withForm({
  ...configFormOpts,
  render: function Render({ form }) {
    return (
      <form.Field name="routines" mode="array">
        {(routinesField) => (
          <View className="gap-5">
            {routinesField.state.value.map((routine, index) => (
              <View
                key={`routine-${routine.id}`}
                className="rounded-base border-border bg-secondary-background flex-row gap-2 border-2 p-4"
              >
                <View className="gap-4">
                  <Button
                    size="icon"
                    variant="noShadow"
                    className="flex-1"
                    onPress={() => {
                      routinesField.moveValue(index, index - 1);
                    }}
                    disabled={index === 0}
                    accessibilityLabel={`Move routine ${index + 1} up`}
                    accessibilityHint={
                      index === 0
                        ? "Already at top"
                        : "Moves routine earlier in the list"
                    }
                  >
                    <ChevronUp />
                  </Button>
                  <Button
                    size="icon"
                    variant="noShadow"
                    className="flex-1"
                    onPress={() => {
                      routinesField.moveValue(index, index + 1);
                    }}
                    disabled={index === routinesField.state.value.length - 1}
                    accessibilityLabel={`Move routine ${index + 1} down`}
                    accessibilityHint={
                      index === routinesField.state.value.length - 1
                        ? "Already at bottom"
                        : "Moves routine later in the list"
                    }
                  >
                    <ChevronDown />
                  </Button>
                </View>

                <Separator orientation="vertical" />

                <FieldGroup className="flex-1">
                  <form.Field name={`routines[${index}].name`}>
                    {(field) => (
                      <Field>
                        <FieldLabel nativeID={`${field.name}-label`}>
                          Name
                        </FieldLabel>
                        <Input
                          value={field.state.value}
                          onChangeText={(value) => field.handleChange(value)}
                          placeholder="Name"
                          nativeID={field.name}
                          accessibilityHint="Enter the routine name"
                          accessibilityLabelledBy={`${field.name}-label`}
                          aria-labelledby={`${field.name}-label`}
                          aria-describedby={`${field.name}-error`}
                          aria-invalid={!field.state.meta.isValid}
                        />
                        <FieldError
                          nativeID={`${field.name}-error`}
                          errors={field.state.meta.errors}
                        />
                      </Field>
                    )}
                  </form.Field>

                  <form.Field name={`routines[${index}].duration`}>
                    {(field) => (
                      <Field>
                        <FieldLabel nativeID={`${field.name}-label`}>
                          Minutes
                        </FieldLabel>
                        <Input
                          keyboardType="number-pad"
                          value={String(field.state.value ?? "")}
                          onChangeText={(value) => {
                            const parsed = Number.parseInt(value, 10);
                            field.handleChange(
                              Number.isNaN(parsed) ? 0 : parsed,
                            );
                          }}
                          placeholder="0"
                          nativeID={field.name}
                          accessibilityHint="Enter the duration in minutes"
                          accessibilityLabelledBy={`${field.name}-label`}
                          aria-labelledby={`${field.name}-label`}
                          aria-describedby={`${field.name}-error`}
                          aria-invalid={!field.state.meta.isValid}
                        />
                        <FieldError
                          nativeID={`${field.name}-error`}
                          errors={field.state.meta.errors}
                        />
                      </Field>
                    )}
                  </form.Field>

                  <Button
                    size="sm"
                    variant="neutral"
                    className="w-full"
                    onPress={() => {
                      routinesField.removeValue(index);
                    }}
                    disabled={routinesField.state.value.length <= 2}
                    accessibilityLabel={`Remove routine ${index + 1}`}
                    accessibilityHint={
                      routinesField.state.value.length <= 2
                        ? "At least two routines are required"
                        : "Removes this routine"
                    }
                  >
                    <Trash2 size={16} />
                    <Text>Remove</Text>
                  </Button>
                </FieldGroup>
              </View>
            ))}

            <FieldError errors={routinesField.state.meta.errors} />

            <Separator />

            <Button
              variant="noShadow"
              onPress={() => {
                routinesField.insertValue(
                  routinesField.state.value.length,
                  createRoutine(),
                );
              }}
              accessibilityLabel="Add routine"
              accessibilityHint="Adds a new routine entry"
            >
              <Plus size={16} />
              <Text>Add routine</Text>
            </Button>
          </View>
        )}
      </form.Field>
    );
  },
});
