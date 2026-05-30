import type { Theme } from "@repo/config";

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

const DEFAULT_ROUTINES = createDefaultRoutines();

export default function Route() {
  const setConfig = useConfigStore((store) => store.set);

  const form = useAppForm({
    ...configFormOpts,
    defaultValues: {
      theme: "system" as Theme,
      routines: DEFAULT_ROUTINES,
    },
    onSubmit: async ({ value }) => {
      setConfig(value);
    },
  });

  return (
    <PatternBackground>
      <SafeAreaView>
        <ScrollView contentContainerClassName="gap-4 px-4 py-8">
          <View>
            <Text variant="h1" className="text-left">
              Welcome to Desk Flow
            </Text>
            <Text variant="small">
              Desk Flow helps you build a healthier work routine, effortlessly.
            </Text>
          </View>

          <Card>
            <CardHeader>
              <CardTitle>Routines</CardTitle>
              <CardDescription>
                Add your routine and adjust the time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RoutineEditor form={form} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>App preferences</CardTitle>
              <CardDescription>
                General app-level options and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AppPreferencesEditor form={form} />
            </CardContent>
          </Card>

          <Button onPress={() => form.handleSubmit()}>
            <Text>Finish setup</Text>
          </Button>
        </ScrollView>
      </SafeAreaView>
    </PatternBackground>
  );
}
