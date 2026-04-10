import { assign, setup } from "xstate";

import { createEmptyRuntimeContext, type RuntimeContext, type RuntimeProfile } from "@/features/runtime/schema/runtime-schema";
import {
  appendEvent,
  buildDecisionRead,
  buildExecutionMoves,
  buildFounderRead,
  buildSignalRead,
} from "@/features/runtime/services/mock-runtime-services";

type RuntimeEvent =
  | { type: "runtime.start"; intent: string; profile: RuntimeProfile }
  | { type: "runtime.reset" };

const RUNTIME_DELAYS = {
  founderSpawnMs: 600,
  signalIntakeMs: 800,
  aiDecisionMs: 1000,
  autonomousExecutionMs: 1800,
} as const;

function startContext(intent: string, profile: RuntimeProfile): RuntimeContext {
  const base = createEmptyRuntimeContext();
  return {
    ...base,
    intentInput: intent,
    runtimeProfile: profile,
  };
}

export const runtimeMachine = setup({
  types: {
    context: {} as RuntimeContext,
    events: {} as RuntimeEvent,
  },
  actions: {
    startRuntime: assign(({ event }) => {
      if (event.type !== "runtime.start") return {};
      return startContext(event.intent, event.profile);
    }),
    applyFounderSpawn: assign(({ context }) => ({
      runtimeStage: "founder_spawn" as const,
      founderRead: buildFounderRead(context.intentInput),
      events: appendEvent(context, "Founder spawned", "Founder agent initialized for this mission."),
    })),
    applySignalIntake: assign(({ context }) => {
      const signalRead = buildSignalRead(context.intentInput);
      return {
        runtimeStage: "signal_intake" as const,
        signalRead,
        events: appendEvent(context, "Signal loaded", signalRead),
      };
    }),
    applyDecision: assign(({ context }) => ({
      runtimeStage: "ai_decision" as const,
      decisionRead: buildDecisionRead(context.signalRead),
      events: appendEvent(context, "Decision formed", "Mandate and execution plan were prepared."),
    })),
    applyExecution: assign(({ context }) => ({
      runtimeStage: "autonomous_execution" as const,
      executionMoves: buildExecutionMoves(),
      events: appendEvent(context, "Execution started", "Runtime entered autonomous execution."),
    })),
    applyCompleted: assign(({ context }) => ({
      runtimeStage: "execution_completed" as const,
      events: appendEvent(context, "Execution completed", "Run finished with deterministic state-machine flow."),
    })),
    resetRuntime: assign(() => createEmptyRuntimeContext()),
  },
}).createMachine({
  id: "runtime-machine",
  initial: "idle",
  context: createEmptyRuntimeContext(),
  states: {
    idle: {
      on: {
        "runtime.start": { target: "founderSpawn", actions: "startRuntime" },
        "runtime.reset": { target: "idle", actions: "resetRuntime" },
      },
    },
    founderSpawn: {
      entry: "applyFounderSpawn",
      after: {
        [RUNTIME_DELAYS.founderSpawnMs]: "signalIntake",
      },
      on: {
        "runtime.reset": { target: "idle", actions: "resetRuntime" },
      },
    },
    signalIntake: {
      entry: "applySignalIntake",
      after: {
        [RUNTIME_DELAYS.signalIntakeMs]: "aiDecision",
      },
      on: {
        "runtime.reset": { target: "idle", actions: "resetRuntime" },
      },
    },
    aiDecision: {
      entry: "applyDecision",
      after: {
        [RUNTIME_DELAYS.aiDecisionMs]: "autonomousExecution",
      },
      on: {
        "runtime.reset": { target: "idle", actions: "resetRuntime" },
      },
    },
    autonomousExecution: {
      entry: "applyExecution",
      after: {
        [RUNTIME_DELAYS.autonomousExecutionMs]: "executionCompleted",
      },
      on: {
        "runtime.reset": { target: "idle", actions: "resetRuntime" },
      },
    },
    executionCompleted: {
      entry: "applyCompleted",
      on: {
        "runtime.reset": { target: "idle", actions: "resetRuntime" },
      },
    },
  },
});
