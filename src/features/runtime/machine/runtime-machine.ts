import { assign, setup } from "xstate";

import { appendEvent, progressExecutionMoves } from "@/features/runtime/services/mock-runtime-services";
import { resolveDecision } from "@/features/runtime/services/decision-service";
import { resolveEvidence } from "@/features/runtime/services/evidence-service";
import { resolveExecutionPlan } from "@/features/runtime/services/execution-service";
import { spawnFounder } from "@/features/runtime/services/founder-service";
import { resolveSignal } from "@/features/runtime/services/signal-service";
import {
  createEmptyRuntimeContext,
  type Decision,
  type RuntimeContext,
  type RuntimeProfile,
} from "@/features/runtime/schema/runtime-schema";

type RuntimeEvent =
  | { type: "runtime.start"; intent: string; profile: RuntimeProfile; plannedDecision?: Decision | null }
  | { type: "runtime.reset" }
  | { type: "wallet.connected" }
  | { type: "wallet.disconnected" }
  | { type: "network.ready" }
  | { type: "network.required" }
  | { type: "deployment.started" }
  | { type: "deployment.succeeded" }
  | { type: "deployment.failed"; error?: string }
  | { type: "deployment.fallback"; reason?: string }
  | { type: "mandate.approve" }
  | { type: "mandate.reject" }
  | { type: "override.open" }
  | { type: "override.redirect" }
  | { type: "override.abort" }
  | { type: "override.resume" };

const RUNTIME_DELAYS = {
  founderSpawnMs: 700,
  signalIntakeMs: 900,
  safeModeAdaptingMs: 900,
  aiDecisionMs: 1100,
  protocolDeployedMs: 260,
  autonomousExecutionMs: 4000,
  executionAdvancingMs: 2600,
  overrideRequestMs: 180,
  resumedExecutionMs: 1400,
  redirectedExecutionMs: 1400,
} as const;

function startContext(intent: string, profile: RuntimeProfile, plannedDecision?: Decision | null): RuntimeContext {
  const baseContext = createEmptyRuntimeContext();

  return {
    ...baseContext,
    intentInput: intent,
    runtimeProfile: profile,
    plannedDecision: plannedDecision ?? null,
    evidence: {
      ...baseContext.evidence,
      runtimeProfile: profile,
    },
  };
}

function resolveDecisionForRun(context: RuntimeContext): Decision | null {
  if (!context.signal) return null;

  if (context.plannedDecision) {
    return {
      ...context.plannedDecision,
      reason: context.plannedDecision.reason || context.signal.insight,
      expectedOutcome:
        context.plannedDecision.expectedOutcome ||
        "A released action with visible contract state and an auditable event trail.",
    };
  }

  return resolveDecision(context.intentInput, context.signal, context.runtimeProfile);
}

export const runtimeMachine = setup({
  types: {
    context: {} as RuntimeContext,
    events: {} as RuntimeEvent,
  },
  guards: {
    usesSafeMode: ({ context }) => context.runtimeProfile === "safe_mode",
    hasHardFailed: ({ context }) => context.runtimeStage === "hard_fail",
  },
  actions: {
    startRuntime: assign(({ event }) => {
      if (event.type !== "runtime.start") return {};
      return startContext(event.intent, event.profile, event.plannedDecision);
    }),
    applyFounderSpawn: assign(({ context }) => {
      const founder = spawnFounder(context.intentInput);
      return {
        founder,
        runtimeStage: "founder_spawn" as const,
        authority: { state: "founder_spawned" as const, percent: 34 },
        execution: {
          ...context.execution,
          events: appendEvent(context.execution.events, {
            label: "Founder spawned",
            detail: `${founder.name} is active and preparing the run.`,
            tone: "ai",
          }),
        },
      };
    }),
    applySignalIntake: assign(({ context }) => {
      if (context.runtimeProfile === "hard_fail") {
        return {
          runtimeStage: "hard_fail" as const,
          founder: {
            ...context.founder,
            state: "halted" as const,
            currentRead: "Signal lookup failed. No fallback path is available for this run.",
          },
          evidence: {
            ...context.evidence,
            provider: "GMI Cloud",
            model: "GLM-5",
            toolCall: "signal_resolver.live_query",
            schemaStatus: "failed" as const,
            fallbackMode: "hard_fail" as const,
            runtimeProfile: "hard_fail" as const,
            latencyMs: 1210,
            toolCalls: [
              {
                name: "founder_spawn",
                status: "done" as const,
                detail: "Founder profile generated and run state initialized.",
              },
              {
                name: "signal_resolver",
                status: "failed" as const,
                detail: "Live signal failed and no fallback path was allowed.",
              },
            ],
          },
          execution: {
            ...context.execution,
            status: "aborted" as const,
            events: appendEvent(context.execution.events, {
              label: "Signal failed",
              detail: "Signal lookup failed before a mandate could be prepared.",
              tone: "danger",
            }),
          },
        };
      }

      const signal = resolveSignal(context.intentInput, context.runtimeProfile);
      return {
        signal,
        runtimeStage: "signal_intake" as const,
        founder: {
          ...context.founder,
          state: "intaking" as const,
          currentRead: signal.insight,
        },
        execution: {
          ...context.execution,
          events: appendEvent(context.execution.events, {
            label: "Signal loaded",
            detail:
              signal.mode === "cached"
                ? `${signal.source} supplied a cached signal.`
                : `${signal.source} supplied a live signal.`,
            tone: signal.mode === "cached" ? "warning" : "neutral",
          }),
        },
      };
    }),
    applySafeModeAdapting: assign(({ context }) => ({
      runtimeStage: "safe_mode_adapting" as const,
      founder: {
        ...context.founder,
        state: "adapting" as const,
        currentRead: "Live signal is unavailable. Safe mode is using cached input.",
      },
      evidence: {
        ...context.evidence,
        fallbackMode: "safe_mode" as const,
        schemaStatus: "fallback" as const,
        runtimeProfile: "safe_mode" as const,
        toolCalls: [
          {
            name: "founder_spawn",
            status: "done" as const,
            detail: "Founder stayed active during degraded conditions.",
          },
          {
            name: "signal_resolver",
            status: "fallback" as const,
            detail: "Live signal unavailable. Switched to cached input.",
          },
        ],
      },
      execution: {
        ...context.execution,
        events: appendEvent(context.execution.events, {
          label: "Safe mode",
          detail: "The run switched to cached input and continued.",
          tone: "warning",
        }),
      },
    })),
    applyDecision: assign(({ context }) => {
      const decision = resolveDecisionForRun(context);
      if (!decision) return {};

      return {
        actionDecision: decision,
        runtimeStage: "ai_decision" as const,
        authority: { state: "ai_deciding" as const, percent: 51 },
        founder: {
          ...context.founder,
          state: "deciding" as const,
          currentRead: decision.reason,
        },
        execution: {
          ...context.execution,
          events: appendEvent(context.execution.events, {
            label: "Mandate formed",
            detail: `${decision.title}. Wallet and chain checks are next.`,
            tone: "decision",
          }),
        },
      };
    }),
    applyWalletRequired: assign(({ context }) => ({
      runtimeStage: "wallet_required" as const,
      authority: { state: "human_release_gate" as const, percent: 58 },
      founder: {
        ...context.founder,
        state: "deciding" as const,
        currentRead: "The mandate is ready. Connect a wallet to continue.",
      },
      execution: {
        ...context.execution,
        events: appendEvent(context.execution.events, {
          label: "Wallet required",
          detail: "Connect a wallet before network checks and deployment.",
          tone: "warning",
        }),
      },
    })),
    applyWalletConnected: assign(({ context }) => ({
      runtimeStage: "wallet_connected" as const,
      founder: {
        ...context.founder,
        state: "deciding" as const,
        currentRead: "Wallet connected. Confirm Base Sepolia before deployment.",
      },
      execution: {
        ...context.execution,
        events: appendEvent(context.execution.events, {
          label: "Wallet connected",
          detail: "A signer is available for deployment and release.",
          tone: "success",
        }),
      },
    })),
    applyNetworkReady: assign(({ context }) => ({
      runtimeStage: "network_ready" as const,
      founder: {
        ...context.founder,
        state: "deciding" as const,
        currentRead: "Base Sepolia is ready. Deploy the protocol package to continue.",
      },
      execution: {
        ...context.execution,
        events: appendEvent(context.execution.events, {
          label: "Network ready",
          detail: "The signer is on the target testnet and can deploy the protocol package.",
          tone: "success",
        }),
      },
    })),
    applyProtocolDeploying: assign(({ context }) => ({
      runtimeStage: "protocol_deploying" as const,
      founder: {
        ...context.founder,
        state: "executing" as const,
        currentRead: "Deployment is live. Waiting for contract confirmations.",
      },
      execution: {
        ...context.execution,
        events: appendEvent(context.execution.events, {
          label: "Deployment started",
          detail: "Token, governor, timelock, and protocol contracts are being deployed.",
          tone: "ai",
        }),
      },
    })),
    applyProtocolDeployed: assign(({ context }) => ({
      runtimeStage: "protocol_deployed" as const,
      founder: {
        ...context.founder,
        state: "executing" as const,
        currentRead: "The protocol package is deployed. The mandate can now be released.",
      },
      execution: {
        ...context.execution,
        events: appendEvent(context.execution.events, {
          label: "Deployment confirmed",
          detail: "The onchain package is ready for release.",
          tone: "success",
        }),
      },
    })),
    applyReleasePending: assign(({ context }) => ({
      runtimeStage: "release_pending" as const,
      authority: { state: "human_release_gate" as const, percent: 63 },
      founder: {
        ...context.founder,
        state: "deciding" as const,
        currentRead: "Review the mandate, then release, reject, or override it.",
      },
      execution: {
        ...context.execution,
        events: appendEvent(context.execution.events, {
          label: "Ready for release",
          detail: "The mandate can now be released, rejected, or overridden.",
          tone: "warning",
        }),
      },
    })),
    applyDeploymentFailure: assign(({ context, event }) => ({
      runtimeStage: "network_ready" as const,
      founder: {
        ...context.founder,
        state: "adapting" as const,
        currentRead: "Deployment failed. Fix the chain state and deploy again.",
      },
      execution: {
        ...context.execution,
        events: appendEvent(context.execution.events, {
          label: "Deployment failed",
          detail:
            event.type === "deployment.failed" && event.error
              ? event.error
              : "Deployment failed before the mandate could be released.",
          tone: "danger",
        }),
      },
    })),
    applyDeploymentFallback: assign(({ context, event }) => ({
      runtimeStage: "release_pending" as const,
      authority: { state: "human_release_gate" as const, percent: 60 },
      founder: {
        ...context.founder,
        state: "adapting" as const,
        currentRead: "Onchain deployment is unavailable. Offchain-safe execution is armed.",
      },
      execution: {
        ...context.execution,
        events: appendEvent(context.execution.events, {
          label: "Safe mode armed",
          detail:
            event.type === "deployment.fallback" && event.reason
              ? event.reason
              : "The run can continue in offchain-safe mode.",
          tone: "warning",
        }),
      },
    })),
    applyMandateApproved: assign(({ context }) => ({
      runtimeStage: "release_pending" as const,
      authority: { state: "ai_deciding" as const, percent: 71 },
      founder: {
        ...context.founder,
        currentRead: "Release confirmed. Execution can now continue.",
      },
      execution: {
        ...context.execution,
        events: appendEvent(context.execution.events, {
          label: "Released",
          detail: "The connected wallet released the mandate.",
          tone: "success",
        }),
      },
    })),
    applyMandateRejected: assign(({ context }) => ({
      runtimeStage: "mandate_rejected" as const,
      authority: { state: "human_rejected" as const, percent: 22 },
      founder: {
        ...context.founder,
        state: "halted" as const,
        currentRead: "The mandate was rejected. The run stopped before execution began.",
      },
      execution: {
        ...context.execution,
        status: "aborted" as const,
        events: appendEvent(context.execution.events, {
          label: "Rejected",
          detail: "The connected wallet rejected the mandate.",
          tone: "danger",
        }),
      },
    })),
    applyAutonomousExecution: assign(({ context }) => {
      if (!context.actionDecision) return {};
      return {
        runtimeStage: "autonomous_execution" as const,
        authority: { state: "ai_executing" as const, percent: 88 },
        founder: {
          ...context.founder,
          state: "executing" as const,
          currentRead: "Execution is live and moving without further input.",
        },
        evidence: resolveEvidence(context.runtimeProfile),
        execution: {
          status: "running" as const,
          moves: resolveExecutionPlan(context.actionDecision),
          events: appendEvent(context.execution.events, {
            label: "Execution started",
            detail: "Execution started after release.",
            tone: "success",
          }),
        },
      };
    }),
    advanceExecution: assign(({ context }) => ({
      runtimeStage: "autonomous_execution" as const,
      execution: {
        ...context.execution,
        status: "running" as const,
        moves: progressExecutionMoves(context.execution.moves, "advance"),
        events: appendEvent(context.execution.events, {
          label: "Execution advanced",
          detail: "Execution moved to the next step.",
          tone: "ai",
        }),
      },
    })),
    applyExecutionComplete: assign(({ context }) => ({
      runtimeStage: "execution_completed" as const,
      authority: { state: "execution_complete" as const, percent: 96 },
      founder: {
        ...context.founder,
        state: "completed" as const,
        currentRead: "The run completed and the final state was recorded.",
      },
      execution: {
        status: "completed" as const,
        moves: progressExecutionMoves(context.execution.moves, "complete"),
        events: appendEvent(context.execution.events, {
          label: "Execution completed",
          detail: "Execution completed successfully.",
          tone: "success",
        }),
      },
      override:
        context.override.status === "active"
          ? { status: "released" as const, mode: context.override.mode, note: context.override.note }
          : context.override,
    })),
    requestOverride: assign(({ context }) => ({
      runtimeStage: "override_requested" as const,
      authority: { state: "human_override_requested" as const, percent: 72 },
      override: { status: "requested" as const, mode: "none" as const },
      execution: {
        ...context.execution,
        events: appendEvent(context.execution.events, {
          label: "Override requested",
          detail: "An override was requested.",
          tone: "danger",
        }),
      },
    })),
    activateOverride: assign(({ context }) => ({
      runtimeStage: "override_active" as const,
      authority: { state: "human_override_active" as const, percent: 48 },
      founder: {
        ...context.founder,
        state: "overridden" as const,
        currentRead: "Execution is paused while the override is active.",
      },
      override: { status: "active" as const, mode: "pause" as const },
      execution: {
        ...context.execution,
        status: "paused" as const,
        moves: progressExecutionMoves(context.execution.moves, "pause"),
      },
    })),
    redirectExecution: assign(({ context }) => ({
      runtimeStage: "redirected_execution" as const,
      authority: { state: "ai_resumed" as const, percent: 84 },
      founder: {
        ...context.founder,
        state: "adapting" as const,
        currentRead: "A redirect was received. Updating the run path.",
      },
      override: {
        status: "released" as const,
        mode: "redirect" as const,
        note: "Constraint applied",
      },
      execution: {
        status: "redirected" as const,
        moves: progressExecutionMoves(context.execution.moves, "redirect"),
        events: appendEvent(context.execution.events, {
          label: "Execution redirected",
          detail: "Execution resumed with the new constraints.",
          tone: "warning",
        }),
      },
    })),
    abortExecution: assign(({ context }) => ({
      runtimeStage: "aborted_execution" as const,
      founder: {
        ...context.founder,
        state: "halted" as const,
        currentRead: "Execution was stopped by the override.",
      },
      override: { status: "aborted" as const, mode: "abort" as const },
      execution: {
        status: "aborted" as const,
        moves: progressExecutionMoves(context.execution.moves, "abort"),
        events: appendEvent(context.execution.events, {
          label: "Execution aborted",
          detail: "The run was stopped.",
          tone: "danger",
        }),
      },
    })),
    resumeExecution: assign(({ context }) => ({
      runtimeStage: "resumed_execution" as const,
      authority: { state: "ai_resumed" as const, percent: 86 },
      founder: {
        ...context.founder,
        state: "executing" as const,
        currentRead: "Override released. Execution is active again.",
      },
      override: { status: "released" as const, mode: "none" as const },
      execution: {
        status: "running" as const,
        moves: context.execution.moves.map((move, index) =>
          index === 1 ? { ...move, status: "running" as const } : move,
        ),
        events: appendEvent(context.execution.events, {
          label: "Execution resumed",
          detail: "Execution resumed.",
          tone: "success",
        }),
      },
    })),
    applyHardFail: assign(({ context }) => ({
      runtimeStage: "hard_fail" as const,
      founder: {
        ...context.founder,
        state: "halted" as const,
        currentRead: "The run hit a hard failure. No recovery path is available.",
      },
      execution: {
        ...context.execution,
        status: "aborted" as const,
        events: appendEvent(context.execution.events, {
          label: "Hard fail",
          detail: "The run stopped after signal failure with no allowed fallback path.",
          tone: "danger",
        }),
      },
    })),
  },
}).createMachine({
  id: "laisen-runtime",
  initial: "idle",
  context: createEmptyRuntimeContext(),
  states: {
    idle: {
      on: {
        "runtime.start": {
          target: "founderSpawn",
          actions: "startRuntime",
        },
      },
    },
    founderSpawn: {
      entry: "applyFounderSpawn",
      after: {
        [RUNTIME_DELAYS.founderSpawnMs]: "signalIntake",
      },
      on: {
        "runtime.reset": { target: "idle", actions: assign(() => createEmptyRuntimeContext()) },
      },
    },
    signalIntake: {
      entry: "applySignalIntake",
      after: {
        [RUNTIME_DELAYS.signalIntakeMs]: [
          {
            guard: "hasHardFailed",
            target: "hardFail",
            actions: "applyHardFail",
          },
          {
            guard: "usesSafeMode",
            target: "safeModeAdapting",
            actions: "applySafeModeAdapting",
          },
          { target: "aiDecision" },
        ],
      },
      on: {
        "runtime.reset": { target: "idle", actions: assign(() => createEmptyRuntimeContext()) },
      },
    },
    safeModeAdapting: {
      after: {
        [RUNTIME_DELAYS.safeModeAdaptingMs]: "aiDecision",
      },
      on: {
        "runtime.reset": { target: "idle", actions: assign(() => createEmptyRuntimeContext()) },
      },
    },
    aiDecision: {
      entry: "applyDecision",
      after: {
        [RUNTIME_DELAYS.aiDecisionMs]: {
          target: "walletRequired",
          actions: "applyWalletRequired",
        },
      },
      on: {
        "runtime.reset": { target: "idle", actions: assign(() => createEmptyRuntimeContext()) },
      },
    },
    walletRequired: {
      on: {
        "wallet.connected": {
          target: "walletConnected",
          actions: "applyWalletConnected",
        },
        "runtime.reset": { target: "idle", actions: assign(() => createEmptyRuntimeContext()) },
      },
    },
    walletConnected: {
      on: {
        "wallet.disconnected": {
          target: "walletRequired",
          actions: "applyWalletRequired",
        },
        "network.ready": {
          target: "networkReady",
          actions: "applyNetworkReady",
        },
        "runtime.reset": { target: "idle", actions: assign(() => createEmptyRuntimeContext()) },
      },
    },
    networkReady: {
      on: {
        "wallet.disconnected": {
          target: "walletRequired",
          actions: "applyWalletRequired",
        },
        "network.required": {
          target: "walletConnected",
          actions: "applyWalletConnected",
        },
        "deployment.started": {
          target: "protocolDeploying",
          actions: "applyProtocolDeploying",
        },
        "deployment.fallback": {
          target: "releasePending",
          actions: "applyDeploymentFallback",
        },
        "runtime.reset": { target: "idle", actions: assign(() => createEmptyRuntimeContext()) },
      },
    },
    protocolDeploying: {
      on: {
        "wallet.disconnected": {
          target: "walletRequired",
          actions: "applyWalletRequired",
        },
        "deployment.succeeded": {
          target: "protocolDeployed",
          actions: "applyProtocolDeployed",
        },
        "deployment.failed": {
          target: "networkReady",
          actions: "applyDeploymentFailure",
        },
        "deployment.fallback": {
          target: "releasePending",
          actions: "applyDeploymentFallback",
        },
        "runtime.reset": { target: "idle", actions: assign(() => createEmptyRuntimeContext()) },
      },
    },
    protocolDeployed: {
      after: {
        [RUNTIME_DELAYS.protocolDeployedMs]: {
          target: "releasePending",
          actions: "applyReleasePending",
        },
      },
      on: {
        "runtime.reset": { target: "idle", actions: assign(() => createEmptyRuntimeContext()) },
      },
    },
    releasePending: {
      on: {
        "mandate.approve": {
          target: "autonomousExecution",
          actions: "applyMandateApproved",
        },
        "mandate.reject": {
          target: "mandateRejected",
          actions: "applyMandateRejected",
        },
        "wallet.disconnected": {
          target: "walletRequired",
          actions: "applyWalletRequired",
        },
        "runtime.reset": { target: "idle", actions: assign(() => createEmptyRuntimeContext()) },
      },
    },
    autonomousExecution: {
      entry: "applyAutonomousExecution",
      after: {
        [RUNTIME_DELAYS.autonomousExecutionMs]: "executionAdvancing",
      },
      on: {
        "override.open": {
          target: "overrideRequested",
          actions: "requestOverride",
        },
        "runtime.reset": { target: "idle", actions: assign(() => createEmptyRuntimeContext()) },
      },
    },
    executionAdvancing: {
      entry: "advanceExecution",
      after: {
        [RUNTIME_DELAYS.executionAdvancingMs]: "executionCompleted",
      },
      on: {
        "override.open": {
          target: "overrideRequested",
          actions: "requestOverride",
        },
        "runtime.reset": { target: "idle", actions: assign(() => createEmptyRuntimeContext()) },
      },
    },
    overrideRequested: {
      after: {
        [RUNTIME_DELAYS.overrideRequestMs]: {
          target: "overrideActive",
          actions: "activateOverride",
        },
      },
    },
    overrideActive: {
      on: {
        "override.redirect": {
          target: "redirectedExecution",
          actions: "redirectExecution",
        },
        "override.abort": {
          target: "abortedExecution",
          actions: "abortExecution",
        },
        "override.resume": {
          target: "resumedExecution",
          actions: "resumeExecution",
        },
        "runtime.reset": { target: "idle", actions: assign(() => createEmptyRuntimeContext()) },
      },
    },
    resumedExecution: {
      after: {
        [RUNTIME_DELAYS.resumedExecutionMs]: "executionCompleted",
      },
      on: {
        "runtime.reset": { target: "idle", actions: assign(() => createEmptyRuntimeContext()) },
      },
    },
    redirectedExecution: {
      after: {
        [RUNTIME_DELAYS.redirectedExecutionMs]: "executionCompleted",
      },
      on: {
        "runtime.reset": { target: "idle", actions: assign(() => createEmptyRuntimeContext()) },
      },
    },
    abortedExecution: {
      on: {
        "runtime.reset": { target: "idle", actions: assign(() => createEmptyRuntimeContext()) },
      },
    },
    mandateRejected: {
      on: {
        "runtime.reset": { target: "idle", actions: assign(() => createEmptyRuntimeContext()) },
      },
    },
    executionCompleted: {
      entry: "applyExecutionComplete",
      on: {
        "runtime.reset": { target: "idle", actions: assign(() => createEmptyRuntimeContext()) },
      },
    },
    hardFail: {
      on: {
        "runtime.reset": { target: "idle", actions: assign(() => createEmptyRuntimeContext()) },
      },
    },
  },
});
