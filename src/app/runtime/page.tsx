import type { Metadata } from "next";

import { RuntimeResilienceStage } from "@/features/resilience/components/runtime-resilience-stage";

export const metadata: Metadata = {
  title: "Laisen Runtime",
  description: "Runtime resilience controls module page.",
};

export default function RuntimePage() {
  return <RuntimeResilienceStage />;
}
