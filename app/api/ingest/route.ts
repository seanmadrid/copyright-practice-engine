// Ingestion + extraction. The front door: raw source text in, the governing test
// (for the selected doctrine) as the source expresses it out. This is the
// content-to-structure step. The doctrine's authored JSON is the validation
// reference and the safety net. Works for any structure type — the prompt and the
// validator both read from the shared model.

import { NextResponse } from "next/server";
import { getAnthropic, MODEL, textOf, extractJson } from "@/lib/anthropic";
import { canonicalStructure, validateStructure } from "@/lib/ingest";
import { ingestPrompt } from "@/lib/prompts";
import { getDoctrine } from "@/lib/data";
import type { Doctrine, ExtractedStructure, IngestResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIMEOUT_MS = 30_000;
const MIN_SOURCE_CHARS = 120;
const MAX_SOURCE_CHARS = 24_000;

function thinNote(doctrine: Doctrine): string {
  return `That source was thin, so we could not extract a clean ${doctrine.name.toLowerCase()} test from it and fell back to the canonical ${doctrine.name} standard. Paste a fuller case opinion or doctrine chapter for a source-grounded test.`;
}

function fallback(doctrine: Doctrine, note: string): NextResponse<IngestResponse> {
  return NextResponse.json<IngestResponse>(
    { ok: true, structure: canonicalStructure(doctrine), thin: true, note },
    { status: 200 },
  );
}

export async function POST(req: Request) {
  let source: string;
  let doctrineId: string;
  try {
    const body = (await req.json()) as { source?: unknown; doctrine_id?: unknown };
    source = typeof body.source === "string" ? body.source.trim() : "";
    doctrineId = typeof body.doctrine_id === "string" ? body.doctrine_id : "";
  } catch {
    return NextResponse.json<IngestResponse>(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const doctrine = getDoctrine(doctrineId);
  if (!doctrine) {
    return NextResponse.json<IngestResponse>(
      { ok: false, error: "Unknown doctrine." },
      { status: 400 },
    );
  }

  if (source.length < MIN_SOURCE_CHARS) {
    return NextResponse.json<IngestResponse>(
      {
        ok: false,
        error:
          "Paste more source text: a case opinion or a doctrine chapter (at least a paragraph).",
      },
      { status: 400 },
    );
  }
  const clipped = source.slice(0, MAX_SOURCE_CHARS);

  // No key: extraction is unavailable. Fall back to the canonical table so the
  // flow still runs end to end. (Safety net #1.)
  if (!process.env.ANTHROPIC_API_KEY) {
    return fallback(
      doctrine,
      `Running without a model key, so extraction is unavailable and practice uses the canonical ${doctrine.name} standard. Set ANTHROPIC_API_KEY to extract structure live from pasted sources.`,
    );
  }

  try {
    const client = getAnthropic();
    const message = await client.messages.create(
      {
        model: MODEL,
        max_tokens: 1500,
        messages: [{ role: "user", content: ingestPrompt(doctrine, clipped) }],
      },
      { timeout: TIMEOUT_MS },
    );
    const raw = extractJson<ExtractedStructure>(textOf(message));
    const structure = validateStructure(doctrine, raw);

    // Malformed shape, or the model judged the source thin: fall back.
    if (!structure || structure.confidence === "low") {
      return fallback(doctrine, thinNote(doctrine));
    }

    return NextResponse.json<IngestResponse>(
      { ok: true, structure, thin: false },
      { status: 200 },
    );
  } catch {
    return fallback(
      doctrine,
      `Live extraction did not complete, so practice falls back to the canonical ${doctrine.name} standard. The rest of the loop runs normally.`,
    );
  }
}
