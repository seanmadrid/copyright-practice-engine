// Classification: read a learner's free-text answer and map it onto structured
// per-unit calls + a conclusion. No grading happens here — that is deterministic
// scoring's job. Doctrine-aware via the shared prompt builder and status vocab.

import { NextResponse } from "next/server";
import { getAnthropic, MODEL, textOf, extractJson } from "@/lib/anthropic";
import { classifyPrompt } from "@/lib/prompts";
import { getDoctrine } from "@/lib/data";
import { structureModel } from "@/lib/structure-model";
import type {
  Classified,
  ClassifyResponse,
  Conclusion,
  Doctrine,
  LearnerAnswer,
  Status,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIMEOUT_MS = 25_000;

type RawClassified = {
  units?: Record<string, string>;
  key_unit_id_named?: number | null;
  identified_distinction?: boolean;
  conclusion?: string;
};

function normalize(
  doctrine: Doctrine,
  raw: RawClassified,
  answer: LearnerAnswer,
): Classified | null {
  if (!raw || typeof raw !== "object" || !raw.units) return null;
  const model = structureModel(doctrine.structure);
  const allowed = new Set(model.statuses.map((s) => s.value));
  const conclusions = new Set(model.conclusions.map((c) => c.value));

  const units: Record<string, Status> = {};
  for (const ua of answer.units) {
    const key = String(ua.unit_id);
    const v = raw.units[key];
    // Fall back to the learner's own selection if the model omitted/garbled one.
    units[key] = (allowed.has(v as Status) ? v : ua.status) as Status;
  }
  const conclusion = (
    conclusions.has(raw.conclusion as Conclusion)
      ? raw.conclusion
      : answer.conclusion
  ) as Conclusion;
  const keyNamed =
    typeof raw.key_unit_id_named === "number" ? raw.key_unit_id_named : null;
  return {
    units,
    key_unit_id_named: keyNamed,
    identified_distinction: Boolean(raw.identified_distinction),
    conclusion,
  };
}

export async function POST(req: Request) {
  let answer: LearnerAnswer;
  try {
    answer = (await req.json()) as LearnerAnswer;
  } catch {
    return NextResponse.json<ClassifyResponse>(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const doctrine = getDoctrine(answer?.doctrine_id);
  const target = doctrine?.teaching_targets.find(
    (t) => t.id === answer?.target_id,
  );
  if (!doctrine || !target || !Array.isArray(answer.units)) {
    return NextResponse.json<ClassifyResponse>(
      { ok: false, error: "Unknown doctrine/target or malformed answer." },
      { status: 400 },
    );
  }

  // Offline fallback: with no API key, map the learner's OWN explicit selections
  // into structured calls so scoring still runs. The two NLP-only judgments
  // (naming the deciding unit, spotting the distinction) require reading prose,
  // so they are conservatively null/false here. Real classification takes over
  // automatically once ANTHROPIC_API_KEY is set.
  if (!process.env.ANTHROPIC_API_KEY) {
    const units: Record<string, Status> = {};
    for (const ua of answer.units) units[String(ua.unit_id)] = ua.status;
    const classified: Classified = {
      units,
      key_unit_id_named: null,
      identified_distinction: false,
      conclusion: answer.conclusion,
    };
    return NextResponse.json<ClassifyResponse>(
      { ok: true, classified, degraded: true },
      { status: 200 },
    );
  }

  try {
    const client = getAnthropic();
    const message = await client.messages.create(
      {
        model: MODEL,
        max_tokens: 512,
        messages: [
          { role: "user", content: classifyPrompt(doctrine, answer, target) },
        ],
      },
      { timeout: TIMEOUT_MS },
    );
    const raw = extractJson<RawClassified>(textOf(message));
    const classified = raw ? normalize(doctrine, raw, answer) : null;
    if (!classified) {
      return NextResponse.json<ClassifyResponse>(
        { ok: false, error: "We could not read your answer. Please try again." },
        { status: 200 },
      );
    }
    return NextResponse.json<ClassifyResponse>(
      { ok: true, classified },
      { status: 200 },
    );
  } catch (err) {
    const msg =
      (err as Error)?.message?.includes("ANTHROPIC_API_KEY") === true
        ? "Classifier is not configured (missing API key)."
        : "We could not read your answer. Please try again.";
    return NextResponse.json<ClassifyResponse>(
      { ok: false, error: msg },
      { status: 200 },
    );
  }
}
