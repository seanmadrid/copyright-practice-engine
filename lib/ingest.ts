// Validation reference + safety net for source ingestion.
//
// The authored doctrine plays two roles here: the canonical schema the extracted
// JSON is validated against (unit ids/names are pinned to it so scoring stays
// valid), and the fallback structure served when a source is too thin to extract
// a real test from. Both roles are doctrine-agnostic — they read from the shared
// `Doctrine` model and the structure's cue statuses.

import type {
  Doctrine,
  ExtractedStructure,
  ExtractedUnit,
} from "./types";
import { structureModel } from "./structure-model";

/** The canonical unit ids this doctrine's extracted shape must cover. */
export function canonicalUnitIds(doctrine: Doctrine): number[] {
  return doctrine.units.map((u) => u.id);
}

/** Canonical units, handed to the extractor so ids/names stay aligned. */
export function canonicalUnits(doctrine: Doctrine) {
  return doctrine.units.map((u) => ({
    id: u.id,
    name: u.name,
    cues: u.cues,
  }));
}

/**
 * The canonical standard rendered as an ExtractedStructure. The safety net:
 * served verbatim when there is no API key, when extraction fails to parse, or
 * when the source is too thin to yield a real test.
 */
export function canonicalStructure(doctrine: Doctrine): ExtractedStructure {
  return {
    doctrine_id: doctrine.id,
    doctrine: doctrine.doctrine,
    structure: doctrine.structure,
    units: doctrine.units.map((u) => ({
      id: u.id,
      name: u.name,
      as_expressed_in_source: `Drawn from the canonical ${doctrine.name} standard, not from the pasted source.`,
      cues: u.cues,
    })),
    source_facts: `The source did not yield a usable ${doctrine.name.toLowerCase()} test, so practice falls back to the canonical standard.`,
    confidence: "low",
  };
}

type RawStructure = {
  doctrine?: unknown;
  structure?: unknown;
  units?: unknown;
  source_facts?: unknown;
  confidence?: unknown;
};

function toStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string" && x.trim() !== "");
}

/**
 * Validate raw extracted JSON against the doctrine's canonical schema and
 * normalize it. Returns null when the shape does not match (wrong/missing unit
 * ids, no names) — the caller then falls back to the canonical table.
 *
 * Unit ids and names are pinned to the canonical set so downstream scoring,
 * which keys on canonical ids, stays valid regardless of what the model returned.
 */
export function validateStructure(
  doctrine: Doctrine,
  raw: RawStructure | null,
): ExtractedStructure | null {
  if (!raw || typeof raw !== "object" || !Array.isArray(raw.units)) {
    return null;
  }

  const model = structureModel(doctrine.structure);
  const ids = canonicalUnitIds(doctrine);
  const byId = new Map<number, ExtractedUnit>();

  for (const entry of raw.units as unknown[]) {
    if (!entry || typeof entry !== "object") continue;
    const e = entry as Record<string, unknown>;
    const id = typeof e.id === "number" ? e.id : Number(e.id);
    if (!ids.includes(id)) continue;
    const canonical = doctrine.units.find((u) => u.id === id)!;
    const cues: Record<string, string[]> = {};
    for (const status of model.cueStatuses) {
      cues[status] = toStringArray(e[status]);
    }
    byId.set(id, {
      id,
      // Pin the name to canonical; keep the model's only if it is a real string.
      name:
        typeof e.name === "string" && e.name.trim() ? e.name : canonical.name,
      as_expressed_in_source:
        typeof e.as_expressed_in_source === "string"
          ? e.as_expressed_in_source
          : "",
      cues,
    });
  }

  // The shape must cover every canonical unit to be a valid test.
  if (ids.some((id) => !byId.has(id))) return null;

  const confidence = raw.confidence === "high" ? "high" : "low";

  return {
    doctrine_id: doctrine.id,
    doctrine:
      typeof raw.doctrine === "string" && raw.doctrine.trim()
        ? raw.doctrine
        : doctrine.doctrine,
    structure: doctrine.structure,
    units: ids.map((id) => byId.get(id)!),
    source_facts:
      typeof raw.source_facts === "string" ? raw.source_facts : "",
    confidence,
  };
}
