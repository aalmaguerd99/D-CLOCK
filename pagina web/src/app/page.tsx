import Navbar from "@/components/Navbar";

/* ─── Data ─────────────────────────────────────────── */
const employees = [
  { name: "Ana García",      initials:"AG", color:"#DBEAFE", text:"#1D4ED8", entrada:"07:58", salida:"17:02", status:"ok"     },
  { name: "Carlos Ruiz",     initials:"CR", color:"#DCFCE7", text:"#15803D", entrada:"08:12", salida:"17:15", status:"ok"     },
  { name: "María López",     initials:"ML", color:"#FEF3C7", text:"#B45309", entrada:"08:47", salida:"—",     status:"tarde"  },
  { name: "José Hernández",  initials:"JH", color:"#EDE9FE", text:"#6D28D9", entrada:"07:55", salida:"16:58", status:"ok"     },
  { name: "Sofía Torres",    initials:"ST", color:"#FEE2E2", text:"#B91C1C", entrada:"—",     salida:"—",     status:"ausente"},
  { name: "Luis Martínez",   initials:"LM", color:"#DBEAFE", text:"#1D4ED8", entrada:"08:01", salida:"17:00", status:"ok"     },
];

const stats = [
  { label:"Presentes", value:42, total:50, color:"#16A34A", bg:"#DCFCE7" },
  { label:"Tarde",     value: 5, total:50, color:"#D97706", bg:"#FEF3C7" },
  { label:"Ausentes",  value: 3, total:50, color:"#DC2626", bg:"#FEE2E2" },
];

const features = [
  {
    icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="#2563EB" strokeWidth="1.4"/><path d="M10 5.5V10l3 1.8" stroke="#2563EB" strokeWidth="1.4" strokeLinecap="round"/></svg>,
    title:"Entrada & Salida",
    desc:"Registro preciso de la hora exacta de entrada y salida de cada empleado, con historial completo.",
  },
  {
    icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="12" rx="3" stroke="#2563EB" strokeWidth="1.4"/><path d="M7 9.5l2.5 2.5 4-4" stroke="#2563EB" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    title:"Reportes automáticos",
    desc:"Exporta la asistencia mensual en Excel o PDF con un clic. Sin cálculos manuales.",
  },
  {
    icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="5" y="2" width="10" height="14" rx="2" stroke="#2563EB" strokeWidth="1.4"/><circle cx="10" cy="7.5" r="2" stroke="#2563EB" strokeWidth="1.4"/><path d="M7 13c0-1.7 1.3-3 3-3s3 1.3 3 3" stroke="#2563EB" strokeWidth="1.4" strokeLinecap="round"/></svg>,
    title:"App móvil",
    desc:"Los empleados fichan desde su celular Android o iPhone. Sin costo adicional.",
  },
  {
    icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2a6 6 0 016 6c0 4-6 10-6 10S4 12 4 8a6 6 0 016-6z" stroke="#2563EB" strokeWidth="1.4"/><circle cx="10" cy="8" r="2" stroke="#2563EB" strokeWidth="1.4"/></svg>,
    title:"Servidor local",
    desc:"Tus datos en tu empresa. El sistema corre en tu propio servidor, sin dependencias externas.",
  },
  {
    icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="5" width="16" height="11" rx="2.5" stroke="#2563EB" strokeWidth="1.4"/><path d="M6 5V4a4 4 0 018 0v1" stroke="#2563EB" strokeWidth="1.4" strokeLinecap="round"/><circle cx="10" cy="10.5" r="1.5" fill="#2563EB"/></svg>,
    title:"Activación por licencia",
    desc:"La app valida tu licencia automáticamente al instalarse. Solo ingresa tu clave y listo.",
  },
  {
    icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 10h14M10 3l7 7-7 7" stroke="#2563EB" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    title:"Instalación en minutos",
    desc:"Descarga el instalador, ejecútalo y en menos de 5 minutos tu sistema está operando.",
  },
];

const plans = [
  { tier:"50",  label:"Starter",    desc:"Ideal para negocios pequeños y medianos.",    feats:["50 empleados","App móvil incluida","Reportes básicos","Soporte por email"],                                         featured:false },
  { tier:"100", label:"Business",   desc:"El más elegido por empresas en crecimiento.", feats:["100 empleados","App móvil incluida","Reportes completos","Exportar Excel/PDF","Soporte prioritario"],               featured:true  },
  { tier:"200", label:"Pro",        desc:"Para empresas con operaciones más grandes.",  feats:["200 empleados","App móvil incluida","Reportes avanzados","Exportar Excel/PDF","Multi-sede","Soporte 24/7"],         featured:false },
  { tier:"500", label:"Enterprise", desc:"Máxima capacidad para grandes corporativos.", feats:["500 empleados","App móvil incluida","Reportes ilimitados","Exportar Excel/PDF","Multi-sede","Integración API","Soporte dedicado"], featured:false },
];

const steps = [
  { n:"01", title:"Descarga el instalador", body:"Descarga el setup de D-CLOCK para Windows desde esta página. Compatible con Windows 10 y 11 de 64 bits." },
  { n:"02", title:"Instala automáticamente", body:"El instalador configura todo solo: crea el servicio, abre el puerto y deja la app lista para usarse." },
  { n:"03", title:"Activa tu licencia",      body:"Ingresa tu clave de licencia. D-CLOCK se conecta a nuestros servidores y configura tu empresa y límite de empleados." },
  { n:"04", title:"Conecta desde el celular",body:"Los empleados descargan la app móvil, escriben la IP de tu servidor y fichan entrada/salida desde cualquier lugar." },
];

/* ─── Helpers ───────────────────────────────────────── */
function StatusTag({ s }: { s: string }) {
  if (s === "ok")      return <span className="tag-entrada">Presente</span>;
  if (s === "tarde")   return <span className="tag-tarde">Tarde</span>;
  return <span className="tag-ausente">Ausente</span>;
}

/* ─── Page ──────────────────────────────────────────── */
export default function Home() {
  return (
    <>
      <Navbar />
      <main className="pt-[3.75rem]">

        {/* ════════════════ HERO ════════════════ */}
        <section className="relative min-h-[96vh] flex items-center justify-center overflow-hidden px-6 py-20">
          {/* Blobs */}
          <div className="blob w-[700px] h-[700px] bg-blue-200 opacity-[0.17] -top-60 -right-60" />
          <div className="blob w-[500px] h-[500px] bg-indigo-100 opacity-[0.12] bottom-0 -left-40" />
          <div className="blob w-[300px] h-[300px] bg-sky-200  opacity-[0.14] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

          <div className="relative z-10 max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left: copy */}
            <div>
              <div className="inline-flex items-center gap-2 glass px-3.5 py-1.5 rounded-full text-[13px] font-semibold text-[#2563EB] mb-7">
                <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-[#2563EB] inline-block" />
                Sistema de checador empresarial
              </div>

              <h1 className="text-5xl md:text-6xl font-bold tracking-[-0.03em] leading-[1.06] text-[#0F0F0F] mb-5">
                El checador
                <br />
                que tu empresa
                <br />
                <span style={{ color:"#2563EB" }}>merece.</span>
              </h1>

              <p className="text-[1.0625rem] text-[#7A7A72] leading-[1.7] max-w-md mb-9">
                Controla entradas, salidas y asistencia en tiempo real.
                Instala en tu servidor, activa con licencia y gestiona
                a todos tus empleados desde el celular.
              </p>

              <div className="flex flex-wrap gap-3">
                <a href="#download" className="btn-primary">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2v9M4.5 7.5 8 11l3.5-3.5M2 13.5h12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Descargar D-CLOCK
                </a>
                <a href="#plans" className="btn-ghost">Ver planes →</a>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-4 mt-8">
                {[
                  { icon:"⚡", text:"Instalación en 5 min" },
                  { icon:"🔒", text:"Datos en tu servidor" },
                  { icon:"📱", text:"App Android & iOS" },
                ].map(b => (
                  <div key={b.text} className="flex items-center gap-1.5 text-[13px] text-[#7A7A72]">
                    <span>{b.icon}</span>
                    <span>{b.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Dashboard mockup */}
            <div className="relative">
              {/* Floating badge top-right */}
              <div className="float absolute -top-4 -right-2 z-20">
                <div className="glass-strong rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-lg">
                  <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8.5l4 4 6-7" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#0F0F0F] leading-tight">Ana García</p>
                    <p className="text-[10px] text-[#16A34A] font-medium">Entrada — 07:58 AM</p>
                  </div>
                </div>
              </div>

              {/* Floating badge bottom-left */}
              <div className="float-delay absolute -bottom-3 -left-3 z-20">
                <div className="glass-strong rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-lg">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="5.5" stroke="#2563EB" strokeWidth="1.4"/>
                      <path d="M8 5v3.5l2 1.2" stroke="#2563EB" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#0F0F0F] leading-tight">42 / 50 presentes</p>
                    <p className="text-[10px] text-[#2563EB] font-medium">Hoy · martes 13 mayo</p>
                  </div>
                </div>
              </div>

              {/* Main dashboard card */}
              <div className="glass rounded-3xl overflow-hidden shadow-[0_24px_80px_rgba(15,15,15,0.10)]">
                {/* Title bar */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-[rgba(200,192,178,0.2)] bg-white/30">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
                  </div>
                  <p className="text-[11px] text-[#AEAEA6] font-mono font-medium">D-CLOCK · Asistencia del día</p>
                  <div className="flex items-center gap-1 text-[11px] text-[#16A34A] font-semibold">
                    <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-[#16A34A] inline-block" />
                    En vivo
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2.5">
                    {stats.map(s => (
                      <div key={s.label} className="glass rounded-2xl p-3">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="stat-dot" style={{ background: s.color }} />
                          <span className="text-[10px] text-[#AEAEA6] font-medium">{s.label}</span>
                        </div>
                        <p className="text-2xl font-bold text-[#0F0F0F] leading-none">{s.value}</p>
                        <div className="mt-2 h-1 rounded-full bg-[#EDE8DF]">
                          <div className="h-full rounded-full" style={{ width:`${(s.value/s.total)*100}%`, background: s.color }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Employee table header */}
                  <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-x-3 px-2 text-[10px] font-semibold text-[#AEAEA6] uppercase tracking-wider">
                    <span>Empleado</span>
                    <span>Entrada</span>
                    <span>Salida</span>
                    <span>Estado</span>
                  </div>

                  {/* Rows */}
                  <div className="space-y-1.5">
                    {employees.map(e => (
                      <div key={e.name} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-x-3 items-center py-2 px-3 rounded-xl bg-white/45 hover:bg-white/70 transition-colors">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="avatar text-[11px]" style={{ background: e.color, color: e.text }}>
                            {e.initials}
                          </div>
                          <span className="text-[12px] font-medium text-[#0F0F0F] truncate">{e.name.split(" ")[0]}</span>
                        </div>
                        <span className="font-mono text-[12px] font-semibold text-[#16A34A]">{e.entrada}</span>
                        <span className="font-mono text-[12px] font-semibold text-[#2563EB]">{e.salida}</span>
                        <StatusTag s={e.status} />
                      </div>
                    ))}
                  </div>

                  {/* Timeline bar */}
                  <div>
                    <div className="flex justify-between text-[10px] text-[#AEAEA6] mb-1.5">
                      <span>07:00</span><span>09:00</span><span>13:00</span><span>17:00</span><span>19:00</span>
                    </div>
                    <div className="h-[3px] rounded-full bg-[#EDE8DF]">
                      <div className="timeline-bar h-full" style={{ width:"65%" }} />
                    </div>
                    <p className="text-[10px] text-[#AEAEA6] mt-1">Jornada laboral · 08:00 — 17:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════ FEATURES ════════════════ */}
        <section id="features" className="py-28 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[12px] font-bold text-[#2563EB] uppercase tracking-[0.14em] mb-3">Características</p>
              <h2 className="text-[2.375rem] font-bold tracking-[-0.025em] text-[#0F0F0F] leading-tight">
                Todo lo que necesitas.
                <br />
                <span className="text-[#7A7A72]">Nada que sobre.</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map(f => (
                <div key={f.title} className="glass rounded-2xl p-6 group hover:shadow-[0_8px_48px_rgba(37,99,235,0.09)] transition-all duration-300 hover:-translate-y-0.5">
                  <div className="w-10 h-10 rounded-[10px] bg-[#EFF6FF] flex items-center justify-center mb-4 group-hover:bg-[#DBEAFE] transition-colors">
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-[#0F0F0F] mb-2 text-[15px]">{f.title}</h3>
                  <p className="text-[13.5px] text-[#7A7A72] leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════ DEMO (detalle checada) ════════════════ */}
        <section id="demo" className="py-28 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="glass rounded-3xl overflow-hidden shadow-[0_20px_80px_rgba(15,15,15,0.07)]">
              <div className="grid lg:grid-cols-2">

                {/* Left: copy */}
                <div className="p-10 lg:p-14 flex flex-col justify-center">
                  <p className="text-[12px] font-bold text-[#2563EB] uppercase tracking-[0.14em] mb-4">Registro de asistencia</p>
                  <h2 className="text-[2rem] font-bold tracking-[-0.025em] text-[#0F0F0F] mb-5 leading-snug">
                    Hora exacta de entrada
                    <br />y salida de cada quien.
                  </h2>
                  <p className="text-[#7A7A72] text-[14.5px] leading-relaxed mb-7">
                    Cada ficha queda registrada con fecha, hora, nombre del empleado
                    y tipo de movimiento. El historial completo siempre disponible.
                  </p>
                  <div className="space-y-3">
                    {[
                      { icon:"🕗", text:"Hora precisa al segundo" },
                      { icon:"📍", text:"Registro desde la app móvil o escritorio" },
                      { icon:"📋", text:"Historial consultable por día, semana o mes" },
                      { icon:"⚠️",  text:"Alertas de llegada tarde o ausencias" },
                    ].map(i => (
                      <div key={i.text} className="flex items-center gap-3 text-[13.5px] text-[#3A3A35]">
                        <span className="text-base">{i.icon}</span>
                        {i.text}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: attendance detail card */}
                <div className="bg-white/30 border-l border-[rgba(200,192,178,0.2)] p-8 lg:p-10 flex flex-col gap-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[13px] font-semibold text-[#0F0F0F]">Movimientos de hoy</p>
                    <span className="text-[11px] text-[#7A7A72]">Martes 13 mayo · 50 empleados</span>
                  </div>

                  {/* Detailed logs */}
                  {[
                    { time:"07:55", name:"José Hernández",  type:"Entrada", color:"#DCFCE7", tc:"#16A34A", tag:"entrada" },
                    { time:"07:58", name:"Ana García",      type:"Entrada", color:"#DBEAFE", tc:"#2563EB", tag:"entrada" },
                    { time:"08:01", name:"Luis Martínez",   type:"Entrada", color:"#DBEAFE", tc:"#2563EB", tag:"entrada" },
                    { time:"08:12", name:"Carlos Ruiz",     type:"Entrada", color:"#DCFCE7", tc:"#16A34A", tag:"entrada" },
                    { time:"08:47", name:"María López",     type:"Entrada", color:"#FEF3C7", tc:"#D97706", tag:"tarde"   },
                    { time:"16:58", name:"José Hernández",  type:"Salida",  color:"#EDE9FE", tc:"#6D28D9", tag:"salida"  },
                    { time:"17:00", name:"Luis Martínez",   type:"Salida",  color:"#DBEAFE", tc:"#2563EB", tag:"salida"  },
                    { time:"17:02", name:"Ana García",      type:"Salida",  color:"#DBEAFE", tc:"#2563EB", tag:"salida"  },
                    { time:"17:15", name:"Carlos Ruiz",     type:"Salida",  color:"#DCFCE7", tc:"#16A34A", tag:"salida"  },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-xl bg-white/50 hover:bg-white/75 transition-colors">
                      <span className="font-mono text-[12px] font-bold text-[#AEAEA6] w-12 shrink-0">{log.time}</span>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                        style={{ background: log.color, color: log.tc }}>
                        {log.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                      </div>
                      <span className="text-[12.5px] font-medium text-[#0F0F0F] flex-1 truncate">{log.name}</span>
                      <span className={`tag-${log.tag}`}>{log.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════ PLANS ════════════════ */}
        <section id="plans" className="py-28 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[12px] font-bold text-[#2563EB] uppercase tracking-[0.14em] mb-3">Planes</p>
              <h2 className="text-[2.375rem] font-bold tracking-[-0.025em] text-[#0F0F0F]">
                Una licencia. Tu servidor.
                <br />
                <span className="text-[#7A7A72]">Sin suscripciones.</span>
              </h2>
              <p className="text-[#7A7A72] mt-4 text-[15px]">Pago único. Actualizaciones incluidas. Datos 100% tuyos.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map(p => (
                <div key={p.tier}
                  className={`glass rounded-2xl p-6 flex flex-col ${p.featured ? "plan-featured" : ""} hover:-translate-y-0.5 transition-all duration-300`}>
                  {p.featured && (
                    <span className="text-[11px] font-bold text-[#2563EB] bg-[#DBEAFE] px-2.5 py-0.5 rounded-full self-start mb-4">
                      ⭐ Más popular
                    </span>
                  )}
                  <p className="text-[11px] font-bold text-[#AEAEA6] uppercase tracking-wider mb-1">{p.label}</p>
                  <div className="mb-1">
                    <span className="text-5xl font-extrabold text-[#0F0F0F] tracking-tight">{p.tier}</span>
                    <span className="text-[13px] text-[#7A7A72] ml-1.5">empleados</span>
                  </div>
                  <p className="text-[12.5px] text-[#7A7A72] mb-5 leading-snug">{p.desc}</p>

                  <ul className="space-y-2.5 mb-6 flex-1">
                    {p.feats.map(f => (
                      <li key={f} className="flex items-start gap-2 text-[13px] text-[#3A3A35]">
                        <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <circle cx="7" cy="7" r="6.5" fill={p.featured ? "#2563EB" : "#F0F0EC"} />
                          <path d="M4.5 7l2 2 3-3" stroke={p.featured ? "white" : "#7A7A72"} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <a href="mailto:contacto@d99-tech.com"
                    className={`justify-center text-[13.5px] ${p.featured ? "btn-primary" : "btn-ghost"}`}>
                    Solicitar licencia
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════ HOW IT WORKS ════════════════ */}
        <section className="py-28 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[12px] font-bold text-[#2563EB] uppercase tracking-[0.14em] mb-3">Cómo funciona</p>
              <h2 className="text-[2.375rem] font-bold tracking-[-0.025em] text-[#0F0F0F]">
                Del cero al control
                <br />
                <span className="text-[#7A7A72]">en minutos.</span>
              </h2>
            </div>

            <div className="space-y-4">
              {steps.map((s, i) => (
                <div key={s.n} className="glass rounded-2xl p-6 flex gap-5 items-start hover:shadow-[0_4px_32px_rgba(37,99,235,0.07)] transition-all">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-mono font-bold text-[13px]"
                    style={{ background: i === 0 ? "#2563EB" : "#EFF6FF", color: i === 0 ? "white" : "#2563EB" }}>
                    {s.n}
                  </div>
                  <div className="pt-0.5">
                    <h3 className="font-semibold text-[#0F0F0F] mb-1.5 text-[15px]">{s.title}</h3>
                    <p className="text-[13.5px] text-[#7A7A72] leading-relaxed">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════ DOWNLOAD ════════════════ */}
        <section id="download" className="py-28 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="glass rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
              <div className="blob w-96 h-96 bg-blue-200 opacity-20 -top-24 -right-24" />
              <div className="blob w-72 h-72 bg-indigo-100 opacity-15 -bottom-20 -left-20" />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-[#2563EB] flex items-center justify-center mx-auto mb-6 shadow-[0_10px_40px_rgba(37,99,235,0.35)]">
                  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                    <path d="M13 3v16M6.5 13l6.5 6.5 6.5-6.5M3 22.5h20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h2 className="text-[2.125rem] font-bold tracking-[-0.025em] text-[#0F0F0F] mb-3">Descarga D-CLOCK</h2>
                <p className="text-[#7A7A72] text-[14.5px] mb-1.5">Versión 1.0 · Windows 10 / 11 · 64-bit</p>
                <p className="text-[13px] text-[#AEAEA6] mb-9">Necesitas una licencia activa para usar la aplicación.</p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a href="/downloads/dclock-setup.exe" className="btn-primary text-[15px]">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2v9M4.5 7.5 8 11l3.5-3.5M2 13.5h12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Descargar para Windows
                  </a>
                  <a href="mailto:contacto@d99-tech.com" className="btn-ghost text-[15px]">
                    Solicitar licencia
                  </a>
                </div>

                <p className="mt-7 text-[12.5px] text-[#AEAEA6]">
                  ¿Dudas?{" "}
                  <a href="mailto:contacto@d99-tech.com" className="text-[#2563EB] hover:underline font-medium">
                    Escríbenos a contacto@d99-tech.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════ FOOTER ════════════════ */}
        <footer className="border-t border-[rgba(200,192,178,0.22)] py-10 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-[8px] bg-[#2563EB] flex items-center justify-center">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="5.5" stroke="white" strokeWidth="1.4"/>
                  <path d="M8 4.5v3.8l2.2 1.4" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="font-bold text-[13px] text-[#0F0F0F]">D-CLOCK</span>
              <span className="text-[#D0CBC0]">·</span>
              <span className="text-[12px] text-[#AEAEA6]">by D99-TECH</span>
            </div>
            <p className="text-[12px] text-[#AEAEA6]">© {new Date().getFullYear()} D99-TECH. Todos los derechos reservados.</p>
            <div className="flex gap-5 text-[12px] text-[#AEAEA6]">
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
