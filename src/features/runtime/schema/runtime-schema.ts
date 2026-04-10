export type RuntimeProfile = "live";

export type RuntimeStage =
  | "idle"
  | "founder_spawn"
  | "signal_intake"
  | "ai_decision"
  | "autonomous_execution"
  | "execution_completed";

export type RuntimeEventItem = {
  id: string;
  label: string;
  detail: string;
  at: string;
};

export type RuntimeContext = {
  intentInput: string;
  runtimeProfile: RuntimeProfile;
  runtimeStage: RuntimeStage;
  founderRead: string;
  signalRead: string;
  decisionRead: string;
  executionMoves: string[];
  events: RuntimeEventItem[];
};

export function createEmptyRuntimeContext(): RuntimeContext {
  return {
    intentInput: "",
    runtimeProfile: "live",
    runtimeStage: "idle",
    founderRead: "Waiting for mission input.",
    signalRead: "No signal yet.",
    decisionRead: "No decision yet.",
    executionMoves: [],
    events: [],
  };
}
