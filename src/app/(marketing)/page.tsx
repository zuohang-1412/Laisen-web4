import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { siteCopy } from "@/features/site/content/site-copy";
import { HeroVisual } from "@/features/site/components/hero-visual";
import { RuntimePreview } from "@/features/site/components/runtime-preview";
import { SectionHeading } from "@/features/site/components/section-heading";

export const metadata: Metadata = {
  title: "Laisen | Web4 Autonomous Execution Engine",
  description:
    "Laisen turns intent into deployment, release, and execution proof on Base Sepolia.",
};

const attributions = [
  {
    name: "GMI Cloud",
    url: "https://www.gmicloud.ai",
    label: "Inference",
  },
  {
    name: "Z.ai",
    url: "https://z.ai",
    label: "Model",
  },
  {
    name: "MetaMask",
    url: "https://metamask.io",
    label: "Wallet",
  },
  {
    name: "Base Sepolia",
    url: "https://www.base.org",
    label: "Testnet",
  },
] as const;

export default function HomePage() {
  const copy = siteCopy.overview;

  return (
    <>
      <section className="site-hero-section relative overflow-hidden pb-24 pt-8 md:pb-32 md:pt-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-10 hidden h-[78%] select-none items-center xl:flex"
        >
          <span className="site-hero-brand-accent">LAISEN</span>
        </div>

        <div className="site-hero-grid">
          <HeroVisual />

          <div className="site-hero-copy relative z-[1]">
            <div className="flex flex-wrap items-center gap-3">
              <span className="site-chip site-chip-ai">{copy.badge}</span>
              <p className="site-eyebrow">{copy.eyebrow}</p>
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[var(--site-text)] md:text-[4.4rem] md:leading-[0.98]">
              {copy.title}
            </h1>
            <p className="mt-6 text-lg leading-8 text-[var(--site-text-secondary)]">
              {copy.body}
            </p>

            <div className="mt-8 flex items-center gap-4">
              <Link href="/runtime" className="site-primary-cta">
                {siteCopy.nav.primaryCta}
              </Link>
            </div>

            <dl className="mt-12 grid gap-8 border-t border-[var(--site-line)] pt-8 sm:grid-cols-3">
              {copy.metrics.map((metric) => (
                <Metric key={metric.label} label={metric.label} value={metric.value} />
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="site-divider py-24 md:py-28">
        <div className="site-section">
          <SectionHeading
            eyebrow={copy.product.eyebrow}
            title={copy.product.title}
          >
            {copy.product.body}
          </SectionHeading>
        </div>
      </section>

      <section className="site-divider py-24 md:py-28">
        <div className="site-section">
          <SectionHeading
            eyebrow={copy.howItWorks.eyebrow}
            title={copy.howItWorks.title}
          />
          <ol className="mt-14 grid gap-10 md:grid-cols-2 xl:grid-cols-4">
            {copy.howItWorks.steps.map((step) => (
              <Step key={step.number} number={step.number} title={step.title}>
                {step.body}
              </Step>
            ))}
          </ol>
          <div className="mt-12">
            <Link href="/how-it-works" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--site-text)]">
              {copy.howItWorks.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="site-divider py-24 md:py-28">
        <div className="site-section">
          <SectionHeading
            eyebrow={copy.evidence.eyebrow}
            title={copy.evidence.title}
          />
          <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            <div>
              <p className="text-lg leading-8 text-[var(--site-text-secondary)]">
                {copy.evidence.body}
              </p>
            </div>
            <dl className="grid gap-4 border-t border-[var(--site-line)] pt-4">
              {copy.evidence.rows.map((row) => (
                <ProofRow key={row.label} label={row.label} value={row.value} />
              ))}
            </dl>
          </div>
          <div className="mt-12">
            <Link href="/evidence" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--site-text)]">
              {copy.evidence.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <RuntimePreview />

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

      <section className="site-divider py-16 md:py-20">
        <div className="site-section">
          <div>
            <p className="site-eyebrow">{copy.attribution.eyebrow}</p>
            <p className="mt-3 text-sm leading-7 text-[var(--site-text-secondary)]">
              {copy.attribution.body}
            </p>
            <div className="sponsor-marquee mt-8" role="region" aria-label="Sponsor attributions">
              <div className="sponsor-marquee-track">
                {[0, 1].map((copyIndex) => (
                  <div
                    key={copyIndex}
                    className={copyIndex === 0 ? "sponsor-marquee-set" : "sponsor-marquee-set pointer-events-none"}
                    aria-hidden={copyIndex === 1}
                  >
                    {attributions.map((item) => (
                      <article
                        key={`${copyIndex}-${item.name}`}
                        className="sponsor-marquee-card rounded-[20px] border border-[var(--site-line)] bg-[rgba(255,255,255,0.74)] px-4 py-4"
                      >
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          tabIndex={copyIndex === 0 ? 0 : -1}
                          className="text-sm font-semibold text-[var(--site-text)] underline-offset-4 hover:underline"
                        >
                          {item.name}
                        </a>
                        <p className="mt-2 text-sm leading-7 text-[var(--site-text-secondary)]">{item.label}</p>
                      </article>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.18em] text-[var(--site-text-secondary)]">{label}</dt>
      <dd className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[var(--site-text)]">{value}</dd>
    </div>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="border-t border-[var(--site-line)] pt-4">
      <p className="site-eyebrow">{number}</p>
      <h3 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-[var(--site-text)]">{title}</h3>
      <p className="mt-4 text-base leading-8 text-[var(--site-text-secondary)]">{children}</p>
    </li>
  );
}

function ProofRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-4 border-b border-[var(--site-line)] py-4 text-sm">
      <dt className="uppercase tracking-[0.16em] text-[var(--site-text-secondary)]">{label}</dt>
      <dd className="text-[var(--site-text)]">{value}</dd>
    </div>
  );
}
