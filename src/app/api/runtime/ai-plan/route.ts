import { NextResponse } from "next/server";
import { z } from "zod";

import { ProtocolPackageSchema } from "@/features/onchain/schema/onchain-schema";
import { generateProtocolPackage } from "@/features/onchain/services/generate-protocol-package";

const RequestSchema = z.object({
  intent: z.string().min(20),
});

const AiResponseSchema = z.object({
  protocolPackage: z.object({
    daoName: z.string(),
    daoSummary: z.string(),
    governanceMode: z.string(),
    operatorPolicy: z.string(),
    treasuryModel: z.string(),
    safePath: z.string(),
    founderPersona: z.object({
      name: z.string(),
      role: z.string(),
      directive: z.string(),
    }),
    token: z.object({
      name: z.string(),
      symbol: z.string().min(2).max(8),
      totalSupplyUnits: z.union([z.string(), z.number(), z.bigint()]).transform((value) => value.toString()),
      totalSupplyLabel: z.string(),
      treasuryAllocation: z.union([z.string(), z.number()]).transform((value) => value.toString()),
      contributorAllocation: z.union([z.string(), z.number()]).transform((value) => value.toString()),
      communityAllocation: z.union([z.string(), z.number()]).transform((value) => value.toString()),
    }),
  }),
  mandate: z.object({
    action: z.string(),
    reason: z.string(),
    expectedOutcome: z.string(),
    riskLevel: z.string(),
    budget: z.string(),
    humanReleaseRequired: z
      .union([z.boolean(), z.string(), z.number()])
      .transform((value) => {
        if (typeof value === "boolean") return value;
        if (typeof value === "number") return value !== 0;
        const normalized = value.trim().toLowerCase();
        if (["true", "1", "yes", "y", "required"].includes(normalized)) return true;
        if (["false", "0", "no", "n", "optional"].includes(normalized)) return false;
        return true;
      }),
  }),
});

export async function POST(request: Request) {
  const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid intent payload.",
      },
      { status: 400 },
    );
  }

  const { intent } = parsed.data;
  const provider = process.env.GMI_API_URL;
  const apiKey = process.env.GMI_API_KEY;
  const model = process.env.GMI_MODEL ?? "zai-org/GLM-5-FP8";
  const timeoutMs = Number.parseInt(process.env.GMI_API_TIMEOUT_MS ?? "15000", 10);

  try {
    if (!provider || !apiKey) {
      throw new Error("GMI API is not configured.");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, Number.isFinite(timeoutMs) ? Math.max(timeoutMs, 1000) : 15000);

    const response = await fetch(provider, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are an AI Founder planner. Respond with strict JSON only. Build a deployable DAO protocol package and one autonomous mandate.",
          },
          {
            role: "user",
            content: [
              "Return JSON with keys:",
              "protocolPackage: daoName, daoSummary, governanceMode, operatorPolicy, treasuryModel, safePath, founderPersona{name,role,directive}, token{name,symbol,totalSupplyUnits,totalSupplyLabel,treasuryAllocation,contributorAllocation,communityAllocation}",
              "mandate: action, reason, expectedOutcome, riskLevel, budget, humanReleaseRequired",
              `intent: ${intent}`,
            ].join("\n"),
          },
        ],
      }),
      signal: controller.signal,
    }).finally(() => {
      clearTimeout(timeoutId);
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`AI provider failed (${response.status}): ${text.slice(0, 180)}`);
    }

    const json = await response.json();
    const content = json?.choices?.[0]?.message?.content;
    const candidate = extractJsonObject(typeof content === "string" ? content : JSON.stringify(content));
    const aiOutput = AiResponseSchema.parse(candidate);

    const protocolPackage = ProtocolPackageSchema.parse({
      ...aiOutput.protocolPackage,
      token: {
        ...aiOutput.protocolPackage.token,
        totalSupplyUnits: BigInt(aiOutput.protocolPackage.token.totalSupplyUnits),
      },
    });

    return NextResponse.json({
      ok: true,
      source: "live_ai",
      provider: "GMI Cloud",
      model,
      protocolPackage: serializeProtocolPackage(protocolPackage),
      mandate: aiOutput.mandate,
    });
  } catch (error) {
    const fallbackPackage = generateProtocolPackage(intent);
    return NextResponse.json({
      ok: true,
      source: "deterministic_fallback",
      provider: "fallback",
      model: "local-template",
      error: error instanceof Error ? error.message : "Unknown AI planning error.",
      protocolPackage: serializeProtocolPackage(fallbackPackage),
      mandate: {
        action: "Proceed with deterministic execution mandate.",
        reason: "Live AI planning unavailable. Using fallback package to preserve runtime continuity.",
        expectedOutcome: "Demo-safe package generation remains available.",
        riskLevel: "medium",
        budget: "testnet-only",
        humanReleaseRequired: true,
      },
    });
  }
}

function serializeProtocolPackage(input: z.infer<typeof ProtocolPackageSchema>) {
  return {
    ...input,
    token: {
      ...input.token,
      totalSupplyUnits: input.token.totalSupplyUnits.toString(),
    },
  };
}

function extractJsonObject(content: string) {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Model response is not valid JSON.");
    }
    return JSON.parse(match[0]);
  }
}
