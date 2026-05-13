import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "D-CLOCK — Sistema de Checador Empresarial",
  description: "Control de asistencia profesional para tu empresa. Gestiona empleados, horarios y reportes desde cualquier dispositivo.",
  keywords: "checador, asistencia, empleados, control, D99-TECH",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
