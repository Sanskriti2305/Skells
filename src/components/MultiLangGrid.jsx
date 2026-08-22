import { motion } from "framer-motion";
import { LANGUAGES } from "../data/appConfig";

export default function MultiLangGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
      {LANGUAGES.map((l, i) => (
        <motion.div
          key={l.code}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-sand-dark/60 rounded-2xl px-4 py-3 border border-ocean/10"
        >
          <p className="text-[11px] font-mono uppercase tracking-wide text-ocean/60 mb-1">{l.label}</p>
          <p className="text-sm text-ink/80 leading-relaxed">
            {ANSWER_TRANSLATIONS[l.code] || ANSWER_TRANSLATIONS.eng_Latn}
          </p>
        </motion.div>
      ))}
    </div>
  );
}