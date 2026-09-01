"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "inhale" | "hold-in" | "exhale" | "hold-out";

const BOX_SEQUENCE: { phase: Phase; label: string; duration: number }[] = [
  { phase: "inhale",   label: "Inhala",   duration: 4 },
  { phase: "hold-in",  label: "Sostén",   duration: 4 },
  { phase: "exhale",   label: "Exhala",   duration: 4 },
  { phase: "hold-out", label: "Pausa",    duration: 4 },
];

const FOUR_SEVEN_EIGHT: { phase: Phase; label: string; duration: number }[] = [
  { phase: "inhale",   label: "Inhala",   duration: 4 },
  { phase: "hold-in",  label: "Sostén",   duration: 7 },
  { phase: "exhale",   label: "Exhala",   duration: 8 },
];

const SCALE: Record<Phase, number> = {
  idle:       1,
  inhale:     1.35,
  "hold-in":  1.35,
  exhale:     1,
  "hold-out": 1,
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

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0d1117]/95 backdrop-blur-sm">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-[#8b949e] hover:text-[#e6edf3] transition-colors text-sm"
        aria-label="Cerrar respiración guiada"
      >
        ✕ Cerrar
      </button>

      <p className="text-[#8b949e] text-sm mb-10 tracking-widest uppercase">
        {technique === "box" ? "Respiración en Caja · 4-4-4-4" : "Respiración 4-7-8"}
      </p>

      {/* Animated ring */}
      <div className="relative flex items-center justify-center w-56 h-56 mb-10">
        {/* Outer glow ring */}
        <div
          className="absolute rounded-full border border-[#3fb950]/20 w-full h-full"
          style={{
            transform: `scale(${scale})`,
            transition: `transform ${current.duration * 0.9}s ease-in-out`,
          }}
        />
        {/* Middle ring */}
        <div
          className="absolute rounded-full border-2 border-[#3fb950]/50 w-4/5 h-4/5"
          style={{
            transform: `scale(${scale})`,
            transition: `transform ${current.duration * 0.9}s ease-in-out`,
          }}
        />
        {/* Core circle */}
        <div
          className="rounded-full bg-[#3fb950]/15 border border-[#3fb950]/40 w-24 h-24 flex flex-col items-center justify-center"
          style={{
            transform: `scale(${scale})`,
            transition: `transform ${current.duration * 0.9}s ease-in-out`,
          }}
        >
          <span className="text-[#3fb950] font-semibold text-lg leading-none">
            {countdown}
          </span>
        </div>
      </div>

      <p className="text-[#e6edf3] text-2xl font-light tracking-wide">
        {current.label}
      </p>
      <p className="text-[#8b949e] text-sm mt-2">{current.duration} segundos</p>

      <p className="text-[#8b949e] text-xs mt-10 max-w-xs text-center leading-relaxed">
        Sigue el ritmo del círculo. Deja que tu cuerpo encuentre su calma natural.
      </p>
    </div>
  );
}
