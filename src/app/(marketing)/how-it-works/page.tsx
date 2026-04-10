import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { siteCopy } from "@/features/site/content/site-copy";
import { SectionHeading } from "@/features/site/components/section-heading";

export const metadata: Metadata = {
  title: siteCopy.howItWorks.title,
  description: siteCopy.howItWorks.description,
};

export default function HowItWorksPage() {
  const copy = siteCopy.howItWorks;

  return (
    <>
      <section className="site-section pb-16 pt-10 md:pb-20 md:pt-14">
        <div className="info-hero-card">
          <SectionHeading eyebrow={copy.eyebrow} title={copy.heading}>
            {copy.body}
          </SectionHeading>
        </div>
      </section>

      <section className="site-divider py-20 md:py-24">
        <div className="site-section">
          <div className="info-grid-shell">
            <aside className="info-side-note">
              <p className="site-eyebrow">{copy.sequenceLabel}</p>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[var(--site-text)]">Linear runtime path</h2>
              <p className="mt-4 text-base leading-8 text-[var(--site-text-secondary)]">{copy.sequenceBody}</p>
              <p className="mt-4 text-sm leading-7 text-[var(--site-text-secondary)]">
                Keep this as your operating order: mission - package - wallet - chain - deploy - release.
              </p>
            </aside>

            <ol className="info-step-list">
              {copy.steps.map((step) => (
                <li key={step.number} className="info-step-card">
                  <p className="site-eyebrow">Step {step.number}</p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[var(--site-text)]">{step.title}</h3>
                  <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--site-text-secondary)]">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="site-divider py-20 md:py-24">
        <div className="site-section">
          <div className="info-final-cta max-w-3xl">
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
