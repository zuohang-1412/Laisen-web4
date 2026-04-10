import type { Decision } from "@/features/runtime/schema/runtime-schema";
import { buildExecutionMoves } from "@/features/runtime/services/mock-runtime-services";

export function resolveExecutionPlan(decision: Decision) {
  return buildExecutionMoves(decision);
}
