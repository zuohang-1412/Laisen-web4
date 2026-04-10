import { cn } from "@/lib/utils";
import type { AiPlanView, MandateView, PanelTone } from "@/features/runtime-site/view-models/runtime-presentation";

type Props = {
  view: MandateView;
  plan: AiPlanView;
};

export function MandateCard({ view, plan }: Props) {
  return (
    <div className="runtime-panel-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="site-eyebrow">Mandate</p>
          <h3 className="mt-3 text-lg font-semibold tracking-[-0.03em] text-[var(--site-text)]">{view.title}</h3>
        </div>
        <span className={cn("site-chip", toneToChip(view.statusTone))}>{view.statusLabel}</span>
      </div>

      <p className="mt-3 text-sm leading-7 text-[var(--site-text)]">{view.action}</p>

      <div className="mt-4 grid gap-3 border-t border-[var(--site-line)] pt-4 sm:grid-cols-2">
        <div>
          <p className="site-eyebrow">Plan source</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={cn("site-chip", toneToChip(plan.sourceTone))}>{plan.sourceLabel}</span>
            <span className={cn("site-chip", toneToChip(plan.statusTone))}>{plan.statusLabel}</span>
          </div>
        </div>
        <div>
          <p className="site-eyebrow">Planner</p>
          <p className="mt-2 text-sm leading-7 text-[var(--site-text-secondary)]">
            {plan.fields.find((field) => field.label === "Provider")?.value ?? "n/a"} ·{" "}
            {plan.fields.find((field) => field.label === "Model")?.value ?? "n/a"}
          </p>
        </div>
        <div>
          <p className="site-eyebrow">Schema</p>
          <p className="mt-2 text-sm leading-7 text-[var(--site-text-secondary)]">
            {plan.fields.find((field) => field.label === "Schema")?.value ?? "n/a"}
          </p>
        </div>
        <div>
          <p className="site-eyebrow">Fallback</p>
          <p className="mt-2 text-sm leading-7 text-[var(--site-text-secondary)]">
            {plan.fields.find((field) => field.label === "Fallback")?.value ?? "n/a"}
          </p>
        </div>
      </div>

      <dl className="mt-4 runtime-detail-grid border-t border-[var(--site-line)] pt-4">
        {view.fields.map((field) => (
          <div key={field.label} className="runtime-detail-cell">
            <dt className="site-eyebrow">{field.label}</dt>
            <dd className="mt-2 text-sm leading-7 text-[var(--site-text-secondary)]">{field.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function toneToChip(tone: PanelTone) {
  switch (tone) {
    case "ai":
      return "site-chip-ai";
    case "warning":
      return "site-chip-warning";
    case "success":
      return "site-chip-success";
    case "danger":
      return "site-chip-danger";
    default:
      return "site-chip-neutral";
  }
}
