import type { Theme } from "@repo/config";

import Constants from "expo-constants";
import { TriangleAlert } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createDefaultRoutines } from "@repo/config";

import { AppPreferencesEditor } from "@/components/app-preferences-editor";
import { PatternBackground } from "@/components/pattern-background";
import { RoutineEditor } from "@/components/routine-editor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useConfigStore } from "@/lib/config";
import { configFormOpts, useAppForm } from "@/lib/config-form";

export default function Route() {
  const config = useConfigStore((store) => store.config);
  const setConfig = useConfigStore((store) => store.set);

  const defaultValues = {
    theme: config?.theme ?? ("system" as Theme),
    routines: config?.routines ?? createDefaultRoutines(),
  };

  const form = useAppForm({
    ...configFormOpts,
    defaultValues,
    onSubmit: async ({ value }) => {
      setConfig(value);
      form.reset(value);
    },
  });

  return (
    <PatternBackground>
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerClassName="gap-4 px-4 py-6">
          <Card>
            <CardHeader>
              <CardTitle>Routine setup</CardTitle>
              <CardDescription>
                Saving routine changes may adjust the current timer if the
                active routine name, duration, or order changes.
              </CardDescription>
            </CardHeader>

            <CardContent className="gap-5">
              <RoutineEditor form={form} />

              <form.Subscribe
                selector={(state) => ({
                  canSubmit: state.canSubmit,
                  isDirty: state.isDirty,
                })}
              >
                {(state) => (
                  <View className="gap-3">
                    {state.isDirty ? (
                      <View className="rounded-base border-border bg-secondary-background flex-row gap-2 border-2 p-3">
                        <TriangleAlert size={18} />
                        <Text className="flex-1 text-sm leading-5">
                          You have unsaved routine changes.
                        </Text>
                      </View>
                    ) : null}

                    <View className="flex-row gap-3">
                      <Button
                        className="flex-1"
                        variant="neutral"
                        onPress={() => form.reset(defaultValues)}
                        disabled={!state.isDirty}
                        accessibilityLabel="Discard routine changes"
                        accessibilityHint="Resets the routine editor back to the last saved settings"
                      >
                        <Text>Discard</Text>
                      </Button>

                      <Button
                        className="flex-1"
                        onPress={() => void form.handleSubmit()}
                        disabled={!state.isDirty || !state.canSubmit}
                        accessibilityLabel="Save routine changes"
                        accessibilityHint="Saves the updated routine configuration"
                      >
                        <Text>Save changes</Text>
                      </Button>
                    </View>
                  </View>
                )}
              </form.Subscribe>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>App preferences</CardTitle>
              <CardDescription>
                General app-level options and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="gap-4">
              <AppPreferencesEditor form={form} autoSubmit />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
              <CardDescription>
                Desk Flow helps you move through healthier desk routines without
                losing your place.
              </CardDescription>
            </CardHeader>

            <CardContent className="gap-4">
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1 gap-1">
                  <Text className="font-medium">App version</Text>
                </View>
                <View className="rounded-base border-border bg-secondary-background border-2 px-2 py-1">
                  <Text className="text-sm">
                    {Constants.expoConfig?.version ?? "Local build"}
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </PatternBackground>
  );
}
