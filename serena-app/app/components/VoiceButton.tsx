"use client";

interface Props {
  listening: boolean;
  supported: boolean;
  onClick: () => void;
}

export default function VoiceButton({ listening, supported, onClick }: Props) {
  if (!supported) return null;

  return (
    <button
      onClick={onClick}
      aria-label={listening ? "Detener grabación de voz" : "Hablar con Serena"}
      title={listening ? "Detener voz" : "Hablar"}
      className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 flex-shrink-0 ${
        listening
          ? "bg-red-500/20 border border-red-500/50 text-red-400"
          : "bg-[#21262d] border border-[#30363d] text-[#8b949e] hover:border-[#3fb950]/40 hover:text-[#3fb950]"
      }`}
    >
      {listening && (
        <span className="voice-ring absolute inset-0 rounded-full border border-red-500/50" />
      )}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-4 h-4"
      >
        <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
        <path d="M19 10a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.93V19H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-2.07A7 7 0 0 0 19 10z" />
      </svg>
    </button>
  );
}
