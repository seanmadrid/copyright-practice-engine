"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, X } from "lucide-react";
import type { ExtractedStructure, ExtractedUnit } from "@/lib/types";
import type { StructureModel } from "@/lib/structure-model";

const INPUT =
  "w-full rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50";

/**
 * The review-and-edit step — the human-in-the-loop check between extraction and
 * generation. The educator reads what was pulled out of their source and edits it
 * into the standard they actually want to teach: rename units, tune the per-status
 * cues, drop a unit, or add one. The edited structure is what generation runs on,
 * so this panel is where the educator's judgment shapes the answer key before any
 * learner sees a question.
 *
 * Controlled: the parent owns the working structure and we report every edit up
 * through `onChange`. `thin` marks a low-confidence or fallback extraction; when
 * set we say so and offer the canonical table as a clean starting point to edit.
 */
export function StructureReview({
  structure,
  onChange,
  model,
  thin,
  note,
  canonical,
  disabled = false,
}: {
  structure: ExtractedStructure;
  onChange: (next: ExtractedStructure) => void;
  model: StructureModel;
  thin?: boolean;
  note?: string;
  /** The canonical table for this doctrine, offered as a starting point. */
  canonical: ExtractedStructure;
  disabled?: boolean;
}) {
  const unitNoun = model.unitNoun;
  const Noun = unitNoun.charAt(0).toUpperCase() + unitNoun.slice(1);

  const nextId = useMemo(
    () => structure.units.reduce((m, u) => Math.max(m, u.id), 0) + 1,
    [structure.units],
  );

  function patchUnits(units: ExtractedUnit[]) {
    onChange({ ...structure, units });
  }

  function updateUnit(id: number, patch: Partial<ExtractedUnit>) {
    patchUnits(structure.units.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }

  function removeUnit(id: number) {
    patchUnits(structure.units.filter((u) => u.id !== id));
  }

  function addUnit() {
    const cues: Record<string, string[]> = {};
    for (const s of model.cueStatuses) cues[s] = [];
    const unit: ExtractedUnit = {
      id: nextId,
      name: `New ${unitNoun}`,
      as_expressed_in_source: "",
      cues,
    };
    patchUnits([...structure.units, unit]);
  }

  function setCue(id: number, status: string, index: number, value: string) {
    const u = structure.units.find((x) => x.id === id);
    if (!u) return;
    const list = [...(u.cues[status] ?? [])];
    list[index] = value;
    updateUnit(id, { cues: { ...u.cues, [status]: list } });
  }

  function addCue(id: number, status: string) {
    const u = structure.units.find((x) => x.id === id);
    if (!u) return;
    const list = [...(u.cues[status] ?? []), ""];
    updateUnit(id, { cues: { ...u.cues, [status]: list } });
  }

  function removeCue(id: number, status: string, index: number) {
    const u = structure.units.find((x) => x.id === id);
    if (!u) return;
    const list = (u.cues[status] ?? []).filter((_, i) => i !== index);
    updateUnit(id, { cues: { ...u.cues, [status]: list } });
  }

  const malformed = structure.units.length === 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Review the extracted structure</CardTitle>
          {thin ? (
            <Badge variant="muted">needs your review</Badge>
          ) : (
            <Badge variant="success">extracted · high confidence</Badge>
          )}
        </div>
        <CardDescription>
          This is the {model.logicLabel} test pulled from your source. Edit it into
          the standard you want to teach: rename a {unitNoun}, tune its cues, drop
          one, or add one. What you approve here is what the generated practice is
          built on.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {(thin || malformed) && (
          <div className="space-y-2 rounded-md border border-secondary/30 bg-secondary/5 p-3">
            <p className="text-xs text-muted-foreground">
              {note ??
                `The extraction came back ${
                  malformed ? "empty" : "thin or low-confidence"
                }, so it may not reflect your source well. Edit it below, or start from the canonical ${structure.doctrine} table and adjust from there.`}
            </p>
            <Button
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => onChange(canonical)}
            >
              Start from the canonical table
            </Button>
          </div>
        )}

        <div className="space-y-3">
          {structure.units.map((u) => (
            <div key={u.id} className="space-y-3 rounded-md border bg-card/50 p-3">
              <div className="flex items-start gap-2">
                <span className="mt-1.5 shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {Noun} {u.id}
                </span>
                <input
                  className={INPUT + " font-medium"}
                  value={u.name}
                  disabled={disabled}
                  aria-label={`${Noun} ${u.id} name`}
                  onChange={(e) => updateUnit(u.id, { name: e.target.value })}
                />
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`Remove ${unitNoun} ${u.id}`}
                  onClick={() => removeUnit(u.id)}
                  className="mt-0.5 shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  As expressed in this source
                </label>
                <input
                  className={INPUT + " mt-1 italic"}
                  value={u.as_expressed_in_source}
                  disabled={disabled}
                  placeholder={`How this source frames the ${unitNoun}…`}
                  onChange={(e) =>
                    updateUnit(u.id, { as_expressed_in_source: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {model.cueStatuses.map((status) => {
                  const opt = model.statuses.find((o) => o.value === status)!;
                  const accent = opt.tone === "fair" || opt.tone === "met";
                  const list = u.cues[status] ?? [];
                  return (
                    <div key={status}>
                      <p
                        className={
                          accent
                            ? "text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--brand-blue))]"
                            : "text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                        }
                      >
                        {opt.label}
                      </p>
                      <div className="mt-1 space-y-1">
                        {list.map((cue, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <input
                              className={INPUT + " text-xs"}
                              value={cue}
                              disabled={disabled}
                              aria-label={`${opt.label} cue ${i + 1}`}
                              onChange={(e) =>
                                setCue(u.id, status, i, e.target.value)
                              }
                            />
                            <button
                              type="button"
                              disabled={disabled}
                              aria-label="Remove cue"
                              onClick={() => removeCue(u.id, status, i)}
                              className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => addCue(u.id, status)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-[hsl(var(--brand-blue))] disabled:opacity-50"
                        >
                          <Plus className="h-3 w-3" /> Add cue
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={addUnit}
          className="w-full"
        >
          <Plus className="mr-1 h-4 w-4" /> Add a {unitNoun}
        </Button>

        {structure.source_facts && (
          <div className="rounded-md bg-muted p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Source facts &amp; holding
            </p>
            <textarea
              className={INPUT + " mt-1 min-h-[64px]"}
              value={structure.source_facts}
              disabled={disabled}
              onChange={(e) =>
                onChange({ ...structure, source_facts: e.target.value })
              }
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
