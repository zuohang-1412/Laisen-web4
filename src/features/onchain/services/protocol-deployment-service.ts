import type { Address, PublicClient, WalletClient } from "viem";
import { getAddress } from "viem";

import {
  laisenGovernorArtifact,
  laisenGovernanceTokenArtifact,
  laisenRuntimeProtocolArtifact,
  laisenTimelockArtifact,
} from "@/features/onchain/contracts/generated";
import {
  DeploymentReceiptSchema,
  type DeploymentPackage,
  type DeploymentReceipt,
} from "@/features/onchain/schema/deployment-schema";

export async function deployProtocolPackage(params: {
  walletClient: WalletClient;
  publicClient: PublicClient;
  account: Address;
  deploymentPackage: DeploymentPackage;
}): Promise<DeploymentReceipt> {
  const { walletClient, publicClient, account, deploymentPackage } = params;

  const tokenTxHash = await walletClient.deployContract({
    account,
    chain: walletClient.chain,
    abi: laisenGovernanceTokenArtifact.abi,
    bytecode: laisenGovernanceTokenArtifact.bytecode as `0x${string}`,
    args: [deploymentPackage.tokenName, deploymentPackage.tokenSymbol, account, deploymentPackage.totalSupplyUnits],
  });
  const tokenReceipt = await publicClient.waitForTransactionReceipt({ hash: tokenTxHash });
  const tokenAddress = getRequiredContractAddress(tokenReceipt.contractAddress, "token");

  const timelockTxHash = await walletClient.deployContract({
    account,
    chain: walletClient.chain,
    abi: laisenTimelockArtifact.abi,
    bytecode: laisenTimelockArtifact.bytecode as `0x${string}`,
    args: [BigInt(30), [account], [account], account],
  });
  const timelockReceipt = await publicClient.waitForTransactionReceipt({ hash: timelockTxHash });
  const timelockAddress = getRequiredContractAddress(timelockReceipt.contractAddress, "timelock");

  const governorTxHash = await walletClient.deployContract({
    account,
    chain: walletClient.chain,
    abi: laisenGovernorArtifact.abi,
    bytecode: laisenGovernorArtifact.bytecode as `0x${string}`,
    args: [tokenAddress, timelockAddress, 1, 8, BigInt(0), BigInt(4)],
  });
  const governorReceipt = await publicClient.waitForTransactionReceipt({ hash: governorTxHash });
  const governorAddress = getRequiredContractAddress(governorReceipt.contractAddress, "governor");

  const protocolTxHash = await walletClient.deployContract({
    account,
    chain: walletClient.chain,
    abi: laisenRuntimeProtocolArtifact.abi,
    bytecode: laisenRuntimeProtocolArtifact.bytecode as `0x${string}`,
    args: [account, tokenAddress, account, zeroHash, zeroHash, zeroHash],
  });
  const protocolReceipt = await publicClient.waitForTransactionReceipt({ hash: protocolTxHash });
  const protocolAddress = getRequiredContractAddress(protocolReceipt.contractAddress, "protocol");

  return DeploymentReceiptSchema.parse({
    deployTxHash: protocolTxHash,
    tokenAddress,
    timelockAddress,
    governorAddress,
    protocolAddress,
    blockNumber: Number(protocolReceipt.blockNumber),
  });
}

function getRequiredContractAddress(address: Address | null | undefined, label: string) {
  if (!address) throw new Error(`Missing ${label} contract address.`);
  return getAddress(address);
}

const zeroHash = "0x0000000000000000000000000000000000000000000000000000000000000000";
