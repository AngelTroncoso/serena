"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import BreathingGuide from "./components/BreathingGuide";
import ChatMessage, { TypingIndicator } from "./components/ChatMessage";
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

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [breathing, setBreathing] = useState<BreathTechnique | null>(null);
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

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-[#e2d9d0] bg-white/60 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Avatar with SVG leaf */}
          <div className="w-10 h-10 rounded-full bg-[#eef4f0] border border-[#a8c5b5] flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C7 2 3 7 3 12c0 3.5 2 6.5 5 8l1-3c-1.5-1-2.5-2.8-2.5-5 0-3.3 2.7-6 6-6s6 2.7 6 6c0 2.2-1 4-2.5 5l1 3c3-1.5 5-4.5 5-8 0-5-4-10-9-10z" fill="#7c9e8a"/>
              <path d="M12 8v8M9 13l3 3 3-3" stroke="#5a8070" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 className="text-[#3d3530] text-sm font-700 leading-none tracking-wide">
              Serena
            </h1>
            <p className="text-[#a89f97] text-xs mt-0.5 font-400">
              Tu espacio de calma · Siempre presente
            </p>
          </div>
        </div>

        {/* Breathing controls */}
        <div className="flex items-center gap-2">
          <span className="text-[#a89f97] text-xs hidden sm:block font-400">
            Respirar:
          </span>
          <button
            onClick={() => setBreathing("box")}
            className="text-xs px-3 py-1.5 rounded-full bg-[#eef4f0] border border-[#a8c5b5] text-[#5a8070] hover:bg-[#d6ece2] transition-colors font-500"
            title="Respiración en caja 4-4-4-4"
          >
            🌿 Caja
          </button>
          <button
            onClick={() => setBreathing("478")}
            className="text-xs px-3 py-1.5 rounded-full bg-[#eef0f7] border border-[#8b9dc3] text-[#5a6a9e] hover:bg-[#dde1f0] transition-colors font-500"
            title="Respiración 4-7-8"
          >
            🌙 4-7-8
          </button>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {streamingText && (
          <ChatMessage
            message={{
              role: "model",
              parts: streamingText,
              id: "streaming",
            }}
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405z" />
            </svg>
          </button>
        </div>

        <p className="text-center text-[#c4b8af] text-xs mt-2 font-300">
          Serena orienta, no prescribe médicamente. En crisis, contacta servicios de emergencia.
        </p>
      </footer>

      {/* Breathing overlay */}
      {breathing && (
        <BreathingGuide
          technique={breathing}
          onClose={() => setBreathing(null)}
        />
      )}
    </div>
  );
}
