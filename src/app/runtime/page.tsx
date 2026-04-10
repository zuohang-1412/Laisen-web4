import type { Metadata } from "next";

import { RuntimeAiPlanStage } from "@/features/ai-planning/components/runtime-ai-plan-stage";
import { RuntimeWalletNetworkStage } from "@/features/onchain/components/runtime-wallet-network-stage";
import { RuntimeProofStage } from "@/features/proof/components/runtime-proof-stage";
import { RuntimeStateMachineStage } from "@/features/runtime/components/runtime-state-machine-stage";

export const metadata: Metadata = {
  title: "Laisen Runtime",
  description: "Runtime integration module page.",
};

export default function RuntimePage() {
  return (
    <>
      <RuntimeStateMachineStage />
      <RuntimeAiPlanStage />
      <RuntimeWalletNetworkStage />
      <RuntimeProofStage />
    </>
  );
}
