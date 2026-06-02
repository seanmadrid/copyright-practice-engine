"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ExtractedStructure } from "@/lib/types";
import { structureModel } from "@/lib/structure-model";

/**
 * Renders the content-to-structure step visibly: the governing test the model
 * pulled out of the pasted source, for whichever structure type was selected.
 * `thin` marks a fallback to the canonical table when the source did not yield a
 * usable test.
 */
export function ExtractedStructureCard({
  structure,
  thin,
  note,
  compact = false,
}: {
  structure: ExtractedStructure;
  thin?: boolean;
  note?: string;
  compact?: boolean;
}) {
  const model = structureModel(structure.structure);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Extracted test structure</CardTitle>
          {thin ? (
            <Badge variant="muted">canonical fallback</Badge>
          ) : (
            <Badge variant="success">
              {structure.confidence === "high" ? "high confidence" : "extracted"}
            </Badge>
          )}
        </div>
        <CardDescription>
          {thin
            ? `From the canonical ${structure.doctrine} standard; the source was thin.`
            : `Pulled live from your source: the ${model.logicLabel} test as this source expresses it.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {note && (
          <p className="rounded-md border border-secondary/30 bg-secondary/5 p-3 text-xs text-muted-foreground">
            {note}
          </p>
        )}

        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="outline">Doctrine: {structure.doctrine}</Badge>
          <Badge variant="outline">Logic: {model.logicLabel}</Badge>
        </div>

        <div className="space-y-3">
          {structure.units.map((u) => {
            const hasCues = model.cueStatuses.some(
              (s) => (u.cues[s]?.length ?? 0) > 0,
            );
            return (
              <div key={u.id} className="rounded-md border bg-card/50 p-3">
                <p className="text-sm font-medium">
                  {model.unitNoun.charAt(0).toUpperCase() + model.unitNoun.slice(1)}{" "}
                  {u.id}. {u.name}
                </p>
                {u.as_expressed_in_source && (
                  <p className="mt-1 text-xs italic text-muted-foreground">
                    {u.as_expressed_in_source}
                  </p>
                )}
                {!compact && hasCues && (
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {model.cueStatuses.map((s) => {
                      const opt = model.statuses.find((o) => o.value === s)!;
                      return (
                        <CueList
                          key={s}
                          label={opt.label}
                          cues={u.cues[s] ?? []}
                          accent={opt.tone === "fair" || opt.tone === "met"}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!compact && structure.source_facts && (
          <div className="rounded-md bg-muted p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Source facts &amp; holding
            </p>
            <p className="mt-1 text-sm text-foreground">
              {structure.source_facts}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CueList({
  label,
  cues,
  accent,
}: {
  label: string;
  cues: string[];
  accent: boolean;
}) {
  if (cues.length === 0) return null;
  return (
    <div>
      <p
        className={
          accent
            ? "text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--brand-blue))]"
            : "text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
        }
      >
        {label}
      </p>
      <ul className="mt-1 space-y-0.5">
        {cues.map((c, i) => (
          <li key={i} className="text-xs text-muted-foreground">
            &bull; {c}
          </li>
        ))}
      </ul>
    </div>
  );
}
