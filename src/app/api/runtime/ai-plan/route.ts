import { NextResponse } from "next/server";

import {
  PlanRequestSchema,
  PlanResponseSchema,
  PlanResultSchema,
} from "@/features/ai-planning/schema/plan-schema";
import { generateDeterministicPlan } from "@/features/ai-planning/services/generate-deterministic-plan";

export async function POST(request: Request) {
  const parsed = PlanRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid payload. intent must be at least 20 characters.",
      },
      { status: 400 },
    );
  }

  const intent = parsed.data.intent.trim();
  const provider = process.env.GMI_API_URL;
  const apiKey = process.env.GMI_API_KEY;
  const model = process.env.GMI_MODEL ?? "zai-org/GLM-5-FP8";
  const timeoutMs = Number.parseInt(process.env.GMI_API_TIMEOUT_MS ?? "15000", 10);

  try {
    if (!provider || !apiKey) {
      throw new Error("Provider config not found.");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), Number.isFinite(timeoutMs) ? Math.max(timeoutMs, 1000) : 15000);

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
            content: "Return strict JSON with keys: title, action, reason, riskLevel(low|medium|high).",
          },
          {
            role: "user",
            content: `intent: ${intent}`,
          },
        ],
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Provider failed (${response.status}): ${text.slice(0, 180)}`);
    }

    const json = await response.json();
    const content = json?.choices?.[0]?.message?.content;
    const plan = PlanResultSchema.parse(extractJsonObject(typeof content === "string" ? content : JSON.stringify(content)));

    return NextResponse.json(
      PlanResponseSchema.parse({
        ok: true,
        source: "live_ai",
        provider: "GMI Cloud",
        model,
        plan,
      }),
    );
  } catch (error) {
    return NextResponse.json(
      PlanResponseSchema.parse({
        ok: true,
        source: "deterministic_fallback",
        provider: "fallback",
        model: "local-template",
        plan: generateDeterministicPlan(intent),
        error: error instanceof Error ? error.message : "Unknown planning error.",
      }),
    );
  }
}

function extractJsonObject(content: string) {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Model output is not valid JSON.");
    return JSON.parse(match[0]);
  }
}
