// Generation grounded in the source. Takes the doctrine, the extracted structure,
// and a teaching target (which units must land where) and writes a novel hypo
// grounded in the rule as the source articulates it. The teaching target is the
// answer key by construction, so deterministic scoring survives. Works for either
// structure type via the shared prompt builder.
//
// Live, right after ingestion. Safety net: retry once, then serve the cached
// example hypo for the target so the preloaded sources always complete the loop.

import { NextResponse } from "next/server";
import { getAnthropic, MODEL, textOf, extractJson } from "@/lib/anthropic";
import type {
  ExtractedStructure,
  GenerateRequest,
  GenerateResponse,
  Hypo,
} from "@/lib/types";
import { validateStructure } from "@/lib/ingest";
import { generatePrompt } from "@/lib/prompts";
import { getDoctrine, hypoFor } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIMEOUT_MS = 30_000;

async function generateOnce(
  prompt: string,
  doctrineId: string,
  targetId: string,
): Promise<Hypo | null> {
  const client = getAnthropic();
  const message = await client.messages.create(
    {
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    },
    { timeout: TIMEOUT_MS },
  );
  const parsed = extractJson<Omit<Hypo, "target_id" | "doctrine_id">>(
    textOf(message),
  );
  if (!parsed || !parsed.fact_pattern) return null;
  return {
    doctrine_id: doctrineId,
    target_id: targetId,
    title: parsed.title ?? "Untitled hypothetical",
    source_work: parsed.source_work ?? "",
    use: parsed.use ?? "",
    fact_pattern: parsed.fact_pattern,
  };
}

export async function POST(req: Request) {
  let body: GenerateRequest;
  try {
    body = (await req.json()) as GenerateRequest;
  } catch {
    return NextResponse.json<GenerateResponse>(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const doctrine = getDoctrine(body?.doctrine_id);
  if (!doctrine) {
    return NextResponse.json<GenerateResponse>(
      { ok: false, error: "Unknown doctrine." },
      { status: 400 },
    );
  }

  const target = doctrine.teaching_targets.find((t) => t.id === body?.target_id);
  if (!target) {
    return NextResponse.json<GenerateResponse>(
      { ok: false, error: "Unknown teaching target." },
      { status: 400 },
    );
  }

  // Re-validate the structure the client sent (it round-tripped through the
  // browser). Fall back to a canonical-shaped structure if it is malformed.
  const structure =
    validateStructure(doctrine, body.structure as unknown as Parameters<
      typeof validateStructure
    >[1]) ?? body.structure;

  const cachedNote =
    "Live generation did not complete, so this hypothetical is a cached example for this teaching focus. It still carries the same answer key, so scoring runs normally.";

  // No key: serve the cached example hypo for this target. (Safety net.)
  if (!process.env.ANTHROPIC_API_KEY) {
    const cached = hypoFor(doctrine.id, target.id);
    if (cached) {
      return NextResponse.json<GenerateResponse>(
        {
          ok: true,
          hypo: cached,
          target_id: target.id,
          degraded: true,
          note: "Running without a model key, so we are serving a cached example hypothetical for this teaching focus. Set ANTHROPIC_API_KEY to generate live from the source.",
        },
        { status: 200 },
      );
    }
    return NextResponse.json<GenerateResponse>(
      { ok: false, error: "Generation is unavailable and no cached hypo exists." },
      { status: 200 },
    );
  }

  const prompt = generatePrompt(
    doctrine,
    structure as ExtractedStructure,
    target,
  );

  // Live generation: try once, retry once, then fall back to the cached hypo.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const hypo = await generateOnce(prompt, doctrine.id, target.id);
      if (hypo) {
        return NextResponse.json<GenerateResponse>(
          { ok: true, hypo, target_id: target.id },
          { status: 200 },
        );
      }
    } catch {
      // fall through to retry / cache
    }
  }

  const cached = hypoFor(doctrine.id, target.id);
  if (cached) {
    return NextResponse.json<GenerateResponse>(
      {
        ok: true,
        hypo: cached,
        target_id: target.id,
        degraded: true,
        note: cachedNote,
      },
      { status: 200 },
    );
  }
  return NextResponse.json<GenerateResponse>(
    { ok: false, error: "Could not generate a hypothetical. Please try again." },
    { status: 200 },
  );
}
