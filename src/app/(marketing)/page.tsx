import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { siteCopy } from "@/features/site/content/site-copy";
import { HeroVisual } from "@/features/site/components/hero-visual";
import { SectionHeading } from "@/features/site/components/section-heading";
import { walletRegistry } from "@/features/onchain/data/wallet-registry";
import { testnetRegistry } from "@/features/onchain/data/testnet-registry";

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

const heroWalletNames = ["MetaMask", "Rabby", "Phantom", "Coinbase Wallet", "OKX Wallet"] as const;
const heroWalletLabel = heroWalletNames.map((name) => name.toLowerCase()).join(", ");
const heroWalletIcons = heroWalletNames
  .map((walletName) => walletRegistry.find((wallet) => wallet.name === walletName))
  .filter((wallet): wallet is NonNullable<typeof wallet> => Boolean(wallet));

const heroTestnetNames = ["Base Sepolia", "Sepolia", "Optimism Sepolia", "Arbitrum Sepolia"] as const;
const heroTestnetIcons = heroTestnetNames
  .map((name) => testnetRegistry.find((network) => network.name === name))
  .filter((network): network is NonNullable<typeof network> => Boolean(network));

export default function HomePage() {
  const copy = siteCopy.overview;
  const launchCorridor = [
    {
      title: "Signal Stack",
      body: "Intent ingress, AI package generation, and mandate shaping in one visible lane.",
      cta: "How it works",
      href: "/how-it-works",
    },
    {
      title: "Execution Corridor",
      body: "Wallet connect, network check, deploy, and release with realtime status feedback.",
      cta: "Open runtime",
      href: "/runtime",
    },
    {
      title: "Proof Ledger",
      body: "Provider, model, schema, tx hash, and event trail surfaced for sponsor-grade verification.",
      cta: "View evidence",
      href: "/evidence",
    },
  ] as const;

  return (
    <>
      <section className="site-hero-section cyber-hero relative overflow-hidden pb-24 pt-10 md:pb-32 md:pt-14">
        <div className="site-hero-grid">
          <HeroVisual />

          <div className="site-hero-copy relative z-[1]">
            <div className="flex flex-wrap items-center gap-3">
              <span className="site-chip site-chip-ai">{copy.badge}</span>
              <p className="site-eyebrow text-[rgba(222,242,255,0.82)]">{copy.eyebrow}</p>
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white md:text-[4.25rem] md:leading-[0.98]">
              Build autonomous execution in public.
            </h1>
            <p className="mt-6 text-lg leading-8 text-[rgba(214,233,249,0.82)]">
              One mission in, one clear path out: package, deploy, release, proof.
            </p>

            <div className="runtime-launch-prompt mt-8">
              <p className="text-sm font-medium uppercase tracking-[0.14em] text-[rgba(154,217,255,0.92)]">
                Ready to go? Let&apos;s run!
              </p>
              <p className="mt-3 text-sm leading-7 text-[rgba(214,233,249,0.78)]">
                Open runtime, connect wallet, deploy, then release.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link href="/runtime" className="site-primary-cta cyber-launch-cta">
                  Open Runtime
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/how-it-works" className="site-secondary-button">
                  See launch flow
                </Link>
              </div>
            </div>

            <dl className="hero-metrics-grid mt-12 border-t border-[rgba(132,188,230,0.26)] pt-8">
              {copy.metrics.map((metric) => {
                if (metric.label === "Wallet") {
                  return (
                    <Metric
                      key={metric.label}
                      label={metric.label}
                      value={heroWalletLabel}
                      compact
                      icons={heroWalletIcons.map((wallet) => (
                        <span
                          key={wallet.name}
                          className="hero-metric-chip inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-[rgba(132,188,230,0.24)] bg-[rgba(255,255,255,0.06)]"
                          aria-label={wallet.name}
                          title={wallet.name}
                          dangerouslySetInnerHTML={{ __html: wallet.icon }}
                        />
                      ))}
                    />
                  );
                }

                if (metric.label === "Testnet") {
                  return (
                    <Metric
                      key={metric.label}
                      label={metric.label}
                      value={metric.value}
                      compact
                      icons={heroTestnetIcons.map((network) => (
                        <span
                          key={network.name}
                          className="hero-metric-chip inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-[rgba(132,188,230,0.24)] bg-[rgba(255,255,255,0.06)]"
                          title={network.name}
                          aria-label={network.name}
                          dangerouslySetInnerHTML={{ __html: network.icon }}
                        />
                      ))}
                    />
                  );
                }

                return <Metric key={metric.label} label={metric.label} value={metric.value} />;
              })}
            </dl>
          </div>
        </div>
      </section>

      <section className="site-divider py-24 md:py-28">
        <div className="site-section">
          <SectionHeading eyebrow="Launch map" title="Pick your entry point, then move in one direction.">
            No scattered blocks. The homepage now acts like an operation map: understand path, enter runtime, verify proof.
          </SectionHeading>
          <div className="cyber-entry-grid mt-12">
            {launchCorridor.map((item) => (
              <article key={item.title} className="cyber-entry-card">
                <p className="site-eyebrow text-[rgba(132,188,230,0.92)]">Entry</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[var(--site-text)]">{item.title}</h3>
                <p className="mt-4 text-base leading-8 text-[var(--site-text-secondary)]">{item.body}</p>
                <Link href={item.href} className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[#8ee8ff]">
                  {item.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="site-divider py-24 md:py-28">
        <div className="site-section">
          <div className="cyber-corridor-shell">
            <div>
              <SectionHeading eyebrow="Execution corridor" title="Mission -> Runtime -> Onchain proof" />
              <ol className="mt-10 grid gap-6 md:grid-cols-2">
                {copy.howItWorks.steps.map((step) => (
                  <Step key={step.number} number={step.number} title={step.title}>
                    {step.body}
                  </Step>
                ))}
              </ol>
            </div>
            <div className="cyber-proof-rail">
              <p className="site-eyebrow text-[rgba(132,188,230,0.92)]">Visible proof</p>
              <p className="mt-3 text-sm leading-7 text-[var(--site-text-secondary)]">
                Every sponsor-critical checkpoint stays visible while execution moves forward.
              </p>
              <dl className="mt-6 grid gap-3 border-t border-[rgba(132,188,230,0.22)] pt-4">
                {copy.evidence.rows.map((row) => (
                  <ProofRow key={row.label} label={row.label} value={row.value} />
                ))}
              </dl>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/evidence" className="site-secondary-button">
                  Explore evidence
                </Link>
                <Link href="/runtime" className="site-primary-cta cyber-launch-cta">
                  Enter runtime
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="site-divider py-24 md:py-28">
        <div className="site-section">
          <div className="cyber-final-cta max-w-4xl">
            <p className="site-eyebrow text-[rgba(132,188,230,0.92)]">{copy.finalCta.eyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--site-text)] md:text-[2.8rem] md:leading-[1.08]">
              Ready to go? Let&apos;s run.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[var(--site-text-secondary)]">
              Jump into live execution mode now. Wallet, chain, deployment, release, and event proof are all in one place.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/runtime" className="site-primary-cta cyber-launch-cta">
                {siteCopy.nav.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/how-it-works" className="site-secondary-button">
                Review path first
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

function Metric({
  label,
  value,
  icons,
  compact,
}: {
  label: string;
  value: string;
  icons?: React.ReactNode;
  compact?: boolean;
}) {
  const isCompactMetric = Boolean(compact && icons);

  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.18em] text-[rgba(132,188,230,0.8)]">{label}</dt>
      <dd
        className={
          isCompactMetric
            ? "mt-3 text-base font-medium tracking-[-0.01em] text-white"
            : "mt-3 text-4xl font-semibold tracking-[-0.05em] text-white"
        }
      >
        {icons ? (
          <span className="hero-metric-icons inline-flex items-center gap-2 align-middle">{icons}</span>
        ) : (
          value
        )}
      </dd>
      {icons ? <p className="mt-2 text-xs text-[rgba(214,233,249,0.72)]">{value}</p> : null}
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
    <li className="rounded-[24px] border border-[rgba(132,188,230,0.2)] bg-[rgba(255,255,255,0.82)] px-5 py-5">
      <p className="site-eyebrow text-[rgba(132,188,230,0.86)]">{number}</p>
      <h3 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-[var(--site-text)]">{title}</h3>
      <p className="mt-4 text-base leading-8 text-[var(--site-text-secondary)]">{children}</p>
    </li>
  );
}

function ProofRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[108px_minmax(0,1fr)] gap-4 border-b border-[rgba(132,188,230,0.16)] py-4 text-sm">
      <dt className="uppercase tracking-[0.16em] text-[rgba(132,188,230,0.86)]">{label}</dt>
      <dd className="text-[var(--site-text)]">{value}</dd>
    </div>
  );
}
