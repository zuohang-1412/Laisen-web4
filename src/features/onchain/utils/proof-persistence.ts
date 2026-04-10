import {
  createEmptyDeploymentProof,
  createEmptyMandateProof,
  type DeploymentProof,
  type MandateProof,
  type ProofEvent,
} from "@/features/onchain/schema/onchain-schema";

export type GovernanceHint = {
  hasVoted: boolean | null;
  walletVotes: bigint | null;
  quorumRequired: bigint | null;
  forVotes: bigint | null;
  remainingForVotes: bigint | null;
};

export type ProposalHistoryItem = {
  proposalId: bigint;
  action: "approve" | "reject" | "unknown";
  governorState: number | null;
  proposalEta: bigint | null;
  forVotes: bigint | null;
  againstVotes: bigint | null;
  abstainVotes: bigint | null;
  quorumRequired: bigint | null;
  proposalTxHash: string | null;
  proposalBlockNumber: number | null;
  voteTxHash: string | null;
  voteBlockNumber: number | null;
  queueTxHash: string | null;
  queueBlockNumber: number | null;
  executeTxHash: string | null;
  executeBlockNumber: number | null;
  updatedAt: number;
};

type PersistedRuntimeOnchainSnapshot = {
  version: 1;
  deployment: PersistedDeploymentProof;
  mandateProof: PersistedMandateProof;
  governanceHint: PersistedGovernanceHint;
  proposalHistory: PersistedProposalHistoryItem[];
};

type PersistedProofEvent = Omit<ProofEvent, "blockNumber"> & {
  blockNumber: number;
};

type PersistedDeploymentProof = Omit<DeploymentProof, "events"> & {
  events: PersistedProofEvent[];
};

type PersistedMandateProof = Omit<
  MandateProof,
  "proposalId" | "proposalEta" | "events"
> & {
  proposalId: string | null;
  proposalEta: string | null;
  events: PersistedProofEvent[];
};

type PersistedGovernanceHint = {
  hasVoted: boolean | null;
  walletVotes: string | null;
  quorumRequired: string | null;
  forVotes: string | null;
  remainingForVotes: string | null;
};

type PersistedProposalHistoryItem = Omit<
  ProposalHistoryItem,
  "proposalId" | "proposalEta" | "forVotes" | "againstVotes" | "abstainVotes" | "quorumRequired"
> & {
  proposalId: string;
  proposalEta: string | null;
  forVotes: string | null;
  againstVotes: string | null;
  abstainVotes: string | null;
  quorumRequired: string | null;
};

const STORAGE_KEY = "laisen.runtime.onchain.v1";

export function createEmptyGovernanceHint(): GovernanceHint {
  return {
    hasVoted: null,
    walletVotes: null,
    quorumRequired: null,
    forVotes: null,
    remainingForVotes: null,
  };
}

export function loadRuntimeOnchainSnapshot(storage: Storage | undefined) {
  if (!storage) return null;

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedRuntimeOnchainSnapshot;
    if (parsed.version !== 1) return null;

    return {
      deployment: deserializeDeploymentProof(parsed.deployment),
      mandateProof: deserializeMandateProof(parsed.mandateProof),
      governanceHint: deserializeGovernanceHint(parsed.governanceHint),
      proposalHistory: parsed.proposalHistory.map(deserializeProposalHistoryItem),
    };
  } catch {
    return null;
  }
}

export function saveRuntimeOnchainSnapshot(
  storage: Storage | undefined,
  snapshot: {
    deployment: DeploymentProof;
    mandateProof: MandateProof;
    governanceHint: GovernanceHint;
    proposalHistory: ProposalHistoryItem[];
  },
) {
  if (!storage) return;

  const payload: PersistedRuntimeOnchainSnapshot = {
    version: 1,
    deployment: serializeDeploymentProof(snapshot.deployment),
    mandateProof: serializeMandateProof(snapshot.mandateProof),
    governanceHint: serializeGovernanceHint(snapshot.governanceHint),
    proposalHistory: snapshot.proposalHistory.map(serializeProposalHistoryItem),
  };

  storage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearRuntimeOnchainSnapshot(storage: Storage | undefined) {
  storage?.removeItem(STORAGE_KEY);
}

function serializeDeploymentProof(proof: DeploymentProof): PersistedDeploymentProof {
  return {
    ...proof,
    events: proof.events.map(serializeProofEvent),
  };
}

function deserializeDeploymentProof(proof: PersistedDeploymentProof): DeploymentProof {
  return {
    ...createEmptyDeploymentProof(),
    ...proof,
    events: proof.events.map(deserializeProofEvent),
  };
}

function serializeMandateProof(proof: MandateProof): PersistedMandateProof {
  return {
    ...proof,
    proposalId: proof.proposalId?.toString() ?? null,
    proposalEta: proof.proposalEta?.toString() ?? null,
    events: proof.events.map(serializeProofEvent),
  };
}

function deserializeMandateProof(proof: PersistedMandateProof): MandateProof {
  return {
    ...createEmptyMandateProof(),
    ...proof,
    proposalId: proof.proposalId ? BigInt(proof.proposalId) : null,
    proposalEta: proof.proposalEta ? BigInt(proof.proposalEta) : null,
    events: proof.events.map(deserializeProofEvent),
  };
}

function serializeGovernanceHint(hint: GovernanceHint): PersistedGovernanceHint {
  return {
    hasVoted: hint.hasVoted,
    walletVotes: hint.walletVotes?.toString() ?? null,
    quorumRequired: hint.quorumRequired?.toString() ?? null,
    forVotes: hint.forVotes?.toString() ?? null,
    remainingForVotes: hint.remainingForVotes?.toString() ?? null,
  };
}

function deserializeGovernanceHint(hint: PersistedGovernanceHint): GovernanceHint {
  return {
    hasVoted: hint.hasVoted,
    walletVotes: hint.walletVotes ? BigInt(hint.walletVotes) : null,
    quorumRequired: hint.quorumRequired ? BigInt(hint.quorumRequired) : null,
    forVotes: hint.forVotes ? BigInt(hint.forVotes) : null,
    remainingForVotes: hint.remainingForVotes ? BigInt(hint.remainingForVotes) : null,
  };
}

function serializeProposalHistoryItem(item: ProposalHistoryItem): PersistedProposalHistoryItem {
  return {
    ...item,
    proposalId: item.proposalId.toString(),
    proposalEta: item.proposalEta?.toString() ?? null,
    forVotes: item.forVotes?.toString() ?? null,
    againstVotes: item.againstVotes?.toString() ?? null,
    abstainVotes: item.abstainVotes?.toString() ?? null,
    quorumRequired: item.quorumRequired?.toString() ?? null,
  };
}

function deserializeProposalHistoryItem(item: PersistedProposalHistoryItem): ProposalHistoryItem {
  return {
    ...item,
    proposalId: BigInt(item.proposalId),
    proposalEta: item.proposalEta ? BigInt(item.proposalEta) : null,
    forVotes: item.forVotes ? BigInt(item.forVotes) : null,
    againstVotes: item.againstVotes ? BigInt(item.againstVotes) : null,
    abstainVotes: item.abstainVotes ? BigInt(item.abstainVotes) : null,
    quorumRequired: item.quorumRequired ? BigInt(item.quorumRequired) : null,
  };
}

function serializeProofEvent(event: ProofEvent): PersistedProofEvent {
  return { ...event };
}

function deserializeProofEvent(event: PersistedProofEvent): ProofEvent {
  return { ...event };
}
