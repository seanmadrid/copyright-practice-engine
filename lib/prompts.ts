// Structure-aware prompt builders. One place that knows how to phrase extraction,
// generation, and classification for either structure type. Each builder reads the
// shared `Doctrine` + structure model and branches only where the logic genuinely
// differs (the deciding-unit framing, the verdict vocabulary).

import type {
  Doctrine,
  ExtractedStructure,
  LearnerAnswer,
  TeachingTarget,
} from "./types";
import { structureModel } from "./structure-model";

// --- Ingestion / extraction ----------------------------------------------

export function ingestPrompt(doctrine: Doctrine, source: string): string {
  const model = structureModel(doctrine.structure);
  const unitList = doctrine.units
    .map((u) => `  ${model.unitNoun} ${u.id} — ${u.name}`)
    .join("\n");

  const cueFields = model.cueStatuses
    .map(
      (s) =>
        `- "${s}": short phrases, drawn from the source where possible, describing what makes this ${model.unitNoun} "${model.statusLabel(s)}".`,
    )
    .join("\n");

  const exampleUnit = (id: number, name: string) => {
    const cues = model.cueStatuses.map((s) => `"${s}": ["..."]`).join(", ");
    return `    {"id": ${id}, "name": "${name}", "as_expressed_in_source": "...", ${cues}}`;
  };
  const exampleUnits = doctrine.units
    .map((u) => exampleUnit(u.id, u.name))
    .join(",\n");

  return `You are extracting the governing legal test from a piece of source material for a ${doctrine.name} (${doctrine.citation ?? doctrine.anchor_case}) practice tool. This test is an ${model.logicLabel} structure: ${model.logicBlurb} Read the SOURCE and describe the test exactly as THIS source expresses it. You are not inventing the test; you are reporting how the source articulates it.

The canonical ${model.unitNounPlural}, which you MUST return with these exact ids and names:
${unitList}

For each ${model.unitNoun}, capture:
- "as_expressed_in_source": one or two sentences on how THIS source frames or emphasizes it. If the source barely touches it, say so plainly.
${cueFields}

Also capture:
- "source_facts": the operative facts and holding drawn from THIS source (2-4 sentences). If the source is an abstract explainer with no specific dispute, summarize the rule it states instead.
- "confidence": "high" if the source genuinely lays out this ${model.logicLabel} test well enough to ground practice; "low" if it is thin, off-topic, or does not actually discuss these ${model.unitNounPlural}.

SOURCE:
"""
${source}
"""

Return STRICT JSON ONLY, no prose, no code fences, exactly this shape:
{
  "doctrine": "${doctrine.doctrine}",
  "structure": "${doctrine.structure}",
  "units": [
${exampleUnits}
  ],
  "source_facts": "...",
  "confidence": "high" | "low"
}`;
}

// --- Generation -----------------------------------------------------------

export function generatePrompt(
  doctrine: Doctrine,
  structure: ExtractedStructure,
  target: TeachingTarget,
): string {
  const model = structureModel(doctrine.structure);

  const unitLines = doctrine.units
    .map((u) => {
      const status = target.configuration[String(u.id)];
      const extracted = structure.units.find((e) => e.id === u.id);
      const cues = u.cues[status] ?? Object.values(u.cues).flat();
      const sourceFraming = extracted?.as_expressed_in_source
        ? `\n      As the source frames it: ${extracted.as_expressed_in_source}`
        : "";
      const weightNote =
        doctrine.structure === "weigh-and-balance"
          ? ` [weight: ${u.weight}]`
          : "";
      return `  ${model.unitNoun} ${u.id} (${u.name})${weightNote} must be "${model.statusLabel(
        status,
      )}". Design toward: ${cues.join("; ")}.${sourceFraming}`;
    })
    .join("\n");

  const keyUnitId = model.keyUnitId(target);
  const keyUnit = doctrine.units.find((u) => u.id === keyUnitId);

  // The deciding-unit instruction is the one place the two structures diverge.
  const decidingInstruction =
    doctrine.structure === "all-of"
      ? keyUnit
        ? `Under all-of (AND) logic, the claim turns entirely on ${model.unitNoun} ${keyUnit.id} (${keyUnit.name}): engineer the facts so that this ${model.unitNoun} clearly FAILS while every other ${model.unitNoun} is plainly met, so a careful student sees that one failing ${model.unitNoun} defeats the whole claim.`
        : `Engineer the facts so that EVERY ${model.unitNoun} is plainly met, so the prima facie claim stands. Do not leave any ${model.unitNoun} ambiguous.`
      : keyUnit
        ? `The DISPOSITIVE ${model.unitNoun} is ${model.unitNoun} ${keyUnit.id} (${keyUnit.name}); it must clearly control the outcome under weigh-and-balance, even against the pull of the other ${model.unitNounPlural}.`
        : "";

  return `You write bar-exam-quality copyright fact patterns for a ${doctrine.name} practice tool (${doctrine.anchor_case}).

You are given the governing test AS A SPECIFIC SOURCE ARTICULATES IT, plus the operative facts of that source. Write ONE original, concrete fact pattern (a hypothetical) grounded in the rule as this source expresses it. Engineer it so that when a careful student works the ${model.unitNounPlural}, they resolve EXACTLY as specified.

HOW THIS SOURCE ARTICULATES THE TEST:
Doctrine: ${structure.doctrine} (${model.logicLabel} — ${model.logicBlurb})
Source facts / holding: ${structure.source_facts || "(none stated)"}

Required ${model.unitNoun} configuration (this is the answer key — do not reveal it):
${unitLines}

${decidingInstruction}
Intended lesson for the student: "${target.intended_lesson}".

Requirements:
- Invent fictional but realistic parties, works, and facts. Do NOT copy the source's own facts; write a fresh scenario that reflects how the source articulates the rule.
- Embed concrete facts that make each ${model.unitNoun} land on its required side. Be specific.
- Do not state the answer, do not label the ${model.unitNounPlural}, and do not hint which ${model.unitNoun} is decisive. Just tell the story.
- 130-220 words for the fact pattern.

Return STRICT JSON only, no prose, no code fences:
{
  "title": "short evocative title, max 8 words",
  "source_work": "one phrase naming the copyrighted work at issue",
  "use": "one phrase naming what the defendant did with it",
  "fact_pattern": "the 130-220 word hypothetical"
}`;
}

// --- Classification -------------------------------------------------------

export function classifyPrompt(
  doctrine: Doctrine,
  answer: LearnerAnswer,
  target: TeachingTarget,
): string {
  const model = structureModel(doctrine.structure);
  const statusVocab = model.statuses.map((s) => `"${s.value}"`).join(", ");
  const conclusionVocab = model.conclusions
    .map((c) => `"${c.value}" (${c.label})`)
    .join(" or ");

  const unitReference = doctrine.units
    .map((u) => {
      const cueLines = model.cueStatuses
        .map((s) => `  Cues for "${model.statusLabel(s)}": ${u.cues[s].join("; ")}`)
        .join("\n");
      const weight =
        doctrine.structure === "weigh-and-balance"
          ? ` (weight: ${u.weight})`
          : "";
      return `${model.unitNoun} ${u.id} — ${u.name}${weight}\n${cueLines}`;
    })
    .join("\n");

  const keyUnitId = model.keyUnitId(target);
  const keyUnit = doctrine.units.find((u) => u.id === keyUnitId);
  const keyContext =
    doctrine.structure === "all-of"
      ? keyUnit
        ? `The ${model.unitNoun} that actually fails (and so defeats the claim) is ${model.unitNoun} ${keyUnit.id} (${keyUnit.name}).`
        : `Every ${model.unitNoun} is actually met here, so no ${model.unitNoun} fails and the claim stands.`
      : keyUnit
        ? `The ${model.unitNoun} that actually controls the outcome is ${model.unitNoun} ${keyUnit.id} (${keyUnit.name}).`
        : "";

  const learnerBlock = answer.units
    .map((ua) => {
      const def = doctrine.units.find((u) => u.id === ua.unit_id);
      return `${model.unitNoun} ${ua.unit_id} (${def?.name ?? ""}):\n  Selected call: ${ua.status}\n  Rationale: ${ua.rationale || "(left blank)"}`;
    })
    .join("\n");

  const keyFieldName =
    doctrine.structure === "all-of"
      ? "the single element the learner treats as the failing/decisive one"
      : "the single factor the learner treats as decisive/controlling for the outcome";

  return `You are a strict classifier for a ${doctrine.name} practice tool. The governing test is ${model.logicLabel}: ${model.logicBlurb} Your ONLY job is to read a learner's answer and map their own words onto structured calls. You do NOT judge whether they are right, you do NOT decide the legal answer, and you do NOT supply analysis they did not make. Classify only what the learner actually argued.

${model.unitNounPlural.toUpperCase()} REFERENCE (for mapping language to a call):
${unitReference}

CONTEXT (for the two booleans only — never use this to "fix" the learner's calls):
- ${keyContext}
- The teaching point of this hypothetical is: "${target.intended_lesson}".

LEARNER'S ANSWER:
${learnerBlock}
Overall conclusion stated: ${model.conclusionLabel(answer.conclusion)}

Produce these classifications:
1. For each ${model.unitNoun}, the call the learner ARGUES, as one of ${statusVocab}. Use their selected call as the primary signal; only override it if their rationale plainly argues the opposite. If a rationale is blank, use the selected call.
2. "key_unit_id_named": ${keyFieldName}, or null if they do not single one out.
3. "identified_distinction": true only if the learner's reasoning shows they recognized the tension the teaching point describes. Be conservative: false if they merely worked through the ${model.unitNounPlural} without noting the tension.
4. "conclusion": the learner's stated overall verdict, as ${conclusionVocab}.

Return STRICT JSON ONLY, no prose, no code fences, exactly this shape:
{
  "units": {${doctrine.units.map((u) => `"${u.id}": "..."`).join(", ")}},
  "key_unit_id_named": <number or null>,
  "identified_distinction": <boolean>,
  "conclusion": ${conclusionVocab.replace(/ \([^)]*\)/g, "")}
}`;
}
