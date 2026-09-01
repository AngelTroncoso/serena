import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        serena: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          400: "#4ade80",
          600: "#16a34a",
          800: "#166534",
          900: "#14532d",
        },
        calm: {
          50: "#eff6ff",
          100: "#dbeafe",
          400: "#60a5fa",
          600: "#2563eb",
          800: "#1e40af",
          900: "#1e3a8a",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "breathe-in": "breathe-in 4s ease-in-out",
        "breathe-out": "breathe-out 8s ease-in-out",
        "fade-in": "fade-in 0.4s ease-out",
      },
      keyframes: {
        "breathe-in": {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(1.4)", opacity: "1" },
        },
        "breathe-out": {
          "0%": { transform: "scale(1.4)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "0.6" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
