import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="9" stroke="#2563EB" strokeWidth="1.5"/>
        <path d="M11 6v5.5l3.5 2" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "Control en tiempo real",
    desc: "Registros de entrada y salida al instante. Sin retrasos, sin pérdida de datos.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="3" width="16" height="16" rx="4" stroke="#2563EB" strokeWidth="1.5"/>
        <path d="M7 11l3 3 5-5" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Licencias flexibles",
    desc: "Planes para 50, 100, 200 o 500 empleados. Escala cuando lo necesites.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="6" y="2" width="10" height="16" rx="2" stroke="#2563EB" strokeWidth="1.5"/>
        <path d="M9 18v2M13 18v2M7 20h8" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="11" cy="8" r="2" stroke="#2563EB" strokeWidth="1.5"/>
      </svg>
    ),
    title: "App móvil incluida",
    desc: "Los empleados fichan desde su celular. Compatible con Android e iPhone.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 11a8 8 0 1 0 16 0A8 8 0 0 0 3 11z" stroke="#2563EB" strokeWidth="1.5"/>
        <path d="M11 7v4l2.5 2.5" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "Servidor local",
    desc: "Tus datos se quedan en tu empresa. Sin dependencia de terceros.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 17L8 13L11 16L15 11L19 14" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="3" y="4" width="16" height="13" rx="2" stroke="#2563EB" strokeWidth="1.5"/>
      </svg>
    ),
    title: "Reportes automáticos",
    desc: "Exporta asistencias en Excel o PDF. Filtros por día, semana o mes.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 3L13.5 8.5H19L14.5 12L16.5 18L11 14.5L5.5 18L7.5 12L3 8.5H8.5L11 3Z" stroke="#2563EB" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Fácil instalación",
    desc: "Descarga, instala y activa con tu licencia. Listo en menos de 5 minutos.",
  },
];

const plans = [
  {
    tier: "50",
    label: "Starter",
    price: "Consultar",
    employees: 50,
    features: ["50 empleados", "App móvil", "Reportes básicos", "Soporte por email"],
    featured: false,
  },
  {
    tier: "100",
    label: "Business",
    price: "Consultar",
    employees: 100,
    features: ["100 empleados", "App móvil", "Reportes completos", "Soporte prioritario", "Exportar Excel/PDF"],
    featured: true,
  },
  {
    tier: "200",
    label: "Pro",
    price: "Consultar",
    employees: 200,
    features: ["200 empleados", "App móvil", "Reportes avanzados", "Soporte 24/7", "Exportar Excel/PDF", "Multi-sede"],
    featured: false,
  },
  {
    tier: "500",
    label: "Enterprise",
    price: "Consultar",
    employees: 500,
    features: ["500 empleados", "App móvil", "Reportes ilimitados", "Soporte dedicado", "Exportar Excel/PDF", "Multi-sede", "Integración API"],
    featured: false,
  },
];

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="pt-16">
        {/* ── HERO ── */}
        <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden px-6">
          {/* Background blobs */}
          <div className="blob w-[600px] h-[600px] bg-blue-200 opacity-20 -top-40 -right-40" />
          <div className="blob w-[400px] h-[400px] bg-blue-100 opacity-15 bottom-0 -left-20" />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 glass px-4 py-2 mb-8 text-sm font-medium text-[#2563EB]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
              Control de asistencia para empresas
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-[4.5rem] font-bold tracking-tight leading-[1.08] text-[#111111] mb-6">
              Ficha. Controla.
              <br />
              <span className="text-[#2563EB]">Administra.</span>
            </h1>

            <p className="text-lg md:text-xl text-[#555550] max-w-2xl mx-auto mb-10 leading-relaxed">
              D-CLOCK es el sistema de checador que transforma cómo tu empresa
              gestiona la asistencia. Instalación en minutos, activación con licencia,
              control desde el celular.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <a href="#download" className="btn-primary text-base">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 2v10M5 8l4 4 4-4M3 15h12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Descargar D-CLOCK
              </a>
              <a href="#plans" className="btn-outline text-base">
                Ver planes y precios
              </a>
            </div>

            {/* Hero mockup */}
            <div className="mt-16 glass rounded-2xl overflow-hidden mx-auto max-w-2xl shadow-[0_20px_80px_rgba(37,99,235,0.1)]">
              <div className="bg-[rgba(37,99,235,0.06)] border-b border-[rgba(180,170,155,0.2)] px-4 py-3 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
                <span className="ml-3 text-xs text-[#999] font-mono">D-CLOCK · Panel de Asistencia</span>
              </div>
              <div className="p-6 bg-white/40">
                {/* Fake dashboard */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-[#999] mb-1">Hoy, martes 13 mayo</p>
                    <p className="font-semibold text-[#111]">Resumen de asistencia</p>
                  </div>
                  <div className="glass px-3 py-1.5 text-xs font-medium text-[#2563EB]">En línea</div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: "Presentes", value: "47", color: "#22C55E" },
                    { label: "Tarde", value: "3", color: "#F59E0B" },
                    { label: "Ausentes", value: "2", color: "#EF4444" },
                  ].map((s) => (
                    <div key={s.label} className="glass-subtle rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-xs text-[#999] mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {[
                    { name: "Ana García", time: "08:02", status: "Entrada" },
                    { name: "Carlos Ruiz", time: "08:15", status: "Entrada" },
                    { name: "María López", time: "08:47", status: "Tarde" },
                  ].map((e) => (
                    <div key={e.name} className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/50 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-600">
                          {e.name[0]}
                        </div>
                        <span className="text-[#111] font-medium">{e.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#999] text-xs font-mono">{e.time}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${e.status === "Tarde" ? "bg-yellow-50 text-yellow-600" : "bg-green-50 text-green-600"}`}>
                          {e.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-[#2563EB] uppercase tracking-widest mb-3">Características</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#111111]">
                Todo lo que necesitas,
                <br />
                nada que sobre.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f) => (
                <div key={f.title} className="glass rounded-2xl p-6 group hover:shadow-[0_8px_40px_rgba(37,99,235,0.08)] transition-all duration-300">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-[#111111] mb-2">{f.title}</h3>
                  <p className="text-sm text-[#6B6B65] leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PLANS ── */}
        <section id="plans" className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-[#2563EB] uppercase tracking-widest mb-3">Planes</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#111111]">
                Licencias para cada empresa
              </h2>
              <p className="mt-4 text-[#6B6B65] text-base">Una sola compra, instalación ilimitada en tu servidor.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {plans.map((p) => (
                <div
                  key={p.tier}
                  className={`glass rounded-2xl p-6 flex flex-col ${p.featured ? "plan-featured" : ""}`}
                >
                  {p.featured && (
                    <span className="inline-block text-xs font-semibold text-[#2563EB] bg-blue-50 px-3 py-1 rounded-full mb-4 self-start">
                      Más popular
                    </span>
                  )}
                  <p className="text-xs text-[#6B6B65] font-medium uppercase tracking-wider mb-1">{p.label}</p>
                  <p className="text-4xl font-bold text-[#111111] mb-1">
                    {p.employees}
                    <span className="text-base font-normal text-[#6B6B65] ml-1">empleados</span>
                  </p>
                  <p className="text-sm text-[#2563EB] font-medium mb-5">{p.price}</p>

                  <ul className="space-y-2.5 mb-6 flex-1">
                    {p.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2 text-sm text-[#444]">
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0">
                          <circle cx="7.5" cy="7.5" r="7" fill={p.featured ? "#2563EB" : "#E5E7EB"}/>
                          <path d="M4.5 7.5L6.5 9.5L10.5 5.5" stroke={p.featured ? "white" : "#6B7280"} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <a
                    href="mailto:contacto@d99-tech.com"
                    className={p.featured ? "btn-primary justify-center text-sm" : "btn-outline justify-center text-sm"}
                  >
                    Solicitar licencia
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-[#2563EB] uppercase tracking-widest mb-3">Cómo funciona</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#111111]">
                De la descarga al control,
                <br />
                en minutos.
              </h2>
            </div>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-[#2563EB] via-[#93C5FD] to-transparent hidden md:block" />

              <div className="space-y-8">
                {[
                  { step: "01", title: "Descarga el instalador", desc: "Descarga el instalador de D-CLOCK desde esta página. Compatible con Windows 10/11." },
                  { step: "02", title: "Instala y configura", desc: "El instalador se configura automáticamente en tu servidor. No necesitas conocimientos técnicos." },
                  { step: "03", title: "Activa tu licencia", desc: "Ingresa tu clave de licencia. La app se conecta a nuestros servidores y se configura sola con el nombre de tu empresa y el límite de empleados." },
                  { step: "04", title: "Conecta tus empleados", desc: "Los empleados descargan la app móvil, se conectan con la IP de tu servidor y fichan desde su teléfono." },
                ].map((s) => (
                  <div key={s.step} className="flex gap-6 items-start">
                    <div className="relative z-10 w-16 h-16 glass rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                      <span className="text-xs font-bold text-[#2563EB] font-mono">{s.step}</span>
                    </div>
                    <div className="pt-3">
                      <h3 className="font-semibold text-[#111111] mb-1">{s.title}</h3>
                      <p className="text-sm text-[#6B6B65] leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── DOWNLOAD ── */}
        <section id="download" className="py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="glass rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
              <div className="blob w-80 h-80 bg-blue-200 opacity-20 -top-20 -right-20" />
              <div className="blob w-64 h-64 bg-blue-100 opacity-15 -bottom-16 -left-16" />

              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-[#2563EB] flex items-center justify-center mx-auto mb-6 shadow-[0_8px_32px_rgba(37,99,235,0.3)]">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M14 4v16M7 14l7 7 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 23h18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#111111] mb-4">
                  Descarga D-CLOCK
                </h2>
                <p className="text-[#6B6B65] mb-2">Versión 1.0 · Windows 10/11 · 64-bit</p>
                <p className="text-sm text-[#999] mb-8">Necesitas una licencia activa para usar la aplicación.</p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href="/downloads/dclock-setup.exe"
                    className="btn-primary text-base"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M9 2v10M5 8l4 4 4-4M3 15h12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Descargar para Windows
                  </a>
                  <a href="mailto:contacto@d99-tech.com" className="btn-outline text-base">
                    Solicitar licencia
                  </a>
                </div>

                <p className="mt-6 text-xs text-[#bbb]">
                  ¿Problemas con la descarga?{" "}
                  <a href="mailto:contacto@d99-tech.com" className="text-[#2563EB] hover:underline">
                    Contacta a soporte
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t border-[rgba(180,170,155,0.2)] py-10 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.5"/>
                  <path d="M8 4.5V8.5L10.5 10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="font-semibold text-sm text-[#111111]">D-CLOCK</span>
              <span className="text-[#ccc] text-sm">·</span>
              <span className="text-xs text-[#999]">by D99-TECH</span>
            </div>

            <p className="text-xs text-[#999]">
              © {new Date().getFullYear()} D99-TECH. Todos los derechos reservados.
            </p>

            <div className="flex gap-5 text-xs text-[#999]">
              <a href="mailto:contacto@d99-tech.com" className="hover:text-[#2563EB] transition-colors">Contacto</a>
              <a href="#" className="hover:text-[#2563EB] transition-colors">Privacidad</a>
              <a href="#" className="hover:text-[#2563EB] transition-colors">Términos</a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
