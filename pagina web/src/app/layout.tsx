import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "D-CLOCK — Sistema de Checador Empresarial | D99-TECH",
  description:
    "Control de asistencia profesional con geo-cercas inteligentes, selfie de verificación, GPS en cada registro y app móvil para Android e iPhone. Compatible con CONTPAq, NOI e IMSS. Instalación en 5 minutos. Tus datos en tu propio servidor.",
  keywords: [
    "checador de asistencia",
    "control de asistencia",
    "checador empresarial",
    "geo-cercas",
    "D99-TECH",
    "D-CLOCK",
    "CONTPAq",
    "NOI",
    "IMSS",
    "México",
    "app móvil asistencia",
    "checador windows",
    "control horario empleados",
    "software asistencia México",
  ],
  openGraph: {
    type: "website",
    title: "D-CLOCK — El checador que sabe dónde están tus empleados",
    description:
      "Control de asistencia con geo-cercas inteligentes, selfie de verificación, GPS en cada registro y app móvil. Compatible con CONTPAq y NOI. Instalación en 5 minutos.",
    images: [
      {
        url: "/D-CLOCKlogo.png",
        width: 512,
        height: 512,
        alt: "D-CLOCK — Sistema de Checador Empresarial",
      },
    ],
    siteName: "D-CLOCK by D99-TECH",
    locale: "es_MX",
  },
  twitter: {
    card: "summary",
    title: "D-CLOCK — Sistema de Checador Empresarial",
    description:
      "Control de asistencia con geo-cercas, selfie de verificación y GPS. Compatible con CONTPAq y NOI.",
    images: ["/D-CLOCKlogo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/D-CLOCKlogo.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.svg",
    apple: "/D-CLOCKlogo.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "D-CLOCK",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Windows 10, Windows 11",
  offers: {
    "@type": "Offer",
    availability: "https://schema.org/InStock",
    description: "Licencia anual. Planes desde 50 hasta 500 empleados.",
  },
  description:
    "Sistema de control de asistencia empresarial con geo-cercas inteligentes, selfie de verificación, GPS, app móvil Android e iOS y credencial digital Apple Wallet.",
  featureList: [
    "Geo-cercas inteligentes",
    "Selfie de verificación",
    "GPS en cada registro",
    "App móvil Android e iPhone",
    "Credencial digital Apple Wallet",
    "Compatible con CONTPAq y NOI",
    "Reportes en Excel y PDF",
    "Multi-sede",
  ],
  author: {
    "@type": "Organization",
    name: "D99-TECH",
    email: "contacto@d99-tech.com",
  },
  downloadUrl: "https://github.com/aalmaguerd99/D-CLOCK/releases",
  softwareVersion: "1.3.0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
