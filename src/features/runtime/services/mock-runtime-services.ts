import type {
  Decision,
  Evidence,
  ExecutionEvent,
  ExecutionMove,
  Founder,
  RuntimeProfile,
  SignalPayload,
} from "@/features/runtime/schema/runtime-schema";

let sequence = 0;

function stamp(label: string) {
  sequence += 1;
  return `${label}-${Date.now().toString(36)}-${sequence.toString(36)}`;
}

function sectorFromIntent(intent: string) {
  const lower = intent.toLowerCase();

  if (lower.includes("payment")) return "payment";
  if (lower.includes("label")) return "labeling";
  if (lower.includes("retail")) return "retail";
  return "market";
}

export function spawnFounder(intent: string): Founder {
  const sector = sectorFromIntent(intent);

  return {
    name: `Laisen ${sector === "market" ? "Founder" : `${sector[0].toUpperCase()}${sector.slice(1)} Founder`}`,
    role: "AI Founder",
    decisionPrinciple: "Read the signal, prepare the next step, and move when release is available.",
    riskPosture: sector === "payment" ? "Controlled" : "Balanced",
    executionMode: "signal-led execution",
    currentRead: "Mission saved. Preparing package and context.",
    state: "spawning",
  };
}

export function intakeSignal(intent: string, profile: RuntimeProfile): SignalPayload {
  const sector = sectorFromIntent(intent);

  const sourceMap: Record<string, string> = {
    payment: "merchant_settlement_feed",
    labeling: "vendor_capacity_index",
    retail: "cross_border_demand_radar",
    market: "market_signal_cache",
  };

  const insightMap: Record<string, string> = {
    payment: "Merchant urgency is rising around faster settlement and lower operational friction in cross-border payout flows.",
    labeling: "Supplier capacity is tightening; fast-response labeling vendors are emerging as a defensible execution lever.",
    retail: "Demand acceleration is concentrating around premium cross-border categories with strong margin headroom.",
    market: "A narrow execution window is opening and favors fast signal-to-action conversion.",
  };

  return {
    source: profile === "safe_mode" ? "cached_signal_archive" : sourceMap[sector],
    headline: profile === "safe_mode" ? "Cached signal loaded" : "Signal loaded",
    insight:
      profile === "safe_mode"
        ? `Live signal unavailable. Using cached context instead. ${insightMap[sector]}`
        : insightMap[sector],
    freshness: profile === "safe_mode" ? "Cached within 15m" : "Live within 90s",
    mode: profile === "safe_mode" ? "cached" : "live",
  };
}

export function buildDecision(intent: string, signal: SignalPayload, profile: RuntimeProfile): Decision {
  const sector = sectorFromIntent(intent);

  const titleMap: Record<string, string> = {
    payment: "Open a settlement release for priority merchants",
    labeling: "Route work to a faster vendor path",
    retail: "Open a premium demand test on the active corridor",
    market: "Open a limited release for the current signal",
  };

  const actionMap: Record<string, string> = {
    payment: "Route execution toward a compliant pilot for merchants with urgent settlement delays.",
    labeling: "Activate a vendor path with more capacity and shorter response times.",
    retail: "Open a limited premium market test and capture early response.",
    market: "Run a contained release that checks whether the signal is strong enough to proceed.",
  };

  return {
    title: titleMap[sector],
    action: actionMap[sector],
    reason: signal.insight,
    expectedOutcome: "A released action with visible contract state and an auditable event trail.",
    riskLevel: sector === "payment" ? "medium" : "low",
    budget: "testnet-only",
    humanReleaseRequired: true,
    source: "deterministic_local",
    confidence: profile === "safe_mode" ? 0.71 : 0.84,
  };
}

export function buildExecutionMoves(decision: Decision): ExecutionMove[] {
  return [
    {
      id: stamp("move"),
      title: "Signal checked",
      detail: "The signal was accepted as a valid input for this run.",
      status: "done",
    },
    {
      id: stamp("move"),
      title: "Mandate prepared",
      detail: decision.title,
      status: "running",
    },
    {
      id: stamp("move"),
      title: "Ledger ready",
      detail: "Wallet, schema, and event logging are ready for release.",
      status: "queued",
    },
  ];
}

export function buildEvidence(profile: RuntimeProfile): Evidence {
  return {
    provider: "GMI Cloud",
    model: "GLM-5",
    toolCall: profile === "safe_mode" ? "signal_resolver.cached_query" : "signal_resolver.live_query",
    schemaStatus: profile === "safe_mode" ? "fallback" : "validated",
    fallbackMode: profile === "safe_mode" ? "safe_mode" : "none",
    latencyMs: profile === "safe_mode" ? 188 : 742,
    runtimeProfile: profile,
    toolCalls: [
      {
        name: "founder_spawn",
        status: "done",
        detail: "Founder profile generated and run state initialized.",
      },
      {
        name: "signal_resolver",
        status: profile === "safe_mode" ? "fallback" : "done",
        detail:
          profile === "safe_mode"
            ? "Live signal unavailable. Using cached signal input."
            : "Signal lookup completed successfully.",
      },
      {
        name: "decision_builder",
        status: "done",
        detail: "Mandate generated and checked against schema.",
      },
      {
        name: "execution_scheduler",
        status: "done",
        detail: "Execution path prepared for release.",
      },
      {
        name: "proof_ledger",
        status: "done",
        detail: "Evidence and event logging are ready.",
      },
    ],
  };
}

export function progressExecutionMoves(
  moves: ExecutionMove[],
  phase: "advance" | "complete" | "pause" | "redirect" | "abort",
): ExecutionMove[] {
  return moves.map((move, index) => {
    if (phase === "abort") {
      return { ...move, status: "aborted" };
    }

    if (phase === "pause") {
      if (move.status === "running" || index === 1) {
        return { ...move, status: "paused" };
      }
      return move;
    }

    if (phase === "redirect") {
      if (index === 1 || index === 2) {
        return { ...move, status: "redirected" };
      }
      return move;
    }

    if (phase === "advance") {
      if (index === 1) {
        return { ...move, status: "done" };
      }
      if (index === 2) {
        return { ...move, status: "running" };
      }
    }

    if (phase === "complete") {
      if (move.status === "queued" || move.status === "running" || move.status === "redirected") {
        return { ...move, status: "done" };
      }
    }

    return move;
  });
}

export function appendEvent(
  current: ExecutionEvent[],
  next: Omit<ExecutionEvent, "id" | "at">,
): ExecutionEvent[] {
  return [
    ...current,
    {
      id: stamp("event"),
      at: new Date().toLocaleTimeString("en-US", { hour12: false }),
      ...next,
    },
  ];
}
