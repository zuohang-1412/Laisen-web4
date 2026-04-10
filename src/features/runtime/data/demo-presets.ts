import type { RuntimeProfile } from "@/features/runtime/schema/runtime-schema";

export type DemoPreset = {
  id: string;
  label: string;
  description: string;
  operatorNote: string;
  profile: RuntimeProfile;
  intent: string;
  recommended?: boolean;
};

export const demoPresets: DemoPreset[] = [
  {
    id: "judge-path",
    label: "Standard",
    description: "Live signal, standard deployment, and a clean release path.",
    operatorNote: "Use this path first.",
    profile: "live",
    recommended: true,
    intent:
      "Wake an AI founder that detects a cross-border retail demand spike and autonomously opens a premium merchant execution corridor across labeling and settlement operations.",
  },
  {
    id: "demo-safe",
    label: "Safe mode",
    description: "Cached signal path for unstable network or model conditions.",
    operatorNote: "Use this when live services are unreliable.",
    profile: "safe_mode",
    intent:
      "Spawn an AI founder that identifies a labeling supply chain bottleneck and safely reroutes execution using cached market evidence to secure a fast-response vendor corridor.",
  },
  {
    id: "failure-drill",
    label: "Failure test",
    description: "Intentional hard stop with visible failure state.",
    operatorNote: "Use this only to test failure handling.",
    profile: "hard_fail",
    intent:
      "Wake an AI founder that sees urgent merchant demand for accelerated settlement and attempts to trigger a live execution route, even if the signal resolver fails hard.",
  },
];

export const defaultDemoPreset =
  demoPresets.find((preset) => preset.recommended) ?? demoPresets[0];
