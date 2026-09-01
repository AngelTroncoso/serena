"use client";

import { useEffect, useRef, useState } from "react";

const SCENES = [
  {
    title: "El bosque tranquilo",
    emoji: "🌲",
    color: { bg: "#eef4f0", border: "#a8c5b5", text: "#5a8070", accent: "#7c9e8a" },
    duration: 120,
    script: [
      "Cierra los ojos. Respira profundo tres veces. Con cada exhalación, siente cómo tu cuerpo se asienta.",
      "Imagina que caminas por un sendero en un bosque de pinos. El aire huele a tierra húmeda y resina.",
      "Escuchas el suave crujido de hojas bajo tus pies. Pájaros cantan a lo lejos. Una brisa fresca roza tu piel.",
      "Encuentras un claro iluminado por rayos de sol que se filtran entre los árboles. Te sientas en la hierba suave.",
      "Sientes la tierra firme bajo ti. El sol calienta tu rostro. Todo está en calma. Tú estás a salvo aquí.",
      "Permanece en este lugar el tiempo que necesites. No hay prisa. Solo presencia.",
    ],
  },
  {
    title: "La orilla del mar",
    emoji: "🌊",
    color: { bg: "#eef0f7", border: "#8b9dc3", text: "#4a5a8a", accent: "#8b9dc3" },
    duration: 120,
    script: [
      "Cierra los ojos. Siente el peso de tu cuerpo y deja que cada músculo se relaje.",
      "Visualiza una playa tranquila al atardecer. El cielo es de tonos naranja, rosa y violeta.",
      "Sientes la arena tibia bajo tus pies descalzos. El suave oleaje llega hasta tus tobillos.",
      "Escuchas el ritmo constante de las olas. Inhala cuando el mar avanza. Exhala cuando retrocede.",
      "Cada ola que llega trae calma. Cada ola que se va se lleva la tensión consigo.",
      "Estás completamente seguro/a aquí. El mar te sostiene, el sol te abriga.",
    ],
  },
  {
    title: "La montaña interior",
    emoji: "🏔️",
    color: { bg: "#f0ebe4", border: "#c4b8af", text: "#7a6f68", accent: "#a89f97" },
    duration: 90,
    script: [
      "Siéntate en una postura cómoda. Imagina que eres una montaña: sólida, estable, inamovible.",
      "Las nubes pueden pasar por tus laderas. Las tormentas pueden rozarte. Pero tu base es firme.",
      "Tus pensamientos son como el clima: cambian, pasan, se van. Tú permaneces.",
      "Visualiza cómo la tormenta emocional se aleja poco a poco, dejando un cielo despejado.",
      "Respira desde ese lugar de solidez interior. Eres la montaña.",
    ],
  },
];

interface Props {
  onClose: () => void;
}

export default function VisualizationGuide({ onClose }: Props) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [scriptIndex, setScriptIndex] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [visible, setVisible] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countRef = useRef(0);
  const scriptRef = useRef(0);

  const scene = SCENES[sceneIndex];
  const secondsPerLine = Math.floor(scene.duration / scene.script.length);

  const start = () => {
    setStarted(true);
    setScriptIndex(0);
    scriptRef.current = 0;
    countRef.current = secondsPerLine;
    setCountdown(secondsPerLine);

    intervalRef.current = setInterval(() => {
      countRef.current -= 1;
      setCountdown(countRef.current);
      if (countRef.current <= 0) {
        const next = scriptRef.current + 1;
        if (next >= scene.script.length) {
          clearInterval(intervalRef.current!);
          setDone(true);
          return;
        }
        setVisible(false);
        setTimeout(() => {
          scriptRef.current = next;
          setScriptIndex(next);
          countRef.current = secondsPerLine;
          setCountdown(secondsPerLine);
          setVisible(true);
        }, 500);
      }
    }, 1000);
  };

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const selectScene = (i: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSceneIndex(i);
    setStarted(false);
    setDone(false);
    setScriptIndex(0);
    setVisible(true);
  };

  const progress = started && !done
    ? ((scriptIndex * secondsPerLine + (secondsPerLine - countdown)) / scene.duration) * 100
    : done ? 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#f5f0eb]/96 backdrop-blur-sm px-6">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-[#a89f97] hover:text-[#3d3530] transition-colors text-sm"
        aria-label="Cerrar visualización"
      >
        ✕ Cerrar
      </button>

      <p className="text-[#a89f97] text-xs mb-5 tracking-widest uppercase font-semibold">
        🌄 Visualización Guiada
      </p>

      {/* Scene selector */}
      {!started && !done && (
        <div className="flex gap-2 mb-6 flex-wrap justify-center">
          {SCENES.map((s, i) => (
            <button
              key={i}
              onClick={() => selectScene(i)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                i === sceneIndex
                  ? "border-[#a8c5b5] bg-[#eef4f0] text-[#5a8070]"
                  : "border-[#e2d9d0] bg-white text-[#a89f97] hover:border-[#a8c5b5]"
              }`}
            >
              {s.emoji} {s.title}
            </button>
          ))}
        </div>
      )}

      {/* Progress bar */}
      {started && (
        <div className="w-full max-w-xs h-1 bg-[#e2d9d0] rounded-full mb-6 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${progress}%`, backgroundColor: scene.color.accent }}
          />
        </div>
      )}

      {!done ? (
        <div className="w-full max-w-sm">
          <div
            className="rounded-2xl border p-6 shadow-sm text-center min-h-[140px] flex flex-col items-center justify-center"
            style={{ backgroundColor: scene.color.bg, borderColor: scene.color.border }}
          >
            {!started ? (
              <>
                <span className="text-5xl mb-3 block">{scene.emoji}</span>
                <h2 className="text-base font-semibold mb-2" style={{ color: scene.color.text }}>
                  {scene.title}
                </h2>
                <p className="text-xs text-[#a89f97]">
                  {scene.script.length} momentos · {scene.duration / 60} min aprox.
                </p>
              </>
            ) : (
              <p
                className="text-base font-light leading-relaxed transition-opacity duration-500"
                style={{ color: scene.color.text, opacity: visible ? 1 : 0 }}
              >
                {scene.script[scriptIndex]}
              </p>
            )}
          </div>

          {!started && (
            <button
              onClick={start}
              className="mt-5 w-full py-2.5 rounded-xl text-white text-sm font-medium transition-colors"
              style={{ backgroundColor: scene.color.accent }}
            >
              Comenzar visualización →
            </button>
          )}
        </div>
      ) : (
        <div className="text-center max-w-xs">
          <span className="text-5xl block mb-4">☀️</span>
          <h2 className="text-[#3d3530] text-xl font-light mb-3">Visualización completa</h2>
          <p className="text-[#7a6f68] text-sm leading-relaxed mb-6">
            Lleva esa imagen de calma contigo. Puedes volver a ella cuando lo necesites.
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
        Cierra los ojos si puedes. Déjate llevar por las imágenes.
      </p>
    </div>
  );
}
