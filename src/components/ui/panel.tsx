import type { PropsWithChildren, ReactNode } from "react";

import { cn } from "@/lib/utils";

type PanelProps = PropsWithChildren<{
  className?: string;
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
}>;

export function Panel({ className, title, eyebrow, action, children }: PanelProps) {
  return (
    <section className={cn("panel-glass min-h-0 rounded-3xl p-5", className)}>
      {(title || eyebrow || action) && (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            {eyebrow ? (
              <p className="text-mono-ui text-[11px] uppercase tracking-[0.24em] text-[var(--text-tertiary)]">
                {eyebrow}
              </p>
            ) : null}
            {title ? <h2 className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{title}</h2> : null}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
