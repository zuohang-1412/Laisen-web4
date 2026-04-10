import type { RuntimeProfile } from "@/features/runtime/schema/runtime-schema";
import { intakeSignal } from "@/features/runtime/services/mock-runtime-services";

export function resolveSignal(intent: string, profile: RuntimeProfile) {
  if (profile === "hard_fail") {
    throw new Error("Live signal resolver failed and no safe fallback was permitted.");
  }

  return intakeSignal(intent, profile);
}
