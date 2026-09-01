"use client";

import { useEffect, useRef, useState } from "react";

const STEPS = [
  {
    zone: "Cabeza y cuero cabelludo",
    emoji: "🧠",
    instruction:
      "Lleva tu atención a la parte alta de la cabeza. ¿Sientes tensión, hormigueo o calor? Sin juzgar, solo observa.",
    duration: 20,
  },
  {
    zone: "Rostro, cuello y hombros",
    emoji: "😮‍💨",
    instruction:
      "Relaja la mandíbula, suaviza el ceño. Deja caer los hombros. Con cada exhalación, libera un poco más la tensión acumulada.",
    duration: 25,
  },
  {
    zone: "Pecho y abdomen",
    emoji: "🫁",
    instruction:
      "Siente el ritmo de tu respiración. ¿Hay opresión o ligereza? Permítete respirar más profundo si lo necesitas.",
    duration: 25,
  },
  {
    zone: "Brazos y manos",
    emoji: "🤲",
    instruction:
      "Recorre desde los hombros hasta las yemas de los dedos. Nota el peso de tus brazos, el contacto con la superficie.",
    duration: 20,
  },
  {
    zone: "Piernas y pies",
    emoji: "🦶",
    instruction:
      "Siente el contacto de tus pies con el suelo. Recorre muslos, rodillas, pantorrillas. Deja que la tierra te sostenga.",
    duration: 25,
  },
];

interface Props {
  onClose: () => void;
}

export default function BodyScanGuide({ onClose }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [countdown, setCountdown] = useState(STEPS[0].duration);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countRef = useRef(STEPS[0].duration);
  const stepRef = useRef(0);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      countRef.current -= 1;
      if (countRef.current <= 0) {
        const next = stepRef.current + 1;
        if (next >= STEPS.length) {
          clearInterval(intervalRef.current!);
          setDone(true);
          return;
        }
        stepRef.current = next;
        countRef.current = STEPS[next].duration;
        setStepIndex(next);
      }
      setCountdown(countRef.current);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const current = STEPS[stepIndex];
  const progress = ((stepIndex) / STEPS.length) * 100 + ((STEPS[stepIndex].duration - countdown) / STEPS[stepIndex].duration) * (100 / STEPS.length);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#f5f0eb]/96 backdrop-blur-sm px-6">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-[#a89f97] hover:text-[#3d3530] transition-colors text-sm"
        aria-label="Cerrar escaneo corporal"
      >
        ✕ Cerrar
      </button>

      <p className="text-[#a89f97] text-xs mb-6 tracking-widest uppercase font-semibold">
        🧘 Escaneo Corporal · {stepIndex + 1} de {STEPS.length}
      </p>

      {/* Progress bar */}
      <div className="w-full max-w-xs h-1.5 bg-[#e2d9d0] rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-[#7c9e8a] rounded-full transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>

      {!done ? (
        <>
          {/* Zone card */}
          <div className="w-full max-w-sm bg-white border border-[#e2d9d0] rounded-2xl p-6 shadow-sm mb-6 text-center">
            <span className="text-4xl mb-3 block">{current.emoji}</span>
            <h2 className="text-[#3d3530] font-semibold text-lg mb-3">
              {current.zone}
            </h2>
            <p className="text-[#7a6f68] text-sm leading-relaxed">
              {current.instruction}
            </p>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[#eef4f0] border-2 border-[#a8c5b5] flex items-center justify-center">
              <span className="text-[#5a8070] font-semibold text-lg">{countdown}</span>
            </div>
            <span className="text-[#a89f97] text-sm">segundos</span>
          </div>
        </>
      ) : (
        <div className="text-center max-w-xs">
          <span className="text-5xl block mb-4">✨</span>
          <h2 className="text-[#3d3530] text-xl font-light mb-3">
            Escaneo completado
          </h2>
          <p className="text-[#7a6f68] text-sm leading-relaxed mb-6">
            Has recorrido tu cuerpo con atención y presencia. Tómate un momento para notar cómo te sientes ahora.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#7c9e8a] text-white text-sm hover:bg-[#5a8070] transition-colors"
          >
            Volver al chat
          </button>
        </div>
      )}

      <p className="text-[#c4b8af] text-xs mt-8 max-w-xs text-center leading-relaxed">
        Escanea sin juzgar. Solo observa y deja ir.
      </p>
    </div>
  );
}
