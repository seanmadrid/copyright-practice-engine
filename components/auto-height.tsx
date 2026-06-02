"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Smoothly animates its own height when the content inside changes size, so the
// controls below don't jump. On the source screen, switching doctrines swaps a
// 2-chip example set for a 4-chip one (and changes the doctrine name mid-
// paragraph), which grows or shrinks this region. A ResizeObserver watches the
// inner content and we transition the outer height between the measured values.
// Height stays `auto` until the first measurement so initial layout (and SSR)
// is never pinned to a stale pixel value.
export function AutoHeight({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const inner = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();

  useEffect(() => {
    const el = inner.current;
    if (!el) return;
    const measure = () => setHeight(el.scrollHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      style={{ height }}
      className="overflow-hidden transition-[height] duration-300 ease-out motion-reduce:transition-none"
    >
      <div ref={inner} className={className}>
        {children}
      </div>
    </div>
  );
}
