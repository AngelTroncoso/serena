import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Serena — Tu espacio de calma",
  description:
    "Asistente conversacional de bienestar emocional, regulación somática y neuro-nutrición.",
  openGraph: {
    title: "Serena — Tu espacio de calma",
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
    <html lang="es" className={nunito.variable}>
      <body className="serena-bg text-[#3d3530] antialiased">
        {children}
      </body>
    </html>
  );
}
