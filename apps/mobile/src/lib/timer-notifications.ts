import * as Notifications from "expo-notifications";

import { useConfigStore } from "@/lib/config";
import { useTimerStore } from "@/lib/timer";

const CHANNEL_ID = "timer";

let completionNotificationId: string | undefined;
let unsubscribeTimerStore: (() => void) | undefined;
let hasInitializedNotifications = false;
let lastScheduledKey: string | undefined;

function getNextRoutineLabel(currentRoutineIndex: number | undefined) {
  const routines = useConfigStore.getState().config?.routines;

  if (!routines || routines.length === 0 || currentRoutineIndex === undefined) {
    return "the next routine";
  }

  const nextIndex = (currentRoutineIndex + 1) % routines.length;
  return routines[nextIndex]?.name ?? "the next routine";
}

async function cancelCompletionNotification() {
  if (!completionNotificationId) {
    lastScheduledKey = undefined;
    return;
  }

  const notificationId = completionNotificationId;
  completionNotificationId = undefined;
  lastScheduledKey = undefined;
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

async function ensureNotificationChannel() {
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: "Timer",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

async function syncCompletionNotification() {
  const timer = useTimerStore.getState();

  if (
    timer.status !== "running" ||
    timer.currentRoutineEndsAtMs === undefined ||
    timer.currentRoutineId === undefined
  ) {
    await cancelCompletionNotification();
    return;
  }

  const nextRoutineLabel = getNextRoutineLabel(timer.currentRoutineIndex);
  const scheduledKey = `${timer.currentRoutineId}:${timer.currentRoutineEndsAtMs}`;

  if (lastScheduledKey === scheduledKey) {
    return;
  }

  await cancelCompletionNotification();

  completionNotificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Routine complete",
      body: `Time to switch to ${nextRoutineLabel}.`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(timer.currentRoutineEndsAtMs),
      channelId: CHANNEL_ID,
    },
  });
  lastScheduledKey = scheduledKey;
}

export async function initializeTimerNotifications() {
  if (hasInitializedNotifications) {
    return;
  }

  hasInitializedNotifications = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  await ensureNotificationChannel();

  unsubscribeTimerStore = useTimerStore.subscribe((state) => {
    void syncCompletionNotification();

    if (state.status === "completed") {
      completionNotificationId = undefined;
      lastScheduledKey = undefined;
    }
  });

  await syncCompletionNotification();
}

export async function destroyTimerNotifications() {
  unsubscribeTimerStore?.();
  unsubscribeTimerStore = undefined;
  hasInitializedNotifications = false;
  await cancelCompletionNotification();
}
