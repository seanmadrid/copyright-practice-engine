// Loads and normalizes the authored doctrines, plus the cached hypotheticals.
//
// Each doctrine ships as JSON in its own natural shape (fair use as a factor
// table with favors_fair_use/favors_owner cues; infringement as an element list
// with is_met_when/fails_when cues). This module folds both into the shared
// `Doctrine` runtime model so the rest of the system never sees the difference.
import type {
  Doctrine,
  FocusOption,
  Hypo,
  Status,
  StructureType,
  TeachingTarget,
  Unit,
} from "./types";
import { structureModel } from "./structure-model";
import fairUseRaw from "@/data/fair-use.json";
import infringementRaw from "@/data/infringement.json";
import hyposJson from "@/data/hypos.json";

type RawDoctrine = Record<string, unknown>;

/**
 * Fold a doctrine's authored JSON into the shared shape. Reads the units from
 * `factors` or `elements` and maps their cue lists onto the structure's status
 * keys, so downstream code only ever touches `Unit.cues[status]`.
 */
function normalizeDoctrine(raw: RawDoctrine): Doctrine {
  const structure = raw.structure as StructureType;
  const model = structureModel(structure);
  const rawUnits = (raw.factors ?? raw.elements ?? []) as Record<
    string,
    unknown
  >[];

  // Per structure, which JSON keys hold the cue lists, and the status each maps to.
  const cueKeyByStatus: Record<string, string> =
    structure === "all-of"
      ? { met: "is_met_when", fails: "fails_when" }
      : { favors_fair_use: "favors_fair_use", favors_owner: "favors_owner" };

  const units: Unit[] = rawUnits.map((u) => {
    const cues: Record<string, string[]> = {};
    for (const status of model.cueStatuses) {
      cues[status] = (u[cueKeyByStatus[status]] as string[]) ?? [];
    }
    return {
      id: u.id as number,
      name: u.name as string,
      weight: (u.weight as Unit["weight"]) ?? "high",
      cues,
      misconceptions: (u.misconceptions as Unit["misconceptions"]) ?? [],
    };
  });

  return {
    id: raw.id as string,
    name: raw.name as string,
    doctrine: raw.doctrine as string,
    citation: raw.citation as string | undefined,
    anchor_case: raw.anchor_case as string,
    structure,
    units,
    teaching_targets: raw.teaching_targets as TeachingTarget[],
  };
}

export const DOCTRINES: Doctrine[] = [
  normalizeDoctrine(fairUseRaw as RawDoctrine),
  normalizeDoctrine(infringementRaw as RawDoctrine),
];

export function getDoctrine(id: string): Doctrine | undefined {
  return DOCTRINES.find((d) => d.id === id);
}

export const hypos = hyposJson as unknown as Hypo[];

export function targetFor(
  doctrine: Doctrine,
  targetId: string,
): TeachingTarget | undefined {
  return doctrine.teaching_targets.find((t) => t.id === targetId);
}

export function hypoFor(doctrineId: string, targetId: string): Hypo | undefined {
  return hypos.find(
    (h) => h.doctrine_id === doctrineId && h.target_id === targetId,
  );
}

/** Human label for a teaching target, phrased for its structure type. */
export function targetLabel(doctrine: Doctrine, target: TeachingTarget): string {
  const model = structureModel(doctrine.structure);
  if (doctrine.structure === "all-of") {
    if (target.failing_element == null) {
      return "All elements met; the claim stands";
    }
    const el = doctrine.units.find((u) => u.id === target.failing_element);
    return `${el?.name ?? `Element ${target.failing_element}`} fails; claim defeated`;
  }
  const factor = doctrine.units.find((u) => u.id === target.dispositive_factor);
  const dir =
    target.direction === "favors_owner"
      ? model.conclusionLabel("not_fair_use").toLowerCase()
      : model.conclusionLabel("fair_use").toLowerCase();
  return `${factor?.name ?? `Factor ${target.dispositive_factor}`} controls (${dir})`;
}

/** The teaching focuses a learner can request, derived from the teaching targets. */
export function focusOptions(doctrine: Doctrine): FocusOption[] {
  return doctrine.teaching_targets.map((t) => ({
    target_id: t.id,
    label: targetLabel(doctrine, t),
  }));
}

/**
 * Pick a teaching focus from source text when the learner does not request one.
 * A light keyword heuristic over how the source reads, branching on structure.
 */
export function autoFocus(doctrine: Doctrine, text: string): FocusOption {
  const opts = focusOptions(doctrine);
  const haystack = text.toLowerCase();
  const byId = (id: string) => opts.find((o) => o.target_id === id) ?? opts[0];

  if (doctrine.structure === "all-of") {
    // Originality / facts -> ownership fails; independent creation -> copying fails.
    const ownershipWeak =
      /(fact|database|directory|listing|unoriginal|sweat of the brow|not original|public domain)/.test(
        haystack,
      );
    const copyingWeak = /(independent(ly)? creat|no access|coincidental|prior art)/.test(
      haystack,
    );
    if (ownershipWeak) return byId("E1");
    if (copyingWeak) return byId("E2");
    return byId("E3");
  }

  const market = /(market|licens|substitut|sales|revenue|royalt)/.test(haystack);
  const heart = /(heart|core|climax|central|essence|qualitative)/.test(haystack);
  const parody = /(parody|transformat|satir|commentary|criticism)/.test(haystack);
  if (parody) return byId("T2");
  if (heart) return byId("T3");
  if (market) return byId("T1");
  return byId("T2");
}
