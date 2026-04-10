import { spawnFounder as spawnFounderMock } from "@/features/runtime/services/mock-runtime-services";

export function spawnFounder(intent: string) {
  return spawnFounderMock(intent);
}
