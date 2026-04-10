"use client";

import {
  CheckCircle2,
  CornerDownLeft,
  Play,
  RotateCcw,
  Route,
  ShieldAlert,
  Wallet,
} from "lucide-react";

import { LAISEN_TESTNET_NAME } from "@/features/onchain/config/chains";
import type { useRuntimeOnchain } from "@/features/onchain/hooks/use-runtime-onchain";
import type { ProtocolPackage } from "@/features/onchain/schema/onchain-schema";
import type { ExecutionEvent, RuntimeContext } from "@/features/runtime/schema/runtime-schema";
import { MandateCard } from "@/features/runtime-site/components/mandate-card";
import { ProtocolPackageCard } from "@/features/runtime-site/components/protocol-package-card";
import { runtimeCopy } from "@/features/runtime-site/content/runtime-copy";
import { buildRuntimePresentation } from "@/features/runtime-site/view-models/runtime-presentation";
import { cn } from "@/lib/utils";

type RuntimeOnchainController = ReturnType<typeof useRuntimeOnchain>;

type Props = {
  intent: string;
  context: RuntimeContext;
  protocolPackage: ProtocolPackage;
  aiPlanSource: "deterministic_local" | "live_ai" | "deterministic_fallback";
  onchain: RuntimeOnchainController;
  canLaunchRuntime: boolean;
  startRunPending: boolean;
  startRunError: string | null;
  requiresWalletRelease: boolean;
  onIntentChange: (value: string) => void;
  onStart: () => void;
  onReset: () => void;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  onSwitchNetwork: () => Promise<void>;
  onDeployProtocol: () => Promise<void>;
  onApproveMandate: () => Promise<void>;
  onRejectMandate: () => Promise<void>;
  onVoteProposal: () => Promise<void>;
  onQueueProposal: () => Promise<void>;
  onExecuteProposal: () => Promise<void>;
  onSelectProposal: (proposalId: bigint) => void;
  onOpenOverride: () => void;
  onRedirect: () => void;
  onAbort: () => void;
  onResume: () => void;
};

export function RuntimeLiveStage({
  intent,
  context,
  protocolPackage,
  aiPlanSource,
  onchain,
  canLaunchRuntime,
  startRunPending,
  startRunError,
  requiresWalletRelease,
  onIntentChange,
  onStart,
  onReset,
  onConnectWallet,
  onDisconnectWallet,
  onSwitchNetwork,
  onDeployProtocol,
  onApproveMandate,
  onRejectMandate,
  onVoteProposal,
  onQueueProposal,
  onExecuteProposal,
  onSelectProposal,
  onOpenOverride,
  onRedirect,
  onAbort,
  onResume,
}: Props) {
  const canOverride = context.runtimeStage === "autonomous_execution";
  const overrideActive =
    context.runtimeStage === "override_requested" || context.runtimeStage === "override_active";
  const manualDaoMode = !onchain.daoAutomation;
  const governorState = onchain.mandateProof.governorState;
  const etaReady = isEtaReady(onchain.mandateProof.proposalEta);
  const hasProposal = Boolean(onchain.mandateProof.proposalId);
  const canDeployProtocol =
    (context.runtimeStage === "network_ready" ||
      context.runtimeStage === "protocol_deploying" ||
      context.runtimeStage === "protocol_deployed" ||
      context.runtimeStage === "release_pending") &&
    onchain.walletStatus === "ready";
  const canVoteProposal =
    manualDaoMode &&
    hasProposal &&
    governorState === 1 &&
    !onchain.mandateProof.voteTxHash &&
    onchain.mandateProof.status !== "signing";
  const canQueueProposal =
    manualDaoMode &&
    hasProposal &&
    governorState === 4 &&
    Boolean(onchain.mandateProof.voteTxHash) &&
    !onchain.mandateProof.queueTxHash &&
    onchain.mandateProof.status !== "signing";
  const canExecuteProposal =
    manualDaoMode &&
    hasProposal &&
    governorState === 5 &&
    Boolean(onchain.mandateProof.queueTxHash) &&
    !onchain.mandateProof.actionTxHash &&
    etaReady &&
    onchain.mandateProof.status !== "signing";
  const combinedEvents = buildCombinedTimeline(context, onchain);
  const presentation = buildRuntimePresentation({
    context,
    protocolPackage,
    aiPlanSource,
    onchain,
    startRunPending,
    canDeployProtocol,
    requiresWalletRelease,
    canOverride,
    overrideActive,
  });
  const workspace = presentation.workspace;
  const proofRows = workspace.ledgerFacts;
  const toolRowsData = presentation.capability.trace;
  const isWalletConnected = onchain.isConnected;
  const primaryAction = getPrimaryAction({
    context,
    onchain,
    canLaunchRuntime,
    startRunPending,
    canDeployProtocol,
    requiresWalletRelease,
  });
  const chainEvents = [...onchain.deployment.events, ...onchain.mandateProof.events].slice(-8).reverse();
  const planningCard = buildPlanningCard(context.runtimeStage, startRunPending, startRunError);

  return (
    <>
      <section className="runtime-workspace-shell">
        <div className="runtime-workspace-grid">
          <aside className="runtime-rail">
            <div className="runtime-panel">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="site-eyebrow">{runtimeCopy.rails.founder}</p>
                  <h1 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.04em] text-[var(--site-text)]">
                    {protocolPackage.founderPersona.name}
                  </h1>
                </div>
                <span className={cn("site-chip", founderTone(context.founder.state))}>{context.founder.state}</span>
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--site-text-secondary)]">
                {context.founder.currentRead}
              </p>
            </div>

            <div className="runtime-panel-soft">
              <div className="flex items-center justify-between gap-3">
                <p className="site-eyebrow">{runtimeCopy.rails.protocolPackage}</p>
                <span className="site-chip site-chip-ai">{protocolPackage.token.symbol}</span>
              </div>
              <h2 className="mt-3 text-base font-semibold text-[var(--site-text)]">{protocolPackage.daoName}</h2>
              <dl className="mt-4 grid gap-3 border-t border-[var(--site-line)] pt-4">
                <MetaBlock label="Governance" value={protocolPackage.governanceMode} compact />
                <MetaBlock label="Token" value={`${protocolPackage.token.symbol} · ${protocolPackage.token.totalSupplyLabel}`} compact />
                <MetaBlock label="Treasury" value={protocolPackage.treasuryModel} compact />
              </dl>
            </div>

            <div className="runtime-panel-soft">
              <div className="flex items-center justify-between gap-3">
                <p className="site-eyebrow">{runtimeCopy.rails.control}</p>
                <span className={cn("site-chip", authorityTone(context.authority.percent))}>
                  {context.authority.percent}% AI
                </span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgba(16,20,24,0.08)]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,rgba(150,167,214,0.48),rgba(0,229,255,0.92))] transition-[width] duration-500"
                  style={{ width: `${context.authority.percent}%` }}
                />
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--site-text-secondary)]">
                {authoritySummary(context)}
              </p>
            </div>
          </aside>

          <div className="runtime-center">
            <div className="runtime-panel">
              <div className="flex items-center justify-between gap-4 border-b border-[var(--site-line)] pb-5">
                <div>
                  <p className="site-eyebrow">{runtimeCopy.center.status}</p>
                  <h2 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[var(--site-text)]">
                    {workspace.run.label}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-[var(--site-text-secondary)]">{workspace.run.summary}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn("site-chip", toneToChip(workspace.run.tone))}>
                    {workspace.run.nextAction}
                  </span>
                  <button type="button" onClick={onReset} className="site-secondary-button h-10 px-4">
                    <RotateCcw className="h-4 w-4" />
                    {runtimeCopy.buttons.reset}
                  </button>
                </div>
              </div>

              <div className="mt-5">
                <label htmlFor="runtime-intent" className="site-eyebrow">{runtimeCopy.center.mission}</label>
                <textarea
                  id="runtime-intent"
                  value={intent}
                  onChange={(event) => onIntentChange(event.target.value)}
                  placeholder={runtimeCopy.placeholder.mission}
                  className="mt-3 min-h-32 w-full rounded-[24px] border border-[var(--site-line)] bg-white px-5 py-4 text-base leading-8 text-[var(--site-text)] outline-none transition focus:border-[rgba(16,20,24,0.22)]"
                />
              </div>

              <div className="mt-6 runtime-actions-grid">
                {workspace.stepFlow.map((item) => (
                  <ActionTile key={item.step} step={item.step} title={item.title} subtitle={item.subtitle} state={item.status} />
                ))}
              </div>

              {planningCard ? (
                <div className="mt-6 rounded-[22px] border border-[rgba(16,20,24,0.08)] bg-white/88 px-5 py-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="site-eyebrow">Planning progress</p>
                    <span className={cn("site-chip", planningCard.tone === "danger" ? "site-chip-danger" : planningCard.tone === "success" ? "site-chip-success" : "site-chip-ai")}>
                      {planningCard.label}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-[var(--site-text-secondary)]">{planningCard.summary}</p>
                  <ol className="mt-4 space-y-2">
                    {planningCard.steps.map((step) => (
                      <li
                        key={step.id}
                        className="flex items-center justify-between gap-3 rounded-[14px] border border-[rgba(16,20,24,0.08)] bg-white px-3 py-2"
                      >
                        <p className="text-sm text-[var(--site-text)]">{step.label}</p>
                        <span
                          className={cn(
                            "site-chip",
                            step.state === "done"
                              ? "site-chip-success"
                              : step.state === "running"
                                ? "site-chip-ai"
                                : step.state === "failed"
                                  ? "site-chip-danger"
                                  : "site-chip-neutral",
                          )}
                        >
                          {step.state}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-3 border-t border-[var(--site-line)] pt-5">
                {primaryAction ? (
                  <button
                    type="button"
                    onClick={
                  primaryAction.key === "connect"
                        ? onConnectWallet
                        : primaryAction.key === "switch"
                          ? onSwitchNetwork
                          : primaryAction.key === "start"
                            ? onStart
                            : primaryAction.key === "deploy"
                              ? onDeployProtocol
                              : onApproveMandate
                    }
                    disabled={primaryAction.disabled}
                    className="site-primary-cta h-11 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <span className="inline-flex h-4 w-4 items-center justify-center">
                      {renderPrimaryActionIcon(primaryAction.key)}
                    </span>
                    {primaryAction.label}
                  </button>
                ) : null}
                {requiresWalletRelease ? (
                  <button type="button" onClick={onRejectMandate} className="site-secondary-button h-11">
                    {runtimeCopy.buttons.reject}
                  </button>
                ) : null}
                {canOverride ? (
                  <button type="button" onClick={onOpenOverride} className="site-secondary-button h-11">
                    <CornerDownLeft className="h-4 w-4" />
                    {runtimeCopy.buttons.override}
                  </button>
                ) : null}
                {overrideActive ? (
                  <button type="button" onClick={onRedirect} className="site-secondary-button h-11">
                    <Route className="h-4 w-4" />
                    {runtimeCopy.buttons.redirect}
                  </button>
                ) : null}
                {overrideActive ? (
                  <button
                    type="button"
                    onClick={onAbort}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[rgba(255,107,107,0.12)] px-5 text-sm font-medium text-[#b04b4b]"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    {runtimeCopy.buttons.abort}
                  </button>
                ) : null}
                {overrideActive ? (
                  <button type="button" onClick={onResume} className="site-secondary-button h-11">
                    <ShieldAlert className="h-4 w-4" />
                    {runtimeCopy.buttons.resume}
                  </button>
                ) : null}
              </div>
              {startRunError ? (
                <p className="mt-3 text-sm leading-7 text-[#b04b4b]">{startRunError}</p>
              ) : null}
            </div>
          </div>

          <aside className="runtime-rail">
            <div className="runtime-panel">
              <div className="flex items-center justify-between gap-3">
                <p className="site-eyebrow">{runtimeCopy.rails.wallet}</p>
                <div className="flex items-center gap-2">
                  <span className={cn("site-chip", toneToChip(workspace.signer.tone))}>
                    {workspace.signer.label}
                  </span>
                  {isWalletConnected ? (
                    <button type="button" onClick={onDisconnectWallet} className="site-secondary-button h-9 px-4">
                      {runtimeCopy.buttons.disconnect}
                    </button>
                  ) : null}
                </div>
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--site-text-secondary)]">{workspace.signer.summary}</p>
              <dl className="mt-4 grid gap-3 border-t border-[var(--site-line)] pt-4">
                {workspace.signer.fields.map((field) => (
                  <MetaBlock key={field.label} label={field.label} value={field.value} compact />
                ))}
                {onchain.walletStatus === "no_test_eth" ? (
                  <MetaBlock label="Faucet" value="Get test ETH: bridge.base.org / faucet.quicknode.com/base/sepolia" compact />
                ) : null}
              </dl>
            </div>

            <div className="runtime-panel">
              <div className="flex items-center justify-between gap-3">
                <p className="site-eyebrow">{runtimeCopy.rails.deployment}</p>
                <span className={cn("site-chip", toneToChip(workspace.protocol.tone))}>
                  {workspace.protocol.label}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--site-text-secondary)]">{workspace.protocol.summary}</p>
              <dl className="mt-4 grid gap-3 border-t border-[var(--site-line)] pt-4">
                {workspace.protocol.fields.map((field) => (
                  <MetaBlock key={field.label} label={field.label} value={field.value} href={field.href ?? undefined} compact />
                ))}
              </dl>
            </div>

            <div className="runtime-panel-fill">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="site-eyebrow">{runtimeCopy.rails.summary}</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--site-text-secondary)]">Current proof for this run.</p>
                </div>
                <span className={cn("site-chip", toneToChip(workspace.proof.tone))}>{workspace.proof.label}</span>
              </div>
              <dl className="mt-4 grid gap-3 border-t border-[var(--site-line)] pt-4">
                {workspace.proof.fields.map((row) => (
                  <SummaryRow key={row.label} label={row.label} value={row.value} href={row.href ?? undefined} />
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </section>

      <section className="runtime-subsection">
        <div className="runtime-detail-stack">
          <div className="runtime-decision-grid">
            <StateBlock
              label={runtimeCopy.center.signal}
              value={context.signal?.headline ?? "Waiting"}
              body={
                context.signal
                  ? `${context.signal.source} · ${context.signal.freshness} · ${context.signal.mode}\n${context.signal.insight}`
                  : context.runtimeStage === "hard_fail"
                    ? "Signal lookup failed before a mandate could be prepared."
                    : "No signal yet."
              }
              tone={context.runtimeStage === "hard_fail" ? "danger" : context.signal ? "ai" : "neutral"}
            />
            <MandateCard view={presentation.mandate} plan={presentation.aiPlan} />
            <StateBlock
              label={runtimeCopy.center.execution}
              value={executionLabel(context, onchain)}
              body={executionBody(context, onchain)}
              tone={executionTone(context, onchain)}
            />
          </div>

          <div className="runtime-subsection-grid">
            <div className="runtime-panel-fill runtime-scroll">
              <div className="flex items-center justify-between gap-4 border-b border-[var(--site-line)] pb-5">
                <div>
                  <p className="site-eyebrow">{runtimeCopy.rails.evidence}</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--site-text-secondary)]">
                    Timeline, proof facts, and chain history for this run.
                  </p>
                </div>
                <span className={cn("site-chip", toneToChip(workspace.proof.tone))}>{workspace.proof.label}</span>
              </div>

              <div className="mt-5">
                <p className="site-eyebrow">{runtimeCopy.rails.activity}</p>
                <ol className="mt-3 space-y-3">
                  {combinedEvents.map((event, index) => (
                    <li
                      key={event.id}
                      className="rounded-[22px] border border-[rgba(16,20,24,0.06)] bg-white/88 px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className={cn("site-chip", toneToChip(event.tone))}>
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <p className="text-sm font-semibold text-[var(--site-text)]">{event.label}</p>
                        </div>
                        <span className="text-sm text-[var(--site-text-secondary)]">{event.at}</span>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-[var(--site-text-secondary)]">{event.detail}</p>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-6 border-t border-[var(--site-line)] pt-5">
                <p className="site-eyebrow">Proof facts</p>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                  {proofRows.map((row) => (
                    <SummaryRow key={row.label} label={row.label} value={row.value} href={row.href ?? undefined} />
                  ))}
                </dl>
              </div>

              {chainEvents.length ? (
                <div className="mt-6 border-t border-[var(--site-line)] pt-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="site-eyebrow">Chain events</p>
                    <span className="site-chip site-chip-neutral">{chainEvents.length}</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {chainEvents.map((event) => (
                      <div
                        key={`${event.txHash}-${event.name}-${event.blockNumber}`}
                        className="rounded-[14px] border border-[rgba(16,20,24,0.08)] bg-white/72 px-3 py-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--site-text)]">
                            {event.name}
                          </p>
                          <span className="text-xs text-[var(--site-text-secondary)]">#{event.blockNumber}</span>
                        </div>
                        <p className="mt-2 text-xs leading-6 text-[var(--site-text-secondary)]">{event.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {onchain.proposalHistory.length ? (
                <div className="mt-6 border-t border-[var(--site-line)] pt-5">
                  <p className="site-eyebrow">Proposal history</p>
                  <div className="mt-3 space-y-2">
                    {onchain.proposalHistory.slice(0, 4).map((item) => (
                      <button
                        key={item.proposalId.toString()}
                        type="button"
                        onClick={() => onSelectProposal(item.proposalId)}
                        className="w-full rounded-[14px] border border-[rgba(16,20,24,0.08)] bg-white/78 px-3 py-3 text-left transition hover:border-[rgba(16,20,24,0.16)]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs uppercase tracking-[0.12em] text-[var(--site-text-secondary)]">
                            {item.action} · {governorStateLabel(item.governorState)}
                          </p>
                          <span className="text-xs text-[var(--site-text-secondary)]">
                            {formatEta(item.proposalEta)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-medium text-[var(--site-text)]">
                          #{item.proposalId.toString()}
                        </p>
                        <p className="mt-1 text-xs text-[var(--site-text-secondary)]">
                          {formatHash(item.executeTxHash) ??
                            formatHash(item.queueTxHash) ??
                            formatHash(item.voteTxHash) ??
                            formatHash(item.proposalTxHash) ??
                            "pending"}
                        </p>
                      </button>
                    ))}
                  </div>

                  {manualDaoMode && hasProposal ? (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={onVoteProposal}
                        disabled={!canVoteProposal}
                        className="site-secondary-button h-10 disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        Vote
                      </button>
                      <button
                        type="button"
                        onClick={onQueueProposal}
                        disabled={!canQueueProposal}
                        className="site-secondary-button h-10 disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        Queue
                      </button>
                      <button
                        type="button"
                        onClick={onExecuteProposal}
                        disabled={!canExecuteProposal}
                        className="site-secondary-button h-10 disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        Execute
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="runtime-rail">
              <div className="runtime-panel-fill runtime-scroll">
                <div className="flex items-center justify-between gap-3 border-b border-[var(--site-line)] pb-5">
                  <p className="site-eyebrow">{runtimeCopy.rails.calls}</p>
                  <span className="site-chip site-chip-neutral">{toolStateLabel(context.runtimeStage)}</span>
                </div>
                <div className="mt-5 space-y-3">
                  {toolRowsData.map((entry) => (
                    <div
                      key={`${entry.name}-${entry.detail}`}
                      className="rounded-[22px] border border-[rgba(16,20,24,0.06)] bg-white/88 px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-[var(--site-text)]">{entry.name}</p>
                        <span className={cn("site-chip", toolTone(entry.status))}>{entry.status}</span>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-[var(--site-text-secondary)]">{entry.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <ProtocolPackageCard view={presentation.protocolPackage} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ActionTile({
  step,
  title,
  subtitle,
  state,
  actionLabel,
  onClick,
  disabled,
  icon,
}: {
  step: string;
  title: string;
  subtitle: string;
  state: "pending" | "active" | "done" | "danger" | "warning";
  actionLabel?: string;
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "runtime-action-tile",
        state === "active" && "runtime-action-tile-active",
        state === "pending" && "runtime-action-tile-muted",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--site-text-secondary)]">{step}</p>
        <span className={cn("site-chip", stateChip(state))}>{stateLabel(state)}</span>
      </div>
      <h3 className="mt-3 text-sm font-semibold text-[var(--site-text)]">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-[var(--site-text-secondary)]">{subtitle}</p>
      {actionLabel && onClick ? (
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className={cn(
            "mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium",
            state === "danger"
              ? "bg-[rgba(255,107,107,0.12)] text-[#b04b4b]"
              : "bg-[var(--site-text)] text-white",
            disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer",
          )}
        >
          {icon}
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function StateBlock({
  label,
  value,
  body,
  tone,
}: {
  label: string;
  value: string;
  body: string;
  tone: "neutral" | "ai" | "warning" | "danger" | "success";
}) {
  return (
    <div className="rounded-[22px] bg-[var(--site-surface-muted)] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="site-eyebrow">{label}</p>
        <span className={cn("site-chip", toneToChip(tone))}>{toneLabel(tone)}</span>
      </div>
      <h3 className="mt-3 text-base font-semibold text-[var(--site-text)]">{value}</h3>
      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--site-text-secondary)]">{body}</p>
    </div>
  );
}

function MetaBlock({
  label,
  value,
  href,
  compact = false,
}: {
  label: string;
  value: string;
  href?: string;
  compact?: boolean;
}) {
  return (
    <div>
      <p className="site-eyebrow">{label}</p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "mt-2 inline-flex text-sm leading-7 text-[var(--site-accent)] underline decoration-[rgba(0,229,255,0.28)] underline-offset-4 transition hover:decoration-[rgba(0,229,255,0.58)]",
            compact ? "text-sm leading-7" : "text-sm leading-7",
          )}
        >
          {value}
        </a>
      ) : (
        <p className={cn("mt-2 text-[var(--site-text-secondary)]", compact ? "text-sm leading-7" : "text-sm leading-7")}>
          {value}
        </p>
      )}
    </div>
  );
}

function SummaryRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="grid grid-cols-[84px_minmax(0,1fr)] gap-3">
      <dt className="site-eyebrow">{label}</dt>
      <dd className="text-sm text-[var(--site-text)]">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--site-accent)] underline decoration-[rgba(0,229,255,0.28)] underline-offset-4 transition hover:decoration-[rgba(0,229,255,0.58)]"
          >
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function getPrimaryAction({
  context,
  onchain,
  canLaunchRuntime,
  startRunPending,
  canDeployProtocol,
  requiresWalletRelease,
}: {
  context: RuntimeContext;
  onchain: RuntimeOnchainController;
  canLaunchRuntime: boolean;
  startRunPending: boolean;
  canDeployProtocol: boolean;
  requiresWalletRelease: boolean;
}) {
  if (onchain.walletStatus === "disconnected" || onchain.walletStatus === "failed") {
    return {
      key: "connect" as const,
      label: runtimeCopy.buttons.connect,
      disabled: false,
    };
  }

  if (onchain.walletStatus === "wrong_network") {
    return {
      key: "switch" as const,
      label: runtimeCopy.buttons.switchNetwork,
      disabled: false,
      icon: undefined,
    };
  }

  if (context.runtimeStage === "idle") {
    return {
      key: "start" as const,
      label: startRunPending ? "Planning prompt..." : runtimeCopy.buttons.launch,
      disabled: startRunPending || !canLaunchRuntime,
    };
  }

  if (
    canDeployProtocol &&
    onchain.deployment.status !== "deploying" &&
    onchain.deployment.status !== "deployed" &&
    onchain.deployment.status !== "fallback_ready"
  ) {
    return {
      key: "deploy" as const,
      label: runtimeCopy.buttons.deploy,
      disabled: false,
      icon: undefined,
    };
  }

  if (requiresWalletRelease) {
    return {
      key: "release" as const,
      label: runtimeCopy.buttons.release,
      disabled: false,
    };
  }

  return null;
}

function renderPrimaryActionIcon(key: "connect" | "switch" | "start" | "deploy" | "release") {
  if (key === "connect") return <Wallet className="h-4 w-4" />;
  if (key === "start") return <Play className="h-4 w-4" />;
  if (key === "release") return <CheckCircle2 className="h-4 w-4" />;
  return null;
}

function authoritySummary(context: RuntimeContext) {
  if (context.runtimeStage === "wallet_required") return "The mandate is ready. Connect a wallet to continue.";
  if (context.runtimeStage === "wallet_connected") return "A signer is connected. Move to the target testnet next.";
  if (context.runtimeStage === "network_ready") return "The target testnet is ready. Deploy the protocol package.";
  if (context.runtimeStage === "protocol_deploying") return "Contracts are deploying on the target testnet.";
  if (context.runtimeStage === "protocol_deployed" || context.runtimeStage === "release_pending") {
    return "The mandate is ready. Release, reject, or override it.";
  }
  if (context.runtimeStage === "autonomous_execution") return "The run is active. The system is moving without further input.";
  if (context.runtimeStage === "execution_completed") return "The run finished and the result is recorded.";
  return "You define the mission. The system handles the next steps.";
}

function executionLabel(context: RuntimeContext, onchain: RuntimeOnchainController) {
  if (onchain.mandateProof.status === "executed") return "Executed onchain";
  if (onchain.mandateProof.status === "rejected") return "Rejected onchain";
  if (context.runtimeStage === "release_pending") return "Awaiting wallet release";
  return labelForExecution(context.execution.status);
}

function executionBody(context: RuntimeContext, onchain: RuntimeOnchainController) {
  if (onchain.mandateProof.status === "executed") {
    return `Execution transaction ${formatHash(onchain.mandateProof.actionTxHash) ?? "submitted"} is recorded onchain.`;
  }
  if (onchain.mandateProof.status === "rejected") {
    return `Rejection transaction ${formatHash(onchain.mandateProof.actionTxHash) ?? "submitted"} is recorded onchain.`;
  }
  if (context.runtimeStage === "release_pending") {
    return "The mandate is ready. Release or reject it with the connected wallet.";
  }
  return context.execution.moves[0]?.detail ?? "Execution starts after release.";
}

function executionTone(context: RuntimeContext, onchain: RuntimeOnchainController): "neutral" | "ai" | "warning" | "danger" | "success" {
  if (onchain.mandateProof.status === "executed") return "success";
  if (onchain.mandateProof.status === "rejected" || context.execution.status === "aborted") return "danger";
  if (context.runtimeStage === "release_pending") return "warning";
  if (context.execution.status === "running") return "ai";
  return "neutral";
}

function buildCombinedTimeline(context: RuntimeContext, onchain: RuntimeOnchainController): ExecutionEvent[] {
  const runtimeEvents = context.execution.events.length ? [...context.execution.events] : [...fallbackEvents];
  const onchainSummaryEvents: ExecutionEvent[] = [];

  if (onchain.deployment.status === "deployed") {
    onchainSummaryEvents.push({
      id: `deploy-${onchain.deployment.deploymentTxHash}`,
      label: "Protocol Deployed",
      detail: `${LAISEN_TESTNET_NAME} deployment confirmed. Token ${formatAddress(onchain.deployment.tokenAddress)} · Protocol ${formatAddress(onchain.deployment.protocolAddress)} · Tx ${formatHash(onchain.deployment.deploymentTxHash)}.`,
      tone: "success",
      at: "onchain",
    });
  } else if (onchain.deployment.status === "fallback_ready") {
    onchainSummaryEvents.push({
      id: "fallback-onchain",
      label: "Fallback Armed",
      detail: onchain.deployment.error ?? "Chain flow unavailable. Runtime continuing in offchain-safe mode.",
      tone: "warning",
      at: "fallback",
    });
  }

  if (onchain.mandateProof.status === "executed") {
    onchainSummaryEvents.push({
      id: `execute-${onchain.mandateProof.actionTxHash}`,
      label: "Mandate Executed Onchain",
      detail: `Wallet released approval and execution on ${LAISEN_TESTNET_NAME}. Tx ${formatHash(onchain.mandateProof.actionTxHash)}.`,
      tone: "success",
      at: "onchain",
    });
  }

  if (onchain.mandateProof.status === "rejected") {
    onchainSummaryEvents.push({
      id: `reject-${onchain.mandateProof.actionTxHash}`,
      label: "Mandate Rejected Onchain",
      detail: `Human wallet rejected the mandate on ${LAISEN_TESTNET_NAME}. Tx ${formatHash(onchain.mandateProof.actionTxHash)}.`,
      tone: "danger",
      at: "onchain",
    });
  }

  if (onchain.mandateProof.proposalTxHash && onchain.mandateProof.status !== "idle") {
    onchainSummaryEvents.push({
      id: `proposal-${onchain.mandateProof.proposalTxHash}`,
      label: "Proposal Submitted",
      detail: `Governor proposal ${onchain.mandateProof.proposalId?.toString() ?? "pending"} created with tx ${formatHash(onchain.mandateProof.proposalTxHash)}.`,
      tone: "decision",
      at: "governor",
    });
  }

  if (onchain.mandateProof.voteTxHash) {
    onchainSummaryEvents.push({
      id: `vote-${onchain.mandateProof.voteTxHash}`,
      label: "Vote Recorded",
      detail: `Vote transaction ${formatHash(onchain.mandateProof.voteTxHash)} recorded on ${LAISEN_TESTNET_NAME}.`,
      tone: "neutral",
      at: "governor",
    });
  }

  if (onchain.mandateProof.queueTxHash) {
    onchainSummaryEvents.push({
      id: `queue-${onchain.mandateProof.queueTxHash}`,
      label: "Proposal Queued",
      detail: `Queue transaction ${formatHash(onchain.mandateProof.queueTxHash)} is waiting for timelock execution.`,
      tone: "warning",
      at: "timelock",
    });
  }

  return [...runtimeEvents, ...onchainSummaryEvents];
}

function labelForExecution(status: RuntimeContext["execution"]["status"]) {
  switch (status) {
    case "idle":
      return "Awaiting launch";
    case "running":
      return "Running";
    case "paused":
      return "Paused";
    case "redirected":
      return "Redirected";
    case "aborted":
      return "Aborted";
    case "completed":
      return "Completed";
  }
}

function founderTone(state: RuntimeContext["founder"]["state"]) {
  if (state === "halted" || state === "overridden") return "site-chip-danger";
  if (state === "completed") return "site-chip-success";
  if (state === "deciding" || state === "adapting") return "site-chip-warning";
  return "site-chip-ai";
}

function authorityTone(percent: number) {
  if (percent >= 80) return "site-chip-ai";
  if (percent >= 50) return "site-chip-warning";
  return "site-chip-neutral";
}

function toolTone(status: string) {
  if (status === "done") return "site-chip-success";
  if (status === "failed") return "site-chip-danger";
  if (status === "fallback") return "site-chip-warning";
  if (status === "running") return "site-chip-ai";
  return "site-chip-neutral";
}

function toolStateLabel(stage: RuntimeContext["runtimeStage"]) {
  switch (stage) {
    case "idle":
      return "idle";
    case "founder_spawn":
    case "signal_intake":
    case "ai_decision":
    case "wallet_required":
    case "wallet_connected":
    case "network_ready":
    case "protocol_deploying":
    case "protocol_deployed":
    case "release_pending":
    case "awaiting_approval":
      return "review";
    case "autonomous_execution":
    case "resumed_execution":
    case "redirected_execution":
      return "running";
    case "execution_completed":
      return "done";
    case "safe_mode_adapting":
      return "fallback";
    case "hard_fail":
    case "aborted_execution":
    case "mandate_rejected":
      return "blocked";
    default:
      return "interrupt";
  }
}

function toneToChip(tone: "neutral" | "ai" | "warning" | "danger" | "success" | "decision") {
  switch (tone) {
    case "ai":
      return "site-chip-ai";
    case "warning":
      return "site-chip-warning";
    case "danger":
      return "site-chip-danger";
    case "success":
      return "site-chip-success";
    case "decision":
      return "site-chip-ai";
    default:
      return "site-chip-neutral";
  }
}

function toneLabel(tone: "neutral" | "ai" | "warning" | "danger" | "success") {
  switch (tone) {
    case "ai":
      return "Live";
    case "warning":
      return "Review";
    case "danger":
      return "Blocked";
    case "success":
      return "Done";
    default:
      return "Pending";
  }
}

function stateChip(state: "pending" | "active" | "done" | "danger" | "warning") {
  switch (state) {
    case "active":
      return "site-chip-warning";
    case "done":
      return "site-chip-success";
    case "danger":
      return "site-chip-danger";
    case "warning":
      return "site-chip-warning";
    default:
      return "site-chip-neutral";
  }
}

function stateLabel(state: "pending" | "active" | "done" | "danger" | "warning") {
  switch (state) {
    case "active":
      return "Active";
    case "done":
      return "Done";
    case "danger":
      return "Blocked";
    case "warning":
      return "Fallback";
    default:
      return "Pending";
  }
}

function formatAddress(value: string | null) {
  if (!value) return null;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function formatHash(value: string | null) {
  if (!value) return null;
  return `${value.slice(0, 10)}...${value.slice(-6)}`;
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

function formatEta(value: bigint | null) {
  if (!value || value === BigInt(0)) return "Pending";

  const now = Math.floor(Date.now() / 1000);
  const eta = Number(value);
  if (eta <= now) return "Ready";
  return `${eta - now}s`;
}

function isEtaReady(value: bigint | null) {
  if (!value || value === BigInt(0)) return false;
  const now = Math.floor(Date.now() / 1000);
  return Number(value) <= now;
}

function buildPlanningCard(
  runtimeStage: RuntimeContext["runtimeStage"],
  startRunPending: boolean,
  startRunError: string | null,
) {
  const planningStage =
    startRunPending ||
    runtimeStage === "founder_spawn" ||
    runtimeStage === "signal_intake" ||
    runtimeStage === "ai_decision" ||
    runtimeStage === "safe_mode_adapting";
  const handedOff =
    runtimeStage === "wallet_required" ||
    runtimeStage === "wallet_connected" ||
    runtimeStage === "network_ready" ||
    runtimeStage === "protocol_deploying" ||
    runtimeStage === "protocol_deployed" ||
    runtimeStage === "release_pending" ||
    runtimeStage === "autonomous_execution" ||
    runtimeStage === "execution_completed" ||
    runtimeStage === "mandate_rejected" ||
    runtimeStage === "aborted_execution" ||
    runtimeStage === "hard_fail";
  const hasStarted = planningStage || handedOff;

  const requestState: "queued" | "running" | "done" | "failed" = startRunError
    ? "failed"
    : startRunPending
      ? "running"
      : hasStarted
        ? "done"
        : "queued";

  const packageState: "queued" | "running" | "done" | "failed" = startRunError
    ? "failed"
    : startRunPending
      ? "running"
      : hasStarted
        ? "done"
        : "queued";

  const mandateState: "queued" | "running" | "done" | "failed" =
    runtimeStage === "founder_spawn" || runtimeStage === "signal_intake" || runtimeStage === "ai_decision"
      ? "running"
      : runtimeStage === "wallet_required" ||
          runtimeStage === "wallet_connected" ||
          runtimeStage === "network_ready" ||
          runtimeStage === "protocol_deploying" ||
          runtimeStage === "protocol_deployed" ||
          runtimeStage === "release_pending" ||
          runtimeStage === "autonomous_execution" ||
          runtimeStage === "execution_completed"
        ? "done"
        : startRunError
          ? "failed"
          : "queued";

  const handoffState: "queued" | "running" | "done" | "failed" =
    runtimeStage === "wallet_required" || runtimeStage === "wallet_connected" || handedOff
      ? "done"
      : startRunError
        ? "failed"
        : "queued";

  return {
    label: startRunError ? "Failed" : handoffState === "done" ? "Ready" : planningStage ? "Running" : "Waiting",
    tone: startRunError
      ? ("danger" as const)
      : handoffState === "done"
        ? ("success" as const)
        : planningStage
          ? ("ai" as const)
          : ("neutral" as const),
    summary: startRunError
      ? startRunError
      : handoffState === "done"
        ? "Planning completed. Continue with wallet and network steps."
        : planningStage
          ? "Preparing prompt plan, package, and mandate."
          : "Planning has not started yet.",
    steps: [
      { id: "request", label: "Send planning request", state: requestState },
      { id: "package", label: "Build protocol package", state: packageState },
      { id: "mandate", label: "Generate mandate", state: mandateState },
      { id: "handoff", label: "Hand off to wallet flow", state: handoffState },
    ],
  };
}

const fallbackEvents: ExecutionEvent[] = [
  {
    id: "fallback-1",
    label: "Run ready",
    detail: `Connect MetaMask, deploy on ${LAISEN_TESTNET_NAME}, or continue in safe mode.`,
    tone: "neutral",
    at: "now",
  },
  {
    id: "fallback-2",
    label: "Wallet waiting",
    detail: "No wallet action has happened yet because the protocol package is not deployed.",
    tone: "neutral",
    at: "pending",
  },
  {
    id: "fallback-3",
    label: "Activity pending",
    detail: "New runtime and onchain events will appear here after the run begins.",
    tone: "neutral",
    at: "pending",
  },
];
