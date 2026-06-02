"use client";

import { useMemo, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText } from "lucide-react";
import { StatusControl } from "@/components/status-control";
import { BrandLoader } from "@/components/brand-loader";
import { AutoHeight } from "@/components/auto-height";
import { ResultsPanel } from "@/components/results-panel";
import { ExtractedStructureCard } from "@/components/extracted-structure";
import { StructureReview } from "@/components/structure-review";
import { score } from "@/lib/score";
import { autoFocus, focusOptions } from "@/lib/data";
import { canonicalStructure } from "@/lib/ingest";
import { structureModel } from "@/lib/structure-model";
import type { ExampleSource } from "@/data/example-sources";
import type {
  Classified,
  ClassifyResponse,
  Conclusion,
  Doctrine,
  ExtractedStructure,
  GenerateResponse,
  Hypo,
  IngestResponse,
  LearnerAnswer,
  ScoreResult,
  Status,
} from "@/lib/types";

const RATIONALE_MAX = 600;
const SOURCE_MAX = 24_000;

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six"];
function numberWord(n: number): string {
  return NUMBER_WORDS[n] ?? String(n);
}

type Step =
  | "source"
  | "ingesting"
  | "extracted"
  | "generating"
  | "answer"
  | "submitting"
  | "results";

type InputTab = "paste" | "upload";

const UPLOAD_ACCEPT = ".txt,.md,.pdf,.docx";

interface PracticeProps {
  doctrines: Doctrine[];
  examples: ExampleSource[];
}

interface UnitState {
  status: Status | null;
  rationale: string;
}

function emptyAnswers(doctrine: Doctrine): Record<number, UnitState> {
  const out: Record<number, UnitState> = {};
  for (const u of doctrine.units) out[u.id] = { status: null, rationale: "" };
  return out;
}

export function Practice({ doctrines, examples }: PracticeProps) {
  const [doctrineId, setDoctrineId] = useState<string>(doctrines[0].id);
  const doctrine = useMemo(
    () => doctrines.find((d) => d.id === doctrineId) ?? doctrines[0],
    [doctrines, doctrineId],
  );
  const model = structureModel(doctrine.structure);

  const [step, setStep] = useState<Step>("source");

  // Ingestion state
  const [inputTab, setInputTab] = useState<InputTab>("paste");
  const [sourceText, setSourceText] = useState("");
  const [loadedExampleId, setLoadedExampleId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadName, setUploadName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [structure, setStructure] = useState<ExtractedStructure | null>(null);
  const [thin, setThin] = useState(false);
  const [ingestNote, setIngestNote] = useState<string | null>(null);

  // Examples that legitimately support the selected doctrine. The same source can
  // be pasted or uploaded under either doctrine, but the curated examples only
  // surface where their `doctrines` tag says they extract cleanly.
  const visibleExamples = useMemo(
    () => examples.filter((ex) => ex.doctrines?.includes(doctrineId)),
    [examples, doctrineId],
  );

  // Generation state
  const [focusId, setFocusId] = useState<string>("auto");
  const [hypo, setHypo] = useState<Hypo | null>(null);
  const [genNote, setGenNote] = useState<string | null>(null);

  // Answer + scoring state
  const [answers, setAnswers] = useState<Record<number, UnitState>>(
    emptyAnswers(doctrine),
  );
  const [conclusion, setConclusion] = useState<Conclusion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [classified, setClassified] = useState<Classified | null>(null);
  const [degraded, setDegraded] = useState(false);

  const options = useMemo(() => focusOptions(doctrine), [doctrine]);

  // The teaching focus that "auto" resolves to, for the on-screen hint.
  const resolvedFocus = useMemo(() => {
    if (focusId !== "auto") {
      return options.find((o) => o.target_id === focusId) ?? null;
    }
    return autoFocus(doctrine, structure?.source_facts ?? sourceText);
  }, [doctrine, focusId, options, structure, sourceText]);

  const target = useMemo(
    () =>
      doctrine.teaching_targets.find(
        (t) => t.id === resolvedFocus?.target_id,
      ) ?? null,
    [doctrine, resolvedFocus],
  );

  const allAnswered =
    conclusion !== null &&
    doctrine.units.every((u) => answers[u.id]?.status != null);

  function resetToSource() {
    setStep("source");
    setStructure(null);
    setThin(false);
    setIngestNote(null);
    setHypo(null);
    setGenNote(null);
    setFocusId("auto");
    setError(null);
  }

  function resetAnswerState(d: Doctrine = doctrine) {
    setAnswers(emptyAnswers(d));
    setConclusion(null);
    setResult(null);
    setClassified(null);
    setDegraded(false);
    setError(null);
  }

  // Switching doctrine changes the whole structure — reset back to the source
  // step. The pasted/uploaded text is kept so the SAME source can re-run through
  // the other structure (a cross-doctrine source becomes a factor grid one way
  // and an element checklist the other). But a loaded example that doesn't
  // support the new doctrine is incoherent under it, so we clear it and prompt
  // for a fitting source rather than carrying a mismatched pairing forward.
  function pickDoctrine(id: string) {
    if (id === doctrineId) return;
    const next = doctrines.find((d) => d.id === id) ?? doctrines[0];
    setDoctrineId(id);
    setStep("source");
    setStructure(null);
    setThin(false);
    setIngestNote(null);
    setHypo(null);
    setGenNote(null);
    setFocusId("auto");
    resetAnswerState(next);

    const loaded = examples.find((ex) => ex.id === loadedExampleId);
    if (loaded && !loaded.doctrines?.includes(id)) {
      setSourceText("");
      setLoadedExampleId(null);
      setUploadName(null);
      setError(
        `"${loaded.label}" doesn't fit ${next.name}. Pick a source that supports it, or paste your own.`,
      );
    } else {
      setError(null);
    }
  }

  // Load a curated example into the paste box.
  function loadExample(ex: ExampleSource) {
    setSourceText(ex.text);
    setLoadedExampleId(ex.id);
    setUploadName(null);
    setInputTab("paste");
    setError(null);
  }

  // Upload tab: parse a real source file to text server-side, then feed it into
  // the exact same ingestion path the paste box uses.
  async function onUpload(file: File) {
    setUploading(true);
    setError(null);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/parse-file", { method: "POST", body: form });
      const json = (await res.json()) as
        | { ok: true; text: string; truncated: boolean }
        | { ok: false; error: string };
      if (!json.ok) {
        setError(json.error);
        setUploadName(null);
      } else {
        setSourceText(json.text);
        setUploadName(file.name);
        setLoadedExampleId(null);
        if (json.truncated) {
          setError("That file was long, so we used the first 24,000 characters.");
        }
      }
    } catch {
      setError("Could not read that file. Try another, or paste the text instead.");
      setUploadName(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // --- Step 1: ingest the pasted source -------------------------------------
  async function ingest() {
    const trimmed = sourceText.trim();
    if (trimmed.length < 120) {
      setError(
        "Paste a fuller source: a case opinion or a doctrine chapter (at least a paragraph).",
      );
      return;
    }
    setError(null);
    setStep("ingesting");
    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: trimmed, doctrine_id: doctrine.id }),
      });
      const json = (await res.json()) as IngestResponse;
      if (!json.ok) {
        setError(json.error);
        setStep("source");
        return;
      }
      setStructure(json.structure);
      setThin(json.thin);
      setIngestNote(json.note ?? null);
      setStep("extracted");
    } catch {
      setError("Could not reach the extractor. Please try again.");
      setStep("source");
    }
  }

  // --- Step 2: generate a hypo grounded in the extracted structure ----------
  async function generate() {
    if (!structure || !resolvedFocus) return;
    setError(null);
    setGenNote(null);
    resetAnswerState();
    setStep("generating");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctrine_id: doctrine.id,
          structure,
          target_id: resolvedFocus.target_id,
        }),
      });
      const json = (await res.json()) as GenerateResponse;
      if (!json.ok) {
        setError(json.error);
        setStep("extracted");
        return;
      }
      setHypo(json.hypo);
      setGenNote(json.degraded ? json.note ?? null : null);
      setStep("answer");
    } catch {
      setError("Could not generate a hypothetical. Please try again.");
      setStep("extracted");
    }
  }

  // --- Step 3: classify + score ---------------------------------------------
  async function submit() {
    if (!target || !hypo || !conclusion) return;
    setError(null);
    setStep("submitting");

    const payload: LearnerAnswer = {
      doctrine_id: doctrine.id,
      target_id: target.id,
      conclusion,
      units: doctrine.units.map((u) => ({
        unit_id: u.id,
        status: answers[u.id].status as Status,
        rationale: answers[u.id].rationale.trim(),
      })),
    };

    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as ClassifyResponse;
      if (!json.ok) {
        setError(json.error);
        setStep("answer");
        return;
      }
      const scored = score(doctrine, json.classified, target);
      setClassified(json.classified);
      setResult(scored);
      setDegraded(Boolean(json.degraded));
      setStep("results");
    } catch {
      setError("We could not read your answer. Please try again.");
      setStep("answer");
    }
  }

  // While the engine reads the test out of the source, hand the screen over to
  // the branded loader instead of leaving the form sitting behind a busy button.
  if (step === "ingesting") {
    return (
      <BrandLoader
        title="Reading the test out of your source…"
        subtitle={`Extracting the governing ${doctrine.name} test for you to review.`}
      />
    );
  }

  // --- Source-input screen (entry point) ------------------------------------
  if (step === "source") {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="mx-auto max-w-4xl text-center text-[56px] font-semibold leading-tight tracking-tight text-[hsl(var(--brand-blue))]">
          Turn a source into practice.
        </h1>
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Doctrine picker — the same source can run through either structure. */}
          <div className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Choose a doctrine
            </span>
            <div className="grid gap-2 sm:grid-cols-2">
              {doctrines.map((d) => {
                const m = structureModel(d.structure);
                const active = d.id === doctrineId;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => pickDoctrine(d.id)}
                    data-active={active}
                    className="rounded-lg border border-input bg-background p-3 text-left transition-colors hover:bg-accent data-[active=true]:border-[hsl(var(--brand-blue))] data-[active=true]:bg-accent disabled:opacity-50"
                  >
                    <span className="block text-sm font-semibold text-foreground">
                      {d.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {m.unitNounPlural} · {m.logicLabel}
                    </span>
                    <span className="mt-1 block text-[11px] italic text-muted-foreground">
                      {d.anchor_case}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* The description (doctrine name) and the example chips both change
              size between doctrines — 4 fair-use chips vs. 2 infringement ones.
              AutoHeight glides the block's height and a keyed fade crossfades the
              content, so the input controls below never jump. */}
          <AutoHeight>
            <div key={doctrineId} className="space-y-6 animate-fade-in">
              <p className="text-muted-foreground">
                Give the engine your source material by pasting it or uploading a
                file. It reads the governing{" "}
                <span className="font-medium">{doctrine.name}</span> test out of it
                for you to review and edit, then builds a grounded hypothetical
                your learners can work. You review the structure and preview the
                question before anyone sees it.
              </p>

              {/* Quick-start chips. Kept in their own block, set apart from the
                  bring-your-own-source input below by a divider so the two paths
                  don't read as one crowded control cluster. */}
              {visibleExamples.length > 0 && (
                <div className="space-y-2.5">
                  <span className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Or start from an example
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {visibleExamples.map((ex) => (
                      <button
                        key={ex.id}
                        type="button"
                        disabled={uploading}
                        onClick={() => loadExample(ex)}
                        data-active={loadedExampleId === ex.id}
                        title={ex.blurb}
                        className="rounded-full border px-3 py-1 text-xs font-medium transition-colors hover:border-[hsl(var(--brand-blue))] hover:text-[hsl(var(--brand-blue))] data-[active=true]:border-[hsl(var(--brand-blue))] data-[active=true]:bg-accent data-[active=true]:text-[hsl(var(--brand-blue))] disabled:opacity-50"
                      >
                        {ex.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </AutoHeight>

          <div
            className={`space-y-3 ${visibleExamples.length > 0 ? "border-t pt-6" : ""}`}
          >
            {/* Paste / Upload tabs — both converge on the same ingestion path. */}
            <div className="inline-flex rounded-md border bg-muted/40 p-0.5">
              {(["paste", "upload"] as InputTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setInputTab(tab);
                    setError(null);
                  }}
                  data-active={inputTab === tab}
                  className="rounded px-4 py-1.5 text-sm font-medium capitalize text-muted-foreground transition-colors data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm disabled:opacity-50"
                >
                  {tab}
                </button>
              ))}
            </div>

            {inputTab === "paste" ? (
              <Textarea
                value={sourceText}
                maxLength={SOURCE_MAX}
                placeholder="Paste a case opinion, an explainer, or a doctrine chapter…"
                onChange={(e) => {
                  setSourceText(e.target.value);
                  setLoadedExampleId(null);
                  setUploadName(null);
                }}
                className="min-h-[260px] font-sans"
              />
            ) : (
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={UPLOAD_ACCEPT}
                  disabled={uploading}
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onUpload(f);
                  }}
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex min-h-[260px] w-full flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-input bg-background p-6 text-center transition-colors hover:border-[hsl(var(--brand-blue))] hover:bg-accent/40 disabled:opacity-50"
                >
                  {uploading ? (
                    <span className="text-sm text-muted-foreground">
                      Reading your file…
                    </span>
                  ) : uploadName ? (
                    <>
                      <FileText className="h-8 w-8 text-[hsl(var(--brand-blue))]" />
                      <span className="text-sm font-medium text-foreground">
                        {uploadName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {sourceText.length.toLocaleString()} characters extracted ·
                        click to choose another
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        Choose a file to upload
                      </span>
                      <span className="text-xs text-muted-foreground">
                        .txt, .md, .pdf, or .docx, parsed to text on the server
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {sourceText.length.toLocaleString()} characters
              </p>
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={uploading || sourceText.trim().length < 120}
              onClick={ingest}
            >
              Use this source →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // While the engine writes a hypothetical from the structure, take over the
  // screen with the branded loader (same treatment as ingestion).
  if (step === "generating") {
    return (
      <BrandLoader
        title="Writing a hypothetical grounded in your structure…"
        subtitle="Building a fact pattern engineered to match your answer key."
      />
    );
  }

  // --- Review-and-edit the extracted structure, then generate ---------------
  if (step === "extracted") {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <button
            onClick={resetToSource}
            className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            &larr; New source
          </button>
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            {doctrine.name} · Review &amp; edit
          </span>
        </div>

        {structure && (
          <StructureReview
            structure={structure}
            onChange={setStructure}
            model={model}
            thin={thin}
            note={ingestNote ?? undefined}
            canonical={canonicalStructure(doctrine)}
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle>Set the answer key</CardTitle>
            <CardDescription>
              {doctrine.structure === "all-of"
                ? "Choose which element should fail (or whether all are met). That choice is the answer key. The generated hypo is engineered to match it, and you preview it by working the elements."
                : "Choose which factor should control the outcome. That choice is the answer key. The generated hypo is engineered to match it, and you preview it by reasoning it out."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setFocusId("auto")}
                data-active={focusId === "auto"}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-accent data-[active=true]:border-secondary data-[active=true]:bg-secondary data-[active=true]:text-secondary-foreground"
              >
                <span className="font-medium">Auto</span>
                <span className="opacity-80">
                  {" "}
                  · pick from the source
                  {resolvedFocus && focusId === "auto"
                    ? ` (→ ${resolvedFocus.label})`
                    : ""}
                </span>
              </button>
              {options.map((o) => (
                <button
                  key={o.target_id}
                  type="button"
                  onClick={() => setFocusId(o.target_id)}
                  data-active={focusId === o.target_id}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-accent data-[active=true]:border-secondary data-[active=true]:bg-secondary data-[active=true]:text-secondary-foreground"
                >
                  {o.label}
                </button>
              ))}
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              className="w-full"
              size="lg"
              disabled={!resolvedFocus}
              onClick={generate}
            >
              Generate practice from this structure
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hypo || !target || !structure) return null;

  // --- Answer + results layout ----------------------------------------------
  const answering = step === "answer" || step === "submitting";
  const gridTitle = `The ${numberWord(doctrine.units.length)} ${model.unitNounPlural}`;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            setStep("extracted");
            setError(null);
          }}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Review &amp; edit
        </button>
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {step === "results"
            ? `Preview scored · ${doctrine.name}`
            : `Preview · ${doctrine.name}`}
        </span>
      </div>

      <p className="rounded-md border border-[hsl(var(--brand-blue))]/20 bg-accent/40 p-3 text-xs text-muted-foreground">
        {step === "results"
          ? "This is the preview a learner would see, scored against your key. Use it to confirm the question is meaningful and the key is sound before you assign it."
          : `Preview: work this hypothetical exactly as a learner would. ${
              doctrine.structure === "all-of"
                ? "Call each element"
                : "Make a call on each factor"
            }, then submit to see it scored against your answer key.`}
      </p>

      {genNote && (
        <p className="rounded-md border border-secondary/30 bg-secondary/5 p-3 text-xs text-muted-foreground">
          {genNote}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{hypo.title}</CardTitle>
          <CardDescription>
            {hypo.source_work} &mdash; {hypo.use}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line leading-relaxed text-foreground">
            {hypo.fact_pattern}
          </p>
        </CardContent>
      </Card>

      <details className="rounded-lg border bg-card/50 px-4 py-3 text-sm">
        <summary className="cursor-pointer font-medium text-muted-foreground">
          Grounded in the test extracted from your source
        </summary>
        <div className="mt-3">
          <ExtractedStructureCard structure={structure} thin={thin} compact />
        </div>
      </details>

      <div
        className={
          step === "results" ? "grid gap-6 lg:grid-cols-2 lg:items-start" : ""
        }
      >
        {/* Learner's unit grid (editable while answering, read-only after) */}
        <Card>
          <CardHeader>
            <CardTitle>{gridTitle}</CardTitle>
            <CardDescription>
              {doctrine.structure === "all-of"
                ? "Mark each element met or failing with a short rationale, then state whether the claim stands. Remember: every element must be met."
                : "Make a call on each factor and give a short rationale, then state your conclusion."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {doctrine.units.map((u) => {
              const us = answers[u.id];
              return (
                <div
                  key={u.id}
                  className="space-y-2 border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">
                      {model.unitNoun.charAt(0).toUpperCase() +
                        model.unitNoun.slice(1)}{" "}
                      {u.id}. {u.name}
                    </p>
                    {doctrine.structure === "weigh-and-balance" && (
                      <Badge variant="muted">{u.weight} weight</Badge>
                    )}
                  </div>
                  <StatusControl
                    name={u.name}
                    options={model.statuses}
                    value={us.status}
                    disabled={!answering}
                    onChange={(s) =>
                      setAnswers((prev) => ({
                        ...prev,
                        [u.id]: { ...prev[u.id], status: s },
                      }))
                    }
                  />
                  {answering ? (
                    <div className="space-y-1">
                      <Textarea
                        value={us.rationale}
                        maxLength={RATIONALE_MAX}
                        disabled={step === "submitting"}
                        placeholder="Two or three sentences: which facts drive this call, and why."
                        onChange={(e) =>
                          setAnswers((prev) => ({
                            ...prev,
                            [u.id]: {
                              ...prev[u.id],
                              rationale: e.target.value,
                            },
                          }))
                        }
                        className="min-h-[64px]"
                      />
                      <p className="text-right text-xs text-muted-foreground">
                        {us.rationale.length}/{RATIONALE_MAX}
                      </p>
                    </div>
                  ) : (
                    us.rationale && (
                      <p className="rounded-md bg-muted p-2 text-xs text-muted-foreground">
                        {us.rationale}
                      </p>
                    )
                  )}
                </div>
              );
            })}

            <div className="space-y-2 pt-1">
              <p className="text-sm font-medium">Overall conclusion</p>
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${model.conclusions.length}, minmax(0, 1fr))`,
                }}
              >
                {model.conclusions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={!answering}
                    onClick={() => setConclusion(opt.value)}
                    data-active={conclusion === opt.value}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent data-[active=true]:border-secondary data-[active=true]:bg-secondary data-[active=true]:text-secondary-foreground"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {answering && (
              <div className="space-y-2 pt-2">
                {error && (
                  <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
                    {error}
                  </p>
                )}
                <Button
                  className="w-full"
                  size="lg"
                  disabled={!allAnswered || step === "submitting"}
                  onClick={submit}
                >
                  {step === "submitting"
                    ? "Reading your answer…"
                    : "Submit for scoring"}
                </Button>
                {!allAnswered && (
                  <p className="text-center text-xs text-muted-foreground">
                    Make a call on every {model.unitNoun} and state a conclusion
                    to submit.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {step === "results" && result && (
          <ResultsPanel
            result={result}
            onNext={() => {
              setStep("extracted");
              setError(null);
            }}
            hasNext
            nextLabel="Preview another focus"
            degraded={degraded}
          />
        )}
      </div>

      {step === "results" && classified && (
        <p className="text-center text-xs text-muted-foreground">
          Scoring is deterministic against the answer key. The model only mapped
          your words onto {model.unitNoun} calls; it did not grade you.
        </p>
      )}
    </div>
  );
}
