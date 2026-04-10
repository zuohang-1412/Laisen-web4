import type { Address, PublicClient, TransactionReceipt, WalletClient } from "viem";
import {
  encodeFunctionData,
  getAddress,
  keccak256,
  parseEventLogs,
  parseUnits,
  stringToBytes,
  zeroAddress,
} from "viem";

import { LAISEN_TESTNET_EXPLORER, laisenTestnet } from "@/features/onchain/config/chains";
import {
  laisenGovernorArtifact,
  laisenGovernanceTokenArtifact,
  laisenRuntimeProtocolArtifact,
  laisenTimelockArtifact,
} from "@/features/onchain/contracts/generated";
import {
  createEmptyDeploymentProof,
  createEmptyMandateProof,
  DeploymentProofSchema,
  MandateProofSchema,
  type DeploymentProof,
  type MandateProof,
  type ProofEvent,
  type ProtocolPackage,
} from "@/features/onchain/schema/onchain-schema";
import { digestJson, digestText } from "@/features/onchain/utils/hash";
import type { RuntimeContext } from "@/features/runtime/schema/runtime-schema";

type DeployParams = {
  walletClient: WalletClient;
  publicClient: PublicClient;
  account: Address;
  protocolPackage: ProtocolPackage;
};

type MandateParams = {
  walletClient: WalletClient;
  publicClient: PublicClient;
  account: Address;
  governorAddress: Address;
  protocolAddress: Address;
  runtimeContext: RuntimeContext;
  protocolPackage: ProtocolPackage;
  onProgress?: (patch: Partial<MandateProof>) => void;
};

type ProposalAction = "approve" | "reject";

type DaoLifecycleProof = {
  proposalId: bigint;
  proposalTxHash: `0x${string}`;
  proposalBlockNumber: number;
  voteTxHash: `0x${string}`;
  voteBlockNumber: number;
  queueTxHash: `0x${string}`;
  queueBlockNumber: number;
  executeTxHash: `0x${string}`;
  executeBlockNumber: number;
  events: ProofEvent[];
};

const DAO_VOTING_DELAY_BLOCKS = readIntEnv("NEXT_PUBLIC_LAISEN_DAO_VOTING_DELAY_BLOCKS", 1);
const DAO_VOTING_PERIOD_BLOCKS = readIntEnv("NEXT_PUBLIC_LAISEN_DAO_VOTING_PERIOD_BLOCKS", 8);
const DAO_PROPOSAL_THRESHOLD = parseUnits("1", 18);
const DAO_QUORUM_NUMERATOR = BigInt(readIntEnv("NEXT_PUBLIC_LAISEN_DAO_QUORUM_PERCENT", 4));
const DAO_TIMELOCK_DELAY_SECONDS = BigInt(readIntEnv("NEXT_PUBLIC_LAISEN_DAO_TIMELOCK_DELAY_SECONDS", 30));
const DAO_SUPPORT_FOR = 1;
const DAO_AUTOMATION = readBoolEnv("NEXT_PUBLIC_LAISEN_DAO_AUTOMATION", true);

export async function deployProtocolPackage({
  walletClient,
  publicClient,
  account,
  protocolPackage,
}: DeployParams): Promise<DeploymentProof> {
  const daoHash = digestJson({
    name: protocolPackage.daoName,
    summary: protocolPackage.daoSummary,
    treasuryModel: protocolPackage.treasuryModel,
  });
  const governanceHash = digestJson({
    governanceMode: protocolPackage.governanceMode,
    operatorPolicy: protocolPackage.operatorPolicy,
    tokenomics: protocolPackage.token,
  });
  const founderHash = digestJson(protocolPackage.founderPersona);

  const tokenTxHash = await walletClient.deployContract({
    account,
    chain: laisenTestnet,
    abi: laisenGovernanceTokenArtifact.abi,
    bytecode: laisenGovernanceTokenArtifact.bytecode,
    args: [
      protocolPackage.token.name,
      protocolPackage.token.symbol,
      account,
      protocolPackage.token.totalSupplyUnits,
    ],
  });

  const tokenReceipt = await publicClient.waitForTransactionReceipt({ hash: tokenTxHash });
  const tokenAddress = getRequiredContractAddress(tokenReceipt.contractAddress, "governance token");

  const timelockTxHash = await walletClient.deployContract({
    account,
    chain: laisenTestnet,
    abi: laisenTimelockArtifact.abi,
    bytecode: laisenTimelockArtifact.bytecode,
    args: [DAO_TIMELOCK_DELAY_SECONDS, [account], [account], account],
  });

  const timelockReceipt = await publicClient.waitForTransactionReceipt({ hash: timelockTxHash });
  const timelockAddress = getRequiredContractAddress(timelockReceipt.contractAddress, "timelock");

  const governorTxHash = await walletClient.deployContract({
    account,
    chain: laisenTestnet,
    abi: laisenGovernorArtifact.abi,
    bytecode: laisenGovernorArtifact.bytecode,
    args: [
      tokenAddress,
      timelockAddress,
      DAO_VOTING_DELAY_BLOCKS,
      DAO_VOTING_PERIOD_BLOCKS,
      DAO_PROPOSAL_THRESHOLD,
      DAO_QUORUM_NUMERATOR,
    ],
  });

  const governorReceipt = await publicClient.waitForTransactionReceipt({ hash: governorTxHash });
  const governorAddress = getRequiredContractAddress(governorReceipt.contractAddress, "governor");

  await configureTimelockRoles({
    walletClient,
    publicClient,
    account,
    timelockAddress,
    governorAddress,
  });

  await distributeGovernanceToken({
    walletClient,
    publicClient,
    account,
    tokenAddress,
    totalSupplyUnits: protocolPackage.token.totalSupplyUnits,
  });

  const protocolTxHash = await walletClient.deployContract({
    account,
    chain: laisenTestnet,
    abi: laisenRuntimeProtocolArtifact.abi,
    bytecode: laisenRuntimeProtocolArtifact.bytecode,
    args: [timelockAddress, tokenAddress, account, daoHash, governanceHash, founderHash],
  });

  const protocolReceipt = await publicClient.waitForTransactionReceipt({ hash: protocolTxHash });
  const protocolAddress = getRequiredContractAddress(protocolReceipt.contractAddress, "runtime protocol");
  const deploymentEvents = [
    buildSyntheticProofEvent({
      name: "TokenDeployed",
      source: "deployment",
      txHash: tokenTxHash,
      blockNumber: Number(tokenReceipt.blockNumber),
      detail: `Governance token deployed at ${tokenAddress}.`,
    }),
    ...parseReceiptEvents({
      receipt: tokenReceipt,
      abi: laisenGovernanceTokenArtifact.abi,
      source: "token",
    }),
    buildSyntheticProofEvent({
      name: "TimelockDeployed",
      source: "deployment",
      txHash: timelockTxHash,
      blockNumber: Number(timelockReceipt.blockNumber),
      detail: `Timelock deployed at ${timelockAddress}.`,
    }),
    ...parseReceiptEvents({
      receipt: timelockReceipt,
      abi: laisenTimelockArtifact.abi,
      source: "timelock",
    }),
    buildSyntheticProofEvent({
      name: "GovernorDeployed",
      source: "deployment",
      txHash: governorTxHash,
      blockNumber: Number(governorReceipt.blockNumber),
      detail: `Governor deployed at ${governorAddress}.`,
    }),
    ...parseReceiptEvents({
      receipt: governorReceipt,
      abi: laisenGovernorArtifact.abi,
      source: "governor",
    }),
    buildSyntheticProofEvent({
      name: "ProtocolDeployed",
      source: "deployment",
      txHash: protocolTxHash,
      blockNumber: Number(protocolReceipt.blockNumber),
      detail: `Runtime protocol deployed at ${protocolAddress}.`,
    }),
    ...parseReceiptEvents({
      receipt: protocolReceipt,
      abi: laisenRuntimeProtocolArtifact.abi,
      source: "protocol",
    }),
  ];

  return DeploymentProofSchema.parse({
    ...createEmptyDeploymentProof(),
    status: "deployed",
    walletAddress: account,
    chainId: laisenTestnet.id,
    chainName: laisenTestnet.name,
    deploymentTxHash: protocolTxHash,
    deploymentBlockNumber: Number(protocolReceipt.blockNumber),
    tokenAddress,
    governorAddress,
    timelockAddress,
    protocolAddress,
    treasuryAddress: account,
    blockExplorerUrl: `${LAISEN_TESTNET_EXPLORER}/tx/${protocolTxHash}`,
    events: deploymentEvents,
    error: null,
    usedFallback: false,
  });
}

export async function approveAndExecuteMandate({
  walletClient,
  publicClient,
  account,
  governorAddress,
  protocolAddress,
  runtimeContext,
  protocolPackage,
  onProgress,
}: MandateParams): Promise<MandateProof> {
  const payload = buildProposalPayload(runtimeContext, protocolPackage, protocolAddress, "approve");

  const proposal = await proposeMandateAction({
    walletClient,
    publicClient,
    account,
    governorAddress,
    payload,
  });

  if (!DAO_AUTOMATION) {
    return MandateProofSchema.parse({
      ...createEmptyMandateProof(),
      status: "awaiting_wallet",
      proposalAction: "approve",
      proposalId: proposal.proposalId,
      governorState: 0,
      proposalEta: BigInt(0),
      proposalTxHash: proposal.proposalTxHash,
      proposalBlockNumber: proposal.proposalBlockNumber,
      mandateId: payload.hashes.mandateId,
      executionHash: payload.hashes.executionHash,
      blockExplorerUrl: `${LAISEN_TESTNET_EXPLORER}/tx/${proposal.proposalTxHash}`,
      events: proposal.events,
      error: null,
    });
  }

  const lifecycle = await executeDaoLifecycle({
    walletClient,
    publicClient,
    account,
    governorAddress,
    payload,
    onProgress,
  });

  return MandateProofSchema.parse({
    ...createEmptyMandateProof(),
    status: "executed",
    proposalAction: "approve",
    proposalId: lifecycle.proposalId,
    proposalTxHash: lifecycle.proposalTxHash,
    proposalBlockNumber: lifecycle.proposalBlockNumber,
    voteTxHash: lifecycle.voteTxHash,
    voteBlockNumber: lifecycle.voteBlockNumber,
    queueTxHash: lifecycle.queueTxHash,
    queueBlockNumber: lifecycle.queueBlockNumber,
    mandateId: payload.hashes.mandateId,
    actionTxHash: lifecycle.executeTxHash,
    actionBlockNumber: lifecycle.executeBlockNumber,
    executionHash: payload.hashes.executionHash,
    rejectionHash: null,
    blockExplorerUrl: `${LAISEN_TESTNET_EXPLORER}/tx/${lifecycle.executeTxHash}`,
    events: lifecycle.events,
    error: null,
  });
}

export async function rejectMandate({
  walletClient,
  publicClient,
  account,
  governorAddress,
  protocolAddress,
  runtimeContext,
  protocolPackage,
  onProgress,
}: MandateParams): Promise<MandateProof> {
  const payload = buildProposalPayload(runtimeContext, protocolPackage, protocolAddress, "reject");

  const proposal = await proposeMandateAction({
    walletClient,
    publicClient,
    account,
    governorAddress,
    payload,
  });

  if (!DAO_AUTOMATION) {
    return MandateProofSchema.parse({
      ...createEmptyMandateProof(),
      status: "awaiting_wallet",
      proposalAction: "reject",
      proposalId: proposal.proposalId,
      governorState: 0,
      proposalEta: BigInt(0),
      proposalTxHash: proposal.proposalTxHash,
      proposalBlockNumber: proposal.proposalBlockNumber,
      mandateId: payload.hashes.mandateId,
      rejectionHash: payload.hashes.rejectionHash,
      blockExplorerUrl: `${LAISEN_TESTNET_EXPLORER}/tx/${proposal.proposalTxHash}`,
      events: proposal.events,
      error: null,
    });
  }

  const lifecycle = await executeDaoLifecycle({
    walletClient,
    publicClient,
    account,
    governorAddress,
    payload,
    onProgress,
  });

  return MandateProofSchema.parse({
    ...createEmptyMandateProof(),
    status: "rejected",
    proposalAction: "reject",
    proposalId: lifecycle.proposalId,
    proposalTxHash: lifecycle.proposalTxHash,
    proposalBlockNumber: lifecycle.proposalBlockNumber,
    voteTxHash: lifecycle.voteTxHash,
    voteBlockNumber: lifecycle.voteBlockNumber,
    queueTxHash: lifecycle.queueTxHash,
    queueBlockNumber: lifecycle.queueBlockNumber,
    mandateId: payload.hashes.mandateId,
    actionTxHash: lifecycle.executeTxHash,
    actionBlockNumber: lifecycle.executeBlockNumber,
    executionHash: null,
    rejectionHash: payload.hashes.rejectionHash,
    blockExplorerUrl: `${LAISEN_TESTNET_EXPLORER}/tx/${lifecycle.executeTxHash}`,
    events: lifecycle.events,
    error: null,
  });
}

export async function voteMandateProposal({
  walletClient,
  publicClient,
  account,
  governorAddress,
  proposalId,
}: {
  walletClient: WalletClient;
  publicClient: PublicClient;
  account: Address;
  governorAddress: Address;
  proposalId: bigint;
}) {
  const state = await readGovernorProposalState({ publicClient, governorAddress, proposalId });
  if (state !== 1) {
    throw new Error(`Proposal is not active for voting. Current state: ${labelGovernorState(state)}.`);
  }

  const voteTxHash = await walletClient.writeContract({
    account,
    chain: laisenTestnet,
    address: governorAddress,
    abi: laisenGovernorArtifact.abi,
    functionName: "castVote",
    args: [proposalId, DAO_SUPPORT_FOR],
  });
  const voteReceipt = await publicClient.waitForTransactionReceipt({ hash: voteTxHash });

  return {
    txHash: voteTxHash,
    blockNumber: Number(voteReceipt.blockNumber),
    events: parseReceiptEvents({
      receipt: voteReceipt,
      abi: laisenGovernorArtifact.abi,
      source: "governor",
    }),
  };
}

export async function queueMandateProposal({
  walletClient,
  publicClient,
  account,
  governorAddress,
  protocolAddress,
  runtimeContext,
  protocolPackage,
  proposalAction,
  proposalId,
}: {
  walletClient: WalletClient;
  publicClient: PublicClient;
  account: Address;
  governorAddress: Address;
  protocolAddress: Address;
  runtimeContext: RuntimeContext;
  protocolPackage: ProtocolPackage;
  proposalAction: ProposalAction;
  proposalId: bigint;
}) {
  const state = await readGovernorProposalState({ publicClient, governorAddress, proposalId });
  if (state !== 4) {
    throw new Error(`Proposal is not succeeded yet. Current state: ${labelGovernorState(state)}.`);
  }

  const payload = buildProposalPayload(runtimeContext, protocolPackage, protocolAddress, proposalAction);
  const queueTxHash = await walletClient.writeContract({
    account,
    chain: laisenTestnet,
    address: governorAddress,
    abi: laisenGovernorArtifact.abi,
    functionName: "queue",
    args: [payload.targets, payload.values, payload.calldatas, payload.descriptionHash],
  });
  const queueReceipt = await publicClient.waitForTransactionReceipt({ hash: queueTxHash });

  return {
    txHash: queueTxHash,
    blockNumber: Number(queueReceipt.blockNumber),
    events: parseReceiptEvents({
      receipt: queueReceipt,
      abi: [...laisenGovernorArtifact.abi, ...laisenTimelockArtifact.abi],
      source: "timelock",
    }),
  };
}

export async function executeMandateProposal({
  walletClient,
  publicClient,
  account,
  governorAddress,
  protocolAddress,
  runtimeContext,
  protocolPackage,
  proposalAction,
  proposalId,
}: {
  walletClient: WalletClient;
  publicClient: PublicClient;
  account: Address;
  governorAddress: Address;
  protocolAddress: Address;
  runtimeContext: RuntimeContext;
  protocolPackage: ProtocolPackage;
  proposalAction: ProposalAction;
  proposalId: bigint;
}) {
  const state = await readGovernorProposalState({ publicClient, governorAddress, proposalId });
  if (state !== 5) {
    throw new Error(`Proposal is not queued for execution. Current state: ${labelGovernorState(state)}.`);
  }

  const proposalEta = (await publicClient.readContract({
    address: governorAddress,
    abi: laisenGovernorArtifact.abi,
    functionName: "proposalEta",
    args: [proposalId],
  })) as bigint;
  const block = await publicClient.getBlock();
  if (block.timestamp < proposalEta) {
    throw new Error("Timelock delay has not elapsed yet.");
  }

  const payload = buildProposalPayload(runtimeContext, protocolPackage, protocolAddress, proposalAction);
  const executeTxHash = await walletClient.writeContract({
    account,
    chain: laisenTestnet,
    address: governorAddress,
    abi: laisenGovernorArtifact.abi,
    functionName: "execute",
    args: [payload.targets, payload.values, payload.calldatas, payload.descriptionHash],
  });
  const executeReceipt = await publicClient.waitForTransactionReceipt({ hash: executeTxHash });

  return {
    executeTxHash,
    executeBlockNumber: Number(executeReceipt.blockNumber),
    events: parseReceiptEvents({
      receipt: executeReceipt,
      abi: [
        ...laisenGovernorArtifact.abi,
        ...laisenTimelockArtifact.abi,
        ...laisenRuntimeProtocolArtifact.abi,
      ],
      source: "protocol",
    }),
    hashes: payload.hashes,
  };
}

export async function readGovernorProposalState({
  publicClient,
  governorAddress,
  proposalId,
}: {
  publicClient: PublicClient;
  governorAddress: Address;
  proposalId: bigint;
}) {
  return Number(await publicClient.readContract({
    address: governorAddress,
    abi: laisenGovernorArtifact.abi,
    functionName: "state",
    args: [proposalId],
  }));
}

export async function readGovernorProposalEta({
  publicClient,
  governorAddress,
  proposalId,
}: {
  publicClient: PublicClient;
  governorAddress: Address;
  proposalId: bigint;
}) {
  return (await publicClient.readContract({
    address: governorAddress,
    abi: laisenGovernorArtifact.abi,
    functionName: "proposalEta",
    args: [proposalId],
  })) as bigint;
}

export async function readGovernorProposalSnapshot({
  publicClient,
  governorAddress,
  proposalId,
}: {
  publicClient: PublicClient;
  governorAddress: Address;
  proposalId: bigint;
}) {
  return (await publicClient.readContract({
    address: governorAddress,
    abi: laisenGovernorArtifact.abi,
    functionName: "proposalSnapshot",
    args: [proposalId],
  })) as bigint;
}

export async function readGovernorProposalVotes({
  publicClient,
  governorAddress,
  proposalId,
}: {
  publicClient: PublicClient;
  governorAddress: Address;
  proposalId: bigint;
}) {
  const [against, support, abstain] = (await publicClient.readContract({
    address: governorAddress,
    abi: laisenGovernorArtifact.abi,
    functionName: "proposalVotes",
    args: [proposalId],
  })) as [bigint, bigint, bigint];

  return { against, support, abstain };
}

export async function readGovernorQuorumAtSnapshot({
  publicClient,
  governorAddress,
  snapshot,
}: {
  publicClient: PublicClient;
  governorAddress: Address;
  snapshot: bigint;
}) {
  return (await publicClient.readContract({
    address: governorAddress,
    abi: laisenGovernorArtifact.abi,
    functionName: "quorum",
    args: [snapshot],
  })) as bigint;
}

export async function readGovernorHasVoted({
  publicClient,
  governorAddress,
  proposalId,
  account,
}: {
  publicClient: PublicClient;
  governorAddress: Address;
  proposalId: bigint;
  account: Address;
}) {
  return (await publicClient.readContract({
    address: governorAddress,
    abi: laisenGovernorArtifact.abi,
    functionName: "hasVoted",
    args: [proposalId, account],
  })) as boolean;
}

export async function readTokenVotes({
  publicClient,
  tokenAddress,
  account,
}: {
  publicClient: PublicClient;
  tokenAddress: Address;
  account: Address;
}) {
  return (await publicClient.readContract({
    address: tokenAddress,
    abi: laisenGovernanceTokenArtifact.abi,
    functionName: "getVotes",
    args: [account],
  })) as bigint;
}

async function configureTimelockRoles({
  walletClient,
  publicClient,
  account,
  timelockAddress,
  governorAddress,
}: {
  walletClient: WalletClient;
  publicClient: PublicClient;
  account: Address;
  timelockAddress: Address;
  governorAddress: Address;
}) {
  const proposerRole = (await publicClient.readContract({
    address: timelockAddress,
    abi: laisenTimelockArtifact.abi,
    functionName: "PROPOSER_ROLE",
  })) as `0x${string}`;
  const cancellerRole = (await publicClient.readContract({
    address: timelockAddress,
    abi: laisenTimelockArtifact.abi,
    functionName: "CANCELLER_ROLE",
  })) as `0x${string}`;
  const executorRole = (await publicClient.readContract({
    address: timelockAddress,
    abi: laisenTimelockArtifact.abi,
    functionName: "EXECUTOR_ROLE",
  })) as `0x${string}`;

  await writeAndConfirm({
    walletClient,
    publicClient,
    account,
    address: timelockAddress,
    abi: laisenTimelockArtifact.abi,
    functionName: "grantRole",
    args: [proposerRole, governorAddress],
  });
  await writeAndConfirm({
    walletClient,
    publicClient,
    account,
    address: timelockAddress,
    abi: laisenTimelockArtifact.abi,
    functionName: "grantRole",
    args: [cancellerRole, governorAddress],
  });
  await writeAndConfirm({
    walletClient,
    publicClient,
    account,
    address: timelockAddress,
    abi: laisenTimelockArtifact.abi,
    functionName: "grantRole",
    args: [executorRole, governorAddress],
  });
}

async function distributeGovernanceToken({
  walletClient,
  publicClient,
  account,
  tokenAddress,
  totalSupplyUnits,
}: {
  walletClient: WalletClient;
  publicClient: PublicClient;
  account: Address;
  tokenAddress: Address;
  totalSupplyUnits: bigint;
}) {
  const contributorAddress = maybeAddress(process.env.NEXT_PUBLIC_LAISEN_CONTRIBUTOR_ADDRESS, account);
  const communityAddress = maybeAddress(process.env.NEXT_PUBLIC_LAISEN_COMMUNITY_ADDRESS, account);

  const contributorUnits = (totalSupplyUnits * BigInt(23)) / BigInt(100);
  const communityUnits = (totalSupplyUnits * BigInt(35)) / BigInt(100);

  if (contributorAddress !== account && contributorUnits > BigInt(0)) {
    await writeAndConfirm({
      walletClient,
      publicClient,
      account,
      address: tokenAddress,
      abi: laisenGovernanceTokenArtifact.abi,
      functionName: "transfer",
      args: [contributorAddress, contributorUnits],
    });
  }

  if (communityAddress !== account && communityUnits > BigInt(0)) {
    await writeAndConfirm({
      walletClient,
      publicClient,
      account,
      address: tokenAddress,
      abi: laisenGovernanceTokenArtifact.abi,
      functionName: "transfer",
      args: [communityAddress, communityUnits],
    });
  }
}

async function executeDaoLifecycle({
  walletClient,
  publicClient,
  account,
  governorAddress,
  payload,
  onProgress,
}: {
  walletClient: WalletClient;
  publicClient: PublicClient;
  account: Address;
  governorAddress: Address;
  payload: ReturnType<typeof buildProposalPayload>;
  onProgress?: (patch: Partial<MandateProof>) => void;
}): Promise<DaoLifecycleProof> {
  const proposal = await proposeMandateAction({
    walletClient,
    publicClient,
    account,
    governorAddress,
    payload,
  });
  onProgress?.({ status: "signing", proposalTxHash: proposal.proposalTxHash, error: null });
  onProgress?.({ status: "signing", proposalId: proposal.proposalId, proposalTxHash: proposal.proposalTxHash, error: null });

  await waitForProposalState({
    publicClient,
    governorAddress,
    proposalId: proposal.proposalId,
    targetState: 1,
  });

  const voteResult = await voteMandateProposal({
    walletClient,
    publicClient,
    account,
    governorAddress,
    proposalId: proposal.proposalId,
  });
  onProgress?.({
    status: "signing",
    proposalId: proposal.proposalId,
    proposalTxHash: proposal.proposalTxHash,
    voteTxHash: voteResult.txHash,
    voteBlockNumber: voteResult.blockNumber,
    events: [...proposal.events, ...voteResult.events],
    error: null,
  });

  await waitForProposalState({
    publicClient,
    governorAddress,
    proposalId: proposal.proposalId,
    targetState: 4,
  });

  const queueResult = await queueMandateProposal({
    walletClient,
    publicClient,
    account,
    governorAddress,
    protocolAddress: payload.protocolAddress,
    runtimeContext: payload.runtimeContext,
    protocolPackage: payload.protocolPackage,
    proposalAction: payload.action,
    proposalId: proposal.proposalId,
  });
  onProgress?.({
    status: "signing",
    proposalId: proposal.proposalId,
    proposalTxHash: proposal.proposalTxHash,
    proposalBlockNumber: proposal.proposalBlockNumber,
    voteTxHash: voteResult.txHash,
    voteBlockNumber: voteResult.blockNumber,
    queueTxHash: queueResult.txHash,
    queueBlockNumber: queueResult.blockNumber,
    events: [...proposal.events, ...voteResult.events, ...queueResult.events],
    error: null,
  });

  const proposalEta = (await publicClient.readContract({
    address: governorAddress,
    abi: laisenGovernorArtifact.abi,
    functionName: "proposalEta",
    args: [proposal.proposalId],
  })) as bigint;

  await waitUntilTimestamp(publicClient, proposalEta);

  const executeResult = await executeMandateProposal({
    walletClient,
    publicClient,
    account,
    governorAddress,
    protocolAddress: payload.protocolAddress,
    runtimeContext: payload.runtimeContext,
    protocolPackage: payload.protocolPackage,
    proposalAction: payload.action,
    proposalId: proposal.proposalId,
  });
  onProgress?.({
    status: "signing",
    proposalId: proposal.proposalId,
    proposalTxHash: proposal.proposalTxHash,
    proposalBlockNumber: proposal.proposalBlockNumber,
    voteTxHash: voteResult.txHash,
    voteBlockNumber: voteResult.blockNumber,
    queueTxHash: queueResult.txHash,
    queueBlockNumber: queueResult.blockNumber,
    actionTxHash: executeResult.executeTxHash,
    actionBlockNumber: executeResult.executeBlockNumber,
    events: [...proposal.events, ...voteResult.events, ...queueResult.events, ...executeResult.events],
    error: null,
  });

  return {
    proposalId: proposal.proposalId,
    proposalTxHash: proposal.proposalTxHash,
    proposalBlockNumber: proposal.proposalBlockNumber,
    voteTxHash: voteResult.txHash,
    voteBlockNumber: voteResult.blockNumber,
    queueTxHash: queueResult.txHash,
    queueBlockNumber: queueResult.blockNumber,
    executeTxHash: executeResult.executeTxHash,
    executeBlockNumber: executeResult.executeBlockNumber,
    events: [...proposal.events, ...voteResult.events, ...queueResult.events, ...executeResult.events],
  };
}

function buildProposalPayload(
  runtimeContext: RuntimeContext,
  protocolPackage: ProtocolPackage,
  protocolAddress: Address,
  action: ProposalAction,
) {
  const hashes = buildMandateHashes(runtimeContext, protocolPackage);

  const calldata =
    action === "approve"
      ? encodeFunctionData({
          abi: laisenRuntimeProtocolArtifact.abi,
          functionName: "approveAndExecuteMandate",
          args: [hashes.mandateId, hashes.mandateHash, hashes.signalHash, hashes.decisionHash, hashes.executionHash],
        })
      : encodeFunctionData({
          abi: laisenRuntimeProtocolArtifact.abi,
          functionName: "rejectMandate",
          args: [hashes.mandateId, hashes.mandateHash, hashes.rejectionHash],
        });

  const description = `${action === "approve" ? "Approve" : "Reject"} mandate ${hashes.mandateId} for ${protocolPackage.daoName}`;
  const descriptionHash = keccak256(stringToBytes(description));

  return {
    action,
    hashes,
    runtimeContext,
    protocolPackage,
    protocolAddress,
    targets: [protocolAddress],
    values: [BigInt(0)],
    calldatas: [calldata],
    description,
    descriptionHash,
  };
}

async function proposeMandateAction({
  walletClient,
  publicClient,
  account,
  governorAddress,
  payload,
}: {
  walletClient: WalletClient;
  publicClient: PublicClient;
  account: Address;
  governorAddress: Address;
  payload: ReturnType<typeof buildProposalPayload>;
}) {
  const proposalTxHash = await walletClient.writeContract({
    account,
    chain: laisenTestnet,
    address: governorAddress,
    abi: laisenGovernorArtifact.abi,
    functionName: "propose",
    args: [payload.targets, payload.values, payload.calldatas, payload.description],
  });
  const proposalReceipt = await publicClient.waitForTransactionReceipt({ hash: proposalTxHash });

  const proposalId = (await publicClient.readContract({
    address: governorAddress,
    abi: laisenGovernorArtifact.abi,
    functionName: "hashProposal",
    args: [payload.targets, payload.values, payload.calldatas, payload.descriptionHash],
  })) as bigint;

  return {
    proposalId,
    proposalTxHash,
    proposalBlockNumber: Number(proposalReceipt.blockNumber),
    events: [
      buildSyntheticProofEvent({
        name: "ProposalSubmitted",
        source: "governor",
        txHash: proposalTxHash,
        blockNumber: Number(proposalReceipt.blockNumber),
        detail: `Proposal ${proposalId.toString()} submitted to governor.`,
      }),
      ...parseReceiptEvents({
        receipt: proposalReceipt,
        abi: laisenGovernorArtifact.abi,
        source: "governor",
      }),
    ],
  };
}

async function waitForProposalState({
  publicClient,
  governorAddress,
  proposalId,
  targetState,
}: {
  publicClient: PublicClient;
  governorAddress: Address;
  proposalId: bigint;
  targetState: number;
}) {
  for (let attempt = 0; attempt < 180; attempt += 1) {
    const state = Number(await publicClient.readContract({
      address: governorAddress,
      abi: laisenGovernorArtifact.abi,
      functionName: "state",
      args: [proposalId],
    }));

    if (state === targetState) return;
    if (state === 2 || state === 3 || state === 6) {
      throw new Error(`Proposal moved to terminal state ${state.toString()} before reaching ${targetState.toString()}.`);
    }

    await delay(2000);
  }

  throw new Error("Timed out waiting for proposal state transition.");
}

async function waitUntilTimestamp(publicClient: PublicClient, targetTimestamp: bigint) {
  if (targetTimestamp === BigInt(0)) return;

  for (let attempt = 0; attempt < 180; attempt += 1) {
    const block = await publicClient.getBlock();
    if (block.timestamp >= targetTimestamp) return;
    await delay(2000);
  }

  throw new Error("Timed out waiting for timelock delay to elapse.");
}

async function writeAndConfirm({
  walletClient,
  publicClient,
  account,
  address,
  abi,
  functionName,
  args,
}: {
  walletClient: WalletClient;
  publicClient: PublicClient;
  account: Address;
  address: Address;
  abi: unknown;
  functionName: string;
  args: unknown[];
}) {
  const txHash = await walletClient.writeContract({
    account,
    chain: laisenTestnet,
    address,
    abi: abi as never,
    functionName: functionName as never,
    args: args as never,
  });

  await publicClient.waitForTransactionReceipt({ hash: txHash });
}

function maybeAddress(value: string | undefined, fallback: Address): Address {
  if (!value) return fallback;
  if (value.toLowerCase() === zeroAddress) return fallback;

  try {
    return getAddress(value);
  } catch {
    return fallback;
  }
}

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function readIntEnv(key: string, fallback: number) {
  const raw = process.env[key];
  if (!raw) return fallback;

  const value = Number.parseInt(raw, 10);
  if (Number.isNaN(value) || value < 0) return fallback;
  return value;
}

function readBoolEnv(key: string, fallback: boolean) {
  const raw = process.env[key];
  if (!raw) return fallback;

  const normalized = raw.trim().toLowerCase();
  if (normalized === "true" || normalized === "1" || normalized === "yes") return true;
  if (normalized === "false" || normalized === "0" || normalized === "no") return false;
  return fallback;
}

function labelGovernorState(state: number) {
  switch (state) {
    case 0:
      return "pending";
    case 1:
      return "active";
    case 2:
      return "canceled";
    case 3:
      return "defeated";
    case 4:
      return "succeeded";
    case 5:
      return "queued";
    case 6:
      return "expired";
    case 7:
      return "executed";
    default:
      return `unknown(${state})`;
  }
}

function buildMandateHashes(runtimeContext: RuntimeContext, protocolPackage: ProtocolPackage) {
  const mandateId = digestText(
    `${runtimeContext.intentInput}:${runtimeContext.actionDecision?.title ?? "pending"}:${runtimeContext.signal?.headline ?? "signal"}`,
  );
  const mandateHash = digestJson({
    dao: protocolPackage.daoName,
    intent: runtimeContext.intentInput,
    title: runtimeContext.actionDecision?.title ?? "pending",
    action: runtimeContext.actionDecision?.action ?? "pending",
  });
  const signalHash = digestJson(runtimeContext.signal ?? { signal: "missing" });
  const decisionHash = digestJson(runtimeContext.actionDecision ?? { decision: "pending" });
  const executionHash = digestJson({
    moves: runtimeContext.execution.moves,
    events: runtimeContext.execution.events,
  });
  const rejectionHash = digestJson({
    reason: runtimeContext.actionDecision?.reason ?? "Human rejected mandate before execution.",
    intent: runtimeContext.intentInput,
  });

  return {
    mandateId,
    mandateHash,
    signalHash,
    decisionHash,
    executionHash,
    rejectionHash,
  };
}

function getRequiredContractAddress(address: Address | null | undefined, label: string) {
  if (!address) {
    throw new Error(`Missing ${label} contract address in deployment receipt.`);
  }

  return getAddress(address);
}

function buildSyntheticProofEvent(event: ProofEvent): ProofEvent {
  return event;
}

function parseReceiptEvents({
  receipt,
  abi,
  source,
}: {
  receipt: TransactionReceipt;
  abi: readonly unknown[];
  source: ProofEvent["source"];
}): ProofEvent[] {
  try {
    const parsed = parseEventLogs({
      abi: abi as never,
      logs: receipt.logs,
      strict: false,
    }) as Array<{ eventName?: string }>;

    return parsed.map((entry) => ({
      name: String(entry.eventName ?? "ReceiptEvent"),
      source,
      txHash: receipt.transactionHash,
      blockNumber: Number(receipt.blockNumber),
      detail: `${String(entry.eventName)} confirmed in block ${receipt.blockNumber.toString()}.`,
    }));
  } catch {
    return [];
  }
}
