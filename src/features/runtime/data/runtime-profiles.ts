import type { RuntimeProfile } from "@/features/runtime/schema/runtime-schema";

export const runtimeProfiles: Array<{
  id: RuntimeProfile;
  label: string;
  description: string;
}> = [
  {
    id: "live",
    label: "Standard",
    description: "Live signal intake with standard deployment and release.",
  },
  {
    id: "safe_mode",
    label: "Safe mode",
    description: "Cached signal path for degraded network conditions.",
  },
  {
    id: "hard_fail",
    label: "Failure test",
    description: "Hard-stop path that keeps failure visible.",
  },
];
