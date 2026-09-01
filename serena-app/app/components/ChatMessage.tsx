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
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#eef4f0] border border-[#a8c5b5] flex items-center justify-center mr-3 mt-0.5 shadow-sm">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3C8.5 3 5 6.5 5 10c0 2.5 1.4 4.7 3.5 5.9l.7-2.1C7.9 13 7 11.6 7 10c0-2.8 2.2-5 5-5s5 2.2 5 5c0 1.6-.9 3-2.2 3.8l.7 2.1C17.6 14.7 19 12.5 19 10c0-3.5-3.5-7-7-7z" fill="#7c9e8a"/>
            <path d="M12 9v5M10 12l2 2 2-2" stroke="#5a8070" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-[#eef0f7] border border-[#c5ccdf] text-[#3d3530] rounded-tr-sm shadow-sm"
            : "bg-white border border-[#e2d9d0] text-[#4a3f38] rounded-tl-sm shadow-sm"
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
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#eef4f0] border border-[#a8c5b5] flex items-center justify-center mr-3 mt-0.5 shadow-sm">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3C8.5 3 5 6.5 5 10c0 2.5 1.4 4.7 3.5 5.9l.7-2.1C7.9 13 7 11.6 7 10c0-2.8 2.2-5 5-5s5 2.2 5 5c0 1.6-.9 3-2.2 3.8l.7 2.1C17.6 14.7 19 12.5 19 10c0-3.5-3.5-7-7-7z" fill="#7c9e8a"/>
          <path d="M12 9v5M10 12l2 2 2-2" stroke="#5a8070" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="bg-white border border-[#e2d9d0] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 shadow-sm">
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#a8c5b5] inline-block" />
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#a8c5b5] inline-block" />
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#a8c5b5] inline-block" />
      </div>
    </div>
  );
}
