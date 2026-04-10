import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { siteCopy } from "@/features/site/content/site-copy";

export function RuntimePreview() {
  const copy = siteCopy.runtimePreview;

  return (
    <section className="site-divider py-24 md:py-28">
      <div className="site-section">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
          <div className="max-w-2xl">
            <p className="site-eyebrow">{copy.eyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--site-text)] md:text-[2.8rem] md:leading-[1.04]">
              {copy.title}
            </h2>
            <p className="mt-6 text-lg leading-8 text-[var(--site-text-secondary)]">
              {copy.body}
            </p>
            <div className="mt-8">
              <Link href="/runtime" className="site-primary-cta">
                {siteCopy.nav.primaryCta}
              </Link>
            </div>
          </div>

          <div className="site-soft-panel rounded-[36px] p-6 md:p-8">
            <div className="grid gap-6">
              <div className="grid gap-4 border-b border-[var(--site-line)] pb-6 md:grid-cols-[160px_minmax(0,1fr)]">
                <p className="site-eyebrow">{copy.stageLabel}</p>
                <p className="text-base leading-8 text-[var(--site-text-secondary)]">
                  {copy.stageBody}
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-[1fr_220px]">
                <div className="rounded-[28px] bg-[var(--site-surface-muted)] px-5 py-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="site-eyebrow">{copy.sequenceLabel}</p>
                      <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[var(--site-text)]">
                        {copy.sequenceValue}
                      </p>
                    </div>
                    <span className="site-chip site-chip-ai">Live</span>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-5">
                    {["Intent", "Deploy", "Signal", "Release", "Proof"].map((step, index) => (
                      <div
                        key={step}
                        className="rounded-[20px] bg-white/70 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
                      >
                        <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--site-text-secondary)]">
                          {String(index + 1).padStart(2, "0")}
                        </p>
                        <p className="mt-2 text-sm font-medium text-[var(--site-text)]">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] bg-white/68 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.88)]">
                  <p className="site-eyebrow">{copy.proofLabel}</p>
                  <dl className="mt-4 space-y-4 text-sm">
                    {copy.proofRows.map((row) => (
                      <div key={row.label} className="grid grid-cols-[84px_minmax(0,1fr)] gap-3">
                        <dt className="text-[var(--site-text-secondary)]">{row.label}</dt>
                        <dd className="font-medium text-[var(--site-text)]">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-[var(--site-line)] pt-5">
                <p className="text-sm leading-7 text-[var(--site-text-secondary)]">
                  {copy.footer}
                </p>
                <Link href="/runtime" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--site-text)]">
                  {copy.link}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
