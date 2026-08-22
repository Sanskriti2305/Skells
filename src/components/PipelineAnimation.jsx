import { useEffect, useRef, useState, useLayoutEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, AudioLines, Layers, Database, Sparkles, ShieldCheck, Check } from "lucide-react";

const STAGES = [
  { icon: Mic, label: "Voice Input", engine: "audio capture", output: "🎙️ 3.2s audio · 16kHz mono" },
  { icon: AudioLines, label: "Speech-to-Text", engine: "Sarvam ASR", output: '"What was the Manhattan Project?"' },
  { icon: Layers, label: "Chunking", engine: "metadata-aware splitter", output: "412 chunks indexed" },
  { icon: Database, label: "Vector Retrieval", engine: "FAISS · e5-base", output: "top-3 · score 0.79–0.81" },
  { icon: Sparkles, label: "Answer Gen", engine: "Qwen 3B", output: "draft answer composed" },
  { icon: ShieldCheck, label: "Guardrail Check", engine: "grounding verifier", output: "grounded ✓ · safe to return" },
];

export default function PipelineAnimation() {
  const [active, setActive] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [shellX, setShellX] = useState(0);
  const [burst, setBurst] = useState(0);
  const [paused, setPaused] = useState(false);
  const [wake, setWake] = useState([]);

  const containerRef = useRef(null);
  const nodeRefs = useRef([]);

  const measure = useCallback(() => {
    const container = containerRef.current;
    const node = nodeRefs.current[active];
    if (!container || !node) return;
    const cRect = container.getBoundingClientRect();
    const nRect = node.getBoundingClientRect();
    setShellX(nRect.left - cRect.left + nRect.width / 2);
  }, [active]);

  useLayoutEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  useEffect(() => {
    setWake((w) => [...w.slice(-4), shellX]);
    setBurst((b) => b + 1);
  }, [shellX]);

  useEffect(() => {
    if (paused) return;
    const stageTimer = setInterval(() => {
      setActive((prev) => {
        setCompleted((c) => (prev < STAGES.length - 1 ? [...c, prev] : []));
        if (prev === STAGES.length - 1) {
          setCompleted([]);
          setElapsed(0);
          return 0;
        }
        return prev + 1;
      });
    }, 1500);
    return () => clearInterval(stageTimer);
  }, [paused]);

  useEffect(() => {
    const tick = setInterval(() => setElapsed((e) => e + 10), 10);
    return () => clearInterval(tick);
  }, [active === 0 && completed.length === 0]);

  const jumpTo = (i) => {
    setPaused(true);
    setCompleted(Array.from({ length: i }, (_, idx) => idx));
    setActive(i);
    setTimeout(() => setPaused(false), 3500);
  };

  return (
    <div
      ref={containerRef}
      className="relative bg-white/80 rounded-3xl border border-ocean/10 px-3 md:px-8 pt-14 pb-8 overflow-hidden"
    >
      <div className="flex items-center justify-between mb-8 px-1">
        <span className="font-mono text-[10px] md:text-xs text-ocean/50 uppercase tracking-widest">
          live pipeline trace {paused && <span className="text-coral">· paused</span>}
        </span>
        <span className="font-mono text-[10px] md:text-xs text-coral font-medium">t+{elapsed}ms</span>
      </div>

      {/* wake trail */}
      {wake.map((x, i) => (
        <motion.div
          key={i}
          className="absolute top-[70px] md:top-[74px] w-1.5 h-1.5 rounded-full bg-coral z-10"
          initial={{ opacity: 0.4, left: x, scale: 1 }}
          animate={{ opacity: 0, scale: 0.3 }}
          transition={{ duration: 1.2 }}
          style={{ translateX: "-50%" }}
        />
      ))}

      {/* burst rings on arrival */}
      <AnimatePresence>
        <motion.div
          key={burst}
          className="absolute top-[70px] md:top-[74px] z-10 pointer-events-none"
          initial={{ left: shellX, translateX: "-50%", translateY: "-50%" }}
          animate={{ left: shellX }}
          style={{ translateX: "-50%", translateY: "-50%" }}
        >
          <motion.div
            className="w-8 h-8 rounded-full border-2 border-coral"
            initial={{ scale: 0.3, opacity: 0.8 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </motion.div>
      </AnimatePresence>

      {/* traveling shell */}
      <motion.div
        className="absolute top-[64px] md:top-[68px] z-30 text-2xl md:text-3xl"
        animate={{ left: shellX, rotate: [0, -12, 12, 0], y: [0, -4, 0] }}
        transition={{
          left: { type: "spring", stiffness: 90, damping: 16 },
          rotate: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
        }}
        style={{ translateX: "-50%" }}
      >
        🐚
      </motion.div>

      <div className="flex items-stretch">
        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          const isActive = active === i;
          const isDone = completed.includes(i);
          return (
            <div key={stage.label} className="flex items-stretch flex-1">
              <div className="flex flex-col items-center text-center gap-2 flex-1 min-w-0">
                <button
                  ref={(el) => (nodeRefs.current[i] = el)}
                  onClick={() => jumpTo(i)}
                  className="relative w-9 h-9 md:w-14 md:h-14 flex items-center justify-center cursor-pointer group"
                >
                  {isActive && (
                    <motion.span
                      className="absolute inset-0 rounded-full bg-coral/25"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.7, 0.15, 0.7] }}
                      transition={{ duration: 1.3, repeat: Infinity }}
                    />
                  )}
                  <motion.div
                    animate={isActive ? { scale: [1, 1.18, 1] } : { scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className={`relative z-10 w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                      isDone
                        ? "bg-seafoam text-white shadow-md shadow-seafoam/40"
                        : isActive
                        ? "bg-ocean text-sand shadow-lg shadow-ocean/40"
                        : "bg-sand-dark text-ink/30"
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5 md:w-5 md:h-5" /> : <Icon className="w-3.5 h-3.5 md:w-6 md:h-6" />}
                  </motion.div>
                </button>

                <p className={`text-[9px] md:text-xs font-semibold leading-tight ${isActive || isDone ? "text-ocean" : "text-ink/35"}`}>
                  {stage.label}
                </p>
                <p className="text-[8px] md:text-[10px] font-mono text-ink/35 hidden sm:block">{stage.engine}</p>

                <div className="h-9 md:h-10 flex items-center justify-center px-1">
                  <AnimatePresence mode="wait">
                    {(isActive || isDone) && (
                      <motion.p
                        key={stage.label + (isActive ? "active" : "done")}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-[8px] md:text-[10px] font-mono text-coral leading-tight break-words"
                      >
                        {stage.output}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {i < STAGES.length - 1 && (
                <div className="flex items-center px-0.5 md:px-2 pb-10">
                  <div className="w-2 md:w-8 h-px bg-ocean/15 relative overflow-hidden">
                    {completed.includes(i) && (
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-seafoam"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.4 }}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-[9px] md:text-[10px] font-mono text-ink/30 mt-6">
        tap any stage to jump there
      </p>
    </div>
  );
}