"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { statusLabel } from "@/components/status-control";
import { structureModel } from "@/lib/structure-model";
import type { ScoreResult } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check, X, AlertTriangle } from "lucide-react";

export function ResultsPanel({
  result,
  onNext,
  hasNext,
  nextLabel,
  degraded,
}: {
  result: ScoreResult;
  onNext: () => void;
  hasNext: boolean;
  nextLabel?: string;
  degraded?: boolean;
}) {
  const model = structureModel(result.structure);
  const isBalance = result.structure === "weigh-and-balance";
  const noun = result.unitNoun;
  const Noun = noun.charAt(0).toUpperCase() + noun.slice(1);
  const conc = (v: ScoreResult["learnerConclusion"] | "even") =>
    model.conclusionLabel(v);

  // The deciding-unit story differs by structure: a controlling factor under
  // balancing, a failing element (or "all met") under all-of.
  const keyHeading = isBalance
    ? `The ${noun} that controls`
    : result.keyUnitId == null
      ? "Every element is met"
      : `The element that defeats the claim`;

  return (
    <div className="space-y-5 animate-fade-in">
      {degraded && (
        <p className="rounded-md border border-secondary/30 bg-secondary/5 p-3 text-xs text-muted-foreground">
          Running without a model key: {noun} scoring and misconception
          corrections come straight from your own calls, but the &ldquo;named the
          deciding {noun}&rdquo; and &ldquo;spotted the distinction&rdquo; checks
          need the live classifier and are shown as not met. Set{" "}
          <span className="font-medium text-foreground">ANTHROPIC_API_KEY</span>{" "}
          to enable prose-aware classification.
        </p>
      )}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Your {noun} calls, scored</CardTitle>
          <Badge variant="muted">
            {result.correctUnitCount} / {result.unitScores.length} {result.unitNoun}
            {result.unitScores.length === 1 ? "" : "s"} matched the key
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.unitScores.map((us) => (
            <div
              key={us.unit_id}
              className={cn(
                "rounded-md border p-3",
                us.correct
                  ? "border-success/30 bg-success/5"
                  : "border-destructive/30 bg-destructive/5",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <span
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white",
                      us.correct ? "bg-success" : "bg-destructive",
                    )}
                  >
                    {us.correct ? <Check size={13} /> : <X size={13} />}
                  </span>
                  <div>
                    <p className="text-sm font-medium leading-tight">
                      {Noun} {us.unit_id}. {us.unit_name}
                    </p>
                    {isBalance && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Weight: {us.weight}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right text-xs">
                  <p>
                    You:{" "}
                    <span className="font-medium">
                      {statusLabel(model.statuses, us.learner_status)}
                    </span>
                  </p>
                  {!us.correct && (
                    <p className="text-muted-foreground">
                      Key: {statusLabel(model.statuses, us.expected_status)}
                    </p>
                  )}
                </div>
              </div>

              {!us.correct &&
                us.corrections.map((m) => (
                  <div
                    key={m.id}
                    className="mt-2 flex gap-2 rounded bg-background/70 p-2 text-xs"
                  >
                    <AlertTriangle
                      size={14}
                      className="mt-0.5 shrink-0 text-destructive"
                    />
                    <p>
                      <span className="font-medium">Common misstep:</span>{" "}
                      {m.wrong_move}.{" "}
                      <span className="font-medium">Correction:</span>{" "}
                      {m.correction}.
                    </p>
                  </div>
                ))}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{keyHeading}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {isBalance ? (
            <p>
              The dispositive {noun} here is{" "}
              <span className="font-semibold">
                {Noun} {result.keyUnitId}, {result.keyUnitName}
              </span>
              , which{" "}
              {result.keyUnitDirection === "favors_owner"
                ? "favors the copyright owner"
                : "favors fair use"}{" "}
              and drives the outcome to{" "}
              <span className="font-semibold">
                {conc(result.authoredConclusion)}
              </span>
              .
            </p>
          ) : result.keyUnitId == null ? (
            <p>
              No element fails. Under all-of (AND) logic, every element being met
              means the prima facie claim{" "}
              <span className="font-semibold">stands</span>.
            </p>
          ) : (
            <p>
              The claim fails on{" "}
              <span className="font-semibold">
                {Noun} {result.keyUnitId}, {result.keyUnitName}
              </span>
              . Under all-of (AND) logic, a single failing element defeats the
              whole claim, so the verdict is{" "}
              <span className="font-semibold">
                {conc(result.authoredConclusion)}
              </span>
              , no balancing required.
            </p>
          )}
          <p className="rounded-md bg-muted p-3 text-muted-foreground">
            <span className="font-medium text-foreground">Why it controls:</span>{" "}
            {result.intendedLesson}.
          </p>
          <p>
            {result.keyUnitFound ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-success">
                <Check size={15} />{" "}
                {isBalance
                  ? "You identified the controlling factor."
                  : result.keyUnitId == null
                    ? "You correctly treated every element as met."
                    : "You identified the failing element."}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-medium text-destructive">
                <X size={15} />{" "}
                {isBalance
                  ? "You did not single out the controlling factor in your reasoning."
                  : result.keyUnitId == null
                    ? "You flagged an element as failing when every element is actually met."
                    : "You did not single out the failing element in your reasoning."}
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your conclusion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              You concluded: {conc(result.learnerConclusion)}
            </Badge>
            <Badge variant={result.conclusionMatchesKey ? "success" : "default"}>
              Answer key: {conc(result.authoredConclusion)}
            </Badge>
          </div>
          <p
            className={cn(
              "rounded-md p-3",
              result.conclusionCoherent
                ? "bg-success/10 text-foreground"
                : "bg-destructive/10 text-foreground",
            )}
          >
            {result.conclusionCoherent ? (
              <>
                <span className="font-medium">Internally coherent.</span>{" "}
                {isBalance ? (
                  <>
                    Your stated conclusion follows from the way you weighed your
                    own {noun} calls
                    {result.conclusionImpliedByOwnCalls === "even"
                      ? " (which came out roughly even)"
                      : ""}
                    .
                  </>
                ) : (
                  <>
                    Your verdict follows from your own element calls: under AND
                    logic, {conc(result.conclusionImpliedByOwnCalls)} is exactly
                    what they compel.
                  </>
                )}
              </>
            ) : (
              <>
                <span className="font-medium">Watch the logic.</span>{" "}
                {isBalance ? (
                  <>
                    Your own {noun} calls weigh toward{" "}
                    <span className="font-medium">
                      {conc(result.conclusionImpliedByOwnCalls)}
                    </span>
                    , yet you concluded{" "}
                    <span className="font-medium">
                      {conc(result.learnerConclusion)}
                    </span>
                    . A conclusion should follow from your own weighing of the{" "}
                    {model.unitNounPlural}.
                  </>
                ) : (
                  <>
                    Under AND logic your own element calls compel{" "}
                    <span className="font-medium">
                      {conc(result.conclusionImpliedByOwnCalls)}
                    </span>
                    , yet you concluded{" "}
                    <span className="font-medium">
                      {conc(result.learnerConclusion)}
                    </span>
                    . If any element fails, the claim fails. There is no
                    balancing it away.
                  </>
                )}
              </>
            )}
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onNext}>
          {nextLabel ?? (hasNext ? "Next hypothetical" : "Back to start")}
        </Button>
      </div>
    </div>
  );
}
