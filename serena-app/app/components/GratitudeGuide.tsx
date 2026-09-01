"use client";

import { useState } from "react";

const PROMPTS = [
  { question: "¿Qué es algo pequeño que te alegró hoy?", placeholder: "Un café rico, una canción, una sonrisa…" },
  { question: "¿A quién agradeces tener en tu vida?", placeholder: "Un amigo, familiar, colega…" },
  { question: "¿Qué parte de tu cuerpo funcionó bien hoy?", placeholder: "Mis piernas, mis manos, mi respiración…" },
  { question: "¿Qué aprendiste o descubriste hoy?", placeholder: "Algo nuevo, una reflexión, un insight…" },
  { question: "¿Qué fue un momento de calma o belleza hoy?", placeholder: "El cielo, el silencio, una planta, el sol…" },
];

interface Props {
  onClose: () => void;
}

export default function GratitudeGuide({ onClose }: Props) {
  const [answers, setAnswers] = useState<string[]>(Array(PROMPTS.length).fill(""));
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [currentInput, setCurrentInput] = useState("");

  const current = PROMPTS[step];

  const handleNext = () => {
    const filled = [...answers];
    filled[step] = currentInput.trim();
    setAnswers(filled);
    if (step + 1 >= PROMPTS.length) {
      setDone(true);
    } else {
      setStep((s) => s + 1);
      setCurrentInput(filled[step + 1] || "");
    }
  };

  const handleBack = () => {
    if (step === 0) return;
    const filled = [...answers];
    filled[step] = currentInput.trim();
    setAnswers(filled);
    setStep((s) => s - 1);
    setCurrentInput(filled[step - 1] || "");
  };

  const filledCount = answers.filter((a) => a.trim()).length + (currentInput.trim() ? 1 : 0);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#f5f0eb]/96 backdrop-blur-sm px-6">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-[#a89f97] hover:text-[#3d3530] transition-colors text-sm"
        aria-label="Cerrar diario de gratitud"
      >
        ✕ Cerrar
      </button>

      <p className="text-[#a89f97] text-xs mb-5 tracking-widest uppercase font-semibold">
        🌸 Diario de Gratitud · 5 reflexiones
      </p>

      {/* Step dots */}
      <div className="flex gap-2 mb-6">
        {PROMPTS.map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor:
                i < step
                  ? "#c4956a"
                  : i === step && !done
                  ? "#e8b87a"
                  : done
                  ? "#c4956a"
                  : "#e2d9d0",
            }}
          />
        ))}
      </div>

      {!done ? (
        <div className="w-full max-w-sm">
          {/* Question card */}
          <div className="rounded-2xl bg-[#fdf0e6] border border-[#e8b87a] p-5 mb-4 shadow-sm">
            <div className="flex items-start gap-2">
              <span className="text-xl mt-0.5">🌸</span>
              <p className="text-[#8a5a30] text-sm font-medium leading-relaxed">
                {current.question}
              </p>
            </div>
          </div>

          {/* Answer input */}
          <textarea
            autoFocus
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            placeholder={current.placeholder}
            rows={3}
            className="w-full resize-none bg-white border border-[#e2d9d0] rounded-xl px-4 py-3 text-sm text-[#3d3530] placeholder-[#c4b8af] focus:outline-none focus:border-[#e8b87a] transition-colors leading-relaxed mb-4"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && currentInput.trim()) {
                e.preventDefault();
                handleNext();
              }
            }}
          />

          {/* Navigation */}
          <div className="flex gap-3">
            {step > 0 && (
              <button
                onClick={handleBack}
                className="flex-1 py-2.5 rounded-xl text-sm text-[#a89f97] border border-[#e2d9d0] bg-white hover:border-[#c4b8af] transition-colors"
              >
                ← Anterior
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!currentInput.trim()}
              className="flex-1 py-2.5 rounded-xl text-sm text-white font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ backgroundColor: currentInput.trim() ? "#c4956a" : "#e2d9d0" }}
            >
              {step + 1 < PROMPTS.length ? "Siguiente →" : "Terminar ✓"}
            </button>
          </div>

          <p className="text-center text-[#c4b8af] text-xs mt-3">
            {step + 1} de {PROMPTS.length} · Escribe lo primero que venga a tu mente
          </p>
        </div>
      ) : (
        <div className="text-center max-w-xs">
          <span className="text-5xl block mb-4">🌺</span>
          <h2 className="text-[#3d3530] text-xl font-light mb-3">
            {filledCount} momentos de gratitud
          </h2>
          <p className="text-[#7a6f68] text-sm leading-relaxed mb-5">
            Reconocer lo bueno, aunque sea pequeño, recalibra el sistema nervioso. Hoy encontraste {filledCount}.
          </p>

          {/* Summary */}
          <div className="text-left mb-6 space-y-2">
            {answers.filter((a) => a.trim()).map((a, i) => (
              <div key={i} className="flex items-start gap-2 bg-[#fdf0e6] border border-[#f0d0a0] rounded-xl px-3 py-2">
                <span className="text-[#c4956a] text-xs mt-0.5">🌸</span>
                <span className="text-[#7a6050] text-xs leading-relaxed">{a}</span>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#c4956a] text-white text-sm hover:bg-[#a87050] transition-colors"
          >
            Volver al chat
          </button>
        </div>
      )}
    </div>
  );
}
