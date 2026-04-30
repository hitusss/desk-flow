import type {
  TimerConfigStore,
  TimerEventName,
  TimerEventPayload,
  TimerEventReason,
  TimerListener,
  TimerSnapshot,
  TimerState,
  TimerStatus,
} from "./types";

import { create } from "zustand";

import { ConfigSchema } from "@repo/config";
import type { Config } from "@repo/config";

type TimerStateUpdate = Partial<TimerSnapshot>;

const EVENT_NAMES: TimerEventName[] = [
  "onComplete",
  "onNew",
  "onTick",
  "onStart",
  "onReset",
  "onPause",
  "onResume",
];

const UNINITIALIZED_SNAPSHOT: TimerSnapshot = {
  status: "uninitialized",
  currentRoutineId: undefined,
  currentRoutineIndex: undefined,
  currentRoutine: undefined,
  remainingSeconds: undefined,
  totalSeconds: undefined,
};

function toSeconds(minutes: number) {
  return minutes * 60;
}

function getSnapshot(state: TimerState): TimerSnapshot {
  return {
    status: state.status,
    currentRoutineId: state.currentRoutineId,
    currentRoutineIndex: state.currentRoutineIndex,
    currentRoutine: state.currentRoutine,
    remainingSeconds: state.remainingSeconds,
    totalSeconds: state.totalSeconds,
  };
}

function getRoutineAtIndex(config: Config, index: number) {
  const routine = config.routines[index];

  if (!routine) {
    throw new Error("Config must contain at least one routine.");
  }

  return routine;
}

function getInitializedSnapshot(
  config: Config,
  routineId = config.routines[0]?.id,
): TimerSnapshot {
  const routineIndex = config.routines.findIndex(
    (routine) => routine.id === routineId,
  );
  const currentRoutineIndex = routineIndex === -1 ? 0 : routineIndex;
  const currentRoutine = getRoutineAtIndex(config, currentRoutineIndex);
  const totalSeconds = toSeconds(currentRoutine.duration);

  return {
    status: "idle",
    currentRoutineId: currentRoutine.id,
    currentRoutineIndex,
    currentRoutine,
    remainingSeconds: totalSeconds,
    totalSeconds,
  };
}

function toEventPayload(
  snapshot: TimerSnapshot,
  reason: TimerEventReason,
): TimerEventPayload {
  return {
    ...snapshot,
    reason,
  };
}

function throwInvalidAction(action: string, status: TimerStatus) {
  throw new Error(`Cannot ${action} timer when status is "${status}".`);
}

function assertPositiveInteger(seconds: number) {
  if (Number.isInteger(seconds) && seconds > 0) {
    return;
  }

  throw new Error("Tick seconds must be a positive integer.");
}

function emitListeners(
  listeners: Set<TimerListener>,
  event: TimerEventPayload,
) {
  listeners.forEach((listener) => {
    try {
      listener(event);
    } catch {
      // Listener failures must not roll back timer state.
    }
  });
}

function getRoutineAtOffset(config: Config, index: number, offset: number) {
  const nextIndex =
    (index + offset + config.routines.length) % config.routines.length;
  const currentRoutine = getRoutineAtIndex(config, nextIndex);

  return {
    currentRoutineIndex: nextIndex,
    currentRoutine,
  };
}

function parseConfig(config: unknown) {
  return ConfigSchema.safeParse(config);
}

function isSameSnapshot(a: TimerSnapshot, b: TimerSnapshot) {
  return (
    a.status === b.status &&
    a.currentRoutineId === b.currentRoutineId &&
    a.currentRoutineIndex === b.currentRoutineIndex &&
    a.currentRoutine === b.currentRoutine &&
    a.remainingSeconds === b.remainingSeconds &&
    a.totalSeconds === b.totalSeconds
  );
}

export function createTimerStore(configStore: TimerConfigStore) {
  const listeners = new Map<TimerEventName, Set<TimerListener>>(
    EVENT_NAMES.map((eventName) => [eventName, new Set<TimerListener>()]),
  );
  let unsubscribe = () => {};

  const emit = (
    eventName: TimerEventName,
    snapshot: TimerSnapshot,
    reason: TimerEventReason,
  ) => {
    emitListeners(
      listeners.get(eventName) ?? new Set<TimerListener>(),
      toEventPayload(snapshot, reason),
    );
  };

  const useTimerStore = create<TimerState>((set, get) => {
    const initialConfig = parseConfig(configStore.getState().config);
    const initialState = initialConfig.success
      ? getInitializedSnapshot(initialConfig.data)
      : UNINITIALIZED_SNAPSHOT;

    const setSnapshot = (snapshot: TimerSnapshot | TimerStateUpdate) => {
      set(snapshot);
      return getSnapshot(get());
    };

    const setRoutine = (
      reason: Extract<TimerEventReason, "next" | "previous">,
      offset: -1 | 1,
    ) => {
      const state = get();
      if (!(reason === "next" ? get().canNext() : get().canPrevious())) {
        throwInvalidAction(reason, state.status);
      }

      const configResult = parseConfig(configStore.getState().config);
      if (!configResult.success || state.currentRoutineIndex === undefined) {
        return setSnapshot(UNINITIALIZED_SNAPSHOT);
      }

      const target = getRoutineAtOffset(
        configResult.data,
        state.currentRoutineIndex,
        offset,
      );
      const totalSeconds = toSeconds(target.currentRoutine.duration);

      const snapshot = setSnapshot({
        status: "idle",
        currentRoutineId: target.currentRoutine.id,
        currentRoutineIndex: target.currentRoutineIndex,
        currentRoutine: target.currentRoutine,
        remainingSeconds: totalSeconds,
        totalSeconds,
      });

      emit("onNew", snapshot, reason);
      return snapshot;
    };

    const resetToInitial = (
      reason: Extract<TimerEventReason, "reset" | "config-delete">,
    ) => {
      const configResult = parseConfig(configStore.getState().config);
      if (!configResult.success) {
        return setSnapshot(UNINITIALIZED_SNAPSHOT);
      }

      const previousRoutineId = get().currentRoutineId;
      const snapshot = setSnapshot(getInitializedSnapshot(configResult.data));

      emit("onReset", snapshot, reason);
      if (previousRoutineId !== snapshot.currentRoutineId) {
        emit("onNew", snapshot, reason);
      }

      return snapshot;
    };

    return {
      ...initialState,
      getFormatedTimer: () => {
        const { remainingSeconds } = get();

        if (remainingSeconds === undefined) {
          return "--:--";
        }

        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
      },
      getProgress: () => {
        const { remainingSeconds, totalSeconds } = get();

        if (
          remainingSeconds === undefined ||
          totalSeconds === undefined ||
          totalSeconds === 0
        ) {
          return 0;
        }

        return Math.min(
          Math.max((totalSeconds - remainingSeconds) / totalSeconds, 0),
          1,
        );
      },
      getStatusLabel: () => {
        switch (get().status) {
          case "idle":
            return "Ready";
          case "running":
            return "Running";
          case "paused":
            return "Paused";
          case "completed":
            return "Completed";
          default:
            return "Unavailable";
        }
      },
      canStart: () => get().status === "idle",
      canReset: () => {
        const state = get();

        return (
          state.status !== "uninitialized" &&
          !(
            state.status === "idle" &&
            state.currentRoutineIndex === 0 &&
            state.currentRoutineId !== undefined &&
            state.remainingSeconds !== undefined &&
            state.remainingSeconds === state.totalSeconds
          )
        );
      },
      canPause: () => get().status === "running",
      canResume: () => get().status === "paused",
      canNext: () => get().status !== "uninitialized",
      canPrevious: () => get().status !== "uninitialized",
      canTick: () => get().status === "running",
      start: () => {
        const state = get();
        if (!get().canStart()) {
          throwInvalidAction("start", state.status);
        }

        const snapshot = setSnapshot({ status: "running" });
        emit("onStart", snapshot, "start");
      },
      reset: () => {
        const state = get();
        if (!get().canReset()) {
          if (state.status === "uninitialized") {
            throwInvalidAction("reset", state.status);
          }

          throw new Error(
            "Cannot reset timer when it is already in the initial state.",
          );
        }

        const configResult = parseConfig(configStore.getState().config);
        if (!configResult.success) {
          throwInvalidAction("reset", "uninitialized");
        }

        resetToInitial("reset");
      },
      pause: () => {
        const state = get();
        if (!get().canPause()) {
          throwInvalidAction("pause", state.status);
        }

        const snapshot = setSnapshot({ status: "paused" });
        emit("onPause", snapshot, "pause");
      },
      resume: () => {
        const state = get();
        if (!get().canResume()) {
          throwInvalidAction("resume", state.status);
        }

        const snapshot = setSnapshot({ status: "running" });
        emit("onResume", snapshot, "resume");
      },
      next: () => {
        setRoutine("next", 1);
      },
      previous: () => {
        setRoutine("previous", -1);
      },
      tick: (seconds = 1) => {
        const state = get();
        if (!get().canTick()) {
          throwInvalidAction("tick", state.status);
        }
        assertPositiveInteger(seconds);

        const remainingSeconds = Math.max(
          (state.remainingSeconds ?? 0) - seconds,
          0,
        );
        const snapshot = setSnapshot({
          status: remainingSeconds === 0 ? "completed" : "running",
          remainingSeconds,
        });

        emit("onTick", snapshot, "tick");
        if (remainingSeconds === 0) {
          emit("onComplete", snapshot, "tick");
        }
      },
      onComplete: (listener) => {
        const eventListeners = listeners.get("onComplete");

        eventListeners?.add(listener);

        return () => {
          eventListeners?.delete(listener);
        };
      },
      onNew: (listener) => {
        const eventListeners = listeners.get("onNew");

        eventListeners?.add(listener);

        return () => {
          eventListeners?.delete(listener);
        };
      },
      onTick: (listener) => {
        const eventListeners = listeners.get("onTick");

        eventListeners?.add(listener);

        return () => {
          eventListeners?.delete(listener);
        };
      },
      onStart: (listener) => {
        const eventListeners = listeners.get("onStart");

        eventListeners?.add(listener);

        return () => {
          eventListeners?.delete(listener);
        };
      },
      onReset: (listener) => {
        const eventListeners = listeners.get("onReset");

        eventListeners?.add(listener);

        return () => {
          eventListeners?.delete(listener);
        };
      },
      onPause: (listener) => {
        const eventListeners = listeners.get("onPause");

        eventListeners?.add(listener);

        return () => {
          eventListeners?.delete(listener);
        };
      },
      onResume: (listener) => {
        const eventListeners = listeners.get("onResume");

        eventListeners?.add(listener);

        return () => {
          eventListeners?.delete(listener);
        };
      },
      destroy: () => {
        unsubscribe();
        listeners.forEach((eventListeners) => {
          eventListeners.clear();
        });
      },
    };
  });

  const syncFromConfig = () => {
    const configResult = parseConfig(configStore.getState().config);
    const state = useTimerStore.getState();

    if (!configResult.success) {
      if (state.status !== "uninitialized") {
        useTimerStore.setState(UNINITIALIZED_SNAPSHOT);
      }
      return;
    }

    const config = configResult.data;

    if (state.status === "uninitialized") {
      const snapshot = getInitializedSnapshot(config);
      useTimerStore.setState(snapshot);
      emit("onNew", snapshot, "init");
      return;
    }

    const currentRoutineIndex = config.routines.findIndex(
      (routine) => routine.id === state.currentRoutineId,
    );

    if (currentRoutineIndex === -1) {
      const nextSnapshot = getInitializedSnapshot(config);
      const previousRoutineId = state.currentRoutineId;

      useTimerStore.setState(nextSnapshot);
      emit("onReset", nextSnapshot, "config-delete");
      if (previousRoutineId !== nextSnapshot.currentRoutineId) {
        emit("onNew", nextSnapshot, "config-delete");
      }
      return;
    }

    const currentRoutine = getRoutineAtIndex(config, currentRoutineIndex);
    const totalSeconds = toSeconds(currentRoutine.duration);
    const hasDurationChanged = totalSeconds !== state.totalSeconds;
    const hasNameChanged = currentRoutine.name !== state.currentRoutine?.name;
    const hasIndexChanged = currentRoutineIndex !== state.currentRoutineIndex;

    if (!hasDurationChanged && !hasNameChanged && !hasIndexChanged) {
      return;
    }

    const elapsedSeconds = Math.max(
      (state.totalSeconds ?? totalSeconds) -
        (state.remainingSeconds ?? totalSeconds),
      0,
    );
    let nextStatus = state.status;
    let remainingSeconds = state.remainingSeconds ?? totalSeconds;

    if (state.status === "idle") {
      remainingSeconds = totalSeconds;
    } else if (state.status === "completed") {
      nextStatus = "idle";
      remainingSeconds = totalSeconds;
    } else {
      remainingSeconds = Math.max(totalSeconds - elapsedSeconds, 0);
      if (remainingSeconds === 0) {
        nextStatus = "completed";
      }
    }

    const nextSnapshot: TimerSnapshot = {
      status: nextStatus,
      currentRoutineId: currentRoutine.id,
      currentRoutineIndex,
      currentRoutine,
      remainingSeconds,
      totalSeconds,
    };

    if (isSameSnapshot(nextSnapshot, getSnapshot(state))) {
      return;
    }

    useTimerStore.setState(nextSnapshot);

    if (nextStatus === "completed" && state.status !== "completed") {
      emit("onComplete", nextSnapshot, "config-update");
    }
  };

  unsubscribe = configStore.subscribe(syncFromConfig);

  return useTimerStore;
}
