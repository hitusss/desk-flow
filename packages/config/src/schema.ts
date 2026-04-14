import { z } from "zod";

export const RoutineSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  duration: z.number().int().positive(),
});

export const RoutinesSchema = z.array(RoutineSchema).min(2).superRefine((routines, ctx) => {
  const routineIds = new Set<string>();

  routines.forEach((routine, index) => {
    if (!routineIds.has(routine.id)) {
      routineIds.add(routine.id);
      return;
    }

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Routine ids must be unique.",
      path: [index, "id"],
    });
  });
});

export const ConfigSchema = z.object({
  routines: RoutinesSchema,
});

export type Routine = z.infer<typeof RoutineSchema>;
export type Config = z.infer<typeof ConfigSchema>;
