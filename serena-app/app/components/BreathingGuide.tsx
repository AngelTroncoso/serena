"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "inhale" | "hold-in" | "exhale" | "hold-out";

const BOX_SEQUENCE: { phase: Phase; label: string; duration: number }[] = [
  { phase: "inhale",   label: "Inhala",  duration: 4 },
  { phase: "hold-in",  label: "Sostén",  duration: 4 },
  { phase: "exhale",   label: "Exhala",  duration: 4 },
  { phase: "hold-out", label: "Pausa",   duration: 4 },
];

const FOUR_SEVEN_EIGHT: { phase: Phase; label: string; duration: number }[] = [
  { phase: "inhale",  label: "Inhala", duration: 4 },
  { phase: "hold-in", label: "Sostén", duration: 7 },
  { phase: "exhale",  label: "Exhala", duration: 8 },
];

const SCALE: Record<Phase, number> = {
  idle:       1,
  inhale:     1.35,
  "hold-in":  1.35,
  exhale:     1,
  "hold-out": 1,
};

// Soft pastel color per phase
const PHASE_COLOR: Record<Phase, { ring: string; core: string; text: string }> = {
  idle:       { ring: "#a8c5b5", core: "#eef4f0", text: "#5a8070" },
  inhale:     { ring: "#7c9e8a", core: "#d6ece2", text: "#3d6b55" },
  "hold-in":  { ring: "#8b9dc3", core: "#dde1f0", text: "#4a5a8a" },
  exhale:     { ring: "#c4956a", core: "#fde8d0", text: "#8a5a30" },
  "hold-out": { ring: "#a89f97", core: "#f0ebe4", text: "#5a5048" },
};

interface Props {
  technique: "box" | "478";
  onClose: () => void;
}

export default function BreathingGuide({ technique, onClose }: Props) {
  const sequence = technique === "box" ? BOX_SEQUENCE : FOUR_SEVEN_EIGHT;
  const [stepIndex, setStepIndex] = useState(0);
  const [countdown, setCountdown] = useState(sequence[0].duration);
  const [scale, setScale] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepRef = useRef(0);
  const countRef = useRef(sequence[0].duration);

  useEffect(() => {
    const step = sequence[0];
    setScale(SCALE[step.phase]);

    intervalRef.current = setInterval(() => {
      countRef.current -= 1;
      if (countRef.current <= 0) {
        stepRef.current = (stepRef.current + 1) % sequence.length;
        const next = sequence[stepRef.current];
        countRef.current = next.duration;
        setStepIndex(stepRef.current);
        setScale(SCALE[next.phase]);
      }
      setCountdown(countRef.current);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [technique]);

  const current = sequence[stepIndex];
  const colors = PHASE_COLOR[current.phase];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#f5f0eb]/95 backdrop-blur-sm">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-[#a89f97] hover:text-[#3d3530] transition-colors text-sm font-400"
        aria-label="Cerrar respiración guiada"
      >
        ✕ Cerrar
      </button>

      <p className="text-[#a89f97] text-xs mb-8 tracking-widest uppercase font-500">
        {technique === "box" ? "🌿 Respiración en Caja · 4-4-4-4" : "🌙 Respiración 4-7-8"}
      </p>

      {/* Animated ring */}
      <div className="relative flex items-center justify-center w-56 h-56 mb-10">
        {/* Outer glow ring */}
        <div
          className="absolute rounded-full w-full h-full border-2"
          style={{
            borderColor: colors.ring + "40",
            transform: `scale(${scale})`,
            transition: `transform ${current.duration * 0.9}s ease-in-out`,
          }}
        />
        {/* Middle ring */}
        <div
          className="absolute rounded-full w-4/5 h-4/5 border-2"
          style={{
            borderColor: colors.ring + "80",
            transform: `scale(${scale})`,
            transition: `transform ${current.duration * 0.9}s ease-in-out`,
          }}
        />
        {/* Core circle */}
        <div
          className="rounded-full w-24 h-24 flex flex-col items-center justify-center border-2 shadow-sm"
          style={{
            backgroundColor: colors.core,
            borderColor: colors.ring,
            transform: `scale(${scale})`,
            transition: `transform ${current.duration * 0.9}s ease-in-out`,
          }}
        >
          <span className="font-semibold text-2xl leading-none" style={{ color: colors.text }}>
            {countdown}
          </span>
        </div>
      </div>

      <p className="text-[#3d3530] text-2xl font-light tracking-wide">
        {current.label}
      </p>
      <p className="text-[#a89f97] text-sm mt-2 font-400">
        {current.duration} segundos
      </p>

      <p className="text-[#c4b8af] text-xs mt-10 max-w-xs text-center leading-relaxed font-300">
        Sigue el ritmo del círculo. Deja que tu cuerpo encuentre su calma natural.
      </p>
    </div>
  );
}
