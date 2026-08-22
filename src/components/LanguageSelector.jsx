import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { LANGUAGES } from "../data/appConfig";

const FLAG_EMOJI = {
  hin_Deva: "🇮🇳", ben_Beng: "🇮🇳", tam_Taml: "🇮🇳", tel_Telu: "🇮🇳",
  mar_Deva: "🇮🇳", guj_Gujr: "🇮🇳", kan_Knda: "🇮🇳", mal_Mlym: "🇮🇳",
  pan_Guru: "🇮🇳", ory_Orya: "🇮🇳", asm_Beng: "🇮🇳", urd_Arab: "🇮🇳",
  eng_Latn: "🌐",
};

export default function LanguageSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGUAGES.find((l) => l.code === value);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-white/80 border-2 border-ocean/20 rounded-full pl-3 pr-4 py-2 text-sm font-medium text-ink shadow-sm hover:border-ocean/50 transition-colors"
      >
        <span className="text-lg leading-none">{FLAG_EMOJI[current?.code]}</span>
        <span>{current?.label}</span>
        <ChevronDown className={`w-4 h-4 text-ocean transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 bg-white/95 backdrop-blur-sm rounded-2xl border border-ocean/15 shadow-xl p-2 w-56 max-h-72 overflow-y-auto z-50"
          >
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => { onChange(l.code); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-left transition-colors ${
                  value === l.code ? "bg-ocean text-sand" : "hover:bg-sand-dark/60 text-ink"
                }`}
              >
                <span className="text-base leading-none">{FLAG_EMOJI[l.code]}</span>
                {l.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}