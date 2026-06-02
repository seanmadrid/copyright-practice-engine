/**
 * Deterministic checks for the scoring engine, across both structure types.
 * No model, no network. Run: npx tsx scripts/test-score.ts
 */
import { score } from "../lib/score";
import { getDoctrine } from "../lib/data";
import type { Classified } from "../lib/types";

let failures = 0;
function check(name: string, cond: boolean) {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) failures++;
}

// ============================================================================
// Fair use — weigh-and-balance
// ============================================================================
const fairUse = getDoctrine("fair-use")!;
const T1 = fairUse.teaching_targets.find((t) => t.id === "T1")!;

// A: a perfect answer to T1 (key 1:fair, 2:neutral, 3:fair, 4:owner; dispositive 4).
const fuPerfect: Classified = {
  units: { "1": "favors_fair_use", "2": "neutral", "3": "favors_fair_use", "4": "favors_owner" },
  key_unit_id_named: 4,
  identified_distinction: true,
  conclusion: "not_fair_use",
};
const fuA = score(fairUse, fuPerfect, T1);
check("FU-A: all 4 factors correct", fuA.correctUnitCount === 4);
check("FU-A: dispositive factor found", fuA.keyUnitFound === true);
check("FU-A: conclusion matches key (not_fair_use)", fuA.conclusionMatchesKey === true);
check("FU-A: conclusion coherent with own calls", fuA.conclusionCoherent === true);
check("FU-A: no corrections fired", fuA.unitScores.every((u) => u.corrections.length === 0));

// B: wrong on Factor 4 (ignored the licensing market). Misconception 4a must fire.
const fuWrong: Classified = {
  units: { "1": "favors_fair_use", "2": "neutral", "3": "favors_fair_use", "4": "favors_fair_use" },
  key_unit_id_named: 1,
  identified_distinction: false,
  conclusion: "fair_use",
};
const fuB = score(fairUse, fuWrong, T1);
const f4 = fuB.unitScores.find((u) => u.unit_id === 4)!;
check("FU-B: Factor 4 marked incorrect", f4.correct === false);
check("FU-B: misconception 4a fired on Factor 4", f4.corrections.some((m) => m.id === "4a"));
check("FU-B: dispositive factor NOT found", fuB.keyUnitFound === false);
check("FU-B: conclusion still coherent with own (all-fair) calls", fuB.conclusionCoherent === true);
check("FU-B: conclusion does NOT match key", fuB.conclusionMatchesKey === false);

// C: incoherent — own calls lean owner, but concluded fair use.
const fuIncoherent: Classified = {
  units: { "1": "favors_owner", "2": "favors_owner", "3": "favors_owner", "4": "favors_owner" },
  key_unit_id_named: null,
  identified_distinction: false,
  conclusion: "fair_use",
};
const fuC = score(fairUse, fuIncoherent, T1);
check("FU-C: own calls imply not_fair_use", fuC.conclusionImpliedByOwnCalls === "not_fair_use");
check("FU-C: conclusion flagged incoherent", fuC.conclusionCoherent === false);

// ============================================================================
// Copyright infringement — all-of (AND)
// ============================================================================
const inf = getDoctrine("infringement")!;
const E2 = inf.teaching_targets.find((t) => t.id === "E2")!; // {1: met, 2: fails}, failing 2
const E3 = inf.teaching_targets.find((t) => t.id === "E3")!; // {1: met, 2: met}, all met

// D: perfect E2 — element 2 fails, so the claim fails (AND logic).
const infPerfect: Classified = {
  units: { "1": "met", "2": "fails" },
  key_unit_id_named: 2,
  identified_distinction: true,
  conclusion: "claim_fails",
};
const infD = score(inf, infPerfect, E2);
check("INF-D: both elements correct", infD.correctUnitCount === 2);
check("INF-D: failing element identified", infD.keyUnitFound === true);
check("INF-D: AND logic -> claim_fails is the key", infD.authoredConclusion === "claim_fails");
check("INF-D: conclusion matches key", infD.conclusionMatchesKey === true);
check("INF-D: conclusion coherent", infD.conclusionCoherent === true);
check("INF-D: no corrections fired", infD.unitScores.every((u) => u.corrections.length === 0));

// E: learner wrongly calls element 2 "met" (treated similarity as copying). 2a fires,
// and AND logic on their own calls would say claim_stands — but they concluded
// claim_fails, so it is INCOHERENT under AND.
const infWrong: Classified = {
  units: { "1": "met", "2": "met" },
  key_unit_id_named: null,
  identified_distinction: false,
  conclusion: "claim_fails",
};
const infE = score(inf, infWrong, E2);
const el2 = infE.unitScores.find((u) => u.unit_id === 2)!;
check("INF-E: element 2 marked incorrect", el2.correct === false);
check("INF-E: misconception 2a fired on element 2", el2.corrections.some((m) => m.id === "2a"));
check("INF-E: failing element NOT found", infE.keyUnitFound === false);
check("INF-E: own calls (all met) imply claim_stands", infE.conclusionImpliedByOwnCalls === "claim_stands");
check("INF-E: claim_fails conclusion is incoherent under AND", infE.conclusionCoherent === false);

// F: E3 all-met perfect — every element met, claim stands, no failing element.
const infAllMet: Classified = {
  units: { "1": "met", "2": "met" },
  key_unit_id_named: null,
  identified_distinction: true,
  conclusion: "claim_stands",
};
const infF = score(inf, infAllMet, E3);
check("INF-F: authored conclusion is claim_stands", infF.authoredConclusion === "claim_stands");
check("INF-F: no key unit (nothing fails)", infF.keyUnitId === null);
check("INF-F: correctly singled out no failing element", infF.keyUnitFound === true);
check("INF-F: coherent", infF.conclusionCoherent === true);

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
