import { z } from "zod";

export const PositionSchema = z.object({
  name: z.string().min(1),
  duration: z.number().int().positive(),
});

export const PositionsSchema = z.array(PositionSchema).min(2);

export const ConfigSchema = z.object({
  positions: PositionsSchema,
});

export type Position = z.infer<typeof PositionSchema>;
export type Config = z.infer<typeof ConfigSchema>;
