import { z } from "zod";

export const RoutineSchema = z.object({
  name: z.string().min(1),
  duration: z.number().int().positive(),
});

export const RoutinesSchema = z.array(RoutineSchema).min(2);

export const ConfigSchema = z.object({
  routines: RoutinesSchema,
});

export type Routine = z.infer<typeof RoutineSchema>;
export type Config = z.infer<typeof ConfigSchema>;
