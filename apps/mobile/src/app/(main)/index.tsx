import {
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
} from "lucide-react-native";
import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { useConfigStore } from "@/lib/config";
import { useTimerStore } from "@/lib/timer";

export default function Route() {
  const routinesCount = useConfigStore(
    (store) => store.config?.routines.length ?? 0,
  );

  const status = useTimerStore((store) => store.status);
  const formattedTimer = useTimerStore((store) => store.getFormatedTimer());
  const progress = useTimerStore((store) => store.getProgress());
  const statusLabel = useTimerStore((store) => store.getStatusLabel());
  const currentRoutine = useTimerStore((store) => store.currentRoutine);
  const currentRoutineIndex = useTimerStore(
    (store) => store.currentRoutineIndex,
  );
  const totalSeconds = useTimerStore((store) => store.totalSeconds);

  const canStart = useTimerStore((store) => store.canStart());
  const canPause = useTimerStore((store) => store.canPause());
  const canResume = useTimerStore((store) => store.canResume());
  const canReset = useTimerStore((store) => store.canReset());
  const canPrevious = useTimerStore((store) => store.canPrevious());
  const canNext = useTimerStore((store) => store.canNext());

  const start = useTimerStore((store) => store.start);
  const pause = useTimerStore((store) => store.pause);
  const resume = useTimerStore((store) => store.resume);
  const reset = useTimerStore((store) => store.reset);
  const previous = useTimerStore((store) => store.previous);
  const next = useTimerStore((store) => store.next);

  useEffect(() => {
    return useTimerStore.getState().onComplete(() => {
      const timer = useTimerStore.getState();

      if (!timer.canNext()) {
        return;
      }

      timer.next();

      const nextTimer = useTimerStore.getState();
      if (nextTimer.canStart()) {
        nextTimer.start();
      }
    });
  }, []);

  useEffect(() => {
    if (status !== "running") {
      return;
    }

    const interval = setInterval(() => {
      const timer = useTimerStore.getState();

      if (timer.canTick()) {
        timer.tick();
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [status]);

  const progressPercent = Math.round(progress * 100);
  const primaryAction =
    status === "running"
      ? {
          label: "Pause",
          icon: Pause,
          onPress: pause,
          disabled: !canPause,
        }
      : status === "paused"
        ? {
            label: "Resume",
            icon: Play,
            onPress: resume,
            disabled: !canResume,
          }
        : status === "completed"
          ? {
              label: "Reset",
              icon: RotateCcw,
              onPress: reset,
              disabled: !canReset,
            }
          : {
              label: "Start",
              icon: Play,
              onPress: start,
              disabled: !canStart,
            };
  const PrimaryActionIcon = primaryAction.icon;

  return (
    <SafeAreaView>
      <View className="min-h-screen justify-center gap-4 px-4 py-8">
        <Card>
          <CardHeader>
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1 gap-1">
                <CardTitle>
                  {currentRoutine?.name ?? "Timer unavailable"}
                </CardTitle>
                <CardDescription>
                  {currentRoutineIndex !== undefined && routinesCount > 0
                    ? `Routine ${currentRoutineIndex + 1} of ${routinesCount}`
                    : "No routine available"}
                </CardDescription>
              </View>

              <View className="rounded-base border-border bg-main border-2 px-3 py-2">
                <Text className="text-main-foreground font-medium">
                  {statusLabel}
                </Text>
              </View>
            </View>
          </CardHeader>

          <CardContent className="gap-6">
            <View className="items-center gap-2">
              <Text className="font-heading text-6xl tracking-tight">
                {formattedTimer}
              </Text>
              <Text className="text-muted-foreground text-sm">
                {totalSeconds === undefined
                  ? "Set up your routine to start tracking time."
                  : `${progressPercent}% complete`}
              </Text>
            </View>

            <View className="rounded-base border-border bg-secondary-background h-4 overflow-hidden border-2">
              <View
                className="bg-main h-full"
                style={{ width: `${progress * 100}%` }}
              />
            </View>

            <Separator />

            <View className="gap-3">
              <View className="flex-row gap-3">
                <Button
                  variant="neutral"
                  size="icon"
                  onPress={previous}
                  disabled={!canPrevious}
                  accessibilityLabel="Previous routine"
                  accessibilityHint="Moves to the previous routine"
                >
                  <SkipBack size={18} />
                </Button>

                <Button
                  className="flex-1"
                  size="lg"
                  onPress={primaryAction.onPress}
                  disabled={primaryAction.disabled}
                  accessibilityLabel={primaryAction.label}
                  accessibilityHint={`${primaryAction.label}s the current timer`}
                >
                  <PrimaryActionIcon size={18} />
                  <Text>{primaryAction.label}</Text>
                </Button>

                <Button
                  variant="neutral"
                  size="icon"
                  onPress={next}
                  disabled={!canNext}
                  accessibilityLabel="Next routine"
                  accessibilityHint="Moves to the next routine"
                >
                  <SkipForward size={18} />
                </Button>
              </View>

              <Button
                variant="neutral"
                onPress={reset}
                disabled={!canReset}
                accessibilityLabel="Reset timer"
                accessibilityHint="Resets the timer back to the start of the current routine"
              >
                <RotateCcw size={16} />
                <Text>Reset timer</Text>
              </Button>
            </View>
          </CardContent>
        </Card>
      </View>
    </SafeAreaView>
  );
}
