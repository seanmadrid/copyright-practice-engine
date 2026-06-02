// Shared domain types for the Practice Engine.
//
// The engine models doctrinal *structures*, not a single doctrine. Two structure
// types exist today:
//   - "weigh-and-balance": a set of factors, each leaning one way; no single one
//     is required (fair use).
//   - "all-of": a set of elements, every one of which must be met or the claim
//     fails (the prima facie infringement case).
// Both share one shape — a list of `Unit`s a learner calls, scored against an
// authored answer key. Generation and scoring branch on the `structure` field;
// everything else is shared. Adding a third type is a new data file + a new
// branch in lib/structure-model.ts, nothing more.

export type StructureType = "weigh-and-balance" | "all-of";

/** The call a learner makes on one unit. Each structure defines its own set. */
export type Status =
  // weigh-and-balance (fair use)
  | "favors_fair_use"
  | "neutral"
  | "favors_owner"
  // all-of (infringement elements)
  | "met"
  | "fails";

/** Overall verdicts. Each structure defines which two apply. */
export type Conclusion =
  // weigh-and-balance
  | "fair_use"
  | "not_fair_use"
  // all-of
  | "claim_stands"
  | "claim_fails";

/** Back-compat alias: a weigh-and-balance status is a "direction". */
export type Direction = "favors_fair_use" | "neutral" | "favors_owner";

export type FactorWeight = "low" | "medium" | "high";

export interface Misconception {
  id: string;
  wrong_move: string;
  correction: string;
}

/**
 * A normalized unit of analysis — a fair use *factor* or an infringement
 * *element*. `cues` holds the authored phrases keyed by the status they point
 * toward (e.g. `favors_fair_use`/`favors_owner`, or `met`/`fails`).
 */
export interface Unit {
  id: number;
  name: string;
  /** Weight matters only for weigh-and-balance; "high" placeholder under all-of. */
  weight: FactorWeight;
  cues: Record<string, string[]>;
  misconceptions: Misconception[];
}

export interface TeachingTarget {
  id: string;
  /** Authored answer key: unit id (as string) -> intended status. */
  configuration: Record<string, Status>;
  intended_lesson: string;
  // --- weigh-and-balance fields ---
  /** The factor that controls the outcome. */
  dispositive_factor?: number;
  /** Direction of the dispositive factor. */
  direction?: Direction;
  // --- all-of fields ---
  /** The single element engineered to fail, or null when all are met. */
  failing_element?: number | null;
}

/** A doctrine, normalized from its authored JSON into the shared shape. */
export interface Doctrine {
  id: string;
  name: string;
  doctrine: string;
  citation?: string;
  anchor_case: string;
  structure: StructureType;
  units: Unit[];
  teaching_targets: TeachingTarget[];
}

// --- Source ingestion (content-to-structure) ---

/** One unit as a pasted source expresses it. */
export interface ExtractedUnit {
  id: number;
  name: string;
  /** How this particular source frames or emphasizes the unit. */
  as_expressed_in_source: string;
  /** Source-grounded cue phrases, keyed by the status they point toward. */
  cues: Record<string, string[]>;
}

/** The governing test as extracted from a pasted source. */
export interface ExtractedStructure {
  doctrine_id: string;
  doctrine: string;
  structure: StructureType;
  units: ExtractedUnit[];
  /** The operative facts and holding drawn from this source. */
  source_facts: string;
  confidence: "high" | "low";
}

export type IngestResponse =
  | {
      ok: true;
      structure: ExtractedStructure;
      /** True when the source was thin and we fell back to the canonical table. */
      thin: boolean;
      note?: string;
    }
  | { ok: false; error: string };

/** Request to generate a hypo grounded in an extracted structure. */
export interface GenerateRequest {
  doctrine_id: string;
  structure: ExtractedStructure;
  /** Teaching target id — supplies the answer key. */
  target_id: string;
}

export type GenerateResponse =
  | {
      ok: true;
      hypo: Hypo;
      target_id: string;
      /** True when live generation failed and a cached example hypo was served. */
      degraded?: boolean;
      note?: string;
    }
  | { ok: false; error: string };

/** A teaching focus the learner can request, derived from a teaching target. */
export interface FocusOption {
  target_id: string;
  label: string;
}

/** A generated hypothetical, cached to data/hypos.json. */
export interface Hypo {
  doctrine_id: string;
  target_id: string;
  title: string;
  fact_pattern: string;
  /** The work that was used, for context in the UI. */
  source_work: string;
  /** What the defendant did with it. */
  use: string;
}

/** What the learner submits for one unit. */
export interface UnitAnswer {
  unit_id: number;
  status: Status;
  rationale: string;
}

/** The full learner submission sent to /api/classify. */
export interface LearnerAnswer {
  doctrine_id: string;
  target_id: string;
  units: UnitAnswer[];
  conclusion: Conclusion;
}

/** Structured calls produced by the live classifier (no quality judgement). */
export interface Classified {
  /** Unit id (as string) -> the status the learner argued. */
  units: Record<string, Status>;
  /** Which unit (if any) the learner identified as controlling the outcome. */
  key_unit_id_named: number | null;
  /** Did the learner recognise how this pattern differs from the typical case? */
  identified_distinction: boolean;
  /** The learner's stated overall conclusion, as read from their answer. */
  conclusion: Conclusion;
}

export type ClassifyResponse =
  | { ok: true; classified: Classified; degraded?: boolean }
  | { ok: false; error: string };

// --- Scoring output ---

export interface UnitScore {
  unit_id: number;
  unit_name: string;
  weight: FactorWeight;
  learner_status: Status;
  expected_status: Status;
  correct: boolean;
  /** Corrections for any unit the learner called wrong. */
  corrections: Misconception[];
}

export interface ScoreResult {
  doctrine_id: string;
  structure: StructureType;
  /** Singular noun for one unit ("factor" | "element"). */
  unitNoun: string;
  target_id: string;
  unitScores: UnitScore[];
  correctUnitCount: number;
  /**
   * The unit that decides the outcome: the dispositive factor (weigh-and-balance)
   * or the failing element (all-of). null when an all-of target has every element
   * met — nothing fails, so no single unit "decides."
   */
  keyUnitId: number | null;
  keyUnitName: string;
  /** weigh-and-balance: the dispositive factor's direction. */
  keyUnitDirection?: Direction;
  /** Did the learner pick out the deciding unit (or correctly find none)? */
  keyUnitFound: boolean;
  intendedLesson: string;
  /** The legally correct conclusion under the authored key. */
  authoredConclusion: Conclusion;
  learnerConclusion: Conclusion;
  conclusionMatchesKey: boolean;
  /** Is the learner's conclusion coherent with the learner's OWN unit calls? */
  conclusionCoherent: boolean;
  /** The conclusion implied by the learner's own calls. */
  conclusionImpliedByOwnCalls: Conclusion | "even";
}
