import { z } from "zod";

export const founderStateValues = [
  "dormant",
  "spawning",
  "intaking",
  "deciding",
  "executing",
  "adapting",
  "completed",
  "overridden",
  "halted",
] as const;

export const authorityStateValues = [
  "human_origin",
  "founder_spawned",
  "ai_deciding",
  "human_release_gate",
  "ai_executing",
  "human_override_requested",
  "human_override_active",
  "human_rejected",
  "ai_resumed",
  "execution_complete",
] as const;

export const runtimeStageValues = [
  "idle",
  "founder_spawn",
  "signal_intake",
  "ai_decision",
  "wallet_required",
  "wallet_connected",
  "network_ready",
  "protocol_deploying",
  "protocol_deployed",
  "release_pending",
  "awaiting_approval",
  "autonomous_execution",
  "mandate_rejected",
  "override_requested",
  "override_active",
  "resumed_execution",
  "redirected_execution",
  "aborted_execution",
  "execution_completed",
  "safe_mode_adapting",
  "hard_fail",
] as const;

export const overrideStatusValues = ["none", "requested", "active", "released", "aborted"] as const;
export const overrideModeValues = ["none", "pause", "redirect", "abort"] as const;
export const schemaStatusValues = ["validated", "pending", "fallback", "failed"] as const;
export const fallbackModeValues = ["none", "cached_signal", "cached_decision", "safe_mode", "hard_fail"] as const;
export const runtimeProfileValues = ["live", "safe_mode", "hard_fail"] as const;
export const RuntimeProfileSchema = z.enum(runtimeProfileValues);

export const FounderSchema = z.object({
  name: z.string(),
  role: z.string(),
  decisionPrinciple: z.string(),
  riskPosture: z.string(),
  executionMode: z.string(),
  currentRead: z.string(),
  state: z.enum(founderStateValues),
});

export const SignalSchema = z.object({
  source: z.string(),
  headline: z.string(),
  insight: z.string(),
  freshness: z.string(),
  mode: z.enum(["live", "cached"]),
});

export const DecisionSchema = z.object({
  title: z.string(),
  action: z.string(),
  reason: z.string(),
  expectedOutcome: z.string(),
  riskLevel: z.string().default("medium"),
  budget: z.string().default("testnet-only"),
  humanReleaseRequired: z.boolean().default(true),
  source: z.enum(["live_ai", "deterministic_local", "deterministic_fallback"]).default("deterministic_local"),
  confidence: z.number().min(0).max(1),
});

export const AuthoritySchema = z.object({
  state: z.enum(authorityStateValues),
  percent: z.number().min(0).max(100),
});

export const OverrideSchema = z.object({
  status: z.enum(overrideStatusValues),
  mode: z.enum(overrideModeValues),
  note: z.string().optional(),
});

export const ExecutionMoveSchema = z.object({
  id: z.string(),
  title: z.string(),
  detail: z.string(),
  status: z.enum(["queued", "running", "done", "paused", "redirected", "aborted"]),
});

export const ExecutionEventSchema = z.object({
  id: z.string(),
  label: z.string(),
  detail: z.string(),
  tone: z.enum(["ai", "decision", "neutral", "danger", "success", "warning"]),
  at: z.string(),
});

export const EvidenceSchema = z.object({
  provider: z.string(),
  model: z.string(),
  toolCall: z.string(),
  schemaStatus: z.enum(schemaStatusValues),
  fallbackMode: z.enum(fallbackModeValues),
  latencyMs: z.number().int().nonnegative(),
  runtimeProfile: RuntimeProfileSchema,
  toolCalls: z.array(
    z.object({
      name: z.string(),
      status: z.enum(["queued", "running", "done", "fallback", "failed"]),
      detail: z.string(),
    }),
  ),
});

export const RuntimeContextSchema = z.object({
  intentInput: z.string(),
  runtimeProfile: RuntimeProfileSchema,
  founder: FounderSchema,
  signal: SignalSchema.nullable(),
  plannedDecision: DecisionSchema.nullable(),
  actionDecision: DecisionSchema.nullable(),
  authority: AuthoritySchema,
  override: OverrideSchema,
  execution: z.object({
    status: z.enum(["idle", "running", "paused", "redirected", "aborted", "completed"]),
    moves: z.array(ExecutionMoveSchema),
    events: z.array(ExecutionEventSchema),
  }),
  evidence: EvidenceSchema,
  runtimeStage: z.enum(runtimeStageValues),
});

export type Founder = z.infer<typeof FounderSchema>;
export type SignalPayload = z.infer<typeof SignalSchema>;
export type Decision = z.infer<typeof DecisionSchema>;
export type Authority = z.infer<typeof AuthoritySchema>;
export type Override = z.infer<typeof OverrideSchema>;
export type ExecutionMove = z.infer<typeof ExecutionMoveSchema>;
export type ExecutionEvent = z.infer<typeof ExecutionEventSchema>;
export type Evidence = z.infer<typeof EvidenceSchema>;
export type RuntimeContext = z.infer<typeof RuntimeContextSchema>;
export type RuntimeProfile = z.infer<typeof RuntimeProfileSchema>;

export function createEmptyRuntimeContext(): RuntimeContext {
  return {
    intentInput: "",
    runtimeProfile: "live",
    founder: {
      name: "Dormant Founder",
      role: "AI Founder",
      decisionPrinciple: "Waiting for a mission before taking the next step.",
      riskPosture: "Balanced",
      executionMode: "signal -> decide -> release -> execute",
      currentRead: "Waiting for a mission.",
      state: "dormant",
    },
    signal: null,
    plannedDecision: null,
    actionDecision: null,
    authority: {
      state: "human_origin",
      percent: 6,
    },
    override: {
      status: "none",
      mode: "none",
    },
    execution: {
      status: "idle",
      moves: [],
      events: [],
    },
    evidence: {
      provider: "GMI Cloud",
      model: "GLM-5",
      toolCall: "signal_resolver",
      schemaStatus: "pending",
      fallbackMode: "none",
      latencyMs: 0,
      runtimeProfile: "live",
      toolCalls: [
        {
          name: "signal_resolver",
          status: "queued",
          detail: "Waiting for the run to start.",
        },
      ],
    },
    runtimeStage: "idle",
  };
}
