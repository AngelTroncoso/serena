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
    "Hola, soy Serena. Estoy aquí contigo. ¿Cómo te sientes en este momento? Del 1 al 10, ¿qué nivel de tensión sientes en tu cuerpo ahora mismo?",
  id: "welcome",
};

type BreathTechnique = "box" | "478";

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
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
  const recognitionRef = useRef<SpeechRecognition | null>(null);
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

      // Resize textarea back
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
              "Lo siento, algo salió mal. Por favor intenta de nuevo en un momento.",
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
    // Auto-grow
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
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#21262d] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#3fb950]/15 border border-[#3fb950]/40 flex items-center justify-center">
            <span className="text-[#3fb950] text-sm font-semibold">S</span>
          </div>
          <div>
            <h1 className="text-[#e6edf3] text-sm font-semibold leading-none">
              Serena
            </h1>
            <p className="text-[#8b949e] text-xs mt-0.5">
              Asesor anti-estrés · Siempre presente
            </p>
          </div>
        </div>

        {/* Breathing controls */}
        <div className="flex items-center gap-2">
          <span className="text-[#8b949e] text-xs hidden sm:block">
            Respiración:
          </span>
          <button
            onClick={() => setBreathing("box")}
            className="text-xs px-3 py-1.5 rounded-lg bg-[#161b22] border border-[#30363d] text-[#8b949e] hover:border-[#3fb950]/40 hover:text-[#3fb950] transition-colors"
            title="Respiración en caja 4-4-4-4"
          >
            Caja
          </button>
          <button
            onClick={() => setBreathing("478")}
            className="text-xs px-3 py-1.5 rounded-lg bg-[#161b22] border border-[#30363d] text-[#8b949e] hover:border-[#58a6ff]/40 hover:text-[#58a6ff] transition-colors"
            title="Respiración 4-7-8"
          >
            4-7-8
          </button>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Streaming message */}
        {streamingText && (
          <ChatMessage
            message={{
              role: "model",
              parts: streamingText,
              id: "streaming",
            }}
          />
        )}

        {/* Typing indicator */}
        {loading && !streamingText && <TypingIndicator />}

        <div ref={bottomRef} />
      </main>

      {/* Input area */}
      <footer className="border-t border-[#21262d] px-4 py-3 flex-shrink-0">
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
              placeholder="Escríbeme cómo te sientes..."
              rows={1}
              disabled={loading}
              className="w-full resize-none bg-[#161b22] border border-[#30363d] rounded-2xl px-4 py-3 text-sm text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#3fb950]/50 transition-colors disabled:opacity-50 leading-relaxed"
              style={{ minHeight: "44px", maxHeight: "120px" }}
            />
          </div>

          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            aria-label="Enviar mensaje"
            className="flex-shrink-0 w-10 h-10 rounded-full bg-[#3fb950]/15 border border-[#3fb950]/30 flex items-center justify-center text-[#3fb950] hover:bg-[#3fb950]/25 hover:border-[#3fb950]/60 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
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

        <p className="text-center text-[#484f58] text-xs mt-2">
          Serena orienta, no prescribe médicamente. En crisis, contacta servicios
          de emergencia.
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
