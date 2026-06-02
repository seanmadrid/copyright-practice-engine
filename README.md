# Copyright Practice Engine

A learning tool that turns **arbitrary source material** — a case opinion, an
article, a doctrine chapter — into applied practice on copyright doctrine. It now
models **two doctrinal structures inside one copyright dispute**, running on
different logic:

| Doctrine | Anchor | Structure | Logic |
| --- | --- | --- | --- |
| **Fair use** (defense) | *Campbell v. Acuff-Rose* | `weigh-and-balance` | four factors weighed together; a dispositive factor can carry the outcome, none is required |
| **Copyright infringement** (prima facie claim) | *Feist v. Rural Telephone* | `all-of` | every element must be met; a single failing element defeats the whole claim — no balancing |

The two halves fit together: a plaintiff proves infringement by satisfying
**every element**; a defendant raises fair use as a **balancing test**. The same
pasted source can be run through either doctrine, and the resulting question
differs in form and cognitive demand — a balancing grid versus an element
checklist.

This is **not a chatbot and not a recall quiz.** It tests applied reasoning:
running a known rule against new facts. Source ingestion is the front door —
source text in, assessment out, all at runtime.

## One structure model, not a fork

The system is **not** two parallel apps. A shared `Unit`/`Doctrine` model
(`lib/types.ts`) describes both doctrines; each declares its own `structure`
field. Everything that genuinely differs between balancing and element logic —
the calls a learner can make on a unit, the verdicts, how a verdict is derived,
what "coherent" means — lives in **one strategy object per structure type** in
[`lib/structure-model.ts`](lib/structure-model.ts). Ingestion, generation,
classification, scoring, and the UI all read from that strategy instead of
hardcoding a doctrine.

**Adding a third structure type is a new data file plus one entry in
`STRUCTURE_MODELS` — nothing forks.**

## Pipeline

Source text in → extract the test structure → generate a hypo grounded in that
source → learner applies the rule → classify the answer → score against the key.
**Three live model steps (extract, generate, classify); scoring stays
deterministic.** There is a hard line between what the model does and what the
rule does. Every step is doctrine-aware via the shared structure model.

1. **Ingestion + extraction — live, server-side.** `POST /api/ingest` takes raw
   source text plus a `doctrine_id` and returns strict JSON describing the
   governing test *for that structure* as the source expresses it: the units
   (factors or elements) with an `as_expressed_in_source` note and per-status cue
   lists (`favors_fair_use`/`favors_owner`, or `met`/`fails`), the source's
   operative facts/holding, and a confidence. The extracted JSON is validated
   against the doctrine's canonical schema; on `low` confidence or a malformed
   shape it falls back to the canonical table and tells the user the source was
   thin. **The authored JSON is no longer the input — it is the validation
   reference and the safety net.**
2. **Generation grounded in the source — live, server-side.** `POST /api/generate`
   takes the extracted structure plus a teaching target and writes a novel hypo
   grounded in the rule as the source articulates it. The target is the answer
   key *by construction*: under balancing it fixes which factor controls and the
   direction; under all-of it fixes which single element fails (or that every
   element is met). The source supplies realism, the target supplies the
   checkable key.
3. **Classification — live, server-side.** `POST /api/classify` maps the
   learner's free text onto structured calls in the doctrine's vocabulary (a
   direction per factor, or met/fails per element), which unit they treated as
   decisive, whether they spotted the distinction, and their stated verdict. The
   model *only classifies the learner's words.* It does not judge quality or
   decide the legal answer.
4. **Scoring — deterministic, no model.** `score(doctrine, classified, target)`
   in [`lib/score.ts`](lib/score.ts) is a pure function comparing the classified
   calls to the answer key. The verdict logic is delegated to the structure
   model: **weighted balance** for fair use, **all-of AND** for infringement
   (any failing element ⇒ the claim fails). It reports per-unit correctness, the
   authored misconception for any wrong call, whether the learner found the
   deciding unit (the dispositive factor / the failing element / correctly none),
   and whether the stated conclusion is coherent with the learner's *own* calls.

```
data/fair-use.json      ← fair use: 4 factors, weigh-and-balance  (validation reference + safety net)
data/infringement.json  ← infringement: 2 elements, all-of        (validation reference + safety net)
data/example-sources.ts ← preloaded sources (Campbell, explainer, casebook note, Feist, a both-doctrines excerpt)
data/hypos.json         ← cached example hypos per doctrine+target, served as the generation fallback
lib/structure-model.ts  ← THE strategy: statuses, conclusions, verdict logic per structure type
lib/data.ts             ← doctrine loader/normalizer (folds each JSON shape into the shared model) + focus helpers
lib/ingest.ts           ← canonical-structure fallback + extraction validation (doctrine-agnostic)
lib/prompts.ts          ← structure-aware extract/generate/classify prompt builders
lib/score.ts            ← deterministic scoring (no model)
lib/types.ts            ← shared Unit/Doctrine/Status domain model
app/api/{ingest,generate,classify}  ← the three live model steps, doctrine-aware
components/practice.tsx ← doctrine picker + the per-structure UI (factor grid vs. element checklist)
components/status-control, extracted-structure, results-panel  ← structure-driven rendering
```

### Visible differentiation

The doctrine picker sits at the entry point. Once a structure is chosen, the
difference is on screen: fair use renders a three-way **factor grid**
(favors fair use / neutral / favors owner) with weights; infringement renders a
binary **element checklist** (met / fails) with no weights, because under AND
logic every element is equally required. The conclusion options, the
deciding-unit explanation, and the coherence check all change with the
structure — a balancing read-out versus an AND read-out.

### Demo safety

All three model steps run live, each with a graceful fallback so the loop never
dead-ends in front of a panel: **extraction** falls back to the doctrine's
canonical table (thin-source notice), **generation** retries once then serves the
cached example hypo for that doctrine+target, **classification** degrades to a
clear retry message (or, with no key, maps the learner's own selections).
Preloaded example sources for **both** doctrines guarantee a clean end-to-end run.

## Running it

```bash
npm install
npm run generate     # optional: refresh data/hypos.json (the generation fallback), both doctrines
npm run dev          # http://localhost:3000
```

Pick a doctrine, paste a source (or click a preloaded example), watch the test
structure get extracted, generate a hypothetical, make a call on each unit with a
short rationale, state your conclusion, and submit for scored feedback.

### The API key

The app reads `ANTHROPIC_API_KEY` **server-side only** — it never reaches the
client. Copy `.env.example` to `.env.local` and set it:

```bash
ANTHROPIC_API_KEY=sk-ant-...
# optional: ANTHROPIC_MODEL=claude-sonnet-4-6   (defaults to a current Sonnet)
```

The model name lives in one constant (`lib/anthropic.ts`, `MODEL`), overridable
by env.

**Runs without a key, too**, so the prototype works end to end out of the box:
ingest serves the doctrine's canonical structure (marked a thin-source fallback),
generate serves the cached example hypo for the chosen doctrine+target, and
classify maps the learner's *own* explicit calls into structured form so scoring
and misconception corrections still run. The two prose-only judgments (naming the
deciding unit, spotting the distinction) need the live model and are shown as not
met until a key is set.

## Verifying the engine

```bash
npx tsx scripts/test-score.ts
```

Deterministic checks across **both** structures: fair use (a perfect answer, a
wrong Factor 4 call that fires misconception `4a`, an incoherent conclusion) and
infringement (a perfect element-test answer, a wrong "copying is met" call that
fires `2a` *and* is incoherent under AND logic, and an all-elements-met case).

## Branding

The visual layer is a thin styling pass over the reasoning engine. The
[`designlang`](https://www.npmjs.com/package/designlang) extraction wrote its
artifacts to `./brand/` (DTCG tokens, Tailwind config, shadcn theme, CSS
variables, etc.), and the brand tokens live as CSS variables in
`app/globals.css`, which mirrors `./brand/barbri-shadcn-theme.css`. Dropping the
emitted variables there restyles the whole app without changing the layout.

BARBRI's actual identity, curated against the site's own usage data in
`brand/barbri-design-language.md`:

| Token        | Value                       | Role on barbri.com                          |
| ------------ | --------------------------- | ------------------------------------------- |
| primary      | `#001722` (`199 100% 7%`)   | the site's `.button` background (dark navy) |
| secondary    | `#464f57` (`208 11% 31%`)   | slate — the dominant text/UI color          |
| brand-blue   | `#2a5488` (`213 53% 35%`)   | links, focus rings, interactive accents     |
| surface      | `#ffffff` / `#f2f7fc` muted | white chrome + pale-blue panels             |
| heading type | **Bitter** (serif)          | every heading on the site                   |
| body type    | **Nunito**                  | body / UI (1122 elements)                   |
| logo         | `brand/barbri_logo.svg`     | inlined in the header (`components/logo.tsx`)|
| radius       | `8px`                       |                                             |

`success` (green) and `destructive` (red) are intentionally **status-only**
colors outside the marketing palette, used so "correct/incorrect", the three-way
"favors fair use / neutral / favors owner" factor calls, and the binary
"met / fails" element calls stay legible against BARBRI's near-monochrome
identity.

> **Curation matters.** The auto-generated `brand/barbri-shadcn-theme.css` is the
> tool's weakest artifact: it flattened every typeface to Nunito and guessed a
> dark color for `primary` while dropping the `#2a5488` blue and the Bitter
> heading face. All of that detail *is* present in `barbri-design-tokens.json`
> and `barbri-design-language.md` — the values above are mapped from there, not
> from the reductive shadcn export. There is no full-width dark header bar on the
> site; the chrome is white with the logo.

### Re-running the extraction

The command in the brief (`--full`) triggers `--deep-interact`, an
auto-interaction crawl (scroll, open menus/modals, hover CTAs) that stalls on a
heavy marketing site like barbri.com. The reliable invocation, which completes
in seconds, is:

```bash
npx designlang https://www.barbri.com/ --out ./brand --name barbri \
  --framework shadcn --ignore-widgets --system-chrome --verbose
```

- `--system-chrome` uses the installed Chrome instead of Playwright's bundled
  Chromium (avoids the 150MB download / version mismatches).
- `--ignore-widgets` strips cookie banners and chat widgets that block crawling.
- `--framework shadcn` emits the shadcn theme this app consumes.
- Drop `--full`/`--deep-interact` unless you specifically need screenshots and
  interaction-state capture; token extraction does not require them.

## Out of scope (by design)

No login/accounts/persistence (session state is in memory), and no
weakness-detecting diagnostic layer (the learner picks the doctrine and focus).
Extraction is pinned to each doctrine's canonical schema, so pasting a source
that does not lay out the chosen test falls back to the canonical table rather
than inventing a new one. The structure model generalizes to a third doctrine by
adding a data file and a strategy entry — but only the two copyright structures
ship today.
