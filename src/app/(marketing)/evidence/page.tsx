import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { siteCopy } from "@/features/site/content/site-copy";
import { SectionHeading } from "@/features/site/components/section-heading";

export const metadata: Metadata = {
  title: siteCopy.evidence.title,
  description: siteCopy.evidence.description,
};

export default function EvidencePage() {
  const copy = siteCopy.evidence;

  return (
    <>
      <section className="site-section pb-20 pt-10 md:pb-28 md:pt-14">
        <SectionHeading
          eyebrow={copy.eyebrow}
          title={copy.heading}
        >
          {copy.body}
        </SectionHeading>
      </section>

      <section className="site-divider py-24 md:py-28">
        <div className="site-section">
          <div className="grid gap-14 lg:grid-cols-[240px_minmax(0,1fr)]">
            <div>
              <p className="site-eyebrow">{copy.listLabel}</p>
              <p className="mt-4 text-base leading-8 text-[var(--site-text-secondary)]">
                {copy.listBody}
              </p>
            </div>

            <dl className="border-t border-[var(--site-line)]">
              {copy.rows.map((row) => (
                <div
                  key={row.label}
                  className="grid gap-4 border-b border-[var(--site-line)] py-6 md:grid-cols-[180px_minmax(0,220px)_minmax(0,1fr)]"
                >
                  <dt className="site-eyebrow">{row.label}</dt>
                  <dd className="text-base font-medium text-[var(--site-text)]">{row.value}</dd>
                  <dd className="text-base leading-8 text-[var(--site-text-secondary)]">{row.note}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="site-divider py-24 md:py-28">
        <div className="site-section">
          <SectionHeading
            eyebrow={copy.fallback.eyebrow}
            title={copy.fallback.title}
          />
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {copy.fallback.modes.map((mode) => (
              <div key={mode.title} className="border-t border-[var(--site-line)] pt-5">
                <h3 className="text-xl font-semibold tracking-[-0.03em] text-[var(--site-text)]">{mode.title}</h3>
                <p className="mt-4 text-base leading-8 text-[var(--site-text-secondary)]">{mode.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="site-divider py-24 md:py-28">
        <div className="site-section">
          <SectionHeading
            eyebrow={copy.events.eyebrow}
            title={copy.events.title}
          />
          <ol className="mt-14 grid gap-10 lg:grid-cols-2">
            {copy.events.stages.map((stage, index) => (
              <li key={stage.name} className="border-t border-[var(--site-line)] pt-5">
                <p className="site-eyebrow">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-[var(--site-text)]">
                  {stage.name}
                </h3>
                <p className="mt-4 max-w-xl text-base leading-8 text-[var(--site-text-secondary)]">
                  {stage.detail}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="site-divider py-24 md:py-28">
        <div className="site-section">
          <div className="max-w-3xl">
            <p className="site-eyebrow">{copy.finalCta.eyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--site-text)] md:text-[2.6rem] md:leading-[1.08]">
              {copy.finalCta.title}
            </h2>
            <p className="mt-5 text-lg leading-8 text-[var(--site-text-secondary)]">
              {copy.finalCta.body}
            </p>
            <div className="mt-8">
              <Link href="/runtime" className="inline-flex items-center gap-2 text-base font-medium text-[var(--site-text)]">
                {siteCopy.nav.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
