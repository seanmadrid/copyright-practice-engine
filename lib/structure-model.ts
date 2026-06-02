// The structure model: the one place the two doctrinal structures differ.
//
// A `StructureModel` captures everything that varies by logic type — the calls a
// learner can make on a unit, the possible verdicts, how a verdict is derived,
// and what "coherent" means. Ingestion, generation, scoring, and the UI all read
// from here instead of hardcoding fair use. Adding a third structure type means
// adding one entry to STRUCTURE_MODELS; nothing forks.

import type {
  Conclusion,
  Status,
  StructureType,
  TeachingTarget,
  Unit,
} from "./types";

export interface StatusOption {
  value: Status;
  label: string;
  /** Active-state pill styling class (see globals.css). */
  className: string;
  /** Cue-list accent tone. */
  tone: "fair" | "neutral" | "owner" | "met" | "fails";
}

export interface ConclusionOption {
  value: Conclusion;
  label: string;
}

export interface StructureModel {
  type: StructureType;
  /** Singular / plural noun for one unit of analysis. */
  unitNoun: string;
  unitNounPlural: string;
  /** Short label for the governing logic, shown in the UI. */
  logicLabel: string;
  /** One-line description of how the verdict is reached. */
  logicBlurb: string;
  /** Calls a learner can make on a single unit, in display order. */
  statuses: StatusOption[];
  /** Overall verdicts, in display order. */
  conclusions: ConclusionOption[];
  /** Status keys that carry authored cue lists (excludes "neutral"). */
  cueStatuses: Status[];
  /** Fallback when a unit call is missing — defensive only; the UI requires all. */
  defaultStatus: Status;

  statusLabel(value: string): string;
  conclusionLabel(value: string): string;

  /** Id of the unit that decides the target (dispositive / failing), or null. */
  keyUnitId(target: TeachingTarget): number | null;
  /** The legally correct conclusion under the authored target. */
  authoredConclusion(target: TeachingTarget): Conclusion;
  /** Conclusion implied by a set of calls (for the coherence read-out). */
  impliedConclusion(
    calls: Record<string, string>,
    units: Unit[],
  ): Conclusion | "even";
  /** Is a stated conclusion coherent with the learner's own calls? */
  isCoherent(
    calls: Record<string, string>,
    conclusion: Conclusion,
    units: Unit[],
  ): boolean;
}

const WEIGHT_VALUE: Record<string, number> = { low: 1, medium: 2, high: 3 };

// --- weigh-and-balance (fair use) -----------------------------------------

const balanceStatuses: StatusOption[] = [
  { value: "favors_fair_use", label: "Favors fair use", className: "dir-fair-use", tone: "fair" },
  { value: "neutral", label: "Neutral", className: "dir-neutral", tone: "neutral" },
  { value: "favors_owner", label: "Favors owner", className: "dir-owner", tone: "owner" },
];

const balanceConclusions: ConclusionOption[] = [
  { value: "fair_use", label: "Fair use" },
  { value: "not_fair_use", label: "Not fair use" },
];

const weighAndBalance: StructureModel = {
  type: "weigh-and-balance",
  unitNoun: "factor",
  unitNounPlural: "factors",
  logicLabel: "weigh-and-balance",
  logicBlurb:
    "No single factor is required; the factors are weighed together, and a dispositive factor can carry the outcome.",
  statuses: balanceStatuses,
  conclusions: balanceConclusions,
  cueStatuses: ["favors_fair_use", "favors_owner"],
  defaultStatus: "neutral",

  statusLabel(value) {
    return balanceStatuses.find((s) => s.value === value)?.label ?? value;
  },
  conclusionLabel(value) {
    if (value === "even") return "Too close to call";
    return balanceConclusions.find((c) => c.value === value)?.label ?? value;
  },

  keyUnitId(target) {
    return target.dispositive_factor ?? null;
  },

  authoredConclusion(target) {
    return target.direction === "favors_owner" ? "not_fair_use" : "fair_use";
  },

  // Weighted lean of the calls — display only ("your own calls weigh toward X").
  // This is NOT how the verdict is judged: a single dispositive factor can control.
  impliedConclusion(calls, units) {
    let fair = 0;
    let owner = 0;
    for (const u of units) {
      const dir = calls[String(u.id)];
      const w = WEIGHT_VALUE[u.weight] ?? 1;
      if (dir === "favors_fair_use") fair += w;
      else if (dir === "favors_owner") owner += w;
    }
    if (fair > owner) return "fair_use";
    if (owner > fair) return "not_fair_use";
    return "even";
  },

  // Coherent when at least one call supports the concluded side (any factor can
  // carry it). Incoherent only when NONE of their calls point that way.
  isCoherent(calls, conclusion, units) {
    let supportsFair = false;
    let supportsOwner = false;
    for (const u of units) {
      const dir = calls[String(u.id)];
      if (dir === "favors_fair_use") supportsFair = true;
      else if (dir === "favors_owner") supportsOwner = true;
    }
    if (!supportsFair && !supportsOwner) return true; // all neutral
    return conclusion === "fair_use" ? supportsFair : supportsOwner;
  },
};

// --- all-of (prima facie infringement) ------------------------------------

const elementStatuses: StatusOption[] = [
  { value: "met", label: "Met", className: "status-met", tone: "met" },
  { value: "fails", label: "Fails", className: "status-fails", tone: "fails" },
];

const elementConclusions: ConclusionOption[] = [
  { value: "claim_stands", label: "Infringement: claim stands" },
  { value: "claim_fails", label: "No infringement: claim fails" },
];

// AND logic: any element failing sinks the whole claim; all met and it stands.
function andVerdict(
  statuses: (string | undefined)[],
): Conclusion {
  return statuses.some((s) => s === "fails") ? "claim_fails" : "claim_stands";
}

const allOf: StructureModel = {
  type: "all-of",
  unitNoun: "element",
  unitNounPlural: "elements",
  logicLabel: "all-of (AND)",
  logicBlurb:
    "Every element must be met. A single failing element defeats the whole claim, with no balancing.",
  statuses: elementStatuses,
  conclusions: elementConclusions,
  cueStatuses: ["met", "fails"],
  defaultStatus: "fails",

  statusLabel(value) {
    return elementStatuses.find((s) => s.value === value)?.label ?? value;
  },
  conclusionLabel(value) {
    return elementConclusions.find((c) => c.value === value)?.label ?? value;
  },

  keyUnitId(target) {
    return target.failing_element ?? null;
  },

  authoredConclusion(target) {
    return andVerdict(Object.values(target.configuration));
  },

  // Under AND logic the verdict is fully determined by the calls — no "even".
  impliedConclusion(calls, units) {
    return andVerdict(units.map((u) => calls[String(u.id)]));
  },

  // With deterministic AND logic, a conclusion is coherent iff it equals what the
  // learner's own element calls compel. (Calling an element "fails" yet
  // concluding the claim stands is internally contradictory.)
  isCoherent(calls, conclusion, units) {
    return conclusion === andVerdict(units.map((u) => calls[String(u.id)]));
  },
};

export const STRUCTURE_MODELS: Record<StructureType, StructureModel> = {
  "weigh-and-balance": weighAndBalance,
  "all-of": allOf,
};

export function structureModel(type: StructureType): StructureModel {
  return STRUCTURE_MODELS[type];
}
