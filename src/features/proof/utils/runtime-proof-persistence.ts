import type { ProofSnapshot } from "@/features/proof/schema/proof-types";

const STORAGE_KEY = "laisen.runtime.proof.v1";

export function loadProofSnapshot(storage: Storage | undefined): ProofSnapshot | null {
  if (!storage) return null;

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as ProofSnapshot;
    if (parsed.version !== 1) return null;
    if (!Array.isArray(parsed.events)) return null;

    return parsed;
  } catch {
    return null;
  }
}

export function saveProofSnapshot(storage: Storage | undefined, snapshot: ProofSnapshot) {
  if (!storage) return;
  storage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

export function clearProofSnapshot(storage: Storage | undefined) {
  storage?.removeItem(STORAGE_KEY);
}
