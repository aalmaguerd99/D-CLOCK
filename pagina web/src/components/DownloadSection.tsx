"use client";
import { useState } from "react";
import Image from "next/image";

const VERSIONS = [
  {
    v: "1.3.0",
    label: "Última versión",
    date: "Mayo 2026",
    latest: true,
    size: "~95 MB",
    changes: [
      "Diseñador de credencial Apple Wallet con fondos, colores y campos personalizados",
      "Reconocimiento facial al registrar asistencia",
      "Genera pases .pkpass para iPhone (Apple Wallet)",
      "Sincronización de credencial con app móvil D-CLOCK",
      "Endpoint público para configuración visual de credencial",
      "Múltiples correcciones y mejoras de rendimiento",
    ],
    installer: "https://github.com/aalmaguerd99/D-CLOCK/releases/download/v1.3.0/D-CLOCK-Setup-1.3.0.exe",
    portable: "https://github.com/aalmaguerd99/D-CLOCK/releases/download/v1.3.0/D-CLOCK-Portable-1.3.0.exe",
  },
  {
    v: "1.0.0",
    label: "Versión anterior",
    date: "Ene 2026",
    latest: false,
    size: "~90 MB",
    changes: [
      "Control de asistencia con geo-cercas",
      "Selfie de verificación y GPS en cada registro",
      "App móvil Android e iPhone",
      "Reportes en Excel y PDF",
      "Compatible con CONTPAq y NOI",
    ],
    installer: "https://github.com/aalmaguerd99/D-CLOCK/releases/download/v1.0.0/D-CLOCK-Setup-1.0.0.exe",
    portable: "https://github.com/aalmaguerd99/D-CLOCK/releases/download/v1.0.0/D-CLOCK-Portable-1.0.0.exe",
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
