import React from "react";
import { BEST_STRATEGY } from "../data/appConfig";

export default function StrategySelector() {
  return (
    <div className="flex items-center gap-2 bg-white/70 border border-seafoam/40 rounded-full px-4 py-2">
      <span className="w-2 h-2 rounded-full bg-seafoam animate-pulse" />

      <span className="text-xs font-medium text-ink/70">
        Auto-selected:{" "}
        <span className="text-ocean font-semibold">
          {BEST_STRATEGY.strategy}
        </span>
      </span>

      <span className="text-[10px] font-mono text-ink/40">
        (deployed)
      </span>
    </div>
  );
}