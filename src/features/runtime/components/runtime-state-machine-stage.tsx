"use client";

import { useMachine } from "@xstate/react";
import { useState } from "react";

import { runtimeMachine } from "@/features/runtime/machine/runtime-machine";
import type { RuntimeProfile } from "@/features/runtime/schema/runtime-schema";
import { cn } from "@/lib/utils";

export function RuntimeStateMachineStage() {
  const [state, send] = useMachine(runtimeMachine);
  const [intent, setIntent] = useState(
    "Wake an AI founder that detects demand shifts and prepares an autonomous execution run.",
  );
  const [profile] = useState<RuntimeProfile>("live");
  const canStart = state.matches("idle") && intent.trim().length >= 20;

  return (
    <section className="site-section py-10 md:py-14">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="site-soft-panel rounded-[28px] p-6 md:p-8">
          <p className="site-eyebrow">Runtime state machine</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--site-text)] md:text-[2.6rem]">
            Deterministic runtime flow
          </h1>
          <p className="mt-4 text-base leading-8 text-[var(--site-text-secondary)]">
            This branch contains only the offline machine flow. It does not call AI APIs or connect wallets/chains.
          </p>

          <label htmlFor="runtime-intent" className="site-eyebrow mt-7 block">
            Mission
          </label>
          <textarea
            id="runtime-intent"
            value={intent}
            onChange={(event) => setIntent(event.target.value)}
            className="mt-2 min-h-28 w-full rounded-[20px] border border-[var(--site-line)] bg-white px-4 py-3 text-sm leading-7 text-[var(--site-text)] outline-none"
          />

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                if (!canStart) return;
                send({ type: "runtime.start", intent: intent.trim(), profile });
              }}
              disabled={!canStart}
              className="site-primary-cta h-10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Start Run
            </button>
            <button
              type="button"
              onClick={() => send({ type: "runtime.reset" })}
              className="site-secondary-button h-10"
            >
              Reset
            </button>
            <span className="site-chip site-chip-neutral self-center">{state.context.runtimeStage}</span>
          </div>
        </div>

        <div className="site-soft-panel rounded-[28px] p-6 md:p-8">
          <p className="site-eyebrow">Current reads</p>
          <dl className="mt-4 grid gap-4 text-sm">
            <MetaRow label="Founder" value={state.context.founderRead} />
            <MetaRow label="Signal" value={state.context.signalRead} />
            <MetaRow label="Decision" value={state.context.decisionRead} />
            <MetaRow
              label="Execution"
              value={state.context.executionMoves.length ? state.context.executionMoves.join(" -> ") : "Pending"}
            />
          </dl>
        </div>
      </div>

      <div className="mt-8 site-soft-panel rounded-[28px] p-6 md:p-8">
        <p className="site-eyebrow">Timeline</p>
        <ol className="mt-4 space-y-3">
          {state.context.events.length ? (
            state.context.events.map((event, index) => (
              <li key={event.id} className="rounded-[18px] border border-[var(--site-line)] bg-white/70 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={cn("site-chip", "site-chip-ai")}>{String(index + 1).padStart(2, "0")}</span>
                    <p className="text-sm font-semibold text-[var(--site-text)]">{event.label}</p>
                  </div>
                  <span className="text-xs text-[var(--site-text-secondary)]">{event.at}</span>
                </div>
                <p className="mt-2 text-sm leading-7 text-[var(--site-text-secondary)]">{event.detail}</p>
              </li>
            ))
          ) : (
            <li className="rounded-[18px] border border-[var(--site-line)] bg-white/70 px-4 py-3 text-sm text-[var(--site-text-secondary)]">
              Timeline is empty. Start a run to generate state transitions.
            </li>
          )}
        </ol>
      </div>
    </section>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[90px_minmax(0,1fr)] gap-3">
      <dt className="site-eyebrow">{label}</dt>
      <dd className="text-sm leading-7 text-[var(--site-text-secondary)]">{value}</dd>
    </div>
  );
}
