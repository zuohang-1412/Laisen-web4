"use client";

import { useMachine } from "@xstate/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { WalletSelectModal } from "@/features/onchain/components/wallet-select-modal";
import { useRuntimeOnchain } from "@/features/onchain/hooks/use-runtime-onchain";
import { ProtocolPackageSchema, type ProtocolPackage } from "@/features/onchain/schema/onchain-schema";
import { generateProtocolPackage } from "@/features/onchain/services/generate-protocol-package";
import { defaultDemoPreset } from "@/features/runtime/data/demo-presets";
import { runtimeMachine } from "@/features/runtime/machine/runtime-machine";
import type { Decision, RuntimeProfile } from "@/features/runtime/schema/runtime-schema";
import { RuntimeLiveStage } from "@/features/runtime-site/components/runtime-live-stage";

type SerializedProtocolPackageResponse = Omit<ProtocolPackage, "token"> & {
  token: Omit<ProtocolPackage["token"], "totalSupplyUnits"> & { totalSupplyUnits: string };
};

type AiPlanResponse = {
  ok: boolean;
  source: "live_ai" | "deterministic_fallback";
  protocolPackage?: SerializedProtocolPackageResponse;
  mandate?: {
    action: string;
    reason: string;
    expectedOutcome: string;
    riskLevel: string;
    budget: string;
    humanReleaseRequired: boolean;
  };
};

export function RuntimePageClient() {
  const [intent, setIntent] = useState(defaultDemoPreset.intent);
  const [profile, setProfile] = useState<RuntimeProfile>(defaultDemoPreset.profile);
  const [aiProtocolPackage, setAiProtocolPackage] = useState<ProtocolPackage | null>(null);
  const [runProtocolPackage, setRunProtocolPackage] = useState<ProtocolPackage | null>(null);
  const [aiPlanSource, setAiPlanSource] = useState<"deterministic_local" | "live_ai" | "deterministic_fallback">(
    "deterministic_local",
  );
  const [startRunPending, setStartRunPending] = useState(false);
  const [startRunError, setStartRunError] = useState<string | null>(null);
  const startRunAbortRef = useRef<AbortController | null>(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [state, send] = useMachine(runtimeMachine);
  const onchain = useRuntimeOnchain();

  const context = state.context;
  const deterministicProtocolPackage = useMemo(() => generateProtocolPackage(intent), [intent]);
  const protocolPackage = runProtocolPackage ?? aiProtocolPackage ?? deterministicProtocolPackage;
  const requiresWalletRelease = state.matches("releasePending");
  const canLaunchRuntime = intent.trim().length >= 20 && state.matches("idle");
 
  async function resolveAiPlan() {
    startRunAbortRef.current?.abort();
    const controller = new AbortController();
    startRunAbortRef.current = controller;

    try {
      const response = await fetch("/api/runtime/ai-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ intent }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`AI plan request failed (${response.status})`);

      const data = (await response.json()) as AiPlanResponse;
      if (!data.ok || !data.protocolPackage) {
        throw new Error("AI planning response is invalid.");
      }

      const parsed = ProtocolPackageSchema.parse({
        ...data.protocolPackage,
        token: {
          ...data.protocolPackage.token,
          totalSupplyUnits: BigInt(data.protocolPackage.token.totalSupplyUnits),
        },
      });
      setAiProtocolPackage(parsed);
      setAiPlanSource(data.source);
      return { protocolPackage: parsed, plannedDecision: normalizeAiMandate(data, data.source) };
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw error;
      }
      setAiProtocolPackage(null);
      setAiPlanSource("deterministic_fallback");
      return {
        protocolPackage: deterministicProtocolPackage,
        plannedDecision: null,
      };
    } finally {
      if (startRunAbortRef.current === controller) {
        startRunAbortRef.current = null;
      }
    }
  }

  useEffect(() => {
    if (state.matches("walletRequired")) {
      if (
        onchain.walletStatus === "ready" ||
        onchain.walletStatus === "wrong_network" ||
        onchain.walletStatus === "switching_network" ||
        onchain.walletStatus === "no_test_eth"
      ) {
        send({ type: "wallet.connected" });
      }
      return;
    }

    if (state.matches("walletConnected")) {
      if (onchain.walletStatus === "disconnected" || onchain.walletStatus === "failed") {
        send({ type: "wallet.disconnected" });
      } else if (onchain.walletStatus === "ready" || onchain.walletStatus === "no_test_eth") {
        send({ type: "network.ready" });
      }
      return;
    }

    if (state.matches("networkReady")) {
      if (onchain.walletStatus === "disconnected" || onchain.walletStatus === "failed") {
        send({ type: "wallet.disconnected" });
      } else if (onchain.walletStatus === "wrong_network" || onchain.walletStatus === "switching_network") {
        send({ type: "network.required" });
      } else if (onchain.deployment.status === "fallback_ready") {
        send({ type: "deployment.fallback", reason: onchain.deployment.error ?? undefined });
      } else if (onchain.deployment.status === "deploying") {
        send({ type: "deployment.started" });
      }
      return;
    }

    if (state.matches("protocolDeploying")) {
      if (onchain.deployment.status === "deployed") {
        send({ type: "deployment.succeeded" });
      } else if (onchain.deployment.status === "fallback_ready") {
        send({ type: "deployment.fallback", reason: onchain.deployment.error ?? undefined });
      } else if (onchain.deployment.status === "failed") {
        send({ type: "deployment.failed", error: onchain.deployment.error ?? undefined });
      }
    }
  }, [onchain.deployment.error, onchain.deployment.status, onchain.walletStatus, send, state, state.value]);

  useEffect(() => {
    if (
      walletModalOpen &&
      (onchain.walletStatus === "ready" ||
        onchain.walletStatus === "wrong_network" ||
        onchain.walletStatus === "switching_network" ||
        onchain.walletStatus === "no_test_eth")
    ) {
      setWalletModalOpen(false);
    }
  }, [onchain.walletStatus, walletModalOpen]);

  useEffect(() => {
    return () => {
      startRunAbortRef.current?.abort();
      startRunAbortRef.current = null;
    };
  }, []);

  return (
    <>
      <RuntimeLiveStage
        intent={intent}
        context={context}
        protocolPackage={protocolPackage}
        aiPlanSource={aiPlanSource}
        onchain={onchain}
        canLaunchRuntime={canLaunchRuntime}
        startRunPending={startRunPending}
        startRunError={startRunError}
        requiresWalletRelease={requiresWalletRelease}
        onIntentChange={(value) => {
          setIntent(value);
          setAiProtocolPackage(null);
          setAiPlanSource("deterministic_local");
          setStartRunError(null);
        }}
        onStart={async () => {
          if (!canLaunchRuntime || startRunPending) return;

          setStartRunPending(true);
          setStartRunError(null);
          try {
            onchain.resetOnchainState();
            const resolvedPlan = await resolveAiPlan();
            setRunProtocolPackage(resolvedPlan.protocolPackage);
            send({
              type: "runtime.start",
              intent: intent.trim(),
              profile,
              plannedDecision: resolvedPlan.plannedDecision,
            });
          } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") {
              setStartRunError("Planning request was cancelled. Please click Start run again.");
              return;
            }
            setStartRunError(error instanceof Error ? error.message : "Unable to start run.");
          } finally {
            setStartRunPending(false);
          }
        }}
        onReset={() => {
          startRunAbortRef.current?.abort();
          startRunAbortRef.current = null;
          setIntent(defaultDemoPreset.intent);
          setAiProtocolPackage(null);
          setRunProtocolPackage(null);
          setAiPlanSource("deterministic_local");
          setStartRunPending(false);
          setStartRunError(null);
          onchain.resetOnchainState();
          send({ type: "runtime.reset" });
        }}
        onConnectWallet={() => {
          setWalletModalOpen(true);
        }}
        onDisconnectWallet={() => {
          setWalletModalOpen(false);
          onchain.disconnectWallet();
        }}
        onSwitchNetwork={async () => {
          await onchain.switchToBaseSepolia();
        }}
        onDeployProtocol={async () => {
          const packageForDeploy = aiProtocolPackage ?? protocolPackage;
          await onchain.deploy(packageForDeploy);
        }}
        onApproveMandate={async () => {
          if (onchain.deployment.status === "fallback_ready") {
            send({ type: "mandate.approve" });
            return;
          }
          const proof = await onchain.approveAndExecute(context, protocolPackage);
          if (proof?.status === "executed") {
            send({ type: "mandate.approve" });
          }
        }}
        onRejectMandate={async () => {
          if (onchain.deployment.status === "fallback_ready") {
            send({ type: "mandate.reject" });
            return;
          }
          const proof = await onchain.reject(context, protocolPackage);
          if (proof?.status === "rejected") {
            send({ type: "mandate.reject" });
          }
        }}
        onVoteProposal={async () => {
          await onchain.voteProposal();
        }}
        onQueueProposal={async () => {
          await onchain.queueProposal(context, protocolPackage);
        }}
        onExecuteProposal={async () => {
          const txHash = await onchain.executeProposal(context, protocolPackage);
          if (txHash) {
            if (onchain.mandateProof.proposalAction === "approve") {
              send({ type: "mandate.approve" });
            } else if (onchain.mandateProof.proposalAction === "reject") {
              send({ type: "mandate.reject" });
            }
          }
        }}
        onSelectProposal={(proposalId) => {
          onchain.selectProposalFromHistory(proposalId);
        }}
        onOpenOverride={() => send({ type: "override.open" })}
        onRedirect={() => send({ type: "override.redirect" })}
        onAbort={() => send({ type: "override.abort" })}
        onResume={() => send({ type: "override.resume" })}
      />
      {walletModalOpen ? (
        <WalletSelectModal
          connectors={onchain.connectors}
          connectedConnectorUid={onchain.activeConnector?.uid ?? null}
          isConnecting={onchain.walletStatus === "connecting"}
          onConnect={(connector) => {
            void onchain.connectWallet(connector);
          }}
          onClose={() => {
            setWalletModalOpen(false);
          }}
        />
      ) : null}
    </>
  );
}

function normalizeAiMandate(
  data: AiPlanResponse,
  source: "live_ai" | "deterministic_fallback",
): Decision | null {
  if (!data.mandate) return null;

  return {
    title: summarizeMandateTitle(data.mandate.action),
    action: data.mandate.action,
    reason: data.mandate.reason,
    expectedOutcome: data.mandate.expectedOutcome,
    riskLevel: data.mandate.riskLevel,
    budget: data.mandate.budget,
    humanReleaseRequired: data.mandate.humanReleaseRequired,
    source,
    confidence: source === "live_ai" ? 0.9 : 0.72,
  };
}

function summarizeMandateTitle(action: string) {
  const normalized = action.trim();
  if (!normalized) return "Prepared mandate";

  const firstSentence = normalized.split(/[.!?]/)[0]?.trim();
  if (!firstSentence) return "Prepared mandate";
  if (firstSentence.length <= 76) return firstSentence;
  return `${firstSentence.slice(0, 73).trimEnd()}...`;
}
