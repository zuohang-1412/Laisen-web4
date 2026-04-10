import { cn } from "@/lib/utils";

type Tone = "neutral" | "ai" | "decision" | "success" | "warning" | "danger";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-white/6 text-[var(--text-secondary)]",
  ai: "bg-cyan-400/10 text-[var(--ai-active-strong)]",
  decision: "bg-blue-300/10 text-[var(--decision-accent)]",
  success: "bg-emerald-300/10 text-[var(--success)]",
  warning: "bg-blue-300/10 text-[var(--safe-mode)]",
  danger: "bg-red-300/10 text-[var(--override-alert)]",
};

export function StatusBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: Tone;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-mono-ui text-[10px] uppercase tracking-[0.16em]",
        toneClasses[tone],
      )}
    >
      {label}
    </span>
  );
}
