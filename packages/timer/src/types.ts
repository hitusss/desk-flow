import type { StoreApi, UseBoundStore } from "zustand";

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
  | "tick"
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
}

export interface TimerEventPayload extends TimerSnapshot {
  reason: TimerEventReason;
}

export interface TimerState extends TimerSnapshot {
  canStart: () => boolean;
  canReset: () => boolean;
  canPause: () => boolean;
  canResume: () => boolean;
  canNext: () => boolean;
  canPrevious: () => boolean;
  canTick: () => boolean;
  start: () => void;
  reset: () => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  tick: (seconds?: number) => void;
  onComplete: (listener: TimerListener) => () => void;
  onNew: (listener: TimerListener) => () => void;
  onTick: (listener: TimerListener) => () => void;
  onStart: (listener: TimerListener) => () => void;
  onReset: (listener: TimerListener) => () => void;
  onPause: (listener: TimerListener) => () => void;
  onResume: (listener: TimerListener) => () => void;
  destroy: () => void;
}

export type TimerListener = (event: TimerEventPayload) => void;

export interface TimerConfigStore {
  getState(): { config?: Config };
  subscribe(listener: () => void): () => void;
}

export type TimerEventName =
  | "onComplete"
  | "onNew"
  | "onTick"
  | "onStart"
  | "onReset"
  | "onPause"
  | "onResume";
