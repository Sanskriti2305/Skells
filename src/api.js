import { Client } from "@gradio/client";

// ============================================================
// CONFIG
// ============================================================

const HF_SPACE =
  "https://violet2305-skells.hf.space";

let clientPromise = null;


// ============================================================
// LANGUAGE NORMALIZATION
// ============================================================

const LANGUAGE_MAP = {
  Assamese: "Assamese",
  Bengali: "Bengali",
  Gujarati: "Gujarati",
  Hindi: "Hindi",
  Kannada: "Kannada",
  Malayalam: "Malayalam",
  Marathi: "Marathi",
  Nepali: "Nepali",
  Odia: "Odia",
  Punjabi: "Punjabi",
  Sanskrit: "Sanskrit",
  Tamil: "Tamil",
  English: "English",

  asm_Beng: "Assamese",
  ben_Beng: "Bengali",
  guj_Gujr: "Gujarati",
  hin_Deva: "Hindi",
  kan_Knda: "Kannada",
  mal_Mlym: "Malayalam",
  mar_Deva: "Marathi",
  npi_Deva: "Nepali",
  ory_Orya: "Odia",
  pan_Guru: "Punjabi",
  san_Deva: "Sanskrit",
  tam_Taml: "Tamil",
  eng_Latn: "English",
};


function normalizeLanguage(language) {
  return (
    LANGUAGE_MAP[language] ||
    language ||
    "English"
  );
}


// ============================================================
// GRADIO CLIENT
// ============================================================

async function getClient() {

  if (!clientPromise) {
    clientPromise = Client.connect(HF_SPACE);
  }

  return clientPromise;
}


// ============================================================
// LATENCY STORAGE
// ============================================================

const latencyHistory = [];

export function getLatencyHistory() {
  return [...latencyHistory];
}

function recordLatency(latency) {

  if (
    typeof latency !== "number" ||
    !Number.isFinite(latency)
  ) {
    return;
  }

  latencyHistory.push(latency);

  if (latencyHistory.length > 200) {
    latencyHistory.shift();
  }
}


// ============================================================
// SOURCE PARSER
// ============================================================

function parseSources(sourceText) {
  if (!sourceText || typeof sourceText !== "string") {
    return [];
  }

  const blocks = sourceText
    .split(/\n\s*\n(?=Source\s+\d+)/i)
    .filter((block) => block.trim());

  return blocks.map((block, index) => {
    const scoreMatch = block.match(
      /(?:score|similarity)\s*[:=]\s*(-?\d+(?:\.\d+)?)/i
    );

    const languageMatch = block.match(
      /Source\s+\d+\s*\(([^)]+)\)/i
    );

    const score = scoreMatch
      ? Number(scoreMatch[1])
      : null;

    return {
      id: index + 1,
      text: block.trim(),

      // Actual FAISS retrieval score
      score,

      // Compatibility with SourceCard
      similarity: score,

      language: languageMatch
        ? languageMatch[1]
        : "Unknown",
    };
  });
}


// ============================================================
// RAG QUERY
// ============================================================

export async function queryRAG({
  query,
  language,
  strategy,
}) {

  if (
    !query ||
    !query.trim()
  ) {
    throw new Error(
      "No query provided."
    );
  }

  const client =
    await getClient();

  console.log(
    "Sending query to HF RAG:",
    query
  );

  // ----------------------------------------------------------
  // CLIENT END-TO-END LATENCY
  // ----------------------------------------------------------

  const startedAt =
    performance.now();

  const result =
    await client.predict(
      "/query",
      [
        query.trim(),
      ]
    );

  const endToEndLatency =
    performance.now() -
    startedAt;


  // ----------------------------------------------------------
  // GRADIO RESPONSE
  //
  // [answer, sources]
  // ----------------------------------------------------------

  const answer =
    result?.data?.[0] ||
    "";

  let sourceText =
    result?.data?.[1] ||
    "";


  // ----------------------------------------------------------
  // SERVER RAG LATENCY
  //
  // app.py appends:
  //
  // __RAG_SERVER_LATENCY_MS__:123.45
  // ----------------------------------------------------------

  const latencyMatch =
    sourceText.match(
      /__RAG_SERVER_LATENCY_MS__:(\d+(?:\.\d+)?)/
    );

  const serverLatency =
    latencyMatch
      ? Number(latencyMatch[1])
      : endToEndLatency;


  // ----------------------------------------------------------
  // REMOVE INTERNAL MARKER
  // ----------------------------------------------------------

  sourceText =
    sourceText.replace(
      /\n\n__RAG_SERVER_LATENCY_MS__:\d+(?:\.\d+)?\s*$/,
      ""
    );


  // ----------------------------------------------------------
  // RECORD REAL SERVER LATENCY
  // ----------------------------------------------------------

  recordLatency(
    serverLatency
  );


  console.log(
    `RAG processing latency: ${serverLatency.toFixed(2)} ms`
  );

  console.log(
    `End-to-end request latency: ${endToEndLatency.toFixed(2)} ms`
  );


  // ----------------------------------------------------------
  // PARSE RETRIEVED SOURCES
  // ----------------------------------------------------------

  const sources =
    parseSources(
      sourceText
    );

  console.log(
    "RAW SOURCE TEXT:",
    sourceText
  );

  console.log(
    "PARSED SOURCE SCORES:",
    sources.map((s) => ({
      score: s.score,
      similarity: s.similarity,
    }))
  );

  console.log(
    "Retrieved sources:",
    sources.length
  );


  // ----------------------------------------------------------
  // RETURN
  // ----------------------------------------------------------

  return {

    answer,

    grounded:
      sources.length > 0,

    refused:
      false,

    strategy:
      strategy ||
      "metadata_aware",

    language:
      normalizeLanguage(
        language
      ),

    sources,

    // IMPORTANT:
    // This is server-side RAG processing latency,
    // NOT browser/network latency.
    latency:
      serverLatency,

    endToEndLatency,

    isDemo:
      false,
  };
}


// ============================================================
// TRANSLATION
// ============================================================

export async function translateAnswer({
  text,
  sourceLanguage,
  targetLanguage,
}) {

  if (
    !text ||
    !text.trim()
  ) {
    throw new Error(
      "No text provided for translation."
    );
  }

  const client =
    await getClient();

  const source =
    normalizeLanguage(
      sourceLanguage
    );

  const target =
    normalizeLanguage(
      targetLanguage
    );

  console.log(
    `Translating ${source} → ${target}`
  );

  const result =
    await client.predict(
      "/translate",
      [
        text.trim(),
        source,
        target,
      ]
    );

  const translated =
    result?.data?.[0] ||
    "";

  if (!translated) {
    throw new Error(
      "Translation returned an empty response."
    );
  }

  return translated;
}


// ============================================================
// TEXT TO SPEECH
// ============================================================

export async function speakAnswer({
  text,
  language,
}) {

  if (
    !text ||
    !text.trim()
  ) {
    throw new Error(
      "No text provided for speech."
    );
  }

  const client =
    await getClient();

  const ttsLanguage =
    normalizeLanguage(
      language
    );

  console.log(
    "Generating speech:",
    ttsLanguage
  );

  const result =
    await client.predict(
      "/speak",
      [
        text.trim(),
        ttsLanguage,
      ]
    );

  const audio =
    result?.data?.[0];

  if (!audio) {
    throw new Error(
      "TTS returned no audio."
    );
  }

  return audio;
}


// ============================================================
// SPEECH TO TEXT
// ============================================================
//
// Supports BOTH:
//
// transcribeAudio(audioBlob, language)
//
// and:
//
// transcribeAudio({
//   audio: audioBlob,
//   language
// })
//
// This keeps compatibility with your existing App.jsx.
// ============================================================

export async function transcribeAudio(
  audioOrOptions,
  languageArg
) {

  let audio;
  let language;

  if (
    audioOrOptions &&
    typeof audioOrOptions === "object" &&
    "audio" in audioOrOptions
  ) {
    audio =
      audioOrOptions.audio;

    language =
      audioOrOptions.language;
  } else {
    audio =
      audioOrOptions;

    language =
      languageArg;
  }

  if (!audio) {
    throw new Error(
      "No audio provided."
    );
  }

  const client =
    await getClient();

  const selectedLanguage =
    normalizeLanguage(
      language
    );

  console.log(
    "Transcribing:",
    selectedLanguage
  );

  const result =
    await client.predict(
      "/transcribe",
      [
        audio,
        selectedLanguage,
      ]
    );

  const transcript =
    result?.data?.[0] ||
    "";

  const detectedLanguage =
    result?.data?.[1] ||
    selectedLanguage;

  return {
    transcript,
    detectedLanguage,
  };
}


// ============================================================
// LATENCY HELPERS
// ============================================================

export function calculatePercentile(
  values,
  percentile
) {

  if (
    !Array.isArray(values) ||
    values.length === 0
  ) {
    return null;
  }

  const sorted =
    values
      .filter(
        (value) =>
          typeof value === "number" &&
          Number.isFinite(value)
      )
      .sort(
        (a, b) => a - b
      );

  if (
    sorted.length === 0
  ) {
    return null;
  }

  const index =
    (sorted.length - 1) *
    percentile;

  const lower =
    Math.floor(index);

  const upper =
    Math.ceil(index);

  if (
    lower === upper
  ) {
    return sorted[lower];
  }

  return (
    sorted[lower] +
    (
      sorted[upper] -
      sorted[lower]
    ) *
    (
      index - lower
    )
  );
}


export function getLatencyStats(
  values = latencyHistory
) {

  return {
    p50:
      calculatePercentile(
        values,
        0.50
      ),

    p70:
      calculatePercentile(
        values,
        0.70
      ),

    p100:
      calculatePercentile(
        values,
        1.00
      ),
  };
}