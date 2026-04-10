import type { RuntimeContext, RuntimeEventItem } from "@/features/runtime/schema/runtime-schema";

let sequence = 0;

function nextId(prefix: string) {
  sequence += 1;
  return `${prefix}-${Date.now().toString(36)}-${sequence.toString(36)}`;
}

function nowClock() {
  return new Date().toLocaleTimeString("en-US", { hour12: false });
}

function sectorFromIntent(intent: string) {
  const normalized = intent.toLowerCase();
  if (normalized.includes("payment")) return "payment";
  if (normalized.includes("label")) return "labeling";
  if (normalized.includes("retail")) return "retail";
  return "market";
}

export function buildFounderRead(intent: string) {
  const sector = sectorFromIntent(intent);
  if (sector === "payment") return "Settlement lane selected. Founder is preparing the run.";
  if (sector === "labeling") return "Supply lane selected. Founder is preparing the run.";
  if (sector === "retail") return "Merchant lane selected. Founder is preparing the run.";
  return "Execution lane selected. Founder is preparing the run.";
}

export function buildSignalRead(intent: string) {
  const sector = sectorFromIntent(intent);
  if (sector === "payment") return "Cross-border settlement pressure is rising.";
  if (sector === "labeling") return "Vendor capacity gap detected in labeling operations.";
  if (sector === "retail") return "Premium demand spike detected for cross-border retail.";
  return "A narrow execution window is opening in current market flow.";
}

export function buildDecisionRead(signalRead: string) {
  return `Mandate prepared: ${signalRead}`;
}

export function buildExecutionMoves() {
  return ["Signal confirmed", "Mandate formed", "Execution lane opened"];
}

export function appendEvent(
  context: RuntimeContext,
  label: string,
  detail: string,
): RuntimeEventItem[] {
  return [
    ...context.events,
    {
      id: nextId("event"),
      label,
      detail,
      at: nowClock(),
    },
  ];
}
