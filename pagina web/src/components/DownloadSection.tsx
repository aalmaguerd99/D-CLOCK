"use client";
import { useState } from "react";
import Image from "next/image";

const VERSIONS = [
  {
    v: "1.3.6",
    label: "v1.3.6 — Vacaciones",
    date: "Julio 2026",
    latest: true,
    size: "~95 MB",
    changes: [
      "Modulo de vacaciones (solicitudes, saldos, calculo LFT)",
      "Mejoras en horarios: asignar semana completa, multi-seleccion, copiar semana",
      "App movil: pantalla de vacaciones con solicitud de fechas",
      "Fecha de ingreso por empleado para calculo automatico",
    ],
    installer: "https://github.com/D99-TECH/D-CLOCK/releases/download/v1.3.6/D-CLOCK.Setup.1.3.6.exe",
    portable: "https://github.com/D99-TECH/D-CLOCK/releases/download/v1.3.6/D-CLOCK.1.3.6.exe",
    apk: "https://github.com/D99-TECH/D-CLOCK/releases/download/v1.3.6/D-CLOCK-1.3.6.apk",
  },
  {
    v: "1.3.5",
    label: "Última versión",
    date: "Jun 2026",
    latest: false,
    size: "~95 MB",
    changes: [
      "Reporte de asistencia inteligente — detección automática de horario por hora de entrada",
      "Semáforo a tiempo / retardo / falta / desviación de turno por empleado y día",
      "Alerta cuando un empleado entra en un turno diferente a su horario asignado",
      "Campo de minutos de falta configurable por horario",
      "Mapa en vivo en dashboard con marcadores de check-ins GPS del día",
      "Múltiples correcciones y mejoras de rendimiento",
    ],
    installer: "https://github.com/aalmaguerd99/D-CLOCK/releases/download/v1.3.5/D-CLOCK.Setup.1.3.5.exe",
    portable: "https://github.com/aalmaguerd99/D-CLOCK/releases/download/v1.3.5/D-CLOCK.1.3.5.exe",
  },
  {
    v: "1.3.4",
    label: "Versión anterior",
    date: "Jun 2026",
    latest: false,
    size: "~95 MB",
    changes: [
      "Dashboard v2 — mapa de México interactivo con Leaflet y GPS real",
      "Top geocercas por número de registros",
      "Feed en vivo de check-ins actualizado por SSE",
      "Gráfica de entradas por hora del día",
      "Corrección de errores de carga del dashboard con Promise.allSettled",
    ],
    installer: "https://github.com/aalmaguerd99/D-CLOCK/releases/download/v1.3.4/D-CLOCK.Setup.1.3.4.exe",
    portable: "https://github.com/aalmaguerd99/D-CLOCK/releases/download/v1.3.4/D-CLOCK.1.3.4.exe",
  },
  {
    v: "1.3.3",
    label: "Versión anterior",
    date: "Jun 2026",
    latest: false,
    size: "~95 MB",
    changes: [
      "Módulo de Equipos — admin visualiza asistencia de su equipo en la app móvil",
      "Descarga directa de APK Android desde el servidor",
      "Diseñador de credencial Apple Wallet con fondos, colores y campos personalizados",
      "Reconocimiento facial al registrar asistencia",
      "Genera pases .pkpass para iPhone (Apple Wallet)",
      "Múltiples correcciones y mejoras de rendimiento",
    ],
    installer: "https://github.com/aalmaguerd99/D-CLOCK/releases/download/v1.3.3/D-CLOCK.Setup.1.3.3.exe",
    portable: "https://github.com/aalmaguerd99/D-CLOCK/releases/download/v1.3.3/D-CLOCK.1.3.3.exe",
  },
];

const IDownload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const ICheck = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IBolt = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IGlobe = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

export default function DownloadSection() {
  const [selected, setSelected] = useState(0);
  const ver = VERSIONS[selected];

  return (
    <section id="download" className="py-28 px-6 relative overflow-hidden">
      <div className="blob w-[600px] h-[600px] bg-blue-200 opacity-[.13] -top-40 -right-40" />
      <div className="blob w-[400px] h-[400px] bg-indigo-100 opacity-[.10] bottom-0 -left-32" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-[11px] font-bold text-[#2563EB] bg-[#DBEAFE] px-3 py-1.5 rounded-full mb-5">
            <IDownload />
            Disponible ahora · Windows 64-bit
          </div>
          <h2 className="text-[2.5rem] font-extrabold tracking-[-0.03em] text-[#0D0D0C] leading-[1.08]">
            Descarga D-CLOCK
            <br /><span className="text-[#78786E]">e instala en 2 minutos.</span>
          </h2>
        </div>

        {/* Version tabs */}
        <div className="flex items-center gap-2 mb-6 justify-center flex-wrap">
          {VERSIONS.map((v, i) => (
            <button
              key={v.v}
              onClick={() => setSelected(i)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold transition-all duration-200 border ${
                selected === i
                  ? "bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-[0_4px_16px_rgba(13,13,12,.18)]"
                  : "bg-white/60 text-[#78786E] border-[rgba(200,192,178,.4)] hover:border-[rgba(13,13,12,.2)] hover:text-[#0D0D0C]"
              }`}
            >
              {v.latest && (
                <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${selected === i ? "bg-white/20 text-white" : "bg-[#DBEAFE] text-[#2563EB]"}`}>
                  NUEVA
                </span>
              )}
              v{v.v}
              <span className={`text-[10px] font-normal ${selected === i ? "text-white/60" : "text-[#AEAEA4]"}`}>
                {v.date}
              </span>
            </button>
          ))}
        </div>

        <div className="glass rounded-3xl overflow-hidden shadow-[0_32px_100px_rgba(13,13,12,.09)]">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 flex-wrap px-10 py-6 border-b border-[rgba(200,192,178,.18)]">
            <div className="flex items-center gap-4">
              <Image src="/D-CLOCKlogo.png" alt="D-CLOCK" width={48} height={48} className="object-contain drop-shadow-md" />
              <div>
                <p className="font-extrabold text-[1.1rem] tracking-tight text-[#0D0D0C] leading-none">D-CLOCK</p>
                <p className="text-[11.5px] text-[#78786E] mt-0.5">by D99-TECH</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { label: `v${ver.v}`, bg: "#1a1a1a", c: "#fff" },
                { label: "Windows 10 / 11", bg: "#F3F4F6", c: "#374151" },
                { label: "64-bit", bg: "#F3F4F6", c: "#374151" },
                { label: ver.size, bg: "#F3F4F6", c: "#374151" },
              ].map(b => (
                <span key={b.label} className="text-[11.5px] font-semibold px-2.5 py-1 rounded-full" style={{ background: b.bg, color: b.c }}>
                  {b.label}
                </span>
              ))}
            </div>
          </div>

          {/* Changelog strip */}
          <div className="px-10 py-5 border-b border-[rgba(200,192,178,.15)] bg-[rgba(13,13,12,.025)]">
            <p className="text-[10.5px] font-bold text-[#AEAEA4] uppercase tracking-wider mb-3">
              Novedades en v{ver.v}
            </p>
            <div className="grid sm:grid-cols-2 gap-1.5">
              {ver.changes.map(c => (
                <div key={c} className="flex items-start gap-2 text-[12.5px] text-[#38382F]">
                  <div className="w-[14px] h-[14px] rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0 mt-0.5 text-white">
                    <ICheck />
                  </div>
                  {c}
                </div>
              ))}
            </div>
          </div>

          {/* Download options */}
          <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-[rgba(200,192,178,.18)]">
            <div className="p-10 flex flex-col gap-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#1a1a1a] flex items-center justify-center shrink-0 shadow-[0_8px_24px_rgba(13,13,12,.25)]">
                  <IDownload />
                </div>
                <div>
                  <p className="font-extrabold text-[16px] text-[#0D0D0C]">
                    Instalador <span className="text-[#2563EB]">· Recomendado</span>
                  </p>
                  <p className="text-[13px] text-[#78786E] mt-0.5 leading-relaxed">
                    Instala D-CLOCK con asistente paso a paso. Crea acceso directo en el escritorio y se ejecuta automáticamente al encender el equipo.
                  </p>
                </div>
              </div>
              <ul className="space-y-2">
                {["Acceso directo en escritorio", "Inicia con Windows (opcional)", "Desinstalador incluido", "Instalación sin conocimientos técnicos"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-[12.5px] text-[#38382F]">
                    <div className="w-[14px] h-[14px] rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0 text-white">
                      <ICheck />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={ver.installer}
                className="btn-primary justify-center text-[14.5px]"
                download
                style={{ background: "#1a1a1a" }}
              >
                <IDownload />
                Descargar instalador
                <span className="ml-1 text-white/50 text-[12px]">.exe</span>
              </a>
            </div>

            <div className="p-10 flex flex-col gap-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F3F4F6] flex items-center justify-center shrink-0 text-[#374151]">
                  <IBolt />
                </div>
                <div>
                  <p className="font-extrabold text-[16px] text-[#0D0D0C]">Portable</p>
                  <p className="text-[13px] text-[#78786E] mt-0.5 leading-relaxed">
                    Sin instalación. Copia en USB o carpeta de red y ejecuta en cualquier equipo Windows.
                  </p>
                </div>
              </div>
              <ul className="space-y-2">
                {["Sin instalación requerida", "Funciona desde USB o red", "Sin permisos de administrador", "Mismo rendimiento que el instalador"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-[12.5px] text-[#38382F]">
                    <div className="w-[14px] h-[14px] rounded-full bg-[#F0F0EC] flex items-center justify-center shrink-0">
                      <ICheck />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={ver.portable}
                className="btn-ghost justify-center text-[14.5px]"
                download
              >
                <IDownload />
                Descargar portable
                <span className="ml-1 text-[#AEAEA4] text-[12px]">.exe</span>
              </a>
            </div>
          </div>

          {/* Mobile downloads */}
          <div className="px-10 py-6 border-t border-[rgba(200,192,178,.15)] bg-[rgba(13,13,12,.02)]">
            <p className="text-[10.5px] font-bold text-[#AEAEA4] uppercase tracking-wider mb-4">App móvil D-CLOCK</p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://github.com/D99-TECH/D-CLOCK/releases/download/v1.3.6/D-CLOCK-1.3.6.apk"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-[10px] bg-[#1a1a1a] text-white text-[13px] font-bold hover:opacity-85 transition-opacity"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.523 15.341c-.462 0-.836-.374-.836-.836s.374-.836.836-.836.836.374.836.836-.374.836-.836.836m-11.046 0c-.462 0-.836-.374-.836-.836s.374-.836.836-.836.836.374.836.836-.374.836-.836.836m11.405-6.268l1.67-2.893a.347.347 0 0 0-.127-.474.347.347 0 0 0-.474.127l-1.692 2.929A10.29 10.29 0 0 0 12 8.16c-1.52 0-2.96.33-4.259.902L6.049 6.133a.347.347 0 0 0-.474-.127.347.347 0 0 0-.127.474l1.67 2.893C4.562 10.812 3 13.218 3 16h18c0-2.782-1.562-5.188-4.118-6.927"/></svg>
                Descargar APK Android
                <span className="text-white/50 text-[11px]">.apk · v1.3.6</span>
              </a>
              <a
                href="https://apps.apple.com/app/d-clock/id6769932290"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-[10px] bg-[#F3F4F6] text-[#0D0D0C] text-[13px] font-bold hover:bg-[#E5E7EB] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                App Store (iPhone)
              </a>
            </div>
            <p className="text-[11.5px] text-[#AEAEA4] mt-3">
              El APK de Android se instala directamente. En iPhone descarga desde la App Store oficial.
            </p>
          </div>

          <div className="px-10 py-5 border-t border-[rgba(200,192,178,.15)] bg-white/20">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <p className="text-[12px] text-[#AEAEA4]">
                Necesitas una licencia anual activa para usar el software.{" "}
                <a href="mailto:contacto@d99-tech.com" className="text-[#2563EB] hover:underline font-medium">
                  Solicita la tuya →
                </a>
              </p>
              <div className="flex items-center gap-1.5 text-[11.5px] text-[#78786E]">
                <IGlobe />
                <a
                  href="https://github.com/aalmaguerd99/D-CLOCK/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#2563EB] transition-colors"
                >
                  Ver todas las versiones en GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
