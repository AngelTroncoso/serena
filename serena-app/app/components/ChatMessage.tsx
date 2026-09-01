"use client";

interface Message {
  role: "user" | "model";
  parts: string;
  id: string;
}

interface Props {
  message: Message;
}

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div
      className={`msg-appear flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#3fb950]/15 border border-[#3fb950]/30 flex items-center justify-center mr-3 mt-0.5">
          <span className="text-[#3fb950] text-xs font-semibold">S</span>
        </div>
      )}
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-[#58a6ff]/10 border border-[#58a6ff]/20 text-[#e6edf3] rounded-tr-sm"
            : "bg-[#161b22] border border-[#30363d] text-[#cdd9e5] rounded-tl-sm"
        }`}
      >
        {message.parts}
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="msg-appear flex justify-start mb-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#3fb950]/15 border border-[#3fb950]/30 flex items-center justify-center mr-3 mt-0.5">
        <span className="text-[#3fb950] text-xs font-semibold">S</span>
      </div>
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#8b949e] inline-block" />
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#8b949e] inline-block" />
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#8b949e] inline-block" />
      </div>
    </div>
  );
}
