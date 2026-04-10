import type { Metadata } from "next";

import { RuntimeStateMachineStage } from "@/features/runtime/components/runtime-state-machine-stage";
import { RuntimeAiPlanStage } from "@/features/ai-planning/components/runtime-ai-plan-stage";

export const metadata: Metadata = {
  title: "Laisen Runtime",
  description: "Runtime integration module page.",
};

export default function RuntimePage() {
  return (
    <>
      <RuntimeStateMachineStage />
      <RuntimeAiPlanStage />
    </>
  );
}
