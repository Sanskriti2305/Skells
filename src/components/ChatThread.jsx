import { motion } from "framer-motion";
import AnswerBubble from "./AnswerBubble";
import {
  translateAnswer,
  speakAnswer,
} from "../api";
import { useState } from "react";

const TRANSLATION_LANGUAGES = [
  "Assamese",
  "Bengali",
  "Gujarati",
  "Hindi",
  "Kannada",
  "Malayalam",
  "Marathi",
  "Nepali",
  "Odia",
  "Punjabi",
  "Sanskrit",
  "Tamil",
  "English",
];

const TTS_LANGUAGES = [
  "Bengali",
  "Gujarati",
  "Hindi",
  "Kannada",
  "Malayalam",
  "Marathi",
  "Odia",
  "Punjabi",
  "Tamil",
  "English",
];

export default function ChatThread({
  messages,
}) {
  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto py-6">

      {messages.map((m, i) =>
        m.role === "user" ? (
          <motion.div
            key={i}
            initial={{
              opacity: 0,
              x: 20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            className="self-end max-w-[85%] md:max-w-md bg-ocean text-sand rounded-3xl rounded-tr-md px-5 py-3 font-mono text-sm"
          >
            {m.text}
          </motion.div>
        ) : (
          <div
            key={i}
            className="self-start w-full"
          >
            <AnswerBubble
              data={m.data}
            />

            <AnswerActions
              data={m.data}
            />
          </div>
        )
      )}
    </div>
  );
}


function AnswerActions({
  data,
}) {

  // ==========================================================
  // TRANSLATION LANGUAGE
  // ==========================================================

  const [targetLanguage, setTargetLanguage] =
    useState("English");

  // ==========================================================
  // TTS LANGUAGE
  // IMPORTANT: completely independent from translation language
  // ==========================================================

  const sourceLanguage =
    data?.sourceLanguage ||
    "Hindi";

  const defaultTTSLanguage =
    TTS_LANGUAGES.includes(
      sourceLanguage
    )
      ? sourceLanguage
      : "Hindi";

  const [ttsLanguage, setTtsLanguage] =
    useState(defaultTTSLanguage);


  const [translation, setTranslation] =
    useState("");

  const [translating, setTranslating] =
    useState(false);

  const [speaking, setSpeaking] =
    useState(false);

  const [audioUrl, setAudioUrl] =
    useState("");


  const answer =
    data?.answer || "";


  // ==========================================================
  // TRANSLATE
  // ==========================================================

  const handleTranslate =
    async () => {

      if (
        !answer ||
        translating
      ) {
        return;
      }

      setTranslating(true);

      try {

        const result =
          await translateAnswer({
            text: answer,
            sourceLanguage,
            targetLanguage,
          });

        setTranslation(result);

      } catch (error) {

        console.error(
          "Translation error:",
          error
        );

        setTranslation(
          "Translation failed. Please try again."
        );

      } finally {

        setTranslating(false);

      }
    };


  // ==========================================================
  // LISTEN
  //
  // TTS language is completely independent.
  //
  // If the displayed translation already matches the selected
  // TTS language, speak that translation directly.
  //
  // Otherwise, translate the original answer into the selected
  // TTS language first, then send that text to Sarvam TTS.
  // ==========================================================

  const handleSpeak =
    async () => {

      if (
        !answer ||
        speaking
      ) {
        return;
      }

      setSpeaking(true);

      try {

        let textToSpeak = answer;


        // ----------------------------------------------------
        // If we already translated the answer into exactly the
        // selected TTS language, use that translation.
        // ----------------------------------------------------

        if (
          translation &&
          targetLanguage === ttsLanguage
        ) {

          textToSpeak = translation;

        }

        // ----------------------------------------------------
        // Otherwise, if the source answer is already in the
        // selected TTS language, speak it directly.
        // ----------------------------------------------------

        else if (
          sourceLanguage === ttsLanguage
        ) {

          textToSpeak = answer;

        }

        // ----------------------------------------------------
        // Otherwise translate specifically for TTS.
        // This prevents situations like:
        //
        // Translation = Sanskrit
        // TTS = Marathi
        //
        // where Sanskrit text would incorrectly be sent to
        // Marathi TTS.
        // ----------------------------------------------------

        else {

          textToSpeak =
            await translateAnswer({
              text: answer,
              sourceLanguage,
              targetLanguage:
                ttsLanguage,
            });
        }


        const url =
          await speakAnswer({
            text: textToSpeak,
            language: ttsLanguage,
          });

        setAudioUrl(url);

      } catch (error) {

        console.error(
          "TTS error:",
          error
        );

      } finally {

        setSpeaking(false);

      }
    };


  return (
    <div className="mt-3 ml-1 max-w-2xl">

      <div className="flex flex-wrap items-center gap-2">


        {/* ==================================================
            TRANSLATION LANGUAGE
            Supports all 13 languages
            ================================================== */}

        <select
          value={targetLanguage}
          onChange={(e) =>
            setTargetLanguage(
              e.target.value
            )
          }
          className="bg-white/80 border border-ocean/15 rounded-xl px-3 py-2 text-xs font-mono text-ink outline-none"
        >

          {TRANSLATION_LANGUAGES.map(
            (lang) => (
              <option
                key={lang}
                value={lang}
              >
                {lang}
              </option>
            )
          )}

        </select>


        <button
          onClick={handleTranslate}
          disabled={
            translating ||
            !answer
          }
          className="px-3 py-2 rounded-xl bg-white/80 border border-ocean/15 text-xs font-mono text-ocean hover:border-ocean/40 disabled:opacity-50"
        >

          {translating
            ? "Translating..."
            : "Translate"}

        </button>


        {/* ==================================================
            TTS LANGUAGE
            ONLY Sarvam-supported TTS languages
            ================================================== */}

        <select
          value={ttsLanguage}
          onChange={(e) =>
            setTtsLanguage(
              e.target.value
            )
          }
          className="bg-white/80 border border-ocean/15 rounded-xl px-3 py-2 text-xs font-mono text-ink outline-none"
        >

          {TTS_LANGUAGES.map(
            (lang) => (
              <option
                key={lang}
                value={lang}
              >
                🔊 {lang}
              </option>
            )
          )}

        </select>


        {/* ==================================================
            LISTEN
            ================================================== */}

        <button
          onClick={handleSpeak}
          disabled={
            speaking ||
            !answer
          }
          className="px-3 py-2 rounded-xl bg-ocean text-white text-xs font-mono hover:opacity-90 disabled:opacity-50"
        >

          {speaking
            ? "Generating..."
            : "Listen"}

        </button>

      </div>


      {/* ======================================================
          TRANSLATED ANSWER
          ====================================================== */}

      {translation && (
        <div className="mt-3 bg-white/70 border border-ocean/10 rounded-2xl p-4">

          <p className="text-[10px] uppercase tracking-wider font-mono text-ocean/60 mb-2">
            {targetLanguage}
          </p>

          <p className="font-mono text-sm text-ink/80 leading-relaxed">
            {translation}
          </p>

        </div>
      )}


      {/* ======================================================
          AUDIO PLAYER
          ====================================================== */}

      {audioUrl && (
        <audio
          className="mt-3 w-full"
          controls
          autoPlay
          src={audioUrl}
        />
      )}

    </div>
  );
}