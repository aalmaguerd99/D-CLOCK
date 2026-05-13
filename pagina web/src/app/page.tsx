import Image from "next/image";
import Navbar from "@/components/Navbar";

/* ─── attendance mock data ──────────────────────────── */
const TODAY_LOGS = [
  { time:"07:52", name:"José Hernández",  ini:"JH", bg:"#EDE9FE", tc:"#6D28D9", type:"Entrada", loc:"Oficina Central · CDMX",    ok:true  },
  { time:"07:58", name:"Ana García",      ini:"AG", bg:"#DBEAFE", tc:"#1D4ED8", type:"Entrada", loc:"Oficina Central · CDMX",    ok:true  },
  { time:"08:01", name:"Luis Martínez",   ini:"LM", bg:"#DCFCE7", tc:"#15803D", type:"Entrada", loc:"Sucursal Norte · CDMX",     ok:true  },
  { time:"08:12", name:"Carlos Ruiz",     ini:"CR", bg:"#FEF3C7", tc:"#B45309", type:"Entrada", loc:"Sucursal Norte · CDMX",     ok:true  },
  { time:"08:47", name:"María López",     ini:"ML", bg:"#FEE2E2", tc:"#B91C1C", type:"Entrada", loc:"Oficina Central · CDMX",    late:true },
  { time:"09:03", name:"Fernanda Cruz",   ini:"FC", bg:"#DBEAFE", tc:"#1D4ED8", type:"Entrada", loc:"Sucursal Sur · CDMX",       ok:true  },
  { time:"16:55", name:"José Hernández",  ini:"JH", bg:"#EDE9FE", tc:"#6D28D9", type:"Salida",  loc:"Oficina Central · CDMX",    ok:true  },
  { time:"17:00", name:"Luis Martínez",   ini:"LM", bg:"#DCFCE7", tc:"#15803D", type:"Salida",  loc:"Sucursal Norte · CDMX",     ok:true  },
  { time:"17:02", name:"Ana García",      ini:"AG", bg:"#DBEAFE", tc:"#1D4ED8", type:"Salida",  loc:"Oficina Central · CDMX",    ok:true  },
  { time:"17:15", name:"Carlos Ruiz",     ini:"CR", bg:"#FEF3C7", tc:"#B45309", type:"Salida",  loc:"Sucursal Norte · CDMX",     ok:true  },
];

const EMPLOYEES = [
  { name:"Ana García",     ini:"AG", bg:"#DBEAFE", tc:"#1D4ED8", entrada:"07:58", salida:"17:02", loc:"Of. Central",   s:"ok"   },
  { name:"Carlos Ruiz",    ini:"CR", bg:"#FEF3C7", tc:"#B45309", entrada:"08:12", salida:"17:15", loc:"Suc. Norte",    s:"ok"   },
  { name:"María López",    ini:"ML", bg:"#FEE2E2", tc:"#B91C1C", entrada:"08:47", salida:"—",     loc:"Of. Central",   s:"late" },
  { name:"José Hernández", ini:"JH", bg:"#EDE9FE", tc:"#6D28D9", entrada:"07:52", salida:"16:55", loc:"Of. Central",   s:"ok"   },
  { name:"Luis Martínez",  ini:"LM", bg:"#DCFCE7", tc:"#15803D", entrada:"08:01", salida:"17:00", loc:"Suc. Norte",    s:"ok"   },
  { name:"Sofía Torres",   ini:"ST", bg:"#FCE7F3", tc:"#9D174D", entrada:"—",     salida:"—",     loc:"—",             s:"abs"  },
];

/* ─── features ──────────────────────────────────────── */
const FEATURES = [
  { emoji:"🕐", title:"Entrada & Salida exacta",    desc:"Cada ficha registra hora al segundo, nombre, tipo de movimiento y ubicación GPS del empleado." },
  { emoji:"📍", title:"Geo-cercas inteligentes",     desc:"Define un radio alrededor de tu empresa. Solo se registra si el empleado está dentro del área." },
  { emoji:"📱", title:"App móvil Android & iOS",    desc:"El empleado ficha desde su celular. Conexión directa a tu servidor vía IP y puerto." },
  { emoji:"🏢", title:"Multi-sede",                  desc:"Administra múltiples sucursales desde un solo panel. Cada una con su geo-cerca propia." },
  { emoji:"📊", title:"Reportes para nómina",        desc:"Exporta asistencias a Excel o PDF. Compatible con CONTPAq, NOI y formatos IMSS." },
  { emoji:"🔒", title:"Servidor en tu empresa",     desc:"Tus datos nunca salen de tu red. Sin nube, sin terceros, sin riesgos de privacidad." },
  { emoji:"⚡", title:"Alertas automáticas",         desc:"Notificaciones de llegada tarde, ausencias o salidas fuera de horario en tiempo real." },
  { emoji:"🗂️", title:"Historial completo",          desc:"Consulta entradas y salidas de cualquier empleado por día, semana, quincena o mes." },
];

/* ─── integrations ─────────────────────────────────── */
const INTEGRATIONS = [
  { name:"CONTPAq",   color:"#1D4ED8" },
  { name:"NOI",       color:"#15803D" },
  { name:"Excel",     color:"#16A34A" },
  { name:"PDF",       color:"#DC2626" },
  { name:"SAT / XML", color:"#D97706" },
  { name:"IMSS",      color:"#7C3AED" },
  { name:"REST API",  color:"#0D0D0C" },
  { name:"Google Maps", color:"#2563EB" },
];

/* ─── plans ─────────────────────────────────────────── */
const PLANS = [
  { tier:"50",  label:"Starter",    desc:"Para PyMEs y negocios pequeños.",        feats:["50 empleados","App móvil","2 geo-cercas","Reportes básicos","Soporte email"],                                            feat:false },
  { tier:"100", label:"Business",   desc:"El más elegido por empresas medianas.",  feats:["100 empleados","App móvil","5 geo-cercas","Reportes Excel/PDF","CONTPAq / NOI","Soporte prioritario"],                   feat:true  },
  { tier:"200", label:"Pro",        desc:"Para empresas en expansión.",            feats:["200 empleados","App móvil","Geo-cercas ilimitadas","Reportes Excel/PDF","CONTPAq / NOI","Multi-sede","Soporte 24/7"],     feat:false },
  { tier:"500", label:"Enterprise", desc:"Máxima capacidad. Sin límites.",         feats:["500 empleados","App móvil","Geo-cercas ilimitadas","Reportes Excel/PDF","CONTPAq / NOI","Multi-sede","REST API","Soporte dedicado"], feat:false },
];

/* ─── helpers ───────────────────────────────────────── */
function STag({ s }: { s:string }) {
  if (s==="ok")   return <span className="tag tag-in">Presente</span>;
  if (s==="late") return <span className="tag tag-late">Tarde</span>;
  return               <span className="tag tag-abs">Ausente</span>;
}
function MTag({ t }: { t:string }) {
  return t==="Entrada"
    ? <span className="tag tag-in">↑ Entrada</span>
    : <span className="tag tag-out">↓ Salida</span>;
}

/* ════════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <>
      <Navbar />
      <main className="pt-[3.75rem]">

        {/* ══ HERO ══════════════════════════════════════ */}
        <section className="relative min-h-[96vh] flex items-center justify-center overflow-hidden px-6 py-20">
          <div className="blob w-[700px] h-[700px] bg-blue-200 opacity-[.15] -top-60 -right-60" />
          <div className="blob w-[500px] h-[500px] bg-indigo-100 opacity-[.12] bottom-0 -left-40" />
          <div className="blob w-[350px] h-[350px] bg-sky-100 opacity-[.14] top-1/2 left-[30%]" />

          <div className="relative z-10 max-w-6xl mx-auto w-full grid lg:grid-cols-[1fr_1.1fr] gap-14 items-center">

            {/* copy */}
            <div>
              {/* brand lockup */}
              <div className="flex items-center gap-3 mb-8">
                <Image src="/D99logo.png" alt="D99-TECH" width={48} height={48}
                  className="rounded-xl object-contain shadow-sm" />
                <div>
                  <p className="text-[11px] font-bold text-[#78786E] uppercase tracking-widest">D99-TECH presenta</p>
                  <p className="text-[1.35rem] font-extrabold tracking-tight text-[#0D0D0C] leading-none">D-CLOCK</p>
                </div>
              </div>

              <h1 className="text-[3.4rem] md:text-[4rem] font-extrabold tracking-[-0.035em] leading-[1.04] text-[#0D0D0C] mb-5">
                El checador que
                <br />
                <span className="text-transparent bg-clip-text"
                  style={{ backgroundImage:"linear-gradient(90deg,#2563EB,#60A5FA)" }}>
                  sabe dónde
                </span>
                <br />
                están tus
                <br />
                empleados.
              </h1>

              <p className="text-[1.0625rem] text-[#78786E] leading-[1.75] max-w-[440px] mb-9">
                Control de asistencia con <strong className="text-[#0D0D0C] font-semibold">geo-cercas</strong>, hora exacta de entrada y salida,
                app móvil, multi-sede y compatible con <strong className="text-[#0D0D0C] font-semibold">CONTPAq y NOI</strong>.
                Todo en tu servidor.
              </p>

              <div className="flex flex-wrap gap-3 mb-9">
                <a href="#download" className="btn-primary">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2v9M4.5 7.5 8 11l3.5-3.5M2 13.5h12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Descargar D-CLOCK
                </a>
                <a href="#plans" className="btn-ghost">Ver planes →</a>
              </div>

              {/* proof pills */}
              <div className="flex flex-wrap gap-2.5">
                {["⚡ Instalación en 5 min","📍 Geo-cercas incluidas","📱 Android & iPhone","🔒 Datos en tu servidor","📊 Compatible CONTPAq"].map(t => (
                  <span key={t} className="text-[12px] font-medium text-[#78786E] bg-white/60 border border-[rgba(200,192,178,.35)] px-2.5 py-1 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* dashboard mockup */}
            <div className="relative">
              {/* floating badge — entrada */}
              <div className="float1 absolute -top-5 -right-3 z-20">
                <div className="glass-strong rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-xl">
                  <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path d="M2.5 8l4 4 6-7" stroke="#16A34A" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#0D0D0C]">Ana García — Entrada</p>
                    <p className="text-[10px] text-[#16A34A] font-semibold flex items-center gap-1">
                      <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                        <path d="M5 1a3 3 0 013 3c0 2.5-3 6-3 6S2 6.5 2 4a3 3 0 013-3z" fill="#16A34A"/>
                        <circle cx="5" cy="4" r="1" fill="white"/>
                      </svg>
                      07:58 · Oficina Central
                    </p>
                  </div>
                </div>
              </div>

              {/* floating badge — geo */}
              <div className="float2 absolute -bottom-4 -left-4 z-20">
                <div className="glass-strong rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-xl">
                  <div className="w-8 h-8 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path d="M7.5 1.5A4 4 0 0111.5 5.5C11.5 8.5 7.5 13 7.5 13S3.5 8.5 3.5 5.5a4 4 0 014-4z" stroke="#7C3AED" strokeWidth="1.3"/>
                      <circle cx="7.5" cy="5.5" r="1.3" stroke="#7C3AED" strokeWidth="1.3"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#0D0D0C]">Geo-cerca activa</p>
                    <p className="text-[10px] text-[#7C3AED] font-semibold">Radio 150m · 47 presentes</p>
                  </div>
                </div>
              </div>

              {/* main card */}
              <div className="glass rounded-3xl overflow-hidden shadow-[0_28px_90px_rgba(13,13,12,.11)]">
                {/* titlebar */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(200,192,178,.18)] bg-white/25">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-300"/>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-300"/>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-300"/>
                  </div>
                  <span className="text-[10.5px] text-[#AEAEA4] font-mono">D-CLOCK · Panel Principal</span>
                  <div className="flex items-center gap-1 text-[10.5px] text-[#16A34A] font-bold">
                    <span className="pdot w-1.5 h-1.5 rounded-full bg-[#16A34A] inline-block"/>En vivo
                  </div>
                </div>

                <div className="p-4 space-y-3.5">
                  {/* stats */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { l:"Presentes", v:44, c:"#16A34A", bg:"#DCFCE7" },
                      { l:"Tarde",     v: 4, c:"#D97706", bg:"#FEF3C7" },
                      { l:"Ausentes",  v: 2, c:"#DC2626", bg:"#FEE2E2" },
                      { l:"En campo",  v:12, c:"#7C3AED", bg:"#EDE9FE" },
                    ].map(s => (
                      <div key={s.l} className="glass rounded-xl p-2.5 text-center">
                        <p className="text-[1.3rem] font-extrabold leading-none" style={{color:s.c}}>{s.v}</p>
                        <p className="text-[9px] text-[#AEAEA4] mt-1 font-medium">{s.l}</p>
                        <div className="mt-1.5 h-[2px] rounded-full bg-[#EDE8DF]">
                          <div className="h-full rounded-full" style={{width:`${(s.v/50)*100}%`,background:s.c}}/>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* col headers */}
                  <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-2 px-2
                    text-[9.5px] font-bold text-[#AEAEA4] uppercase tracking-wider">
                    <span/>
                    <span>Empleado</span>
                    <span>Entrada</span>
                    <span>Salida</span>
                    <span>Estado</span>
                  </div>

                  {/* rows */}
                  <div className="space-y-1">
                    {EMPLOYEES.map(e => (
                      <div key={e.name}
                        className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-2 items-center py-2 px-2.5 rounded-xl bg-white/45 hover:bg-white/70 transition-colors">
                        <div className="av" style={{background:e.bg,color:e.tc}}>{e.ini}</div>
                        <div className="min-w-0">
                          <p className="text-[11.5px] font-semibold text-[#0D0D0C] truncate leading-none">{e.name.split(" ")[0]}</p>
                          <p className="text-[9.5px] text-[#AEAEA4] flex items-center gap-0.5 mt-0.5">
                            <svg width="7" height="7" viewBox="0 0 8 8" fill="none">
                              <path d="M4 0.5A2.5 2.5 0 016.5 3C6.5 5 4 7.5 4 7.5S1.5 5 1.5 3A2.5 2.5 0 014 0.5z" fill="#AEAEA4"/>
                            </svg>
                            {e.loc}
                          </p>
                        </div>
                        <span className="font-mono text-[11px] font-bold text-[#16A34A]">{e.entrada}</span>
                        <span className="font-mono text-[11px] font-bold text-[#2563EB]">{e.salida}</span>
                        <STag s={e.s}/>
                      </div>
                    ))}
                  </div>

                  {/* jornada */}
                  <div className="px-1">
                    <div className="flex justify-between text-[9px] text-[#AEAEA4] mb-1">
                      <span>07:00</span><span>09:00</span><span>13:00</span><span>17:00</span><span>19:00</span>
                    </div>
                    <div className="h-[3px] rounded-full bg-[#EDE8DF]">
                      <div className="h-full rounded-full"
                        style={{width:"62%",background:"linear-gradient(90deg,#16A34A,#2563EB 60%,#D97706)"}}/>
                    </div>
                    <p className="text-[9px] text-[#AEAEA4] mt-1">Jornada 08:00–17:00 · Turno matutino</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ STATS BANNER ═════════════════════════════ */}
        <section className="py-10 px-6 border-y border-[rgba(200,192,178,.2)]">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { v:"< 5 min", l:"Tiempo de instalación" },
              { v:"100%",    l:"Datos en tu servidor" },
              { v:"4 tiers", l:"Planes de licencia" },
              { v:"0 mensualidades", l:"Pago único de por vida" },
            ].map(s => (
              <div key={s.l}>
                <p className="text-2xl font-extrabold text-[#0D0D0C] tracking-tight">{s.v}</p>
                <p className="text-[12px] text-[#78786E] mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ FEATURES ═════════════════════════════════ */}
        <section id="features" className="py-28 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[11.5px] font-bold text-[#2563EB] uppercase tracking-[.14em] mb-3">Características</p>
              <h2 className="text-[2.25rem] font-extrabold tracking-[-0.028em] text-[#0D0D0C]">
                Todo lo que necesitas para
                <br />
                <span className="text-[#78786E]">controlar la asistencia de verdad.</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {FEATURES.map(f => (
                <div key={f.title}
                  className="glass rounded-2xl p-5 group hover:shadow-[0_8px_48px_rgba(37,99,235,.09)] hover:-translate-y-0.5 transition-all duration-300">
                  <p className="text-2xl mb-3">{f.emoji}</p>
                  <h3 className="font-bold text-[#0D0D0C] mb-1.5 text-[14px] leading-snug">{f.title}</h3>
                  <p className="text-[12.5px] text-[#78786E] leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ GEO-CERCAS ═══════════════════════════════ */}
        <section id="geo" className="py-28 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="glass rounded-3xl overflow-hidden shadow-[0_20px_80px_rgba(13,13,12,.07)]">
              <div className="grid lg:grid-cols-2 gap-0">

                {/* left: copy */}
                <div className="p-10 lg:p-14 flex flex-col justify-center">
                  <span className="inline-block text-[11px] font-bold text-[#7C3AED] bg-[#EDE9FE] px-3 py-1 rounded-full self-start mb-5">
                    📍 Geo-cercas inteligentes
                  </span>
                  <h2 className="text-[2rem] font-extrabold tracking-[-0.025em] text-[#0D0D0C] mb-5 leading-snug">
                    Solo registra si el empleado
                    <br />
                    <span className="text-[#7C3AED]">está donde debe estar.</span>
                  </h2>
                  <p className="text-[#78786E] text-[14px] leading-relaxed mb-7">
                    Define un radio personalizado (50m, 100m, 500m) alrededor de cada sede.
                    Si el empleado no está dentro del área al fichar, la checada se
                    rechaza o se marca como fuera de zona.
                  </p>
                  <div className="space-y-3">
                    {[
                      { icon:"🏢", text:"Multi-sede: cada sucursal con su propia geo-cerca" },
                      { icon:"📐", text:"Radio ajustable desde 50 hasta 2,000 metros" },
                      { icon:"🚫", text:"Bloquea checadas fuera del área autorizada" },
                      { icon:"🗺️", text:"Visualiza en tiempo real dónde ficharon tus empleados" },
                      { icon:"⚠️",  text:"Alerta automática si alguien ficha fuera de zona" },
                    ].map(i => (
                      <div key={i.text} className="flex items-center gap-3 text-[13px] text-[#38382F]">
                        <span>{i.icon}</span>{i.text}
                      </div>
                    ))}
                  </div>
                </div>

                {/* right: map mock */}
                <div className="bg-white/30 border-l border-[rgba(200,192,178,.2)] p-8 lg:p-10 flex flex-col gap-4">
                  {/* map visual */}
                  <div className="relative rounded-2xl bg-[#EFF6FF] h-52 overflow-hidden flex items-center justify-center border border-[rgba(37,99,235,.1)]">
                    {/* grid lines */}
                    {[...Array(6)].map((_,i) => (
                      <div key={i} className="absolute inset-x-0 border-t border-[rgba(37,99,235,.06)]" style={{top:`${i*20}%`}}/>
                    ))}
                    {[...Array(6)].map((_,i) => (
                      <div key={i} className="absolute inset-y-0 border-l border-[rgba(37,99,235,.06)]" style={{left:`${i*20}%`}}/>
                    ))}
                    {/* geo-fence circle */}
                    <div className="relative flex items-center justify-center">
                      <div className="map-circle" style={{width:140,height:140,marginLeft:-70,marginTop:-70,top:"50%",left:"50%",position:"absolute"}}/>
                      <div className="w-24 h-24 rounded-full border-2 border-dashed border-[rgba(37,99,235,.35)] flex items-center justify-center bg-[rgba(37,99,235,.05)]">
                        <div className="map-pin bg-[#2563EB] shadow-[0_4px_16px_rgba(37,99,235,.4)]">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M7 1a4 4 0 014 4c0 3-4 8-4 8S3 8 3 5a4 4 0 014-4z" fill="white"/>
                            <circle cx="7" cy="5" r="1.3" fill="rgba(37,99,235,.4)"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    {/* employee dots */}
                    {[
                      {x:"55%",y:"42%",c:"#16A34A"},
                      {x:"48%",y:"55%",c:"#16A34A"},
                      {x:"52%",y:"38%",c:"#16A34A"},
                      {x:"70%",y:"65%",c:"#DC2626"},
                    ].map((d,i) => (
                      <div key={i} className="absolute w-3 h-3 rounded-full border-2 border-white shadow-sm"
                        style={{left:d.x,top:d.y,background:d.c}}/>
                    ))}
                    <p className="absolute bottom-2 right-3 text-[10px] text-[#78786E] font-mono">Radio: 150m</p>
                  </div>

                  {/* live log */}
                  <p className="text-[12px] font-bold text-[#0D0D0C]">Movimientos recientes</p>
                  <div className="space-y-1.5">
                    {TODAY_LOGS.slice(0,6).map((l,i) => (
                      <div key={i} className="flex items-center gap-2.5 py-1.5 px-3 rounded-xl bg-white/55 hover:bg-white/80 transition-colors">
                        <span className="font-mono text-[10.5px] font-bold text-[#AEAEA4] w-10 shrink-0">{l.time}</span>
                        <div className="av text-[10px]" style={{background:l.bg,color:l.tc}}>{l.ini}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11.5px] font-semibold text-[#0D0D0C] truncate leading-none">{l.name.split(" ")[0]}</p>
                          <p className="text-[9.5px] text-[#AEAEA4] flex items-center gap-0.5 mt-0.5">
                            <svg width="7" height="7" viewBox="0 0 8 8" fill="none">
                              <path d="M4 .5A2.5 2.5 0 016.5 3C6.5 5 4 7.5 4 7.5S1.5 5 1.5 3A2.5 2.5 0 014 .5z" fill="#AEAEA4"/>
                            </svg>
                            {l.loc}
                          </p>
                        </div>
                        <MTag t={l.type}/>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ INTEGRACIONES ════════════════════════════ */}
        <section className="py-20 px-6 border-y border-[rgba(200,192,178,.2)]">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-[11.5px] font-bold text-[#78786E] uppercase tracking-[.14em] mb-4">Compatible con</p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {INTEGRATIONS.map(i => (
                <span key={i.name} className="int-pill">
                  <span className="w-2 h-2 rounded-full inline-block" style={{background:i.color}}/>
                  {i.name}
                </span>
              ))}
            </div>
            <p className="text-[13px] text-[#78786E] mt-5">
              Exporta reportes en formatos compatibles con los sistemas de nómina más usados en México.
            </p>
          </div>
        </section>

        {/* ══ PLANS ════════════════════════════════════ */}
        <section id="plans" className="py-28 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[11.5px] font-bold text-[#2563EB] uppercase tracking-[.14em] mb-3">Planes</p>
              <h2 className="text-[2.25rem] font-extrabold tracking-[-0.028em] text-[#0D0D0C]">
                Un pago. Tu servidor.
                <br/>
                <span className="text-[#78786E]">Sin rentas mensuales.</span>
              </h2>
              <p className="text-[#78786E] mt-3 text-[14.5px]">Licencia de por vida · Actualizaciones incluidas · Soporte incluido</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PLANS.map(p => (
                <div key={p.tier}
                  className={`glass rounded-2xl p-6 flex flex-col ${p.feat?"plan-feat":""} hover:-translate-y-0.5 transition-all duration-300`}>
                  {p.feat && (
                    <span className="text-[10.5px] font-bold text-[#2563EB] bg-[#DBEAFE] px-2.5 py-0.5 rounded-full self-start mb-4">
                      ⭐ Más popular
                    </span>
                  )}
                  <p className="text-[10px] font-bold text-[#AEAEA4] uppercase tracking-wider mb-0.5">{p.label}</p>
                  <div className="mb-1.5">
                    <span className="text-5xl font-black text-[#0D0D0C] tracking-tighter">{p.tier}</span>
                    <span className="text-[13px] text-[#78786E] ml-1">empleados</span>
                  </div>
                  <p className="text-[12px] text-[#78786E] mb-5 leading-snug">{p.desc}</p>
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {p.feats.map(f => (
                      <li key={f} className="flex items-start gap-2 text-[12.5px] text-[#38382F]">
                        <svg className="mt-0.5 shrink-0" width="13" height="13" viewBox="0 0 13 13" fill="none">
                          <circle cx="6.5" cy="6.5" r="6" fill={p.feat?"#2563EB":"#F0F0EC"}/>
                          <path d="M4 6.5l2 2 3-3" stroke={p.feat?"white":"#78786E"}
                            strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a href="mailto:contacto@d99-tech.com"
                    className={`justify-center text-[13px] ${p.feat?"btn-primary":"btn-ghost"}`}>
                    Solicitar licencia
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ HOW IT WORKS ═════════════════════════════ */}
        <section className="py-28 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[11.5px] font-bold text-[#2563EB] uppercase tracking-[.14em] mb-3">Cómo funciona</p>
              <h2 className="text-[2.25rem] font-extrabold tracking-[-0.028em] text-[#0D0D0C]">
                Del cero al control
                <br/><span className="text-[#78786E]">en menos de 5 minutos.</span>
              </h2>
            </div>
            <div className="space-y-3.5">
              {[
                { n:"01", title:"Descarga el instalador",   body:"Descarga D-CLOCK para Windows desde esta página. Un solo archivo .exe de instalación rápida." },
                { n:"02", title:"Se instala solo",          body:"El instalador configura el servicio, abre el puerto y deja la app lista. Sin conocimientos técnicos." },
                { n:"03", title:"Activa tu licencia",       body:"Ingresa tu clave. D-CLOCK consulta nuestros servidores, obtiene el nombre de tu empresa, el límite de empleados y las sedes permitidas." },
                { n:"04", title:"Configura tus geo-cercas", body:"Desde el panel, dibuja el radio de cada sede en el mapa. Los empleados solo podrán fichar dentro del área." },
                { n:"05", title:"Empleados desde el celular",body:"Descargan la app, ingresan la IP de tu servidor y fichan entrada/salida con ubicación en tiempo real." },
              ].map((s,i) => (
                <div key={s.n} className="glass rounded-2xl p-5 flex gap-4 items-start hover:shadow-[0_4px_32px_rgba(37,99,235,.07)] transition-all">
                  <div className="w-11 h-11 rounded-[10px] flex items-center justify-center shrink-0 font-mono font-extrabold text-[12px]"
                    style={{background:i===0?"#2563EB":"#EFF6FF",color:i===0?"white":"#2563EB"}}>
                    {s.n}
                  </div>
                  <div className="pt-0.5">
                    <h3 className="font-bold text-[#0D0D0C] mb-1 text-[14.5px]">{s.title}</h3>
                    <p className="text-[13px] text-[#78786E] leading-relaxed">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ DOWNLOAD ═════════════════════════════════ */}
        <section id="download" className="py-28 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="glass rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
              <div className="blob w-96 h-96 bg-blue-200 opacity-20 -top-28 -right-28"/>
              <div className="blob w-72 h-72 bg-indigo-100 opacity-15 -bottom-20 -left-20"/>
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Image src="/D99logo.png" alt="D99-TECH" width={44} height={44}
                    className="rounded-xl object-contain shadow-sm" />
                  <div className="text-left">
                    <p className="font-extrabold text-[1.2rem] tracking-tight text-[#0D0D0C] leading-none">D-CLOCK</p>
                    <p className="text-[11px] text-[#78786E]">by D99-TECH</p>
                  </div>
                </div>
                <h2 className="text-[2rem] font-extrabold tracking-[-0.025em] text-[#0D0D0C] mb-2">
                  Descarga D-CLOCK gratis
                </h2>
                <p className="text-[#78786E] text-[14px] mb-1">Versión 1.0 · Windows 10 / 11 · 64-bit</p>
                <p className="text-[12.5px] text-[#AEAEA4] mb-8">Necesitas una licencia activa. <a href="mailto:contacto@d99-tech.com" className="text-[#2563EB] hover:underline">Solicita la tuya →</a></p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a href="/downloads/dclock-setup.exe" className="btn-primary text-[15px]">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2v9M4.5 7.5 8 11l3.5-3.5M2 13.5h12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Descargar para Windows
                  </a>
                  <a href="mailto:contacto@d99-tech.com" className="btn-ghost text-[15px]">Solicitar licencia</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ FOOTER ═══════════════════════════════════ */}
        <footer className="border-t border-[rgba(200,192,178,.2)] py-10 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-2.5">
              <Image src="/D99logo.png" alt="D99-TECH" width={28} height={28}
                className="rounded-[7px] object-contain" />
              <span className="font-extrabold text-[13px] text-[#0D0D0C]">D-CLOCK</span>
              <span className="text-[#D0CBC0]">·</span>
              <span className="text-[11.5px] text-[#AEAEA4]">by D99-TECH</span>
            </div>
            <p className="text-[11.5px] text-[#AEAEA4]">© {new Date().getFullYear()} D99-TECH. Todos los derechos reservados.</p>
            <div className="flex gap-5 text-[11.5px] text-[#AEAEA4]">
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
