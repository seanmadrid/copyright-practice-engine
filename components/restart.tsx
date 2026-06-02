"use client";

// Bridges the flow's "start over" action up into the app header. The whole
// lesson-building state lives in <Practice>, but the header (with the logo and
// prototype label) lives in the layout, structurally separate. Rather than lift
// the entire state machine, Practice registers a clean-slate reset handler and
// whether it is past the first step; <HeaderRestart> in the header reads both.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { RotateCcw } from "lucide-react";

type RestartContext = {
  // True once the educator is past the source step, so a reset is meaningful.
  canRestart: boolean;
  // Wipes the flow back to a blank source step.
  restart: () => void;
  // Called by the flow to publish its handler and current eligibility.
  register: (handler: () => void, canRestart: boolean) => void;
};

const Ctx = createContext<RestartContext | null>(null);

export function RestartProvider({ children }: { children: ReactNode }) {
  const handlerRef = useRef<(() => void) | null>(null);
  const [canRestart, setCanRestart] = useState(false);

  const register = useCallback((handler: () => void, can: boolean) => {
    handlerRef.current = handler;
    setCanRestart(can);
  }, []);
  const restart = useCallback(() => handlerRef.current?.(), []);

  const value = useMemo(
    () => ({ canRestart, restart, register }),
    [canRestart, restart, register],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRestart(): RestartContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useRestart must be used within <RestartProvider>");
  return ctx;
}

// The header action, opposite the logo. Hidden on the first step, where there is
// nothing yet to start over from.
export function HeaderRestart() {
  const { canRestart, restart } = useRestart();
  if (!canRestart) return null;
  return (
    <button
      onClick={restart}
      className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <RotateCcw className="h-4 w-4" />
      Start over
    </button>
  );
}
