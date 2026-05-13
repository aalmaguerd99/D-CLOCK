import Image from "next/image";
import Navbar from "@/components/Navbar";
import {
  IClock, IPin, IPhone, IBuildings, IBarChart, IShield,
  IBell, IHistory, IBolt, ILock, ICompass, IShieldOff,
  IMap, IAlertTri, IDownload, IArrowRight, ICheck, IServer, IGlobe, IUsers,
} from "@/components/Icons";

/* ─── data ──────────────────────────────────────────── */
const TODAY_LOGS = [
  { time:"07:52", name:"José Hernández",  ini:"JH", bg:"#EDE9FE", tc:"#6D28D9", type:"Entrada", loc:"Oficina Central · CDMX" },
  { time:"07:58", name:"Ana García",      ini:"AG", bg:"#DBEAFE", tc:"#1D4ED8", type:"Entrada", loc:"Oficina Central · CDMX" },
  { time:"08:01", name:"Luis Martínez",   ini:"LM", bg:"#DCFCE7", tc:"#15803D", type:"Entrada", loc:"Sucursal Norte · CDMX"  },
  { time:"08:12", name:"Carlos Ruiz",     ini:"CR", bg:"#FEF3C7", tc:"#B45309", type:"Entrada", loc:"Sucursal Norte · CDMX"  },
  { time:"08:47", name:"María López",     ini:"ML", bg:"#FEE2E2", tc:"#B91C1C", type:"Entrada", loc:"Oficina Central · CDMX", late:true },
  { time:"09:03", name:"Fernanda Cruz",   ini:"FC", bg:"#DBEAFE", tc:"#1D4ED8", type:"Entrada", loc:"Sucursal Sur · CDMX"    },
  { time:"16:55", name:"José Hernández",  ini:"JH", bg:"#EDE9FE", tc:"#6D28D9", type:"Salida",  loc:"Oficina Central · CDMX" },
  { time:"17:00", name:"Luis Martínez",   ini:"LM", bg:"#DCFCE7", tc:"#15803D", type:"Salida",  loc:"Sucursal Norte · CDMX"  },
  { time:"17:02", name:"Ana García",      ini:"AG", bg:"#DBEAFE", tc:"#1D4ED8", type:"Salida",  loc:"Oficina Central · CDMX" },
  { time:"17:15", name:"Carlos Ruiz",     ini:"CR", bg:"#FEF3C7", tc:"#B45309", type:"Salida",  loc:"Sucursal Norte · CDMX"  },
];

const EMPLOYEES = [
  { name:"Ana García",     ini:"AG", bg:"#DBEAFE", tc:"#1D4ED8", entrada:"07:58", salida:"17:02", loc:"Of. Central",  s:"ok"   },
  { name:"Carlos Ruiz",    ini:"CR", bg:"#FEF3C7", tc:"#B45309", entrada:"08:12", salida:"17:15", loc:"Suc. Norte",   s:"ok"   },
  { name:"María López",    ini:"ML", bg:"#FEE2E2", tc:"#B91C1C", entrada:"08:47", salida:"—",     loc:"Of. Central",  s:"late" },
  { name:"José Hernández", ini:"JH", bg:"#EDE9FE", tc:"#6D28D9", entrada:"07:52", salida:"16:55", loc:"Of. Central",  s:"ok"   },
  { name:"Luis Martínez",  ini:"LM", bg:"#DCFCE7", tc:"#15803D", entrada:"08:01", salida:"17:00", loc:"Suc. Norte",   s:"ok"   },
  { name:"Sofía Torres",   ini:"ST", bg:"#FCE7F3", tc:"#9D174D", entrada:"—",     salida:"—",     loc:"—",            s:"abs"  },
];

const FEATURES = [
  { Icon: IClock,     title:"Entrada & Salida exacta",   desc:"Cada ficha registra hora al segundo, nombre, tipo de movimiento y ubicación GPS del empleado." },
  { Icon: IPin,       title:"Geo-cercas inteligentes",    desc:"Define un radio alrededor de tu empresa. Solo se registra si el empleado está dentro del área." },
  { Icon: IPhone,     title:"App móvil Android & iOS",   desc:"El empleado ficha desde su celular. Conexión directa a tu servidor vía IP y puerto." },
  { Icon: IBuildings, title:"Multi-sede",                 desc:"Administra múltiples sucursales desde un solo panel. Cada una con su geo-cerca propia." },
  { Icon: IBarChart,  title:"Reportes para nómina",       desc:"Exporta asistencias a Excel o PDF. Compatible con CONTPAq, NOI y formatos IMSS." },
  { Icon: IServer,    title:"Servidor en tu empresa",     desc:"Tus datos nunca salen de tu red. Sin nube, sin terceros, sin riesgos de privacidad." },
  { Icon: IBell,      title:"Alertas automáticas",        desc:"Notificaciones de llegada tarde, ausencias o salidas fuera de horario en tiempo real." },
  { Icon: IHistory,   title:"Historial completo",         desc:"Consulta entradas y salidas de cualquier empleado por día, semana, quincena o mes." },
];

const INTEGRATIONS = [
  { name:"CONTPAq",    color:"#1D4ED8" },
  { name:"NOI",        color:"#15803D" },
  { name:"Excel",      color:"#16A34A" },
  { name:"PDF",        color:"#DC2626" },
  { name:"SAT / XML",  color:"#D97706" },
  { name:"IMSS",       color:"#7C3AED" },
  { name:"REST API",   color:"#0D0D0C" },
  { name:"Google Maps",color:"#2563EB" },
];

const PLANS = [
  { tier:"50",  label:"Starter",    desc:"Para PyMEs y negocios pequeños.",       feats:["50 empleados","App móvil","2 geo-cercas","Reportes básicos","Soporte email"],                                           feat:false },
  { tier:"100", label:"Business",   desc:"El más elegido por empresas medianas.", feats:["100 empleados","App móvil","5 geo-cercas","Reportes Excel/PDF","CONTPAq / NOI","Soporte prioritario"],                  feat:true  },
  { tier:"200", label:"Pro",        desc:"Para empresas en expansión.",           feats:["200 empleados","App móvil","Geo-cercas ilimitadas","Excel/PDF","CONTPAq / NOI","Multi-sede","Soporte 24/7"],             feat:false },
  { tier:"500", label:"Enterprise", desc:"Máxima capacidad. Sin límites.",        feats:["500 empleados","App móvil","Geo-cercas ilimitadas","Excel/PDF","CONTPAq / NOI","Multi-sede","REST API","Soporte dedicado"], feat:false },
];

/* ─── small components ──────────────────────────────── */
function STag({ s }: { s: string }) {
  if (s === "ok")   return <span className="tag tag-in">Presente</span>;
  if (s === "late") return <span className="tag tag-late">Tarde</span>;
  return <span className="tag tag-abs">Ausente</span>;
}
function MTag({ t }: { t: string }) {
  return t === "Entrada"
    ? <span className="tag tag-in">Entrada</span>
    : <span className="tag tag-out">Salida</span>;
}

/* ════════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <>
      <Navbar />
      <main className="pt-[3.75rem]">

        {/* ══ HERO ══════════════════════════════════════════ */}
        <section className="relative min-h-[96vh] flex items-center justify-center overflow-hidden px-6 py-20">
          <div className="blob w-[700px] h-[700px] bg-blue-200 opacity-[.15] -top-60 -right-60" />
          <div className="blob w-[500px] h-[500px] bg-indigo-100 opacity-[.12] bottom-0 -left-40" />
          <div className="blob w-[350px] h-[350px] bg-sky-100 opacity-[.13] top-1/2 left-[30%]" />

          <div className="relative z-10 max-w-6xl mx-auto w-full grid lg:grid-cols-[1fr_1.1fr] gap-14 items-center">

            {/* copy */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Image src="/D99logo.png" alt="D99-TECH" width={48} height={48}
                  className="rounded-xl object-contain shadow-sm" />
                <div>
                  <p className="text-[10.5px] font-bold text-[#78786E] uppercase tracking-widest">D99-TECH presenta</p>
                  <p className="text-[1.3rem] font-extrabold tracking-tight text-[#0D0D0C] leading-none">D-CLOCK</p>
                </div>
              </div>

              <h1 className="text-[3.4rem] md:text-[4rem] font-extrabold tracking-[-0.035em] leading-[1.04] text-[#0D0D0C] mb-5">
                El checador que<br />
                <span className="text-transparent bg-clip-text"
                  style={{ backgroundImage:"linear-gradient(90deg,#2563EB,#60A5FA)" }}>
                  sabe dónde
                </span><br />
                están tus<br />empleados.
              </h1>

              <p className="text-[1.0625rem] text-[#78786E] leading-[1.75] max-w-[440px] mb-9">
                Control de asistencia con{" "}
                <strong className="text-[#0D0D0C] font-semibold">geo-cercas</strong>, hora
                exacta de entrada y salida, app móvil, multi-sede y compatible con{" "}
                <strong className="text-[#0D0D0C] font-semibold">CONTPAq y NOI</strong>.
                Todo en tu servidor.
              </p>

              <div className="flex flex-wrap gap-3 mb-9">
                <a href="#download" className="btn-primary">
                  <IDownload size={16} color="white" />
                  Descargar D-CLOCK
                </a>
                <a href="#plans" className="btn-ghost">
                  Ver planes
                  <IArrowRight size={15} color="#38382F" />
                </a>
              </div>

              {/* proof pills — icons only, no emojis */}
              <div className="flex flex-wrap gap-2">
                {[
                  { Icon: IBolt,      text:"Instalación en 5 min"    },
                  { Icon: IPin,       text:"Geo-cercas incluidas"     },
                  { Icon: IPhone,     text:"Android & iPhone"         },
                  { Icon: IShield,    text:"Datos en tu servidor"     },
                  { Icon: IBarChart,  text:"Compatible CONTPAq"       },
                ].map(({ Icon, text }) => (
                  <span key={text}
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#78786E] bg-white/60 border border-[rgba(200,192,178,.35)] px-2.5 py-1 rounded-full">
                    <Icon size={13} color="#2563EB" />
                    {text}
                  </span>
                ))}
              </div>
            </div>

            {/* dashboard mockup */}
            <div className="relative">
              {/* floating — entrada */}
              <div className="float1 absolute -top-5 -right-3 z-20">
                <div className="glass-strong rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-xl">
                  <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] flex items-center justify-center">
                    <ICheck size={15} color="#16A34A" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#0D0D0C]">Ana García — Entrada</p>
                    <p className="text-[10px] text-[#16A34A] font-semibold flex items-center gap-1">
                      <IPin size={9} color="#16A34A" />
                      07:58 · Oficina Central
                    </p>
                  </div>
                </div>
              </div>

              {/* floating — geo */}
              <div className="float2 absolute -bottom-4 -left-4 z-20">
                <div className="glass-strong rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-xl">
                  <div className="w-8 h-8 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
                    <ICompass size={15} color="#7C3AED" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#0D0D0C]">Geo-cerca activa</p>
                    <p className="text-[10px] text-[#7C3AED] font-semibold">Radio 150m · 47 presentes</p>
                  </div>
                </div>
              </div>

              {/* main card */}
              <div className="glass rounded-3xl overflow-hidden shadow-[0_28px_90px_rgba(13,13,12,.11)]">
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
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { l:"Presentes", v:44, c:"#16A34A" },
                      { l:"Tarde",     v: 4, c:"#D97706" },
                      { l:"Ausentes",  v: 2, c:"#DC2626" },
                      { l:"En campo",  v:12, c:"#7C3AED" },
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

                  <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-2 px-2 text-[9.5px] font-bold text-[#AEAEA4] uppercase tracking-wider">
                    <span/><span>Empleado</span><span>Entrada</span><span>Salida</span><span>Estado</span>
                  </div>

                  <div className="space-y-1">
                    {EMPLOYEES.map(e => (
                      <div key={e.name}
                        className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-2 items-center py-2 px-2.5 rounded-xl bg-white/45 hover:bg-white/70 transition-colors">
                        <div className="av" style={{background:e.bg,color:e.tc}}>{e.ini}</div>
                        <div className="min-w-0">
                          <p className="text-[11.5px] font-semibold text-[#0D0D0C] truncate leading-none">{e.name.split(" ")[0]}</p>
                          <p className="text-[9.5px] text-[#AEAEA4] flex items-center gap-0.5 mt-0.5">
                            <IPin size={8} color="#AEAEA4" />{e.loc}
                          </p>
                        </div>
                        <span className="font-mono text-[11px] font-bold text-[#16A34A]">{e.entrada}</span>
                        <span className="font-mono text-[11px] font-bold text-[#2563EB]">{e.salida}</span>
                        <STag s={e.s}/>
                      </div>
                    ))}
                  </div>

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

        {/* ══ STATS BANNER ═════════════════════════════════ */}
        <section className="py-10 px-6 border-y border-[rgba(200,192,178,.2)]">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { v:"< 5 min",         l:"Tiempo de instalación"   },
              { v:"100%",            l:"Datos en tu servidor"    },
              { v:"4 planes",        l:"Tiers de licencia"       },
              { v:"Sin mensualidad", l:"Pago único de por vida"  },
            ].map(s => (
              <div key={s.l}>
                <p className="text-[1.5rem] font-extrabold text-[#0D0D0C] tracking-tight">{s.v}</p>
                <p className="text-[12px] text-[#78786E] mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ FEATURES ══════════════════════════════════════ */}
        <section id="features" className="py-28 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[11px] font-bold text-[#2563EB] uppercase tracking-[.14em] mb-3">Características</p>
              <h2 className="text-[2.25rem] font-extrabold tracking-[-0.028em] text-[#0D0D0C]">
                Todo lo que necesitas para
                <br /><span className="text-[#78786E]">controlar la asistencia de verdad.</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {FEATURES.map(({ Icon, title, desc }) => (
                <div key={title}
                  className="glass rounded-2xl p-5 group hover:shadow-[0_8px_48px_rgba(37,99,235,.09)] hover:-translate-y-0.5 transition-all duration-300">
                  <div className="w-10 h-10 rounded-[10px] bg-[#EFF6FF] flex items-center justify-center mb-3.5 group-hover:bg-[#DBEAFE] transition-colors">
                    <Icon size={19} color="#2563EB" />
                  </div>
                  <h3 className="font-bold text-[#0D0D0C] mb-1.5 text-[14px] leading-snug">{title}</h3>
                  <p className="text-[12.5px] text-[#78786E] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ GEO-CERCAS ════════════════════════════════════ */}
        <section id="geo" className="py-28 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="glass rounded-3xl overflow-hidden shadow-[0_20px_80px_rgba(13,13,12,.07)]">
              <div className="grid lg:grid-cols-2">

                {/* copy */}
                <div className="p-10 lg:p-14 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 text-[11px] font-bold text-[#7C3AED] bg-[#EDE9FE] px-3 py-1.5 rounded-full self-start mb-5">
                    <IPin size={12} color="#7C3AED" />
                    Geo-cercas inteligentes
                  </div>
                  <h2 className="text-[2rem] font-extrabold tracking-[-0.025em] text-[#0D0D0C] mb-5 leading-snug">
                    Solo registra si el empleado
                    <br /><span className="text-[#7C3AED]">está donde debe estar.</span>
                  </h2>
                  <p className="text-[#78786E] text-[14px] leading-relaxed mb-7">
                    Define un radio personalizado (50m–2km) alrededor de cada sede.
                    Si el empleado no está dentro del área al fichar, la checada se
                    rechaza o se marca como fuera de zona.
                  </p>
                  <div className="space-y-3">
                    {[
                      { Icon: IBuildings, text:"Multi-sede: cada sucursal con su propia geo-cerca" },
                      { Icon: ICompass,   text:"Radio ajustable desde 50 hasta 2,000 metros"       },
                      { Icon: IShieldOff, text:"Bloquea checadas fuera del área autorizada"         },
                      { Icon: IMap,       text:"Visualiza en mapa dónde ficharon tus empleados"     },
                      { Icon: IAlertTri,  text:"Alerta automática si alguien ficha fuera de zona"   },
                    ].map(({ Icon, text }) => (
                      <div key={text} className="flex items-center gap-3 text-[13px] text-[#38382F]">
                        <div className="w-7 h-7 rounded-lg bg-[#EDE9FE] flex items-center justify-center shrink-0">
                          <Icon size={13} color="#7C3AED" />
                        </div>
                        {text}
                      </div>
                    ))}
                  </div>
                </div>

                {/* map + log */}
                <div className="bg-white/30 border-l border-[rgba(200,192,178,.2)] p-8 lg:p-10 flex flex-col gap-4">
                  {/* map mock */}
                  <div className="relative rounded-2xl bg-[#F0F5FF] h-52 overflow-hidden flex items-center justify-center border border-[rgba(37,99,235,.1)]">
                    {[...Array(6)].map((_,i) => (
                      <div key={`h${i}`} className="absolute inset-x-0 border-t border-[rgba(37,99,235,.06)]" style={{top:`${i*20}%`}}/>
                    ))}
                    {[...Array(6)].map((_,i) => (
                      <div key={`v${i}`} className="absolute inset-y-0 border-l border-[rgba(37,99,235,.06)]" style={{left:`${i*20}%`}}/>
                    ))}
                    <div className="relative flex items-center justify-center">
                      <div className="map-circle absolute" style={{width:140,height:140,left:-70,top:-70}}/>
                      <div className="w-24 h-24 rounded-full border-2 border-dashed border-[rgba(37,99,235,.3)] flex items-center justify-center bg-[rgba(37,99,235,.05)]">
                        <div className="w-9 h-9 rounded-full bg-[#2563EB] flex items-center justify-center shadow-[0_4px_16px_rgba(37,99,235,.4)]">
                          <IPin size={15} color="white" />
                        </div>
                      </div>
                    </div>
                    {[{x:"55%",y:"42%",c:"#16A34A"},{x:"48%",y:"55%",c:"#16A34A"},{x:"52%",y:"37%",c:"#16A34A"},{x:"72%",y:"65%",c:"#DC2626"}].map((d,i)=>(
                      <div key={i} className="absolute w-3 h-3 rounded-full border-2 border-white shadow-sm"
                        style={{left:d.x,top:d.y,background:d.c}}/>
                    ))}
                    <div className="absolute bottom-2 right-3 flex items-center gap-1 text-[10px] text-[#78786E] font-mono">
                      <ICompass size={9} color="#78786E"/>Radio: 150m
                    </div>
                  </div>

                  <p className="text-[12px] font-bold text-[#0D0D0C]">Movimientos recientes</p>
                  <div className="space-y-1.5">
                    {TODAY_LOGS.slice(0, 6).map((l, i) => (
                      <div key={i} className="flex items-center gap-2.5 py-1.5 px-3 rounded-xl bg-white/55 hover:bg-white/80 transition-colors">
                        <span className="font-mono text-[10.5px] font-bold text-[#AEAEA4] w-10 shrink-0">{l.time}</span>
                        <div className="av text-[10px]" style={{background:l.bg,color:l.tc}}>{l.ini}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11.5px] font-semibold text-[#0D0D0C] truncate leading-none">{l.name.split(" ")[0]}</p>
                          <p className="text-[9.5px] text-[#AEAEA4] flex items-center gap-0.5 mt-0.5">
                            <IPin size={7} color="#AEAEA4"/>{l.loc}
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

        {/* ══ INTEGRATIONS ══════════════════════════════════ */}
        <section className="py-20 px-6 border-y border-[rgba(200,192,178,.2)]">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-[11px] font-bold text-[#78786E] uppercase tracking-[.14em] mb-5">Compatible con los sistemas que ya usas</p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {INTEGRATIONS.map(i => (
                <span key={i.name} className="int-pill">
                  <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{background:i.color}}/>
                  {i.name}
                </span>
              ))}
            </div>
            <p className="text-[13px] text-[#78786E] mt-5 max-w-lg mx-auto">
              Exporta reportes en formatos compatibles con los sistemas de nómina más usados en México.
            </p>
          </div>
        </section>

        {/* ══ PLANS ══════════════════════════════════════════ */}
        <section id="plans" className="py-28 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[11px] font-bold text-[#2563EB] uppercase tracking-[.14em] mb-3">Planes</p>
              <h2 className="text-[2.25rem] font-extrabold tracking-[-0.028em] text-[#0D0D0C]">
                Un pago. Tu servidor.
                <br/><span className="text-[#78786E]">Sin rentas mensuales.</span>
              </h2>
              <p className="text-[#78786E] mt-3 text-[14px]">Licencia de por vida · Actualizaciones incluidas · Soporte incluido</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PLANS.map(p => (
                <div key={p.tier}
                  className={`glass rounded-2xl p-6 flex flex-col ${p.feat?"plan-feat":""} hover:-translate-y-0.5 transition-all duration-300`}>
                  {p.feat && (
                    <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#2563EB] bg-[#DBEAFE] px-2.5 py-0.5 rounded-full self-start mb-4">
                      <IBolt size={10} color="#2563EB"/>Más popular
                    </div>
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
                        <div className={`mt-0.5 w-[14px] h-[14px] rounded-full flex items-center justify-center shrink-0 ${p.feat?"bg-[#2563EB]":"bg-[#F0F0EC]"}`}>
                          <ICheck size={9} color={p.feat?"white":"#78786E"}/>
                        </div>
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

        {/* ══ HOW IT WORKS ══════════════════════════════════ */}
        <section className="py-28 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[11px] font-bold text-[#2563EB] uppercase tracking-[.14em] mb-3">Cómo funciona</p>
              <h2 className="text-[2.25rem] font-extrabold tracking-[-0.028em] text-[#0D0D0C]">
                Del cero al control
                <br/><span className="text-[#78786E]">en menos de 5 minutos.</span>
              </h2>
            </div>
            <div className="space-y-3.5">
              {[
                { n:"01", Icon:IDownload,  title:"Descarga el instalador",    body:"Descarga D-CLOCK para Windows desde esta página. Un solo archivo .exe de instalación rápida." },
                { n:"02", Icon:IBolt,      title:"Se instala solo",            body:"El instalador configura el servicio, abre el puerto y deja la app lista. Sin conocimientos técnicos." },
                { n:"03", Icon:ILock,      title:"Activa tu licencia",         body:"Ingresa tu clave. D-CLOCK obtiene el nombre de tu empresa, el límite de empleados y las sedes permitidas." },
                { n:"04", Icon:ICompass,   title:"Configura tus geo-cercas",   body:"Desde el panel, dibuja el radio de cada sede. Los empleados solo podrán fichar dentro del área." },
                { n:"05", Icon:IPhone,     title:"Empleados desde el celular", body:"Descargan la app, ingresan la IP de tu servidor y fichan entrada/salida con ubicación en tiempo real." },
              ].map(({ n, Icon, title, body }, i) => (
                <div key={n} className="glass rounded-2xl p-5 flex gap-4 items-start hover:shadow-[0_4px_32px_rgba(37,99,235,.07)] transition-all">
                  <div className="w-11 h-11 rounded-[10px] flex items-center justify-center shrink-0"
                    style={{background:i===0?"#2563EB":"#EFF6FF"}}>
                    <Icon size={18} color={i===0?"white":"#2563EB"}/>
                  </div>
                  <div className="pt-0.5">
                    <p className="text-[10.5px] font-bold text-[#AEAEA4] font-mono mb-0.5">{n}</p>
                    <h3 className="font-bold text-[#0D0D0C] mb-1 text-[14.5px]">{title}</h3>
                    <p className="text-[13px] text-[#78786E] leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ DOWNLOAD ══════════════════════════════════════ */}
        <section id="download" className="py-28 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="glass rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
              <div className="blob w-96 h-96 bg-blue-200 opacity-20 -top-28 -right-28"/>
              <div className="blob w-72 h-72 bg-indigo-100 opacity-15 -bottom-20 -left-20"/>
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-3 mb-7">
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
                <p className="text-[12.5px] text-[#AEAEA4] mb-9">
                  Necesitas una licencia activa.{" "}
                  <a href="mailto:contacto@d99-tech.com" className="text-[#2563EB] hover:underline">
                    Solicita la tuya
                  </a>
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a href="/downloads/dclock-setup.exe" className="btn-primary text-[15px]">
                    <IDownload size={16} color="white"/>Descargar para Windows
                  </a>
                  <a href="mailto:contacto@d99-tech.com" className="btn-ghost text-[15px]">
                    Solicitar licencia
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ FOOTER ════════════════════════════════════════ */}
        <footer className="border-t border-[rgba(200,192,178,.2)] py-10 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-2.5">
              <Image src="/D99logo.png" alt="D99-TECH" width={28} height={28}
                className="rounded-[7px] object-contain"/>
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
