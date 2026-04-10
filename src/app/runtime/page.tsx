import type { Metadata } from "next";

import { RuntimeProofStage } from "@/features/proof/components/runtime-proof-stage";

export const metadata: Metadata = {
  title: "Laisen Runtime",
  description: "Runtime proof persistence module page.",
};

export default function RuntimePage() {
  return <RuntimeProofStage />;
}
