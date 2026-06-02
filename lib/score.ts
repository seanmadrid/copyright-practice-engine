// Deterministic scoring. No model calls. Pure function of (doctrine, classified,
// target). The verdict logic — weighted balance vs. all-of AND — lives in the
// structure model; this function compares calls to the key and assembles the
// result the same way for every structure type.

import type {
  Classified,
  Direction,
  Doctrine,
  ScoreResult,
  Status,
  TeachingTarget,
  UnitScore,
} from "./types";
import { structureModel } from "./structure-model";

export function score(
  doctrine: Doctrine,
  classified: Classified,
  target: TeachingTarget,
): ScoreResult {
  const model = structureModel(doctrine.structure);

  const unitScores: UnitScore[] = doctrine.units.map((unit) => {
    const key = String(unit.id);
    const expected = target.configuration[key];
    const learner = classified.units[key] ?? model.defaultStatus;
    const correct = learner === expected;
    return {
      unit_id: unit.id,
      unit_name: unit.name,
      weight: unit.weight,
      learner_status: learner,
      expected_status: expected,
      correct,
      // For any wrong call, surface that unit's authored misconceptions.
      corrections: correct ? [] : unit.misconceptions,
    };
  });

  const correctUnitCount = unitScores.filter((u) => u.correct).length;

  const keyUnitId = model.keyUnitId(target);
  const keyUnitDef = doctrine.units.find((u) => u.id === keyUnitId);

  const authoredConclusion = model.authoredConclusion(target);
  const learnerConclusion = classified.conclusion;
  const impliedByOwnCalls = model.impliedConclusion(
    classified.units,
    doctrine.units,
  );

  // The learner "found" the deciding unit when they singled out exactly the unit
  // that decides — the dispositive factor, the failing element, or (when nothing
  // fails) correctly singled out none.
  const keyUnitFound = (classified.key_unit_id_named ?? null) === keyUnitId;

  return {
    doctrine_id: doctrine.id,
    structure: doctrine.structure,
    unitNoun: model.unitNoun,
    target_id: target.id,
    unitScores,
    correctUnitCount,
    keyUnitId,
    keyUnitName: keyUnitDef?.name ?? "",
    keyUnitDirection: target.direction as Direction | undefined,
    keyUnitFound,
    intendedLesson: target.intended_lesson,
    authoredConclusion,
    learnerConclusion,
    conclusionMatchesKey: learnerConclusion === authoredConclusion,
    conclusionCoherent: model.isCoherent(
      classified.units,
      learnerConclusion,
      doctrine.units,
    ),
    conclusionImpliedByOwnCalls: impliedByOwnCalls,
  };
}

// Re-exported for convenience: a Status that is a weigh-and-balance Direction.
export type { Status, Direction };
