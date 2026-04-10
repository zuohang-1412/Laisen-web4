import type { useRuntimeOnchain } from "@/features/onchain/hooks/use-runtime-onchain";
import type { ProtocolPackage } from "@/features/onchain/schema/onchain-schema";
import { LAISEN_TESTNET_EXPLORER, LAISEN_TESTNET_ID, LAISEN_TESTNET_NAME } from "@/features/onchain/config/chains";
import type { RuntimeContext } from "@/features/runtime/schema/runtime-schema";

type RuntimeOnchainController = ReturnType<typeof useRuntimeOnchain>;

export type PanelTone = "neutral" | "ai" | "warning" | "success" | "danger";
export type CapabilityStatus = "available" | "waiting" | "done" | "fallback" | "blocked";
export type TraceStatus = "queued" | "running" | "done" | "fallback" | "failed";
export type PrimaryRunState =
  | "idle"
  | "planning"
  | "waiting_for_signer"
  | "ready_to_deploy"
  | "ready_to_release"
  | "executing"
  | "completed"
  | "override"
  | "failed";
export type PrimaryWalletState = "disconnected" | "wrong_network" | "low_balance" | "ready" | "connecting";
export type PrimaryDeployState = "not_deployed" | "deploying" | "deployed" | "fallback" | "failed";
export type PrimaryReleaseState = "blocked" | "ready" | "signing" | "executed" | "rejected" | "failed";

export type AiPlanView = {
  title: string;
  sourceLabel: string;
  sourceTone: PanelTone;
  statusLabel: string;
  statusTone: PanelTone;
  summary: string;
  fields: Array<{ label: string; value: string }>;
};

export type ProtocolPackageView = {
  title: string;
  summary: string;
  tokenSymbol: string;
  primary: Array<{ label: string; value: string }>;
  secondary: Array<{ label: string; value: string }>;
};

export type MandateView = {
  title: string;
  statusLabel: string;
  statusTone: PanelTone;
  action: string;
  fields: Array<{ label: string; value: string }>;
};

export type CapabilityAvailability = {
  name: string;
  status: CapabilityStatus;
  requirement: string;
  nextAction: string;
};

export type CapabilityTrace = {
  name: string;
  source: "ai" | "wallet" | "chain" | "governance";
  status: TraceStatus;
  detail: string;
};

export type CapabilityView = {
  summary: string;
  available: CapabilityAvailability[];
  trace: CapabilityTrace[];
};

export type RuntimeStageView = {
  run: {
    state: PrimaryRunState;
    label: string;
    tone: PanelTone;
    nextAction: string;
    summary: string;
  };
  signer: {
    state: PrimaryWalletState;
    label: string;
    tone: PanelTone;
    summary: string;
    fields: Array<{ label: string; value: string }>;
  };
  protocol: {
    state: PrimaryDeployState;
    label: string;
    tone: PanelTone;
    summary: string;
    fields: Array<{ label: string; value: string; href?: string | null }>;
  };
  release: {
    state: PrimaryReleaseState;
    label: string;
    tone: PanelTone;
    summary: string;
  };
  proof: {
    label: string;
    tone: PanelTone;
    fields: Array<{ label: string; value: string; href?: string | null }>;
  };
  stepFlow: Array<{
    step: string;
    title: string;
    subtitle: string;
    status: "pending" | "active" | "done" | "danger" | "warning";
  }>;
  ledgerFacts: Array<{ label: string; value: string; href?: string | null }>;
};

export function buildRuntimePresentation(params: {
  context: RuntimeContext;
  protocolPackage: ProtocolPackage;
  aiPlanSource: "deterministic_local" | "live_ai" | "deterministic_fallback";
  onchain: RuntimeOnchainController;
  startRunPending: boolean;
  canDeployProtocol: boolean;
  requiresWalletRelease: boolean;
  canOverride: boolean;
  overrideActive: boolean;
}) {
  const {
    context,
    protocolPackage,
    aiPlanSource,
    onchain,
    startRunPending,
    canDeployProtocol,
    requiresWalletRelease,
    canOverride,
    overrideActive,
  } =
    params;

  return {
    aiPlan: buildAiPlanView(context, protocolPackage, aiPlanSource, onchain),
    protocolPackage: buildProtocolPackageView(protocolPackage),
    mandate: buildMandateView(context),
    capability: buildCapabilityView(context, onchain, {
      canDeployProtocol,
      requiresWalletRelease,
      canOverride,
      overrideActive,
    }),
    workspace: buildRuntimeStageView(context, onchain, aiPlanSource, startRunPending),
  };
}

function buildAiPlanView(
  context: RuntimeContext,
  protocolPackage: ProtocolPackage,
  aiPlanSource: "deterministic_local" | "live_ai" | "deterministic_fallback",
  onchain: RuntimeOnchainController,
): AiPlanView {
  const sourceLabel =
    aiPlanSource === "live_ai" ? "Live AI" : aiPlanSource === "deterministic_fallback" ? "Fallback plan" : "Local plan";
  const sourceTone: PanelTone =
    aiPlanSource === "live_ai" ? "success" : aiPlanSource === "deterministic_fallback" ? "warning" : "neutral";

  const statusLabel =
    context.runtimeStage === "idle"
      ? "Not generated"
      : context.runtimeStage === "founder_spawn" || context.runtimeStage === "signal_intake" || context.runtimeStage === "ai_decision"
        ? "Planning"
        : context.runtimeStage === "hard_fail"
          ? "Blocked"
          : "Ready";
  const statusTone: PanelTone =
    statusLabel === "Ready" ? "success" : statusLabel === "Planning" ? "ai" : statusLabel === "Blocked" ? "danger" : "neutral";

  const summary =
    context.runtimeStage === "idle"
      ? "Start the run to generate the package, read the signal, and prepare the next mandate."
      : context.actionDecision
        ? `${protocolPackage.daoName} is prepared and the mandate is ready for wallet-gated release.`
        : context.runtimeStage === "hard_fail"
          ? "Planning stopped before a valid mandate could be prepared."
          : `${protocolPackage.daoName} is being prepared for ${LAISEN_TESTNET_NAME}.`;

  return {
    title: protocolPackage.daoName,
    sourceLabel,
    sourceTone,
    statusLabel,
    statusTone,
    summary,
    fields: [
      { label: "Provider", value: context.evidence.provider },
      { label: "Model", value: context.evidence.model },
      { label: "Schema", value: context.evidence.schemaStatus },
      {
        label: "Fallback",
        value: onchain.deployment.usedFallback ? "offchain-safe" : context.evidence.fallbackMode,
      },
    ],
  };
}

function buildProtocolPackageView(protocolPackage: ProtocolPackage): ProtocolPackageView {
  return {
    title: protocolPackage.daoName,
    summary: protocolPackage.daoSummary,
    tokenSymbol: protocolPackage.token.symbol,
    primary: [
      { label: "Governance", value: protocolPackage.governanceMode },
      { label: "Operator policy", value: protocolPackage.operatorPolicy },
      { label: "Treasury model", value: protocolPackage.treasuryModel },
      { label: "Safe path", value: protocolPackage.safePath },
    ],
    secondary: [
      { label: "Founder", value: `${protocolPackage.founderPersona.name} · ${protocolPackage.founderPersona.role}` },
      { label: "Directive", value: protocolPackage.founderPersona.directive },
      { label: "Token", value: `${protocolPackage.token.name} (${protocolPackage.token.symbol}) · ${protocolPackage.token.totalSupplyLabel}` },
      {
        label: "Allocation",
        value: `Treasury ${protocolPackage.token.treasuryAllocation} · Contributors ${protocolPackage.token.contributorAllocation} · Community ${protocolPackage.token.communityAllocation}`,
      },
    ],
  };
}

function buildMandateView(context: RuntimeContext): MandateView {
  const mandate = context.actionDecision ?? context.plannedDecision;
  if (!mandate) {
    return {
      title: "Mandate pending",
      statusLabel: "Pending",
      statusTone: "neutral",
      action: "The next action appears here after the run reads the signal and prepares the mandate.",
      fields: [
        { label: "Reason", value: "Waiting for planning." },
        { label: "Expected", value: "Pending" },
        { label: "Risk", value: "Pending" },
        { label: "Budget", value: "Pending" },
        { label: "Release", value: "Pending" },
        { label: "Confidence", value: "Pending" },
      ],
    };
  }

  const statusLabel =
    context.runtimeStage === "release_pending"
      ? "Ready for release"
      : context.runtimeStage === "autonomous_execution"
        ? "Executing"
        : context.runtimeStage === "mandate_rejected"
          ? "Rejected"
          : context.runtimeStage === "execution_completed"
            ? "Completed"
            : "Prepared";
  const statusTone: PanelTone =
    statusLabel === "Ready for release"
      ? "warning"
      : statusLabel === "Executing"
        ? "ai"
        : statusLabel === "Completed"
          ? "success"
          : statusLabel === "Rejected"
            ? "danger"
            : "neutral";

  return {
    title: mandate.title,
    statusLabel,
    statusTone,
    action: mandate.action,
    fields: [
      { label: "Reason", value: mandate.reason },
      { label: "Expected", value: mandate.expectedOutcome },
      { label: "Risk", value: mandate.riskLevel },
      { label: "Budget", value: mandate.budget },
      { label: "Release", value: mandate.humanReleaseRequired ? "Required" : "Not required" },
      { label: "Confidence", value: `${Math.round(mandate.confidence * 100)}% · ${mandate.source}` },
    ],
  };
}

function buildCapabilityView(
  context: RuntimeContext,
  onchain: RuntimeOnchainController,
  gate: {
    canDeployProtocol: boolean;
    requiresWalletRelease: boolean;
    canOverride: boolean;
    overrideActive: boolean;
  },
): CapabilityView {
  const available: CapabilityAvailability[] = [
    buildWalletCapability(onchain),
    buildNetworkCapability(onchain),
    buildDeployCapability(onchain, gate.canDeployProtocol),
    buildReleaseCapability(onchain, gate.requiresWalletRelease),
    buildRejectCapability(onchain, gate.requiresWalletRelease),
    buildOverrideCapability(context, gate.canOverride, gate.overrideActive),
  ];

  const trace: CapabilityTrace[] = [
    ...context.evidence.toolCalls.map((entry) => ({
      name: entry.name,
      source: "ai" as const,
      status: entry.status,
      detail: entry.detail,
    })),
    {
      name: "wallet_connection",
      source: "wallet",
      status:
        onchain.walletStatus === "ready"
          ? "done"
          : onchain.walletStatus === "wrong_network" || onchain.walletStatus === "failed" || onchain.walletStatus === "no_test_eth"
            ? "failed"
            : onchain.walletStatus === "connecting" || onchain.walletStatus === "switching_network"
              ? "running"
              : "queued",
      detail:
        onchain.walletStatus === "ready"
          ? `MetaMask connected and ${LAISEN_TESTNET_NAME} confirmed.`
          : onchain.walletStatus === "wrong_network"
            ? `Wallet connected, but the network must switch to ${LAISEN_TESTNET_NAME}.`
            : onchain.walletStatus === "no_test_eth"
              ? `Wallet connected, but it has no ${LAISEN_TESTNET_NAME} ETH.`
              : "Waiting for a MetaMask connection.",
    },
    {
      name: "protocol_deployment",
      source: "chain",
      status:
        onchain.deployment.status === "deployed"
          ? "done"
          : onchain.deployment.status === "fallback_ready"
            ? "fallback"
            : onchain.deployment.status === "failed"
              ? "failed"
              : onchain.deployment.status === "deploying"
                ? "running"
                : "queued",
      detail:
        onchain.deployment.status === "deployed"
          ? `Token and protocol contracts are deployed on ${LAISEN_TESTNET_NAME}.`
          : onchain.deployment.status === "fallback_ready"
            ? "Safe mode is armed because chain interaction could not complete."
            : onchain.deployment.status === "failed"
              ? onchain.deployment.error ?? "Deployment failed."
              : "Waiting for wallet confirmation to deploy.",
    },
    {
      name: "wallet_release",
      source: onchain.daoAutomation ? "governance" : "wallet",
      status:
        onchain.mandateProof.status === "executed"
          ? "done"
          : onchain.mandateProof.status === "rejected"
            ? "failed"
            : onchain.mandateProof.status === "signing"
              ? "running"
              : "queued",
      detail:
        onchain.mandateProof.status === "executed"
          ? "The mandate was released and executed onchain."
          : onchain.mandateProof.status === "rejected"
            ? "The mandate was rejected onchain."
            : onchain.mandateProof.error ??
              (onchain.daoAutomation
                ? "DAO lifecycle runs propose -> vote -> queue -> execute after release opens."
                : "Manual DAO mode requires propose, vote, queue, and execute."),
    },
  ];

  if (onchain.mandateProof.proposalId) {
    trace.push({
      name: "dao_lifecycle",
      source: "governance",
      status: onchain.mandateProof.status === "executed" ? "done" : "fallback",
      detail: `Current proposal state: ${governorStateLabel(onchain.mandateProof.governorState)}.`,
    });
  }

  return {
    summary:
      context.runtimeStage === "idle"
        ? "Start the run to prepare capabilities for wallet, deployment, release, and override."
        : "These are the actions the runtime can execute now and the capability runs already recorded.",
    available,
    trace,
  };
}

function buildRuntimeStageView(
  context: RuntimeContext,
  onchain: RuntimeOnchainController,
  aiPlanSource: "deterministic_local" | "live_ai" | "deterministic_fallback",
  startRunPending: boolean,
): RuntimeStageView {
  const runState = derivePrimaryRunState(context, onchain, startRunPending);
  const signerState = derivePrimaryWalletState(onchain);
  const protocolState = derivePrimaryDeployState(onchain);
  const releaseState = derivePrimaryReleaseState(context, onchain);
  const latestProof = getLatestProof(onchain);

  const signerLabel =
    signerState === "ready"
      ? "Ready"
      : signerState === "wrong_network"
        ? "Wrong network"
        : signerState === "low_balance"
          ? "Low balance"
          : signerState === "connecting"
            ? "Connecting"
            : "Disconnected";
  const signerTone: PanelTone =
    signerState === "ready"
      ? "success"
      : signerState === "wrong_network" || signerState === "low_balance"
        ? "danger"
        : signerState === "connecting"
          ? "ai"
          : "neutral";

  const protocolLabel =
    protocolState === "deployed"
      ? "Deployed"
      : protocolState === "deploying"
        ? "Deploying"
        : protocolState === "fallback"
          ? "Fallback"
          : protocolState === "failed"
            ? "Failed"
            : "Not deployed";
  const protocolTone: PanelTone =
    protocolState === "deployed"
      ? "success"
      : protocolState === "deploying"
        ? "ai"
        : protocolState === "fallback"
          ? "warning"
          : protocolState === "failed"
            ? "danger"
            : "neutral";

  const releaseLabel =
    releaseState === "executed"
      ? "Executed"
      : releaseState === "rejected"
        ? "Rejected"
        : releaseState === "ready"
          ? "Ready"
          : releaseState === "signing"
            ? "Signing"
            : releaseState === "failed"
              ? "Failed"
              : "Blocked";
  const releaseTone: PanelTone =
    releaseState === "executed"
      ? "success"
      : releaseState === "ready"
        ? "warning"
        : releaseState === "signing"
          ? "ai"
          : releaseState === "rejected" || releaseState === "failed"
            ? "danger"
            : "neutral";

  const runView = buildRunView(runState, context);

  return {
    run: runView,
    signer: {
      state: signerState,
      label: signerLabel,
      tone: signerTone,
      summary:
        signerState === "ready"
          ? `Signer is ready on ${LAISEN_TESTNET_NAME}.`
          : signerState === "wrong_network"
            ? `Switch the signer to ${LAISEN_TESTNET_NAME}.`
            : signerState === "low_balance"
              ? `Fund the signer with ${LAISEN_TESTNET_NAME} ETH.`
              : signerState === "connecting"
                ? "Approve the wallet connection."
                : "Connect a signer to continue.",
      fields: [
        { label: "Wallet", value: onchain.activeConnector?.name ?? "Not connected" },
        { label: "Address", value: formatAddress(onchain.walletAddress) ?? "Not connected" },
        { label: "Chain", value: onchain.chainName },
        {
          label: "Balance",
          value: onchain.walletBalanceEth === null ? "n/a" : `${Number.parseFloat(onchain.walletBalanceEth).toFixed(4)} ETH`,
        },
      ],
    },
    protocol: {
      state: protocolState,
      label: protocolLabel,
      tone: protocolTone,
      summary:
        protocolState === "deployed"
          ? "The protocol package is live on the target testnet."
          : protocolState === "deploying"
            ? "Contract deployment is in progress."
            : protocolState === "fallback"
              ? "Chain deployment is unavailable. Safe fallback is armed."
              : protocolState === "failed"
                ? onchain.deployment.error ?? "Deployment failed."
                : "Deploy the package after wallet and network are ready.",
      fields: [
        {
          label: "Deploy tx",
          value: formatHash(onchain.deployment.deploymentTxHash) ?? "Pending",
          href: buildExplorerHref(onchain.deployment.deploymentTxHash),
        },
        { label: "Block", value: formatBlockNumber(onchain.deployment.deploymentBlockNumber) },
        { label: "Protocol", value: formatAddress(onchain.deployment.protocolAddress) ?? "Pending" },
        { label: "Token", value: formatAddress(onchain.deployment.tokenAddress) ?? "Pending" },
      ],
    },
    release: {
      state: releaseState,
      label: releaseLabel,
      tone: releaseTone,
      summary:
        releaseState === "ready"
          ? "The mandate is ready for wallet release."
          : releaseState === "signing"
            ? "A chain transaction is waiting for confirmation."
            : releaseState === "executed"
              ? "The release path completed onchain."
              : releaseState === "rejected"
                ? "The mandate was rejected."
                : releaseState === "failed"
                  ? onchain.mandateProof.error ?? "Release failed."
                  : "Finish planning, wallet, and deployment before release.",
    },
    proof: {
      label: latestProof.label,
      tone: latestProof.tone,
      fields: [
        { label: "Release", value: releaseLabel },
        { label: "Latest tx", value: latestProof.hash, href: latestProof.href },
        { label: "Latest block", value: latestProof.block },
        { label: "Plan", value: aiPlanSource === "live_ai" ? "Live AI" : aiPlanSource === "deterministic_fallback" ? "Fallback" : "Local" },
      ],
    },
    stepFlow: buildStepFlow(runState, signerState, protocolState, releaseState, startRunPending),
    ledgerFacts: [
      { label: "Provider", value: context.evidence.provider },
      { label: "Model", value: context.evidence.model },
      { label: "Schema", value: context.evidence.schemaStatus },
      { label: "Fallback", value: onchain.deployment.usedFallback ? "offchain-safe" : context.evidence.fallbackMode },
      { label: "Proposal", value: formatHash(onchain.mandateProof.proposalTxHash) ?? "Pending", href: buildExplorerHref(onchain.mandateProof.proposalTxHash) },
      { label: "Vote", value: formatHash(onchain.mandateProof.voteTxHash) ?? "Pending", href: buildExplorerHref(onchain.mandateProof.voteTxHash) },
      { label: "Queue", value: formatHash(onchain.mandateProof.queueTxHash) ?? "Pending", href: buildExplorerHref(onchain.mandateProof.queueTxHash) },
      { label: "Execute", value: formatHash(onchain.mandateProof.actionTxHash) ?? "Pending", href: buildExplorerHref(onchain.mandateProof.actionTxHash) },
      { label: "Latency", value: `${context.evidence.latencyMs} ms` },
    ],
  };
}

function buildRunView(state: PrimaryRunState, context: RuntimeContext) {
  switch (state) {
    case "idle":
      return {
        state,
        label: "Idle",
        tone: "neutral" as const,
        nextAction: "Start the run.",
        summary: "No mission is active yet.",
      };
    case "planning":
      return {
        state,
        label: "Planning",
        tone: "ai" as const,
        nextAction: "Wait for the mandate.",
        summary: "The runtime is preparing the package, signal, and mandate.",
      };
    case "waiting_for_signer":
      return {
        state,
        label: "Waiting for signer",
        tone: "warning" as const,
        nextAction: "Connect the wallet.",
        summary: "The mandate is ready and waiting for a signer.",
      };
    case "ready_to_deploy":
      return {
        state,
        label: "Ready to deploy",
        tone: "warning" as const,
        nextAction: "Deploy the protocol.",
        summary: "Wallet and network are ready for deployment.",
      };
    case "ready_to_release":
      return {
        state,
        label: "Ready to release",
        tone: "warning" as const,
        nextAction: "Release or reject the mandate.",
        summary: "The run is waiting for the human release gate.",
      };
    case "executing":
      return {
        state,
        label: "Executing",
        tone: "ai" as const,
        nextAction: "Watch the proof ledger.",
        summary: "Execution is moving through the runtime and chain path.",
      };
    case "completed":
      return {
        state,
        label: "Completed",
        tone: "success" as const,
        nextAction: "Review the proof ledger.",
        summary: "The run finished and the proof is recorded.",
      };
    case "override":
      return {
        state,
        label: "Override",
        tone: "danger" as const,
        nextAction: "Redirect, abort, or resume.",
        summary: "The operator is controlling the run.",
      };
    case "failed":
      return {
        state,
        label: "Failed",
        tone: "danger" as const,
        nextAction: "Reset or switch to a fallback path.",
        summary: context.runtimeStage === "hard_fail" ? "The run stopped before execution." : "The run cannot continue.",
      };
  }
}

function buildStepFlow(
  run: PrimaryRunState,
  signer: PrimaryWalletState,
  deploy: PrimaryDeployState,
  release: PrimaryReleaseState,
  startRunPending: boolean,
): RuntimeStageView["stepFlow"] {
  const walletDone = signer === "ready" || signer === "wrong_network" || signer === "low_balance";
  const networkDone = signer === "ready" || signer === "low_balance";
  const startRunDone =
    run === "waiting_for_signer" ||
    run === "ready_to_deploy" ||
    run === "ready_to_release" ||
    run === "executing" ||
    run === "completed" ||
    run === "override";

  return [
    {
      step: "01",
      title: "Connect wallet",
      subtitle: signer === "ready" || signer === "wrong_network" || signer === "low_balance" ? "Signer detected." : signer === "connecting" ? "Approve the wallet." : "Connect MetaMask.",
      status: walletDone ? "done" : "active",
    },
    {
      step: "02",
      title: "Switch network",
      subtitle:
        signer === "wrong_network"
          ? `${LAISEN_TESTNET_NAME} required.`
          : signer === "ready" || signer === "low_balance"
            ? `${LAISEN_TESTNET_NAME} ready.`
            : "Connect a wallet first.",
      status: !walletDone ? "pending" : signer === "wrong_network" ? "active" : networkDone ? "done" : "pending",
    },
    {
      step: "03",
      title: "Start run",
      subtitle: startRunPending
        ? "Prompt planning in progress."
        : run === "idle"
          ? "Generate the next mandate."
          : "Planning has started.",
      status: !networkDone ? "pending" : run === "failed" ? "danger" : startRunPending || run === "planning" || run === "idle" ? "active" : startRunDone ? "done" : "pending",
    },
    {
      step: "04",
      title: "Deploy protocol",
      subtitle: deploy === "deployed" ? "Contracts are live." : deploy === "deploying" ? "Deployment in progress." : deploy === "fallback" ? "Fallback path armed." : "Deploy the package.",
      status: deploy === "deployed" ? "done" : deploy === "deploying" ? "active" : deploy === "fallback" ? "warning" : deploy === "failed" ? "danger" : run === "ready_to_deploy" || run === "ready_to_release" || run === "executing" || run === "completed" ? "active" : "pending",
    },
    {
      step: "05",
      title: "Release mandate",
      subtitle: release === "ready" ? "Sign the release." : release === "executed" ? "Executed onchain." : release === "rejected" ? "Rejected onchain." : release === "signing" ? "Transaction pending." : "Wait for the release gate.",
      status: release === "executed" ? "done" : release === "rejected" || release === "failed" ? "danger" : release === "ready" || release === "signing" ? "active" : "pending",
    },
  ] as const;
}

function derivePrimaryRunState(
  context: RuntimeContext,
  onchain: RuntimeOnchainController,
  startRunPending: boolean,
): PrimaryRunState {
  if (context.runtimeStage === "idle" && startRunPending) return "planning";

  switch (context.runtimeStage) {
    case "idle":
      return "idle";
    case "founder_spawn":
    case "signal_intake":
    case "ai_decision":
      return "planning";
    case "wallet_required":
    case "wallet_connected":
      return "waiting_for_signer";
    case "network_ready":
    case "protocol_deploying":
      return "ready_to_deploy";
    case "protocol_deployed":
    case "release_pending":
      return "ready_to_release";
    case "autonomous_execution":
    case "resumed_execution":
    case "redirected_execution":
      return "executing";
    case "execution_completed":
      return "completed";
    case "override_requested":
    case "override_active":
      return "override";
    case "safe_mode_adapting":
      return "ready_to_release";
    case "hard_fail":
    case "aborted_execution":
    case "mandate_rejected":
      return onchain.mandateProof.status === "rejected" ? "completed" : "failed";
    default:
      return "failed";
  }
}

function derivePrimaryWalletState(onchain: RuntimeOnchainController): PrimaryWalletState {
  switch (onchain.walletStatus) {
    case "connecting":
    case "switching_network":
      return "connecting";
    case "wrong_network":
      return "wrong_network";
    case "no_test_eth":
      return "low_balance";
    case "ready":
      return "ready";
    default:
      return "disconnected";
  }
}

function derivePrimaryDeployState(onchain: RuntimeOnchainController): PrimaryDeployState {
  switch (onchain.deployment.status) {
    case "deploying":
      return "deploying";
    case "deployed":
      return "deployed";
    case "fallback_ready":
      return "fallback";
    case "failed":
      return "failed";
    default:
      return "not_deployed";
  }
}

function derivePrimaryReleaseState(
  context: RuntimeContext,
  onchain: RuntimeOnchainController,
): PrimaryReleaseState {
  if (onchain.mandateProof.status === "executed") return "executed";
  if (onchain.mandateProof.status === "rejected") return "rejected";
  if (onchain.mandateProof.status === "signing") return "signing";
  if (onchain.mandateProof.status === "failed") return "failed";
  if (context.runtimeStage === "release_pending" || context.runtimeStage === "protocol_deployed") return "ready";
  return "blocked";
}

function getLatestProof(onchain: RuntimeOnchainController) {
  if (onchain.mandateProof.actionTxHash) {
    return {
      label: "Latest action",
      tone: onchain.mandateProof.status === "executed" ? "success" as const : "warning" as const,
      hash: formatHash(onchain.mandateProof.actionTxHash) ?? "Pending",
      block: formatBlockNumber(onchain.mandateProof.actionBlockNumber),
      href: buildExplorerHref(onchain.mandateProof.actionTxHash),
    };
  }

  if (onchain.mandateProof.proposalTxHash) {
    return {
      label: "Latest proposal",
      tone: "warning" as const,
      hash: formatHash(onchain.mandateProof.proposalTxHash) ?? "Pending",
      block: formatBlockNumber(onchain.mandateProof.proposalBlockNumber),
      href: buildExplorerHref(onchain.mandateProof.proposalTxHash),
    };
  }

  if (onchain.deployment.deploymentTxHash) {
    return {
      label: "Latest deploy",
      tone: onchain.deployment.status === "deployed" ? "success" as const : "warning" as const,
      hash: formatHash(onchain.deployment.deploymentTxHash) ?? "Pending",
      block: formatBlockNumber(onchain.deployment.deploymentBlockNumber),
      href: buildExplorerHref(onchain.deployment.deploymentTxHash),
    };
  }

  return {
    label: "Latest proof",
    tone: "neutral" as const,
    hash: "Pending",
    block: "Pending",
    href: null,
  };
}

function formatAddress(value: string | null) {
  if (!value) return null;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function formatHash(value: string | null) {
  if (!value) return null;
  return `${value.slice(0, 10)}...${value.slice(-6)}`;
}

function formatBlockNumber(value: number | null) {
  if (value === null) return "Pending";
  return `#${value}`;
}

function buildExplorerHref(hash: string | null) {
  if (!hash) return null;
  return `${LAISEN_TESTNET_EXPLORER}/tx/${hash}`;
}

function buildWalletCapability(onchain: RuntimeOnchainController): CapabilityAvailability {
  if (onchain.walletStatus === "ready" || onchain.walletStatus === "wrong_network" || onchain.walletStatus === "no_test_eth") {
    return {
      name: "Connect wallet",
      status: "done",
      requirement: "Signer connected",
      nextAction: "Wallet is available.",
    };
  }

  if (onchain.walletStatus === "connecting") {
    return {
      name: "Connect wallet",
      status: "waiting",
      requirement: "Approve the wallet request",
      nextAction: "Finish the MetaMask connection.",
    };
  }

  return {
    name: "Connect wallet",
    status: onchain.walletStatus === "failed" ? "blocked" : "available",
    requirement: "MetaMask or another injected wallet",
    nextAction: "Connect a wallet to continue.",
  };
}

function buildNetworkCapability(onchain: RuntimeOnchainController): CapabilityAvailability {
  if (onchain.chainId === LAISEN_TESTNET_ID) {
    return {
      name: "Switch network",
      status: "done",
      requirement: LAISEN_TESTNET_NAME,
      nextAction: "Target testnet is ready.",
    };
  }

  if (onchain.walletStatus === "wrong_network") {
    return {
      name: "Switch network",
      status: "available",
      requirement: LAISEN_TESTNET_NAME,
      nextAction: `Switch to ${LAISEN_TESTNET_NAME}.`,
    };
  }

  if (onchain.walletStatus === "switching_network") {
    return {
      name: "Switch network",
      status: "waiting",
      requirement: LAISEN_TESTNET_NAME,
      nextAction: "Waiting for wallet network confirmation.",
    };
  }

  return {
    name: "Switch network",
    status: "waiting",
    requirement: "Wallet connection",
    nextAction: "Connect the wallet first.",
  };
}

function buildDeployCapability(onchain: RuntimeOnchainController, canDeployProtocol: boolean): CapabilityAvailability {
  if (onchain.deployment.status === "deployed") {
    return {
      name: "Deploy protocol",
      status: "done",
      requirement: "Token, governor, timelock, protocol",
      nextAction: "Protocol package is onchain.",
    };
  }

  if (onchain.deployment.status === "fallback_ready") {
    return {
      name: "Deploy protocol",
      status: "fallback",
      requirement: "Wallet + chain unavailable",
      nextAction: "Runtime can continue in offchain-safe mode.",
    };
  }

  if (onchain.deployment.status === "failed") {
    return {
      name: "Deploy protocol",
      status: "blocked",
      requirement: "Wallet, chain, and balance",
      nextAction: onchain.deployment.error ?? "Fix chain conditions and deploy again.",
    };
  }

  if (onchain.deployment.status === "deploying") {
    return {
      name: "Deploy protocol",
      status: "waiting",
      requirement: "Wallet signature",
      nextAction: "Waiting for contract confirmations.",
    };
  }

  return {
    name: "Deploy protocol",
    status: canDeployProtocol ? "available" : "waiting",
    requirement: `${LAISEN_TESTNET_NAME} + funded signer`,
    nextAction: canDeployProtocol ? "Deploy the protocol package." : "Finish wallet and network checks first.",
  };
}

function buildReleaseCapability(onchain: RuntimeOnchainController, requiresWalletRelease: boolean): CapabilityAvailability {
  if (onchain.mandateProof.status === "executed") {
    return {
      name: "Release mandate",
      status: "done",
      requirement: "Mandate released",
      nextAction: "Onchain execution is recorded.",
    };
  }

  if (onchain.mandateProof.status === "signing") {
    return {
      name: "Release mandate",
      status: "waiting",
      requirement: "MetaMask signature",
      nextAction: "Finish the release signature.",
    };
  }

  if (onchain.mandateProof.status === "failed") {
    return {
      name: "Release mandate",
      status: "blocked",
      requirement: "Wallet + chain + mandate",
      nextAction: onchain.mandateProof.error ?? "Release failed. Retry or reject.",
    };
  }

  return {
    name: "Release mandate",
    status: requiresWalletRelease ? "available" : "waiting",
    requirement: "Deployed protocol + ready mandate",
    nextAction: requiresWalletRelease ? `Sign to release on ${LAISEN_TESTNET_NAME}.` : "Wait until the mandate reaches release-ready state.",
  };
}

function buildRejectCapability(onchain: RuntimeOnchainController, requiresWalletRelease: boolean): CapabilityAvailability {
  if (onchain.mandateProof.status === "rejected") {
    return {
      name: "Reject mandate",
      status: "done",
      requirement: "Mandate rejected",
      nextAction: "The run stopped before execution.",
    };
  }

  return {
    name: "Reject mandate",
    status: requiresWalletRelease ? "available" : "waiting",
    requirement: "Ready mandate",
    nextAction: requiresWalletRelease ? "Reject the current mandate." : "Reject becomes available once the mandate is ready.",
  };
}

function buildOverrideCapability(
  context: RuntimeContext,
  canOverride: boolean,
  overrideActive: boolean,
): CapabilityAvailability {
  if (overrideActive) {
    return {
      name: "Override execution",
      status: "available",
      requirement: "Override active",
      nextAction: "Redirect, abort, or resume the run.",
    };
  }

  return {
    name: "Override execution",
    status: canOverride ? "available" : "waiting",
    requirement: "Autonomous execution running",
    nextAction: canOverride ? "Open the human override lane." : stateSpecificOverrideHint(context.runtimeStage),
  };
}

function stateSpecificOverrideHint(stage: RuntimeContext["runtimeStage"]) {
  if (stage === "execution_completed") return "Execution already completed.";
  if (stage === "mandate_rejected" || stage === "aborted_execution" || stage === "hard_fail") {
    return "The run is already stopped.";
  }
  return "Override becomes available during autonomous execution.";
}

function governorStateLabel(state: number | null) {
  if (state === null) return "Pending";
  switch (state) {
    case 0:
      return "Pending";
    case 1:
      return "Active";
    case 2:
      return "Canceled";
    case 3:
      return "Defeated";
    case 4:
      return "Succeeded";
    case 5:
      return "Queued";
    case 6:
      return "Expired";
    case 7:
      return "Executed";
    default:
      return `State ${state}`;
  }
}
