import type { RuntimeProfile } from "@/features/runtime/schema/runtime-schema";
import { buildEvidence } from "@/features/runtime/services/mock-runtime-services";

export function resolveEvidence(profile: RuntimeProfile) {
  return buildEvidence(profile);
}
