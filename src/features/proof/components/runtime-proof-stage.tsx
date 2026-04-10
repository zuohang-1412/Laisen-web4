"use client";

import { useEffect, useState } from "react";

import type { ProofEvent, ProofSnapshot } from "@/features/proof/schema/proof-types";
import {
  clearProofSnapshot,
  loadProofSnapshot,
  saveProofSnapshot,
} from "@/features/proof/utils/runtime-proof-persistence";

export function RuntimeProofStage() {
  const [runId] = useState(() => `run-${Date.now().toString(36)}`);
  const [status, setStatus] = useState<ProofSnapshot["status"]>(() => {
    const snapshot = loadProofSnapshot(typeof window === "undefined" ? undefined : window.localStorage);
    return snapshot?.status ?? "pending";
  });
  const [events, setEvents] = useState<ProofEvent[]>(() => {
    const snapshot = loadProofSnapshot(typeof window === "undefined" ? undefined : window.localStorage);
    return snapshot?.events ?? [];
  });

  useEffect(() => {
    const snapshot: ProofSnapshot = {
      version: 1,
      runId,
      status,
      events,
      updatedAt: Date.now(),
    };
    saveProofSnapshot(typeof window === "undefined" ? undefined : window.localStorage, snapshot);
  }, [events, runId, status]);

  function append(label: string, detail: string, nextStatus: ProofSnapshot["status"]) {
    setEvents((current) => [
      ...current,
      {
        id: `${label}-${Date.now().toString(36)}`,
        label,
        detail,
        at: new Date().toLocaleTimeString("en-US", { hour12: false }),
      },
    ]);
    setStatus(nextStatus);
  }

  return (
    <section className="site-section py-10 md:py-14">
      <div className="site-soft-panel rounded-[28px] p-6 md:p-8">
        <p className="site-eyebrow">Proof persistence module</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--site-text)] md:text-[2.6rem]">
          Runtime proof snapshot
        </h1>
        <p className="mt-4 text-base leading-8 text-[var(--site-text-secondary)]">
          This module persists runtime proof events to localStorage and restores them after refresh.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => append("Run started", "Execution initiated for current mission.", "running")}
            className="site-primary-cta h-10"
          >
            Start
          </button>
          <button
            type="button"
            onClick={() => append("Execution completed", "Run finished and proof was sealed.", "completed")}
            className="site-secondary-button h-10"
          >
            Complete
          </button>
          <button
            type="button"
            onClick={() => append("Execution failed", "Run failed and emitted error-proof entry.", "failed")}
            className="site-secondary-button h-10"
          >
            Fail
          </button>
          <button
            type="button"
            onClick={() => {
              setStatus("pending");
              setEvents([]);
              clearProofSnapshot(typeof window === "undefined" ? undefined : window.localStorage);
            }}
            className="site-secondary-button h-10"
          >
            Clear Snapshot
          </button>
        </div>

        <dl className="mt-6 grid gap-2 border-t border-[var(--site-line)] pt-4 text-sm">
          <MetaRow label="Run" value={runId} />
          <MetaRow label="Status" value={status} />
          <MetaRow label="Events" value={String(events.length)} />
        </dl>
      </div>

      <div className="mt-8 site-soft-panel rounded-[28px] p-6 md:p-8">
        <p className="site-eyebrow">Proof timeline</p>
        <ol className="mt-4 space-y-3">
          {events.length ? (
            events.map((event, index) => (
              <li key={event.id} className="rounded-[16px] border border-[var(--site-line)] bg-white/70 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--site-text)]">
                    {String(index + 1).padStart(2, "0")} {event.label}
                  </p>
                  <span className="text-xs text-[var(--site-text-secondary)]">{event.at}</span>
                </div>
                <p className="mt-2 text-sm leading-7 text-[var(--site-text-secondary)]">{event.detail}</p>
              </li>
            ))
          ) : (
            <li className="rounded-[16px] border border-[var(--site-line)] bg-white/70 px-4 py-3 text-sm text-[var(--site-text-secondary)]">
              No proof event yet.
            </li>
          )}
        </ol>
      </div>
    </section>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[70px_minmax(0,1fr)] gap-3">
      <dt className="site-eyebrow">{label}</dt>
      <dd className="text-sm text-[var(--site-text-secondary)]">{value}</dd>
    </div>
  );
}
