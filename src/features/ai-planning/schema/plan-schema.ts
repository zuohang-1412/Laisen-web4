import { z } from "zod";

export const PlanRequestSchema = z.object({
  intent: z.string().min(20),
});

export const PlanResultSchema = z.object({
  title: z.string(),
  action: z.string(),
  reason: z.string(),
  riskLevel: z.enum(["low", "medium", "high"]),
});

export const PlanResponseSchema = z.object({
  ok: z.literal(true),
  source: z.enum(["live_ai", "deterministic_fallback"]),
  provider: z.string(),
  model: z.string(),
  plan: PlanResultSchema,
  error: z.string().optional(),
});

export type PlanResult = z.infer<typeof PlanResultSchema>;
