import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Laisen Runtime",
  description: "Runtime workspace foundation page.",
};

export default function RuntimePage() {
  return (
    <section className="site-section py-16 md:py-24">
      <div className="max-w-3xl">
        <p className="site-eyebrow">Runtime foundation</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--site-text)] md:text-[2.8rem] md:leading-[1.08]">
          Runtime workspace is ready for module rollout.
        </h1>
        <p className="mt-5 text-lg leading-8 text-[var(--site-text-secondary)]">
          This base branch keeps the route and visual shell only. Wallet, AI planning, onchain execution, and proof
          modules are added in follow-up feature branches.
        </p>
        <div className="mt-8">
          <Link href="/" className="site-primary-cta">
            Back to Overview
          </Link>
        </div>
      </div>
    </section>
  );
}
