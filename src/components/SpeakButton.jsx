import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Mic } from "lucide-react";

export default function SpeakButton({ onResult, disabled }) {
  const [listening, setListening] = useState(false);
  const [bars, setBars] = useState(Array(14).fill(6));
  const intervalRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    if (listening) {
      intervalRef.current = setInterval(() => {
        setBars(Array.from({ length: 14 }, () => 6 + Math.random() * 28));
      }, 120);
    } else {
      clearInterval(intervalRef.current);
      setBars(Array(14).fill(6));
    }
    return () => clearInterval(intervalRef.current);
  }, [listening]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.start();
      mediaRecorderRef.current = recorder;
      setListening(true);
    } catch (err) {
      console.warn("Mic access denied or unavailable, using demo mode:", err.message);
      setListening(true);
      mediaRecorderRef.current = null;
    }
  };

  const stopRecording = () => {
    setListening(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        onResult(blob);
      };
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    } else {
      onResult(null);
    }
  };

  const handleClick = () => {
    if (disabled) return;
    if (!listening) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex items-center justify-center w-36 h-36">
        {listening && (
          <>
            <span className="absolute inset-0 rounded-full bg-ocean-light animate-ripple" />
            <span className="absolute inset-0 rounded-full bg-ocean-light animate-ripple" style={{ animationDelay: "0.6s" }} />
          </>
        )}
        <motion.button
          onClick={handleClick}
          whileTap={{ scale: 0.92 }}
          className="relative z-10 w-32 h-32 rounded-full flex items-center justify-center shadow-lg"
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{ clipPath: "circle(50% at 50% 50%)", overflow: "hidden" }}
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              style={{ transform: "scale(1.5)", willChange: "transform" }}
            >
              <source src="/speak-bg.mp4" type="video/mp4" />
            </video>
          </div>
          <div className={`absolute inset-0 rounded-full transition-colors ${listening ? "bg-coral/25" : "bg-ocean/20"}`} />
          <Mic className="relative z-10 w-9 h-9 text-white drop-shadow-lg" />
        </motion.button>
      </div>

      <div className="flex items-end gap-1 h-10">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            animate={{ height: h }}
            transition={{ duration: 0.15 }}
            className="w-1.5 rounded-full bg-ocean-light"
            style={{ height: h }}
          />
        ))}
      </div>

      <p className="text-sm text-ink/50 font-mono">
        {listening ? "listening… tap to stop" : "tap to speak"}
      </p>
    </div>
  );
}