import type { Config, Routine } from "./schema";

const DEFAULT_ROUTINES = [
  { name: "Sit", duration: 45 },
  { name: "Stand", duration: 15 },
] as const;

export function createRoutineId() {
  return `routine-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createRoutine(
  input: Partial<Pick<Routine, "name" | "duration">> = {},
): Routine {
  return {
    id: createRoutineId(),
    name: input.name ?? "",
    duration: input.duration ?? 1,
  };
}

export function createDefaultRoutines(): Routine[] {
  return DEFAULT_ROUTINES.map((routine) => createRoutine(routine));
}

export function createDefaultConfig(): Config {
  return {
    routines: createDefaultRoutines(),
  };
}
