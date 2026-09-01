"use client";

import { useEffect, useRef, useState } from "react";

const STRETCHES = [
  {
    name: "Círculos de cuello",
    emoji: "🔄",
    duration: 30,
    color: { bg: "#eef4f0", border: "#a8c5b5", text: "#5a8070", accent: "#7c9e8a" },
    steps: [
      "Siéntate erguido con los hombros relajados.",
      "Inclina la cabeza suavemente hacia la derecha. Sostén 3 segundos.",
      "Lleva la barbilla al pecho. Sostén 3 segundos.",
      "Inclina hacia la izquierda. Sostén 3 segundos.",
      "Repite el ciclo lentamente, con la respiración.",
    ],
  },
  {
    name: "Apertura de hombros",
    emoji: "🦋",
    duration: 30,
    color: { bg: "#eef0f7", border: "#8b9dc3", text: "#4a5a8a", accent: "#8b9dc3" },
    steps: [
      "Entrelaza los dedos detrás de la nuca.",
      "Lleva los codos hacia atrás abriendo el pecho. Inhala.",
      "Sostén 5 segundos. Siente el estiramiento en el pecho.",
      "Exhala y suelta suavemente.",
      "Repite 3 veces a tu ritmo.",
    ],
  },
  {
    name: "Estiramiento de muñecas",
    emoji: "🤲",
    duration: 25,
    color: { bg: "#fdf0e6", border: "#c4956a", text: "#8a5a30", accent: "#c4956a" },
    steps: [
      "Extiende el brazo derecho al frente, palma hacia arriba.",
      "Con la mano izquierda, dobla suavemente los dedos hacia abajo.",
      "Sostén 10 segundos. Siente el estiramiento en el antebrazo.",
      "Ahora palma hacia abajo y repite.",
      "Cambia de brazo y repite.",
    ],
  },
  {
    name: "Torsión sentado",
    emoji: "🌀",
    duration: 35,
    color: { bg: "#f7eef7", border: "#b89dc3", text: "#6a4a8a", accent: "#b89dc3" },
    steps: [
      "Siéntate al borde de la silla, pies apoyados en el suelo.",
      "Coloca la mano derecha en la rodilla izquierda.",
      "Gira el torso suavemente hacia la izquierda. Inhala.",
      "Sostén 15 segundos mirando por encima del hombro.",
      "Exhala, centra y repite hacia el lado derecho.",
    ],
  },
];

interface Props {
  onClose: () => void;
}

export default function StretchGuide({ onClose }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [countdown, setCountdown] = useState(STRETCHES[0].duration);
  const [instrIndex, setInstrIndex] = useState(0);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countRef = useRef(STRETCHES[0].duration);
  const stepRef = useRef(0);
  const instrRef = useRef(0);

  useEffect(() => {
    // Cycle instruction text every few seconds
    const instrInterval = setInterval(() => {
      instrRef.current = (instrRef.current + 1) % STRETCHES[stepRef.current].steps.length;
      setInstrIndex(instrRef.current);
    }, 6000);

    intervalRef.current = setInterval(() => {
      countRef.current -= 1;
      if (countRef.current <= 0) {
        const next = stepRef.current + 1;
        if (next >= STRETCHES.length) {
          clearInterval(intervalRef.current!);
          clearInterval(instrInterval);
          setDone(true);
          return;
        }
        stepRef.current = next;
        countRef.current = STRETCHES[next].duration;
        instrRef.current = 0;
        setStepIndex(next);
        setInstrIndex(0);
      }
      setCountdown(countRef.current);
    }, 1000);

    return () => {
      clearInterval(intervalRef.current!);
      clearInterval(instrInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = STRETCHES[stepIndex];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#f5f0eb]/96 backdrop-blur-sm px-6">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-[#a89f97] hover:text-[#3d3530] transition-colors text-sm"
        aria-label="Cerrar estiramiento"
      >
        ✕ Cerrar
      </button>

      <p className="text-[#a89f97] text-xs mb-6 tracking-widest uppercase font-semibold">
        🤸 Estiramiento Rápido · {stepIndex + 1} de {STRETCHES.length}
      </p>

      {/* Step dots */}
      <div className="flex gap-2 mb-6">
        {STRETCHES.map((s, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor:
                i < stepIndex ? "#7c9e8a" : i === stepIndex ? s.color.accent : "#e2d9d0",
            }}
          />
        ))}
      </div>

      {!done ? (
        <>
          <div
            className="w-full max-w-sm rounded-2xl border p-6 shadow-sm mb-5"
            style={{ backgroundColor: current.color.bg, borderColor: current.color.border }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{current.emoji}</span>
              <h2 className="text-base font-semibold" style={{ color: current.color.text }}>
                {current.name}
              </h2>
            </div>

            {/* Cycling instruction */}
            <div className="min-h-[60px] flex items-center">
              <p className="text-sm text-[#7a6f68] leading-relaxed transition-opacity duration-500">
                {instrIndex + 1}. {current.steps[instrIndex]}
              </p>
            </div>

            {/* All steps preview */}
            <div className="mt-4 flex flex-col gap-1">
              {current.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span
                    className="text-xs font-semibold mt-0.5 flex-shrink-0"
                    style={{ color: i === instrIndex ? current.color.accent : "#c4b8af" }}
                  >
                    {i + 1}.
                  </span>
                  <span
                    className="text-xs leading-relaxed"
                    style={{ color: i === instrIndex ? "#5a504a" : "#c4b8af" }}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-2">
            <div
              className="w-12 h-12 rounded-full border-2 flex items-center justify-center"
              style={{ borderColor: current.color.accent, backgroundColor: current.color.bg }}
            >
              <span className="font-semibold text-lg" style={{ color: current.color.text }}>
                {countdown}
              </span>
            </div>
            <span className="text-[#a89f97] text-sm">segundos</span>
          </div>
        </>
      ) : (
        <div className="text-center max-w-xs">
          <span className="text-5xl block mb-4">🌸</span>
          <h2 className="text-[#3d3530] text-xl font-light mb-3">
            ¡Muy bien!
          </h2>
          <p className="text-[#7a6f68] text-sm leading-relaxed mb-6">
            Has movido y liberado tu cuerpo. Unos minutos de movimiento consciente marcan una gran diferencia.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#7c9e8a] text-white text-sm hover:bg-[#5a8070] transition-colors"
          >
            Volver al chat
          </button>
        </div>
      )}

      <p className="text-[#c4b8af] text-xs mt-6 max-w-xs text-center leading-relaxed">
        Muévete con suavidad. Para si sientes dolor.
      </p>
    </div>
  );
}
