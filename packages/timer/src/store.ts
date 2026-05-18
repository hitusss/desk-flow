import type {
  TimerConfigStore,
  TimerEventName,
  TimerEventPayload,
  TimerEventReason,
  TimerListener,
  TimerReconcileResult,
  TimerSnapshot,
  TimerState,
  TimerStatus,
} from "./types";

import { create } from "zustand";

import { ConfigSchema } from "@repo/config";
import type { Config, Routine } from "@repo/config";

type TimerStateUpdate = Partial<TimerSnapshot>;

const EVENT_NAMES: TimerEventName[] = [
  "onRoutineComplete",
  "onRoutineChange",
  "onTimerStart",
  "onTimerReset",
  "onTimerPause",
  "onTimerResume",
];

const UNINITIALIZED_SNAPSHOT: TimerSnapshot = {
  status: "uninitialized",
  currentRoutineId: undefined,
  currentRoutineIndex: undefined,
  currentRoutine: undefined,
  remainingSeconds: undefined,
  totalSeconds: undefined,
  currentRoutineStartedAtMs: undefined,
  currentRoutineEndsAtMs: undefined,
  completedAtMs: undefined,
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
    currentRoutineStartedAtMs: state.currentRoutineStartedAtMs,
    currentRoutineEndsAtMs: state.currentRoutineEndsAtMs,
    completedAtMs: state.completedAtMs,
  };
}

function getRoutineAtIndex(config: Config, index: number) {
  const routine = config.routines[index];

  if (!routine) {
    throw new Error("Config must contain at least one routine.");
  }

  return routine;
}

function getIdleSnapshot(
  routine: Routine,
  currentRoutineIndex: number,
  totalSeconds = toSeconds(routine.duration),
): TimerSnapshot {
  return {
    status: "idle",
    currentRoutineId: routine.id,
    currentRoutineIndex,
    currentRoutine: routine,
    remainingSeconds: totalSeconds,
    totalSeconds,
    currentRoutineStartedAtMs: undefined,
    currentRoutineEndsAtMs: undefined,
    completedAtMs: undefined,
  };
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

  return getIdleSnapshot(currentRoutine, currentRoutineIndex);
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
    a.totalSeconds === b.totalSeconds &&
    a.currentRoutineStartedAtMs === b.currentRoutineStartedAtMs &&
    a.currentRoutineEndsAtMs === b.currentRoutineEndsAtMs &&
    a.completedAtMs === b.completedAtMs
  );
}

function getRemainingSeconds(endsAtMs: number, now: number) {
  return Math.max(Math.ceil((endsAtMs - now) / 1000), 0);
}

function getRunningSnapshot(
  state: Pick<
    TimerSnapshot,
    | "currentRoutineId"
    | "currentRoutineIndex"
    | "currentRoutine"
    | "remainingSeconds"
    | "totalSeconds"
  >,
  now: number,
): TimerSnapshot {
  const remainingSeconds = state.remainingSeconds;

  if (
    state.currentRoutineId === undefined ||
    state.currentRoutineIndex === undefined ||
    state.currentRoutine === undefined ||
    remainingSeconds === undefined ||
    state.totalSeconds === undefined
  ) {
    return UNINITIALIZED_SNAPSHOT;
  }

  return {
    status: "running",
    currentRoutineId: state.currentRoutineId,
    currentRoutineIndex: state.currentRoutineIndex,
    currentRoutine: state.currentRoutine,
    remainingSeconds,
    totalSeconds: state.totalSeconds,
    currentRoutineStartedAtMs: now,
    currentRoutineEndsAtMs: now + remainingSeconds * 1000,
    completedAtMs: undefined,
  };
}

function getReconciledRunningSnapshot(
  state: TimerSnapshot,
  now: number,
): TimerSnapshot {
  if (state.currentRoutineEndsAtMs === undefined) {
    return state;
  }

  const remainingSeconds = getRemainingSeconds(state.currentRoutineEndsAtMs, now);

  if (remainingSeconds === 0) {
    return {
      ...state,
      status: "completed",
      remainingSeconds: 0,
      currentRoutineEndsAtMs: undefined,
      completedAtMs: now,
    };
  }

  return {
    ...state,
    remainingSeconds,
  };
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

    const reconcile = (now = Date.now()): TimerReconcileResult => {
      const state = getSnapshot(get());

      if (state.status !== "running") {
        return {
          didUpdate: false,
          didCompleteRoutine: false,
          snapshot: state,
        };
      }

      const nextSnapshot = getReconciledRunningSnapshot(state, now);
      if (isSameSnapshot(nextSnapshot, state)) {
        return {
          didUpdate: false,
          didCompleteRoutine: false,
          snapshot: state,
        };
      }

      setSnapshot(nextSnapshot);
      const didCompleteRoutine = nextSnapshot.status === "completed";

      if (didCompleteRoutine) {
        emit("onRoutineComplete", nextSnapshot, "complete");
      }

      return {
        didUpdate: true,
        didCompleteRoutine,
        snapshot: nextSnapshot,
      };
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
      const snapshot = setSnapshot(
        getIdleSnapshot(target.currentRoutine, target.currentRoutineIndex),
      );

      emit("onRoutineChange", snapshot, reason);
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

      emit("onTimerReset", snapshot, reason);
      if (previousRoutineId !== snapshot.currentRoutineId) {
        emit("onRoutineChange", snapshot, reason);
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
      start: () => {
        const state = get();
        if (!get().canStart()) {
          throwInvalidAction("start", state.status);
        }

        const snapshot = setSnapshot(
          getRunningSnapshot(getSnapshot(get()), Date.now()),
        );
        emit("onTimerStart", snapshot, "start");
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

        const { snapshot } = reconcile(Date.now());
        if (snapshot.status === "completed") {
          throwInvalidAction("pause", snapshot.status);
        }

        const pausedSnapshot = setSnapshot({
          status: "paused",
          currentRoutineEndsAtMs: undefined,
        });
        emit("onTimerPause", pausedSnapshot, "pause");
      },
      resume: () => {
        const state = get();
        if (!get().canResume()) {
          throwInvalidAction("resume", state.status);
        }

        const snapshot = setSnapshot(
          getRunningSnapshot(getSnapshot(get()), Date.now()),
        );
        emit("onTimerResume", snapshot, "resume");
      },
      next: () => {
        setRoutine("next", 1);
      },
      previous: () => {
        setRoutine("previous", -1);
      },
      reconcile,
      onRoutineComplete: (listener) => {
        const eventListeners = listeners.get("onRoutineComplete");

        eventListeners?.add(listener);

        return () => {
          eventListeners?.delete(listener);
        };
      },
      onRoutineChange: (listener) => {
        const eventListeners = listeners.get("onRoutineChange");

        eventListeners?.add(listener);

        return () => {
          eventListeners?.delete(listener);
        };
      },
      onTimerStart: (listener) => {
        const eventListeners = listeners.get("onTimerStart");

        eventListeners?.add(listener);

        return () => {
          eventListeners?.delete(listener);
        };
      },
      onTimerReset: (listener) => {
        const eventListeners = listeners.get("onTimerReset");

        eventListeners?.add(listener);

        return () => {
          eventListeners?.delete(listener);
        };
      },
      onTimerPause: (listener) => {
        const eventListeners = listeners.get("onTimerPause");

        eventListeners?.add(listener);

        return () => {
          eventListeners?.delete(listener);
        };
      },
      onTimerResume: (listener) => {
        const eventListeners = listeners.get("onTimerResume");

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
      emit("onRoutineChange", snapshot, "init");
      return;
    }

    const currentRoutineIndex = config.routines.findIndex(
      (routine) => routine.id === state.currentRoutineId,
    );

    if (currentRoutineIndex === -1) {
      const nextSnapshot = getInitializedSnapshot(config);
      const previousRoutineId = state.currentRoutineId;

      useTimerStore.setState(nextSnapshot);
      emit("onTimerReset", nextSnapshot, "config-delete");
      if (previousRoutineId !== nextSnapshot.currentRoutineId) {
        emit("onRoutineChange", nextSnapshot, "config-delete");
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

    let nextSnapshot: TimerSnapshot;
    if (state.status === "running") {
      const reconciledSnapshot = getReconciledRunningSnapshot(getSnapshot(state), Date.now());
      const elapsedSeconds = Math.max(
        (reconciledSnapshot.totalSeconds ?? totalSeconds) -
          (reconciledSnapshot.remainingSeconds ?? totalSeconds),
        0,
      );
      const remainingSeconds = Math.max(totalSeconds - elapsedSeconds, 0);

      nextSnapshot =
        remainingSeconds === 0
          ? {
              ...reconciledSnapshot,
              status: "completed",
              currentRoutineId: currentRoutine.id,
              currentRoutineIndex,
              currentRoutine,
              remainingSeconds: 0,
              totalSeconds,
              currentRoutineEndsAtMs: undefined,
              completedAtMs: Date.now(),
            }
          : {
              ...reconciledSnapshot,
              status: "running",
              currentRoutineId: currentRoutine.id,
              currentRoutineIndex,
              currentRoutine,
              remainingSeconds,
              totalSeconds,
              currentRoutineEndsAtMs: Date.now() + remainingSeconds * 1000,
              completedAtMs: undefined,
            };
    } else if (state.status === "paused") {
      const elapsedSeconds = Math.max(
        (state.totalSeconds ?? totalSeconds) - (state.remainingSeconds ?? totalSeconds),
        0,
      );
      const remainingSeconds = Math.max(totalSeconds - elapsedSeconds, 0);

      nextSnapshot = {
        ...getSnapshot(state),
        currentRoutineId: currentRoutine.id,
        currentRoutineIndex,
        currentRoutine,
        remainingSeconds,
        totalSeconds,
      };
    } else if (state.status === "completed") {
      nextSnapshot = {
        ...getSnapshot(state),
        currentRoutineId: currentRoutine.id,
        currentRoutineIndex,
        currentRoutine,
        remainingSeconds: 0,
        totalSeconds,
      };
    } else {
      nextSnapshot = getIdleSnapshot(currentRoutine, currentRoutineIndex, totalSeconds);
    }

    if (isSameSnapshot(nextSnapshot, getSnapshot(state))) {
      return;
    }

    useTimerStore.setState(nextSnapshot);

    if (hasIndexChanged) {
      emit("onRoutineChange", nextSnapshot, "config-update");
    }
    if (nextSnapshot.status === "completed" && state.status !== "completed") {
      emit("onRoutineComplete", nextSnapshot, "config-update");
    }
  };

  unsubscribe = configStore.subscribe(syncFromConfig);

  return useTimerStore;
}
