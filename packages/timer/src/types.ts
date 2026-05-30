import type { Config, Routine } from "@repo/config";

export type TimerStatus =
  | "uninitialized"
  | "idle"
  | "running"
  | "paused"
  | "completed";

export type TimerEventReason =
  | "init"
  | "start"
  | "complete"
  | "pause"
  | "resume"
  | "next"
  | "previous"
  | "reset"
  | "config-update"
  | "config-delete";

export interface TimerSnapshot {
  status: TimerStatus;
  currentRoutineId: string | undefined;
  currentRoutineIndex: number | undefined;
  currentRoutine: Routine | undefined;
  remainingSeconds: number | undefined;
  totalSeconds: number | undefined;
  currentRoutineStartedAtMs: number | undefined;
  currentRoutineEndsAtMs: number | undefined;
  completedAtMs: number | undefined;
}

export interface TimerEventPayload extends TimerSnapshot {
  reason: TimerEventReason;
}

export interface TimerReconcileResult {
  didUpdate: boolean;
  didCompleteRoutine: boolean;
  snapshot: TimerSnapshot;
}

export interface TimerState extends TimerSnapshot {
  getFormatedTimer: () => string;
  getProgress: () => number;
  getStatusLabel: () => string;
  canStart: () => boolean;
  canReset: () => boolean;
  canPause: () => boolean;
  canResume: () => boolean;
  canNext: () => boolean;
  canPrevious: () => boolean;
  start: () => void;
  reset: () => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  reconcile: (now?: number) => TimerReconcileResult;
  onRoutineComplete: (listener: TimerListener) => () => void;
  onRoutineChange: (listener: TimerListener) => () => void;
  onTimerStart: (listener: TimerListener) => () => void;
  onTimerReset: (listener: TimerListener) => () => void;
  onTimerPause: (listener: TimerListener) => () => void;
  onTimerResume: (listener: TimerListener) => () => void;
  destroy: () => void;
}

export type TimerListener = (event: TimerEventPayload) => void;

export interface TimerConfigStore {
  getState: () => { config?: Config };
  subscribe: (listener: () => void) => () => void;
}

export type TimerEventName =
  | "onRoutineComplete"
  | "onRoutineChange"
  | "onTimerStart"
  | "onTimerReset"
  | "onTimerPause"
  | "onTimerResume";
