"use client";

import { useState } from "react";

type PlanResponse = {
  ok: true;
  source: "live_ai" | "deterministic_fallback";
  provider: string;
  model: string;
  error?: string;
  plan: {
    title: string;
    action: string;
    reason: string;
    riskLevel: "low" | "medium" | "high";
  };
};

export function RuntimeAiPlanStage() {
  const [intent, setIntent] = useState(
    "Wake an AI founder that detects demand shifts and prepares a bounded autonomous execution plan.",
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PlanResponse | null>(null);

  async function runPlan() {
    if (intent.trim().length < 20 || pending) return;
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/runtime/ai-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent }),
      });
      if (!response.ok) throw new Error(`Planning failed (${response.status}).`);

      const data = (await response.json()) as PlanResponse;
      setResult(data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Planning request failed.");
      setResult(null);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="site-section py-10 md:py-14">
      <div className="site-soft-panel rounded-[28px] p-6 md:p-8">
        <p className="site-eyebrow">AI planning API</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--site-text)] md:text-[2.6rem]">
          Runtime planning endpoint
        </h1>
        <p className="mt-4 text-base leading-8 text-[var(--site-text-secondary)]">
          This module adds only AI planning route logic and fallback behavior.
        </p>

        <label htmlFor="intent" className="site-eyebrow mt-7 block">
          Mission
        </label>
        <textarea
          id="intent"
          value={intent}
          onChange={(event) => setIntent(event.target.value)}
          className="mt-2 min-h-28 w-full rounded-[20px] border border-[var(--site-line)] bg-white px-4 py-3 text-sm leading-7 text-[var(--site-text)] outline-none"
        />

        <div className="mt-5">
          <button
            type="button"
            disabled={pending || intent.trim().length < 20}
            onClick={() => void runPlan()}
            className="site-primary-cta h-10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending ? "Planning..." : "Generate Plan"}
          </button>
        </div>

        {error ? (
          <p className="mt-3 text-sm text-[#b04b4b]">{error}</p>
        ) : null}
      </div>

      {result ? (
        <div className="mt-8 site-soft-panel rounded-[28px] p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="site-chip site-chip-ai">{result.source}</span>
            <span className="site-chip site-chip-neutral">{result.provider}</span>
            <span className="site-chip site-chip-neutral">{result.model}</span>
          </div>
          {result.error ? (
            <p className="mt-3 text-sm text-[var(--site-text-secondary)]">{result.error}</p>
          ) : null}
          <h2 className="mt-4 text-xl font-semibold text-[var(--site-text)]">{result.plan.title}</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--site-text-secondary)]">{result.plan.action}</p>
          <p className="mt-3 text-sm leading-7 text-[var(--site-text-secondary)]">{result.plan.reason}</p>
          <p className="mt-4 text-sm text-[var(--site-text)]">Risk: {result.plan.riskLevel}</p>
        </div>
      ) : null}
    </section>
  );
}
