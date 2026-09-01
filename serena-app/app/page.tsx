"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AffirmationsGuide from "./components/AffirmationsGuide";
import BodyScanGuide from "./components/BodyScanGuide";
import BreathingGuide from "./components/BreathingGuide";
import ChatMessage, { TypingIndicator } from "./components/ChatMessage";
import GratitudeGuide from "./components/GratitudeGuide";
import GroundingGuide from "./components/GroundingGuide";
import StretchGuide from "./components/StretchGuide";
import VisualizationGuide from "./components/VisualizationGuide";
import VoiceButton from "./components/VoiceButton";

interface Message {
  role: "user" | "model";
  parts: string;
  id: string;
}

const WELCOME: Message = {
  role: "model",
  parts:
    "Hola, soy Serena 🌿 Estoy aquí contigo. ¿Cómo te sientes en este momento? Del 1 al 10, ¿qué nivel de tensión sientes en tu cuerpo ahora mismo?",
  id: "welcome",
};

type BreathTechnique = "box" | "478";
type Tool = "breath-box" | "breath-478" | "body-scan" | "grounding" | "affirmations" | "stretch" | "visualization" | "gratitude" | null;

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

const TOOLS: {
  id: Tool;
  label: string;
  emoji: string;
  title: string;
  colorClass: string;
  activeClass: string;
}[] = [
  {
    id: "breath-box",
    label: "Respiración Caja",
    emoji: "🌿",
    title: "Respiración en caja 4-4-4-4",
    colorClass: "bg-[#eef4f0] border-[#a8c5b5] text-[#5a8070]",
    activeClass: "bg-[#d6ece2] border-[#7c9e8a] text-[#3d6b55]",
  },
  {
    id: "breath-478",
    label: "Respiración 4-7-8",
    emoji: "🌙",
    title: "Respiración 4-7-8 para calmar el sistema nervioso",
    colorClass: "bg-[#eef0f7] border-[#8b9dc3] text-[#5a6a9e]",
    activeClass: "bg-[#dde1f0] border-[#5a6a9e] text-[#3a4a7e]",
  },
  {
    id: "body-scan",
    label: "Escaneo Corporal",
    emoji: "🧘",
    title: "Recorre tu cuerpo con atención plena",
    colorClass: "bg-[#f0ebe4] border-[#c4b8af] text-[#7a6f68]",
    activeClass: "bg-[#e2d4c6] border-[#a89f97] text-[#5a5048]",
  },
  {
    id: "grounding",
    label: "Anclaje 5-4-3-2-1",
    emoji: "🌍",
    title: "Técnica de anclaje sensorial",
    colorClass: "bg-[#fdf0e6] border-[#e8b87a] text-[#8a6030]",
    activeClass: "bg-[#f8dfc0] border-[#c4956a] text-[#6a4020]",
  },
  {
    id: "affirmations",
    label: "Afirmaciones",
    emoji: "💛",
    title: "Afirmaciones de calma y autocompasión",
    colorClass: "bg-[#fff9e6] border-[#e8cc7a] text-[#8a6a10]",
    activeClass: "bg-[#fff0b0] border-[#c4a030] text-[#6a5000]",
  },
  {
    id: "stretch",
    label: "Estiramientos",
    emoji: "🤸",
    title: "Estiramientos rápidos para liberar tensión",
    colorClass: "bg-[#f7eef7] border-[#b89dc3] text-[#6a4a8a]",
    activeClass: "bg-[#edd8ed] border-[#8b5a9e] text-[#4a2a6a]",
  },
  {
    id: "visualization",
    label: "Visualización",
    emoji: "🌄",
    title: "Viaje de visualización guiada para calmar la mente",
    colorClass: "bg-[#eef4f0] border-[#a8c5b5] text-[#5a8070]",
    activeClass: "bg-[#d6ece2] border-[#7c9e8a] text-[#3d6b55]",
  },
  {
    id: "gratitude",
    label: "Gratitud",
    emoji: "🌸",
    title: "Diario rápido de gratitud para reconectar con lo positivo",
    colorClass: "bg-[#fdf0e6] border-[#e8b87a] text-[#8a5a30]",
    activeClass: "bg-[#f8dfc0] border-[#c4956a] text-[#6a4020]",
  },
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTool, setActiveTool] = useState<Tool>(null);
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [streamingText, setStreamingText] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setVoiceSupported(!!SpeechRecognition);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText, loading]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: Message = {
        role: "user",
        parts: trimmed,
        id: `user-${Date.now()}`,
      };

      const updated = [...messages, userMsg];
      setMessages(updated);
      setInput("");
      setLoading(true);
      setStreamingText("");

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updated.map((m) => ({ role: m.role, parts: m.parts })),
          }),
        });

        if (!res.ok || !res.body) {
          throw new Error("Error en la respuesta del servidor.");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        setLoading(false);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setStreamingText(accumulated);
        }

        const modelMsg: Message = {
          role: "model",
          parts: accumulated,
          id: `model-${Date.now()}`,
        };

        setMessages((prev) => [...prev, modelMsg]);
        setStreamingText("");
      } catch {
        setLoading(false);
        setStreamingText("");
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            parts:
              "Lo siento, algo salió mal. Por favor intenta de nuevo en un momento 🌿",
            id: `error-${Date.now()}`,
          },
        ]);
      }
    },
    [messages, loading]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const toggleVoice = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      sendMessage(transcript);
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening, sendMessage]);

  // Derive breathing technique for BreathingGuide
  const breathTechnique: BreathTechnique | null =
    activeTool === "breath-box" ? "box" : activeTool === "breath-478" ? "478" : null;

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      {/* Header */}
      <header className="border-b border-[#e2d9d0] bg-white/60 backdrop-blur-sm flex-shrink-0">
        {/* Top row: identity */}
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#eef4f0] border border-[#a8c5b5] flex items-center justify-center shadow-sm flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C7 2 3 7 3 12c0 3.5 2 6.5 5 8l1-3c-1.5-1-2.5-2.8-2.5-5 0-3.3 2.7-6 6-6s6 2.7 6 6c0 2.2-1 4-2.5 5l1 3c3-1.5 5-4.5 5-8 0-5-4-10-9-10z" fill="#7c9e8a"/>
                <path d="M12 8v8M9 13l3 3 3-3" stroke="#5a8070" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h1 className="text-[#3d3530] text-sm font-semibold leading-none">Serena</h1>
              <p className="text-[#a89f97] text-xs mt-0.5">Tu espacio de calma · Siempre presente</p>
            </div>
          </div>
          <span className="text-[#c4b8af] text-xs hidden sm:block">Recursos →</span>
        </div>

        {/* Tools grid — 4 per row, wraps to 2 rows */}
        <div className="grid grid-cols-4 gap-1.5 px-3 pb-3">
          {TOOLS.map((tool) => {
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(isActive ? null : tool.id)}
                title={tool.title}
                className={`flex flex-col items-center gap-0.5 text-xs px-2 py-2 rounded-xl border transition-all duration-200 font-medium ${
                  isActive ? tool.activeClass : tool.colorClass + " hover:opacity-80"
                }`}
              >
                <span className="text-base leading-none">{tool.emoji}</span>
                <span className="text-center leading-tight" style={{ fontSize: "10px" }}>{tool.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {streamingText && (
          <ChatMessage
            message={{ role: "model", parts: streamingText, id: "streaming" }}
          />
        )}

        {loading && !streamingText && <TypingIndicator />}

        <div ref={bottomRef} />
      </main>

      {/* Input area */}
      <footer className="border-t border-[#e2d9d0] bg-white/60 backdrop-blur-sm px-4 py-3 flex-shrink-0">
        <div className="flex items-end gap-2">
          <VoiceButton
            listening={listening}
            supported={voiceSupported}
            onClick={toggleVoice}
          />

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Escríbeme cómo te sientes…"
              rows={1}
              disabled={loading}
              className="w-full resize-none bg-[#faf7f4] border border-[#e2d9d0] rounded-2xl px-4 py-3 text-sm text-[#3d3530] placeholder-[#c4b8af] focus:outline-none focus:border-[#a8c5b5] focus:bg-white transition-all disabled:opacity-50 leading-relaxed shadow-sm"
              style={{ minHeight: "44px", maxHeight: "120px" }}
            />
          </div>

          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            aria-label="Enviar mensaje"
            className="flex-shrink-0 w-10 h-10 rounded-full bg-[#7c9e8a] flex items-center justify-center text-white hover:bg-[#5a8070] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405z" />
            </svg>
          </button>
        </div>

        <p className="text-center text-[#c4b8af] text-xs mt-2">
          Serena orienta, no prescribe médicamente. En crisis, contacta servicios de emergencia.
        </p>
      </footer>

      {/* Tool overlays */}
      {breathTechnique && (
        <BreathingGuide
          technique={breathTechnique}
          onClose={() => setActiveTool(null)}
        />
      )}
      {activeTool === "body-scan" && (
        <BodyScanGuide onClose={() => setActiveTool(null)} />
      )}
      {activeTool === "grounding" && (
        <GroundingGuide onClose={() => setActiveTool(null)} />
      )}
      {activeTool === "affirmations" && (
        <AffirmationsGuide onClose={() => setActiveTool(null)} />
      )}
      {activeTool === "stretch" && (
        <StretchGuide onClose={() => setActiveTool(null)} />
      )}
      {activeTool === "visualization" && (
        <VisualizationGuide onClose={() => setActiveTool(null)} />
      )}
      {activeTool === "gratitude" && (
        <GratitudeGuide onClose={() => setActiveTool(null)} />
      )}
    </div>
  );
}
