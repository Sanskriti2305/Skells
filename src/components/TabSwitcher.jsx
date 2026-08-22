import { motion } from "framer-motion";

export default function TabSwitcher({ active, onChange }) {
  const tabs = [
    { id: "ask", label: "Ask" },
    { id: "eval", label: "Eval Dashboard" },
  ];

  return (
    <div className="flex gap-2 bg-sand-dark/60 p-1.5 rounded-full w-fit mx-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className="relative px-6 py-2.5 rounded-full text-sm font-medium transition-colors"
        >
          {active === tab.id && (
            <motion.div
              layoutId="tab-pill"
              className="absolute inset-0 bg-ocean rounded-full"
              transition={{ type: "spring", duration: 0.5 }}
            />
          )}
          <span className={`relative z-10 ${active === tab.id ? "text-sand" : "text-ink/60"}`}>
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}