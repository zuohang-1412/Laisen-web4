import type { ProtocolPackageView } from "@/features/runtime-site/view-models/runtime-presentation";

type Props = {
  view: ProtocolPackageView;
};

export function ProtocolPackageCard({ view }: Props) {
  return (
    <div className="runtime-panel-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="site-eyebrow">Package detail</p>
          <h3 className="mt-3 text-lg font-semibold tracking-[-0.03em] text-[var(--site-text)]">{view.title}</h3>
        </div>
        <span className="site-chip site-chip-ai">{view.tokenSymbol}</span>
      </div>

      <p className="mt-3 text-sm leading-7 text-[var(--site-text-secondary)]">{view.summary}</p>

      <div className="mt-4 grid gap-4 border-t border-[var(--site-line)] pt-4 lg:grid-cols-2">
        <dl className="grid gap-3">
          {view.primary.map((field) => (
            <div key={field.label}>
              <dt className="site-eyebrow">{field.label}</dt>
              <dd className="mt-2 text-sm leading-7 text-[var(--site-text)]">{field.value}</dd>
            </div>
          ))}
        </dl>
        <dl className="grid gap-3">
          {view.secondary.map((field) => (
            <div key={field.label}>
              <dt className="site-eyebrow">{field.label}</dt>
              <dd className="mt-2 text-sm leading-7 text-[var(--site-text)]">{field.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
