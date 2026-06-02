// On-brand loading state for the "engine is working" moments — reading the test
// out of a source, then writing a hypothetical from the structure. The bouncing
// BARBRI lettermark (brand/barbri_bounce.gif, served from /public) carries the
// motion; a status line and a sequential dot pulse sit under it.

export function BrandLoader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-16 text-center animate-fade-in">
      {/* Plain <img>, not next/image — the optimizer can strip GIF animation. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/barbri_bounce.gif"
        alt=""
        aria-hidden
        className="h-auto w-40 select-none"
        draggable={false}
      />

      <div className="space-y-3">
        <p className="font-serif text-lg leading-snug text-[hsl(var(--brand-blue))]">
          {title}
        </p>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
        <div
          className="flex items-center justify-center gap-1.5 pt-1"
          aria-hidden
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand-blue))] animate-pulse-dot"
              style={{ animationDelay: `${i * 0.16}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
