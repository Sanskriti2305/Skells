import { useState } from "react";

import TabSwitcher from "./components/TabSwitcher";
import WaveDivider from "./components/WaveDivider";
import SpeakButton from "./components/SpeakButton";
import LanguageSelector from "./components/LanguageSelector";
import StrategySelector from "./components/StrategySelector";
import ChatThread from "./components/ChatThread";
import EvalDashboard from "./components/EvalDashboard";
import FloatingDecor from "./components/FloatingDecor";
import BrandBadge from "./components/BrandBadge";
import VideoBackground from "./components/VideoBackground";

import {
  queryRAG,
  transcribeAudio,
} from "./api";

import { BEST_STRATEGY } from "./data/appConfig";

/* ==========================================================
   SUGGESTED QUESTIONS

   These are questions selected from topics that exist
   in the multilingual RAG corpus.

   The selected UI language is used when the question
   is actually submitted to the backend.
   ========================================================== */

const SUGGESTED_QUESTIONS = [
  {
    id: "manhattan_project",
    question: "What was the Manhattan Project?",
  },
  {
    id: "phloem",
    question:
      "What is phloem and what does it transport?",
  },
  {
    id: "class_ring",
    question: "What is a class ring?",
  },
  {
    id: "alabama_capital",
    question:
      "What is the capital of Alabama?",
  },
  {
    id: "manhattan_project2",
    question:
      "What was the main purpose of the Manhattan Project's Hanford site?",
  },
  {
    id: "out_of_scope",
    question:
      "What is the recipe for making chocolate cake?",
  },
];


export default function App() {

  const [tab, setTab] =
    useState("ask");

  const [language, setLanguage] =
    useState("hin_Deva");

  const [messages, setMessages] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [textQuery, setTextQuery] =
    useState("");

  const [evaluation, setEvaluation] =
    useState({
      queries: 0,
      successful: 0,
      grounded: 0,
      totalLatency: 0,
      latencies: [],
      languages: new Set(),
      scores: [],
    });


  // ==========================================================
  // RUN RAG
  // ==========================================================

  const runRAG = async (
    query,
    selectedLanguage = language
  ) => {

    if (!query?.trim() || loading) {
      return;
    }

    setLoading(true);

    try {

      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          text: query.trim(),
        },
      ]);


      const data =
        await queryRAG({
          query: query.trim(),
          language: selectedLanguage,
          strategy:
            BEST_STRATEGY.strategy,
        });


      const scores =
        (data.sources || [])
          .map((s) => s.score)
          .filter(
            (s) =>
              typeof s === "number"
          );


      setEvaluation((prev) => ({
        queries:
          prev.queries + 1,

        successful:
          prev.successful +
          (data.answer ? 1 : 0),

        grounded:
          prev.grounded +
          (data.grounded ? 1 : 0),

        totalLatency:
          prev.totalLatency +
          (data.latency || 0),

        latencies: [
          ...prev.latencies,
          ...(typeof data.latency === "number"
            ? [data.latency]
            : []),
        ],

        languages:
          new Set([
            ...prev.languages,
            selectedLanguage,
          ]),

        scores: [
          ...prev.scores,
          ...scores,
        ],
      }));


      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          data: {
            ...data,
            sourceLanguage:
              selectedLanguage,
            demoMode: false,
          },
        },
      ]);

    } catch (error) {

      console.error(
        "RAG error:",
        error
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          data: {
            answer:
              "Sorry, I couldn't process that request. Please try again.",
            grounded: false,
            refused: false,
            isDemo: false,
            sources: [],
          },
        },
      ]);

    } finally {

      setLoading(false);

    }
  };


  // ==========================================================
  // MICROPHONE
  // ==========================================================

  const handleSpeakResult =
    async (audioBlob) => {

      if (!audioBlob || loading) {
        return;
      }

      setLoading(true);

      try {

        const {
          transcript,
          language:
            detectedLanguage,
        } =
          await transcribeAudio(
            audioBlob,
            language
          );


        setMessages((prev) => [
          ...prev,
          {
            role: "user",
            text: transcript,
          },
        ]);


        const data =
          await queryRAG({
            query: transcript,
            language:
              detectedLanguage ||
              language,
            strategy:
              BEST_STRATEGY.strategy,
          });


        const scores =
          (data.sources || [])
            .map((s) => s.score)
            .filter(
              (s) =>
                typeof s === "number"
            );


        setEvaluation(
          (prev) => ({
            queries:
              prev.queries + 1,

            successful:
              prev.successful +
              (data.answer
                ? 1
                : 0),

            grounded:
              prev.grounded +
              (data.grounded
                ? 1
                : 0),

            totalLatency:
              prev.totalLatency +
              (data.latency ||
                0),

            latencies: [
              ...prev.latencies,
              ...(typeof data.latency === "number"
                ? [data.latency]
                : []),
            ],

            languages:
              new Set([
                ...prev.languages,
                language,
              ]),

            scores: [
              ...prev.scores,
              ...scores,
            ],
          })
        );


        setMessages(
          (prev) => [
            ...prev,
            {
              role: "assistant",
              data: {
                ...data,
                sourceLanguage:
                  language,
                demoMode: false,
              },
            },
          ]
        );

      } catch (error) {

        console.error(
          "Voice RAG error:",
          error
        );

        setMessages(
          (prev) => [
            ...prev,
            {
              role: "assistant",
              data: {
                answer:
                  "Sorry, I couldn't process that request. Please try again.",
                grounded: false,
                refused: false,
                isDemo: false,
                sources: [],
              },
            },
          ]
        );

      } finally {

        setLoading(false);

      }
    };


  // ==========================================================
  // TEXT SUBMIT
  // ==========================================================

  const handleTextSubmit =
    async (e) => {

      e.preventDefault();

      const query =
        textQuery.trim();

      if (!query || loading) {
        return;
      }

      setTextQuery("");

      await runRAG(
        query,
        language
      );
    };


  // ==========================================================
  // SUGGESTED QUESTION
  // ==========================================================

  const handleSuggested =
    async (item) => {

      if (loading) {
        return;
      }

      /*
       * IMPORTANT:
       * Do NOT change the selected language here.
       *
       * The question is submitted using whatever
       * language the user has currently selected.
       */

      await runRAG(
        item.question,
        language
      );
    };


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="min-h-screen relative">

      <VideoBackground />

      <FloatingDecor />


      {/* ======================================================
          HEADER
          ====================================================== */}

      <header className="pt-12 md:pt-16 pb-4 text-center px-4 relative">

        <BrandBadge />

        <h1 className="font-display text-5xl md:text-7xl text-ocean font-semibold tracking-tight">
          SKELLS
        </h1>

        <p className="text-ink/50 mt-2 font-mono text-xs md:text-sm tracking-widest uppercase">
          speak · retrieve · answer
        </p>

        <p className="text-ocean/70 mt-1 font-mono text-[10px] md:text-xs tracking-wide font-medium">
          shell-powered voice RAG · built for HH Goa
        </p>

      </header>


      <WaveDivider />


      {/* ======================================================
          TABS
          ====================================================== */}

      <div className="my-6 px-4">

        <TabSwitcher
          active={tab}
          onChange={setTab}
        />

      </div>


      {/* ======================================================
          ASK TAB
          ====================================================== */}

      {tab === "ask" ? (

        <div className="px-4 pb-16">


          {/* ==================================================
              LANGUAGE + STRATEGY
              ================================================== */}

          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-7">

            <LanguageSelector
              value={language}
              onChange={setLanguage}
            />

            <StrategySelector />

          </div>


          {/* ==================================================
              TEXT INPUT
              ================================================== */}

          <form
            onSubmit={
              handleTextSubmit
            }
            className="max-w-2xl mx-auto mb-8"
          >

            <div className="flex gap-2 bg-white/80 border-2 border-ocean/15 rounded-2xl p-2 shadow-sm">

              <input
                value={textQuery}
                onChange={(e) =>
                  setTextQuery(
                    e.target.value
                  )
                }
                placeholder="Type your question..."
                disabled={loading}
                className="flex-1 bg-transparent outline-none px-3 py-2 font-mono text-sm text-ink placeholder:text-ink/40"
              />

              <button
                type="submit"
                disabled={
                  loading ||
                  !textQuery.trim()
                }
                className="px-5 py-2 rounded-xl bg-ocean text-white font-medium disabled:opacity-40"
              >
                Ask
              </button>

            </div>

          </form>


          {/* ==================================================
              SUGGESTED QUESTIONS
              ================================================== */}

          <section className="max-w-3xl mx-auto mb-10">

            <div className="text-center mb-4">

              <h2 className="font-display text-xl text-ocean">
                Try a question
              </h2>

              <p className="text-xs font-mono text-ink/45 mt-1">
                One-click questions for the demo
              </p>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

              {SUGGESTED_QUESTIONS.map(
                (item) => (

                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      handleSuggested(
                        item
                      )
                    }
                    disabled={loading}
                    className="text-left bg-white/75 border border-ocean/10 rounded-2xl px-4 py-3 hover:border-ocean/35 hover:bg-white transition-all disabled:opacity-50"
                  >

                    <span className="block text-[10px] uppercase tracking-wider font-mono text-ocean/60 mb-1">
                      Suggested
                    </span>

                    <span className="font-mono text-sm text-[#155e63]">
                      {item.question}
                    </span>

                  </button>

                )
              )}

            </div>

          </section>


          {/* ==================================================
              MICROPHONE
              ================================================== */}

          <SpeakButton
            onResult={
              handleSpeakResult
            }
            disabled={loading}
          />


          {/* ==================================================
              CHAT
              ================================================== */}

          <ChatThread
            messages={messages}
          />

        </div>

      ) : (

        /* ====================================================
           EVALUATION TAB
           ==================================================== */

        <div className="px-4 pb-16">

          <EvalDashboard
            evaluation={
              evaluation
            }
          />

        </div>

      )}


      <WaveDivider flip />

    </div>
  );
}