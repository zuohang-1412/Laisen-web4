import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="max-w-3xl">
      <p className="site-eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--site-text)] md:text-[2.6rem] md:leading-[1.08]">
        {title}
      </h2>
      {children ? (
        <p className="mt-5 text-base leading-8 text-[var(--site-text-secondary)] md:text-lg">
          {children}
        </p>
      ) : null}
    </div>
  );
}
