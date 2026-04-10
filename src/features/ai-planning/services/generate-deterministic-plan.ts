import type { PlanResult } from "@/features/ai-planning/schema/plan-schema";

function sectorFromIntent(intent: string) {
  const normalized = intent.toLowerCase();
  if (normalized.includes("payment") || normalized.includes("settlement")) return "payment";
  if (normalized.includes("label")) return "labeling";
  if (normalized.includes("retail")) return "retail";
  return "market";
}

export function generateDeterministicPlan(intent: string): PlanResult {
  const sector = sectorFromIntent(intent);

  if (sector === "payment") {
    return {
      title: "Open settlement acceleration pilot",
      action: "Prepare a controlled settlement lane for priority merchants and release a small-scope execution pilot.",
      reason: "Settlement pressure is high and requires short-cycle execution validation.",
      riskLevel: "medium",
    };
  }

  if (sector === "labeling") {
    return {
      title: "Activate backup vendor corridor",
      action: "Route workload to faster-response labeling vendors and monitor throughput stability.",
      reason: "Capacity constraints are likely to block normal delivery flow.",
      riskLevel: "low",
    };
  }

  if (sector === "retail") {
    return {
      title: "Launch premium corridor test",
      action: "Start a constrained premium retail run and collect conversion and margin signals.",
      reason: "Demand spike suggests a short opportunity window.",
      riskLevel: "medium",
    };
  }

  return {
    title: "Run bounded execution validation",
    action: "Launch a small-scope execution run to validate signal quality and response latency.",
    reason: "A deterministic baseline is needed before scaling.",
    riskLevel: "low",
  };
}
