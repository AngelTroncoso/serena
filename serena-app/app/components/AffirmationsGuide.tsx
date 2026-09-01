"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const AFFIRMATIONS = [
  { text: "Este momento difícil pasará. Soy más fuerte de lo que creo.", color: "#7c9e8a" },
  { text: "Merezco cuidarme y descansar sin culpa.", color: "#8b9dc3" },
  { text: "Puedo hacer una cosa a la vez. Eso es suficiente.", color: "#c4956a" },
  { text: "Mi cuerpo y mi mente trabajan juntos para sanarme.", color: "#b89dc3" },
  { text: "Suelto lo que no puedo controlar. Me enfoco en lo que sí puedo.", color: "#7c9e8a" },
  { text: "Soy humano/a. El error y la imperfección forman parte del camino.", color: "#8b9dc3" },
  { text: "Tengo todo lo que necesito en este momento.", color: "#c4956a" },
  { text: "Mis emociones son válidas. Las acojo sin dejar que me definan.", color: "#7c9e8a" },
  { text: "Respiro. Me calmo. Recomienzo.", color: "#8b9dc3" },
  { text: "Soy capaz de atravesar lo que siento con calma y presencia.", color: "#b89dc3" },
];

const CYCLE_SECONDS = 8;

interface Props {
  onClose: () => void;
}

export default function AffirmationsGuide({ onClose }: Props) {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const [manual, setManual] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);

  const goTo = useCallback(
    (next: number) => {
      setVisible(false);
      setTimeout(() => {
        setIndex(next);
        elapsedRef.current = 0;
        setProgress(0);
        setVisible(true);
      }, 350);
    },
    []
  );

  useEffect(() => {
    if (manual) return;
    tickRef.current = setInterval(() => {
      elapsedRef.current += 0.1;
      setProgress((elapsedRef.current / CYCLE_SECONDS) * 100);
      if (elapsedRef.current >= CYCLE_SECONDS) {
        elapsedRef.current = 0;
        goTo((index + 1) % AFFIRMATIONS.length);
      }
    }, 100);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [index, manual, goTo]);

  const current = AFFIRMATIONS[index];

  const handlePrev = () => {
    setManual(true);
    if (tickRef.current) clearInterval(tickRef.current);
    goTo((index - 1 + AFFIRMATIONS.length) % AFFIRMATIONS.length);
  };

  const handleNext = () => {
    setManual(true);
    if (tickRef.current) clearInterval(tickRef.current);
    goTo((index + 1) % AFFIRMATIONS.length);
  };

  const handleAuto = () => {
    setManual(false);
    elapsedRef.current = 0;
    setProgress(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#f5f0eb]/96 backdrop-blur-sm px-6">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-[#a89f97] hover:text-[#3d3530] transition-colors text-sm"
        aria-label="Cerrar afirmaciones"
      >
        ✕ Cerrar
      </button>

      <p className="text-[#a89f97] text-xs mb-8 tracking-widest uppercase font-semibold">
        💛 Afirmaciones de Calma
      </p>

      {/* Card */}
      <div className="w-full max-w-sm relative">
        <div
          className="rounded-3xl p-8 border-2 shadow-sm text-center min-h-[160px] flex items-center justify-center transition-opacity duration-300"
          style={{
            borderColor: current.color + "60",
            backgroundColor: current.color + "10",
            opacity: visible ? 1 : 0,
          }}
        >
          <p className="text-[#3d3530] text-lg font-light leading-relaxed">
            "{current.text}"
          </p>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 mt-5">
          {AFFIRMATIONS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setManual(true); if (tickRef.current) clearInterval(tickRef.current); goTo(i); }}
              className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{ backgroundColor: i === index ? current.color : "#e2d9d0" }}
            />
          ))}
        </div>
      </div>

      {/* Progress bar (auto mode) */}
      {!manual && (
        <div className="w-full max-w-xs h-0.5 bg-[#e2d9d0] rounded-full mt-6 overflow-hidden">
          <div
            className="h-full rounded-full transition-none"
            style={{ width: `${progress}%`, backgroundColor: current.color }}
          />
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={handlePrev}
          className="w-10 h-10 rounded-full bg-white border border-[#e2d9d0] text-[#7a6f68] hover:border-[#a8c5b5] hover:text-[#5a8070] transition-colors flex items-center justify-center text-lg"
        >
          ‹
        </button>
        {manual ? (
          <button
            onClick={handleAuto}
            className="text-xs text-[#a89f97] hover:text-[#7a6f68] transition-colors px-3 py-1.5 rounded-full border border-[#e2d9d0] hover:border-[#a8c5b5]"
          >
            ▶ Auto
          </button>
        ) : (
          <span className="text-xs text-[#c4b8af] w-16 text-center">
            Cambia solo
          </span>
        )}
        <button
          onClick={handleNext}
          className="w-10 h-10 rounded-full bg-white border border-[#e2d9d0] text-[#7a6f68] hover:border-[#a8c5b5] hover:text-[#5a8070] transition-colors flex items-center justify-center text-lg"
        >
          ›
        </button>
      </div>

      <p className="text-[#c4b8af] text-xs mt-8 max-w-xs text-center leading-relaxed">
        Lee cada frase despacio. Respira. Déjala aterrizar.
      </p>
    </div>
  );
}
