import type { RuntimeProfile, SignalPayload } from "@/features/runtime/schema/runtime-schema";
import { buildDecision } from "@/features/runtime/services/mock-runtime-services";

export function resolveDecision(intent: string, signal: SignalPayload, profile: RuntimeProfile) {
  return buildDecision(intent, signal, profile);
}
