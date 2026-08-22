import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Globe } from "lucide-react";
import ShellIcon from "./ShellIcon";
import SourceCard from "./SourceCard";
import MultiLangGrid from "./MultiLangGrid";

export default function AnswerBubble({ data }) {
  const [showLangs, setShowLangs] = useState(false);

  // Normalize the API payload once so the UI remains compatible
  // with SourceCard implementations that use either `score` or
  // `similarity`, and with both `latency` and `latency_ms`.
  const normalizedSources = (data.sources || []).map((source, index) => {
    const score =
      typeof source.score === "number"
        ? source.score
        : typeof source.similarity === "number"
          ? source.similarity
          : null;

    return {
      ...source,
      id: source.id ?? index + 1,
      score,
      similarity: score,
    };
  });

  const latency =
    typeof data.latency === "number"
      ? data.latency
      : typeof data.latency_ms === "number"
        ? data.latency_ms
        : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, clipPath: "inset(0 0 100% 0)" }}
      animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
      transition={{ duration: 0.5 }}
      className="max-w-[85%] md:max-w-xl bg-white/80 rounded-3xl rounded-tl-md px-5 py-4 shadow-md border border-ocean/10"
    >
      <p className="text-ink leading-relaxed">{data.answer}</p>

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-ocean/10 flex-wrap">
        <div className="flex items-center gap-1.5">
          <ShellIcon open={data.grounded} className="w-4 h-4" />
          <span className="text-xs font-medium text-ink/60">
            {data.grounded ? "Grounded" : "Not grounded"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-ink/50">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-xs font-mono">
            {latency !== null ? `${latency.toFixed(2)}ms` : "—"}
          </span>
        </div>
        <span className="text-xs font-mono text-ocean/60">{data.strategy}</span>
        {data.demoMode && (
          <span className="text-[10px] font-mono bg-terracotta/15 text-terracotta px-2 py-0.5 rounded-full">
            demo mode
          </span>
        )}
        {data.grounded && (
          <button
            onClick={() => setShowLangs(!showLangs)}
            className="flex items-center gap-1.5 ml-auto text-xs font-medium text-coral hover:text-coral/70 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            {showLangs ? "Hide" : "View in all 13 languages"}
          </button>
        )}
      </div>

      {showLangs && <MultiLangGrid />}

      {normalizedSources.length > 0 && (
        <div className="mt-3 space-y-2">
          {normalizedSources.map((s, i) => (
            <SourceCard key={i} source={s} index={i} />
          ))}
        </div>
      )}
    </motion.div>
  );
}