"use client";

import { useState } from "react";

type ResilienceStage =
  | "idle"
  | "running"
  | "safe_mode_adapting"
  | "override_requested"
  | "override_active"
  | "resumed_execution"
  | "redirected_execution"
  | "aborted_execution"
  | "hard_fail";

type ResilienceEvent = {
  id: string;
  label: string;
  detail: string;
  at: string;
};

export function RuntimeResilienceStage() {
  const [stage, setStage] = useState<ResilienceStage>("idle");
  const [events, setEvents] = useState<ResilienceEvent[]>([]);

  function emit(label: string, detail: string, nextStage: ResilienceStage) {
    setStage(nextStage);
    setEvents((current) => [
      ...current,
      {
        id: `${label}-${Date.now().toString(36)}`,
        label,
        detail,
        at: new Date().toLocaleTimeString("en-US", { hour12: false }),
      },
    ]);
  }

  return (
    <section className="site-section py-10 md:py-14">
      <div className="site-soft-panel rounded-[28px] p-6 md:p-8">
        <p className="site-eyebrow">Resilience controls module</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--site-text)] md:text-[2.6rem]">
          Runtime interruption controls
        </h1>
        <p className="mt-4 text-base leading-8 text-[var(--site-text-secondary)]">
          This module adds visible resilience actions: safe mode, hard fail, and human override controls.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={() => emit("Run started", "Execution lane is active.", "running")} className="site-primary-cta h-10">
            Start
          </button>
          <button
            type="button"
            onClick={() => emit("Safe mode", "Switched to cached fallback path.", "safe_mode_adapting")}
            className="site-secondary-button h-10"
          >
            Safe Mode
          </button>
          <button
            type="button"
            onClick={() => emit("Override requested", "Human interrupt requested.", "override_requested")}
            className="site-secondary-button h-10"
          >
            Request Override
          </button>
          <button
            type="button"
            onClick={() => emit("Override active", "Execution paused under human control.", "override_active")}
            className="site-secondary-button h-10"
          >
            Activate Override
          </button>
          <button
            type="button"
            onClick={() => emit("Resumed", "Control returned to AI lane.", "resumed_execution")}
            className="site-secondary-button h-10"
          >
            Resume
          </button>
          <button
            type="button"
            onClick={() => emit("Redirected", "Execution continued with updated constraints.", "redirected_execution")}
            className="site-secondary-button h-10"
          >
            Redirect
          </button>
          <button
            type="button"
            onClick={() => emit("Aborted", "Run halted by operator.", "aborted_execution")}
            className="site-secondary-button h-10"
          >
            Abort
          </button>
          <button
            type="button"
            onClick={() => emit("Hard fail", "Signal and fallback both unavailable.", "hard_fail")}
            className="site-secondary-button h-10"
          >
            Hard Fail
          </button>
          <button
            type="button"
            onClick={() => {
              setStage("idle");
              setEvents([]);
            }}
            className="site-secondary-button h-10"
          >
            Reset
          </button>
        </div>

        <p className="mt-6 text-sm text-[var(--site-text-secondary)]">
          Current stage: <span className="font-semibold text-[var(--site-text)]">{stage}</span>
        </p>
      </div>

      <div className="mt-8 site-soft-panel rounded-[28px] p-6 md:p-8">
        <p className="site-eyebrow">Resilience timeline</p>
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
              No resilience event yet.
            </li>
          )}
        </ol>
      </div>
    </section>
  );
}
