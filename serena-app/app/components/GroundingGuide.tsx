"use client";

import { useState } from "react";

const SENSES = [
  {
    count: 5,
    sense: "VES",
    emoji: "👁️",
    color: { bg: "#eef4f0", border: "#a8c5b5", text: "#5a8070", badge: "#7c9e8a" },
    prompt: "Nombra 5 cosas que puedes ver ahora mismo.",
    hint: "Una silla, una ventana, una planta, tus manos, un vaso…",
  },
  {
    count: 4,
    sense: "ESCUCHAS",
    emoji: "👂",
    color: { bg: "#eef0f7", border: "#8b9dc3", text: "#4a5a8a", badge: "#8b9dc3" },
    prompt: "Nombra 4 sonidos que puedes escuchar.",
    hint: "Tu respiración, el viento, pasos, el zumbido del equipo…",
  },
  {
    count: 3,
    sense: "PUEDES TOCAR",
    emoji: "🤚",
    color: { bg: "#fdf0e6", border: "#c4956a", text: "#8a5a30", badge: "#c4956a" },
    prompt: "Nombra 3 texturas que puedes sentir con tu cuerpo.",
    hint: "La ropa en tu piel, la silla bajo ti, la temperatura del aire…",
  },
  {
    count: 2,
    sense: "HUELES",
    emoji: "👃",
    color: { bg: "#f7eef7", border: "#b89dc3", text: "#6a4a8a", badge: "#b89dc3" },
    prompt: "Nombra 2 aromas que percibes (o que recuerdes).",
    hint: "Café, jabón, aire fresco, madera, tierra mojada…",
  },
  {
    count: 1,
    sense: "SABOREAS",
    emoji: "👅",
    color: { bg: "#fff4e6", border: "#e8b87a", text: "#8a6030", badge: "#e8b87a" },
    prompt: "Nombra 1 sabor que percibes en este momento.",
    hint: "El sabor actual de tu boca, agua, té, café…",
  },
];

interface Props {
  onClose: () => void;
}

export default function GroundingGuide({ onClose }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const current = SENSES[stepIndex];
  const remaining = current.count - items.length;

  const addItem = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    const next = [...items, trimmed];
    setItems(next);
    setInputValue("");

    if (next.length >= current.count) {
      setTimeout(() => {
        if (stepIndex + 1 >= SENSES.length) {
          setDone(true);
        } else {
          setStepIndex((s) => s + 1);
          setItems([]);
        }
      }, 600);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") addItem();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#f5f0eb]/96 backdrop-blur-sm px-6">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-[#a89f97] hover:text-[#3d3530] transition-colors text-sm"
        aria-label="Cerrar anclaje sensorial"
      >
        ✕ Cerrar
      </button>

      <p className="text-[#a89f97] text-xs mb-6 tracking-widest uppercase font-semibold">
        🌍 Anclaje Sensorial · Técnica 5-4-3-2-1
      </p>

      {/* Step dots */}
      <div className="flex gap-2 mb-8">
        {SENSES.map((s, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor:
                i < stepIndex
                  ? "#7c9e8a"
                  : i === stepIndex
                  ? s.color.badge
                  : "#e2d9d0",
            }}
          />
        ))}
      </div>

      {!done ? (
        <div className="w-full max-w-sm">
          {/* Sense card */}
          <div
            className="rounded-2xl p-5 border mb-5 text-center"
            style={{ backgroundColor: current.color.bg, borderColor: current.color.border }}
          >
            <span className="text-4xl block mb-2">{current.emoji}</span>
            <div
              className="inline-block text-white text-xs font-semibold px-3 py-1 rounded-full mb-3"
              style={{ backgroundColor: current.color.badge }}
            >
              {current.count} cosas que {current.sense}
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: current.color.text }}>
              {current.prompt}
            </p>
            <p className="text-xs text-[#a89f97]">{current.hint}</p>
          </div>

          {/* Items listed */}
          {items.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 justify-center">
              {items.map((item, i) => (
                <span
                  key={i}
                  className="text-xs px-3 py-1 rounded-full border font-medium"
                  style={{ backgroundColor: current.color.bg, borderColor: current.color.border, color: current.color.text }}
                >
                  ✓ {item}
                </span>
              ))}
            </div>
          )}

          {/* Input */}
          {remaining > 0 && (
            <div className="flex gap-2">
              <input
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKey}
                placeholder={`${remaining} más… Escribe y presiona Enter`}
                className="flex-1 bg-white border border-[#e2d9d0] rounded-xl px-4 py-2.5 text-sm text-[#3d3530] placeholder-[#c4b8af] focus:outline-none focus:border-[#a8c5b5] transition-colors"
              />
              <button
                onClick={addItem}
                className="px-4 py-2.5 rounded-xl text-sm text-white transition-colors"
                style={{ backgroundColor: current.color.badge }}
              >
                +
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center max-w-xs">
          <span className="text-5xl block mb-4">🌱</span>
          <h2 className="text-[#3d3530] text-xl font-light mb-3">
            Estás aquí, en este momento
          </h2>
          <p className="text-[#7a6f68] text-sm leading-relaxed mb-6">
            Has recorrido tus cinco sentidos. Eso es presencia plena. ¿Cómo se siente tu cuerpo ahora?
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#7c9e8a] text-white text-sm hover:bg-[#5a8070] transition-colors"
          >
            Volver al chat
          </button>
        </div>
      )}
    </div>
  );
}
