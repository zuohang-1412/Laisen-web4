import { parseUnits } from "viem";

import { ProtocolPackageSchema, type ProtocolPackage } from "@/features/onchain/schema/onchain-schema";

function sectorFromIntent(intent: string) {
  const lower = intent.toLowerCase();

  if (lower.includes("payment") || lower.includes("settlement")) return "payment";
  if (lower.includes("label")) return "labeling";
  if (lower.includes("retail")) return "retail";
  return "market";
}

function symbolForSector(sector: string) {
  switch (sector) {
    case "payment":
      return "LSPAY";
    case "labeling":
      return "LSLBL";
    case "retail":
      return "LSRTL";
    default:
      return "LSRUN";
  }
}

export function generateProtocolPackage(intent: string): ProtocolPackage {
  const sector = sectorFromIntent(intent);
  const daoNameMap: Record<string, string> = {
    payment: "Laisen Settlement Runtime",
    labeling: "Laisen Labeling Runtime",
    retail: "Laisen Merchant Runtime",
    market: "Laisen Execution Runtime",
  };
  const daoSummaryMap: Record<string, string> = {
    payment: "AI-led settlement execution structure for merchant payout acceleration on testnet.",
    labeling: "AI-led vendor and capacity execution structure for label supply continuity on testnet.",
    retail: "AI-led merchant corridor execution structure for premium cross-border demand capture.",
    market: "AI-led execution structure for fast signal-to-action validation on Base Sepolia.",
  };
  const founderDirectiveMap: Record<string, string> = {
    payment: "Read settlement stress, form a mandate, and move value-routing execution forward.",
    labeling: "Read supply pressure, form a corridor mandate, and activate vendor execution quickly.",
    retail: "Read demand movement, form a merchant mandate, and move premium execution into market.",
    market: "Read signal pressure, form a mandate, and turn intent into visible execution proof.",
  };

  return ProtocolPackageSchema.parse({
    daoName: daoNameMap[sector],
    daoSummary: daoSummaryMap[sector],
    governanceMode: "Human release gate, AI-led runtime execution",
    operatorPolicy: "AI Founder may generate structure, read signal, form mandates, and execute after wallet-gated release.",
    treasuryModel: "Wallet-owned, Safe-ready treasury path on Base Sepolia",
    safePath: "MVP uses the connected wallet as treasury owner while keeping the execution account Safe-compatible for future modules/guards.",
    founderPersona: {
      name: sector === "market" ? "Laisen Founder" : `Laisen ${sector[0].toUpperCase()}${sector.slice(1)} Founder`,
      role: "AI Founder",
      directive: founderDirectiveMap[sector],
    },
    token: {
      name: `${daoNameMap[sector]} Token`,
      symbol: symbolForSector(sector),
      totalSupplyUnits: parseUnits("1000000", 18),
      totalSupplyLabel: "1,000,000",
      treasuryAllocation: "42%",
      contributorAllocation: "23%",
      communityAllocation: "35%",
    },
  });
}
