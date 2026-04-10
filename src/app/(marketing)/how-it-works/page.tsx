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
          <div className="grid gap-14 lg:grid-cols-[220px_minmax(0,1fr)]">
            <div>
              <p className="site-eyebrow">{copy.sequenceLabel}</p>
              <p className="mt-4 text-base leading-8 text-[var(--site-text-secondary)]">
                {copy.sequenceBody}
              </p>
            </div>

            <ol className="space-y-10">
              {copy.steps.map((step) => (
                <li key={step.number} className="grid gap-5 border-t border-[var(--site-line)] pt-5 md:grid-cols-[92px_minmax(0,1fr)]">
                  <p className="site-eyebrow">{step.number}</p>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--site-text)]">{step.title}</h2>
                    <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--site-text-secondary)]">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
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
