export type DemoScenario = {
  id: string;
  label: string;
  intent: string;
};

export const demoScenarios: DemoScenario[] = [
  {
    id: "retail-agent",
    label: "Retail Signal Loop",
    intent:
      "Launch an AI founder that detects a cross-border retail demand spike and autonomously allocate execution toward a premium pilot campaign.",
  },
  {
    id: "label-network",
    label: "Label Network Expansion",
    intent:
      "Spawn an AI founder that identifies a labeling supply chain bottleneck and starts execution to secure a fast-response vendor corridor.",
  },
  {
    id: "payment-rail",
    label: "Payment Rail Activation",
    intent:
      "Wake an AI founder that sees rising merchant demand for faster settlement and proactively pushes an execution move to open a compliant payment rail pilot.",
  },
];
