/**
 * Offline generation. For every doctrine and every teaching target, ask the
 * model to write a fact pattern engineered so the units resolve exactly as that
 * target's `configuration` says — the dispositive factor controlling under
 * balancing, or the right element failing under all-of.
 *
 * Run once at build time:  npm run generate
 * The app reads the cached data/hypos.json and never generates at request time.
 *
 * If ANTHROPIC_API_KEY is absent, this falls back to authored seed hypos so the
 * app still runs end to end. With a key present, real generation overwrites them.
 */
import { config as loadEnv } from "dotenv";
import { writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import type { Doctrine, Hypo, TeachingTarget } from "../lib/types";
import { DOCTRINES } from "../lib/data";
import { canonicalStructure } from "../lib/ingest";
import { generatePrompt } from "../lib/prompts";
import { FALLBACK_HYPOS } from "./fallback-hypos";

loadEnv({ path: resolve(process.cwd(), ".env.local") });
loadEnv();

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
const OUT = resolve(process.cwd(), "data/hypos.json");

function extractJson<T>(raw: string): T | null {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : raw;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

async function generateOne(
  client: Anthropic,
  doctrine: Doctrine,
  target: TeachingTarget,
): Promise<Hypo> {
  // Build-time generation grounds in the canonical structure (no pasted source).
  const prompt = generatePrompt(doctrine, canonicalStructure(doctrine), target);
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });
  const raw = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  const parsed = extractJson<Omit<Hypo, "target_id" | "doctrine_id">>(raw);
  if (!parsed || !parsed.fact_pattern) {
    throw new Error(`Could not parse generation for ${doctrine.id}/${target.id}`);
  }
  return { doctrine_id: doctrine.id, target_id: target.id, ...parsed };
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.warn(
      "[generate] ANTHROPIC_API_KEY not set — writing authored fallback hypos so the app runs.",
    );
    console.warn(
      "[generate] Set ANTHROPIC_API_KEY (e.g. in .env.local) and re-run `npm run generate` for AI-written hypos.",
    );
    writeFileSync(OUT, JSON.stringify(FALLBACK_HYPOS, null, 2) + "\n");
    console.log(`[generate] Wrote ${FALLBACK_HYPOS.length} fallback hypos to ${OUT}`);
    return;
  }

  const client = new Anthropic({ apiKey });
  const hypos: Hypo[] = [];
  for (const doctrine of DOCTRINES) {
    for (const target of doctrine.teaching_targets) {
      process.stdout.write(`[generate] ${doctrine.id}/${target.id} ... `);
      try {
        const hypo = await generateOne(client, doctrine, target);
        hypos.push(hypo);
        console.log(`ok — "${hypo.title}"`);
      } catch (err) {
        console.log("failed, using fallback");
        const fb = FALLBACK_HYPOS.find(
          (h) => h.doctrine_id === doctrine.id && h.target_id === target.id,
        );
        if (fb) hypos.push(fb);
        console.error(`  ${(err as Error).message}`);
      }
    }
  }

  if (hypos.length === 0) {
    console.error("[generate] No hypos produced; leaving existing file intact.");
    if (!existsSync(OUT)) {
      writeFileSync(OUT, JSON.stringify(FALLBACK_HYPOS, null, 2) + "\n");
    }
    return;
  }

  writeFileSync(OUT, JSON.stringify(hypos, null, 2) + "\n");
  console.log(`[generate] Wrote ${hypos.length} hypos to ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
