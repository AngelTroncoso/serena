import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Serena — Asesor Anti-Estrés",
  description:
    "Asistente conversacional de bienestar emocional, regulación somática y neuro-nutrición.",
  openGraph: {
    title: "Serena — Asesor Anti-Estrés",
    description: "Tu compañero de regulación emocional y bienestar.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-[#0d1117] text-[#e6edf3] antialiased">
        {children}
      </body>
    </html>
  );
}
