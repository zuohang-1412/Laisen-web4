import type { Metadata } from "next";

import { RuntimeStateMachineStage } from "@/features/runtime/components/runtime-state-machine-stage";

export const metadata: Metadata = {
  title: "Laisen Runtime",
  description: "Runtime state machine module page.",
};

export default function RuntimePage() {
  return <RuntimeStateMachineStage />;
}
