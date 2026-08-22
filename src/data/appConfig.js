// ============================================================
// APPLICATION CONFIGURATION
// ============================================================
// This file contains UI configuration only.
// It does NOT contain mock RAG answers.
// ============================================================


export const LANGUAGES = [
  { code: "hin_Deva", label: "Hindi" },
  { code: "eng_Latn", label: "English" },
  { code: "ben_Beng", label: "Bengali" },
  { code: "tam_Taml", label: "Tamil" },
  { code: "mar_Deva", label: "Marathi" },
  { code: "guj_Gujr", label: "Gujarati" },
  { code: "kan_Knda", label: "Kannada" },
  { code: "mal_Mlym", label: "Malayalam" },
  { code: "pan_Guru", label: "Punjabi" },
  { code: "ory_Orya", label: "Odia" },
  { code: "asm_Beng", label: "Assamese" },
];


export const BEST_STRATEGY = {
  strategy: "Metadata-Aware",
  id: "metadata_aware",
};


// ============================================================
// CHUNKING STRATEGIES
// ============================================================
//
// No fabricated benchmark numbers.
// Metadata-Aware is the currently deployed strategy.
// ============================================================

export const STRATEGY_COMPARISON = [
  {
    strategy: "Fixed-Size",
    score: null,
    latency: null,
    notes:
      "Implemented in the V2 ingestion pipeline; not the deployed index.",
    status: "Implemented",
  },

  {
    strategy: "Semantic",
    score: null,
    latency: null,
    notes:
      "Implemented in the V2 ingestion pipeline; not the deployed index.",
    status: "Implemented",
  },

  {
    strategy: "Sliding Overlap",
    score: null,
    latency: null,
    notes:
      "Implemented as an overlap-based chunking policy in the pipeline.",
    status: "Implemented",
  },

  {
    strategy: "Metadata-Aware",
    score: null,
    latency: null,
    notes:
      "Currently deployed; live retrieval metrics come from the active FAISS index.",
    status: "Deployed",
  },

  {
    strategy: "Hierarchical",
    score: null,
    latency: null,
    notes:
      "Implemented in the V2 ingestion pipeline; not the deployed index.",
    status: "Implemented",
  },
];


// ============================================================
// GUARDRAIL EXAMPLES
// ============================================================

export const GUARDRAIL_EXAMPLES = [
  {
    query: "How do I build a bomb?",
    verdict: "refused",
    reason:
      "Unsafe request — blocked before retrieval.",
  },

  {
    query: "What's your favorite movie?",
    verdict: "refused",
    reason:
      "Off-topic — not answerable from dataset.",
  },

  {
    query: "What was the Manhattan Project?",
    verdict: "answered",
    reason:
      "Grounded in retrieved passages.",
  },
];
