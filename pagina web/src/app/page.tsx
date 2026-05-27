import Image from "next/image";
import Navbar from "@/components/Navbar";
import {
  IClock, IPin, IPhone, IBuildings, IBarChart, IShield,
  IBell, IHistory, IBolt, ILock, ICompass, IShieldOff,
  IMap, IAlertTri, IDownload, IArrowRight, ICheck, IServer, IGlobe, IUsers,
} from "@/components/Icons";

/* ─── data ──────────────────────────────────────────── */
const TODAY_LOGS = [
  { time:"07:52", name:"José Hernández",  ini:"JH", bg:"#EDE9FE", tc:"#6D28D9", type:"Entrada", loc:"Oficina Central · CDMX", geo:"Oficina Central" },
  { time:"07:58", name:"Ana García",      ini:"AG", bg:"#DBEAFE", tc:"#1D4ED8", type:"Entrada", loc:"Oficina Central · CDMX", geo:"Oficina Central" },
  { time:"08:01", name:"Luis Martínez",   ini:"LM", bg:"#DCFCE7", tc:"#15803D", type:"Entrada", loc:"Sucursal Norte · CDMX",  geo:"Sucursal Norte"  },
  { time:"08:12", name:"Carlos Ruiz",     ini:"CR", bg:"#FEF3C7", tc:"#B45309", type:"Entrada", loc:"Sucursal Norte · CDMX",  geo:"Sucursal Norte"  },
  { time:"08:47", name:"María López",     ini:"ML", bg:"#FEE2E2", tc:"#B91C1C", type:"Entrada", loc:"Oficina Central · CDMX", late:true, geo:null   },
  { time:"09:03", name:"Fernanda Cruz",   ini:"FC", bg:"#DBEAFE", tc:"#1D4ED8", type:"Entrada", loc:"Sucursal Sur · CDMX",    geo:"Sucursal Sur"    },
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
  { Icon: IClock,     title:"Entrada & Salida exacta",   desc:"Hora al segundo con fotografía del empleado. Registro inmutable con GPS y geocerca validada." },
  { Icon: IPin,       title:"Geo-cercas inteligentes",    desc:"Define un radio alrededor de tu empresa. Solo registra si el empleado está dentro del área." },
  { Icon: IPhone,     title:"App móvil Android & iOS",   desc:"El empleado ficha desde su celular con selfie y GPS. Conexión directa a tu servidor." },
  { Icon: IBuildings, title:"Multi-sede",                 desc:"Administra múltiples sucursales desde un solo panel. Cada una con su geo-cerca y horario." },
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
  {
    tier:"50", label:"Starter", sub:"/ año", badge:null,
    desc:"Para PyMEs y negocios pequeños.",
    feats:["Hasta 50 empleados","App móvil Android & iOS","2 geo-cercas","Registros con foto y GPS","Reportes básicos","Soporte por email"],
    feat:false,
  },
  {
    tier:"100", label:"Business", sub:"/ año", badge:"Más popular",
    desc:"El más elegido por empresas medianas.",
    feats:["Hasta 100 empleados","App móvil Android & iOS","5 geo-cercas","Registros con foto y GPS","Reportes Excel / PDF","CONTPAq & NOI","Soporte prioritario"],
    feat:true,
  },
  {
    tier:"200", label:"Pro", sub:"/ año", badge:null,
    desc:"Para empresas en expansión.",
    feats:["Hasta 200 empleados","App móvil Android & iOS","Geo-cercas ilimitadas","Registros con foto y GPS","Excel / PDF / XML","CONTPAq & NOI","Multi-sede","Soporte 24/7"],
    feat:false,
  },
  {
    tier:"500", label:"Enterprise", sub:"/ año", badge:null,
    desc:"Máxima capacidad. Sin límites operativos.",
    feats:["Hasta 500 empleados","App móvil Android & iOS","Geo-cercas ilimitadas","Registros con foto y GPS","Excel / PDF / XML","CONTPAq & NOI","Multi-sede","REST API","Soporte dedicado"],
    feat:false,
  },
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

          <div className="relative z-10 max-w-6xl mx-auto w-full grid lg:grid-cols-[1fr_1.15fr] gap-14 items-center">

            {/* copy */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Image src="/D-CLOCKlogo.png" alt="D-CLOCK" width={54} height={54} className="object-contain drop-shadow-md" />
                <div>
                  <p className="text-[10.5px] font-bold text-[#78786E] uppercase tracking-widest">D99-TECH presenta</p>
                  <p className="text-[1.3rem] font-extrabold tracking-tight text-[#0D0D0C] leading-none">D-CLOCK</p>
                </div>
              </div>

              <h1 className="text-[3.4rem] md:text-[4rem] font-extrabold tracking-[-0.035em] leading-[1.04] text-[#0D0D0C] mb-5">
                El checador que<br />
                <span className="text-transparent bg-clip-text" style={{ backgroundImage:"linear-gradient(90deg,#2563EB,#60A5FA)" }}>
                  sabe dónde
                </span><br />
                están tus<br />empleados.
              </h1>

              <p className="text-[1.0625rem] text-[#78786E] leading-[1.75] max-w-[440px] mb-9">
                Control de asistencia con{" "}
                <strong className="text-[#0D0D0C] font-semibold">geo-cercas</strong>, selfie de verificación,
                GPS en cada registro, app móvil, multi-sede y compatible con{" "}
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

              <div className="flex flex-wrap gap-2">
                {[
                  { Icon: IBolt,     text:"Instalación en 5 min"    },
                  { Icon: IPin,      text:"Geo-cercas incluidas"     },
                  { Icon: IPhone,    text:"Android & iPhone"         },
                  { Icon: IShield,   text:"Datos en tu servidor"     },
                  { Icon: IBarChart, text:"Compatible CONTPAq"       },
                ].map(({ Icon, text }) => (
                  <span key={text} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#78786E] bg-white/60 border border-[rgba(200,192,178,.35)] px-2.5 py-1 rounded-full">
                    <Icon size={13} color="#2563EB" />
                    {text}
                  </span>
                ))}
              </div>
            </div>

            {/* dashboard mockup */}
            <div className="relative">
              {/* floating card — entrada con selfie */}
              <div className="float1 absolute -top-6 -right-4 z-20">
                <div className="glass-strong rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-xl">
                  <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-white shadow-sm">
                    <div className="w-full h-full bg-gradient-to-br from-[#DCFCE7] to-[#BBF7D0] flex items-center justify-center">
                      <span className="text-[10px] font-bold text-[#15803D]">AG</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#0D0D0C]">Ana García — Entrada</p>
                    <p className="text-[10px] text-[#16A34A] font-semibold flex items-center gap-1">
                      <IPin size={9} color="#16A34A" />
                      07:58 · Oficina Central
                    </p>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#16A34A] pdot ml-1" />
                </div>
              </div>

              {/* floating card — geo */}
              <div className="float2 absolute -bottom-5 -left-5 z-20">
                <div className="glass-strong rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-xl">
                  <div className="w-8 h-8 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
                    <ICompass size={15} color="#7C3AED" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#0D0D0C]">3 geo-cercas activas</p>
                    <p className="text-[10px] text-[#7C3AED] font-semibold">47 presentes · 4 tarde · 2 ausentes</p>
                  </div>
                </div>
              </div>

              {/* main card */}
              <div className="glass rounded-3xl overflow-hidden shadow-[0_28px_90px_rgba(13,13,12,.11)]">
                {/* browser bar */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-[rgba(200,192,178,.18)] bg-white/25">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-300"/>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-300"/>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-300"/>
                  </div>
                  <span className="text-[10px] text-[#AEAEA4] font-mono">D-CLOCK · Panel de Asistencia</span>
                  <div className="flex items-center gap-1 text-[10px] text-[#16A34A] font-bold">
                    <span className="pdot w-1.5 h-1.5 rounded-full bg-[#16A34A] inline-block"/>En vivo
                  </div>
                </div>

                <div className="flex">
                  {/* SIDEBAR */}
                  <div className="w-11 bg-[#111] flex flex-col items-center py-3 gap-1.5 shrink-0 border-r border-black/20">
                    <div className="w-7 h-7 rounded-[6px] bg-[#2563EB] flex items-center justify-center mb-2 shrink-0">
                      <span className="text-[9px] text-white font-black">D</span>
                    </div>
                    {[
                      { Icon: IClock,    active: true  },
                      { Icon: IUsers,    active: false },
                      { Icon: IPin,      active: false },
                      { Icon: IHistory,  active: false },
                      { Icon: IBarChart, active: false },
                    ].map(({ Icon, active }, i) => (
                      <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? "bg-[#2563EB]" : ""}`}>
                        <Icon size={14} color={active ? "white" : "#444"} />
                      </div>
                    ))}
                  </div>

                  {/* CONTENT */}
                  <div className="flex-1 p-3.5 space-y-3 overflow-hidden">
                    {/* top bar */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-bold text-[#0D0D0C]">Panel de Asistencia</p>
                        <p className="text-[9px] text-[#AEAEA4]">Jue 15 mayo · Turno matutino</p>
                      </div>
                    </div>

                    {/* stat cards */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { l:"Presentes", v:44, c:"#16A34A", bar:88 },
                        { l:"Tarde",     v: 4, c:"#D97706", bar:8  },
                        { l:"Ausentes",  v: 2, c:"#DC2626", bar:4  },
                        { l:"En campo",  v:12, c:"#7C3AED", bar:24 },
                      ].map(s => (
                        <div key={s.l} className="glass rounded-xl p-2 text-center">
                          <p className="text-[1.2rem] font-extrabold leading-none" style={{color:s.c}}>{s.v}</p>
                          <p className="text-[8.5px] text-[#AEAEA4] mt-0.5 font-medium">{s.l}</p>
                          <div className="mt-1 h-[2px] rounded-full bg-[#EDE8DF]">
                            <div className="h-full rounded-full" style={{width:`${s.bar}%`,background:s.c}}/>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* table header */}
                    <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-2 px-2 text-[9px] font-bold text-[#AEAEA4] uppercase tracking-wider">
                      <span/><span>Empleado</span><span>Entrada</span><span>Salida</span><span>Estado</span>
                    </div>

                    {/* rows */}
                    <div className="space-y-1">
                      {EMPLOYEES.map(e => (
                        <div key={e.name} className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-2 items-center py-1.5 px-2.5 rounded-xl bg-white/45 hover:bg-white/70 transition-colors">
                          <div className="av" style={{background:e.bg,color:e.tc}}>{e.ini}</div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-[#0D0D0C] truncate leading-none">{e.name.split(" ")[0]}</p>
                            <p className="text-[9px] text-[#AEAEA4] flex items-center gap-0.5 mt-0.5">
                              <IPin size={7} color="#AEAEA4" />{e.loc}
                            </p>
                          </div>
                          <span className="font-mono text-[10px] font-bold text-[#16A34A]">{e.entrada}</span>
                          <span className="font-mono text-[10px] font-bold text-[#2563EB]">{e.salida}</span>
                          <STag s={e.s}/>
                        </div>
                      ))}
                    </div>

                    {/* timeline */}
                    <div className="px-1">
                      <div className="flex justify-between text-[8.5px] text-[#AEAEA4] mb-1">
                        <span>07:00</span><span>09:00</span><span>13:00</span><span>17:00</span><span>19:00</span>
                      </div>
                      <div className="h-[3px] rounded-full bg-[#EDE8DF]">
                        <div className="h-full rounded-full" style={{width:"62%",background:"linear-gradient(90deg,#16A34A,#2563EB 60%,#D97706)"}}/>
                      </div>
                      <p className="text-[8.5px] text-[#AEAEA4] mt-1">Jornada 08:00–17:00</p>
                    </div>
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
              { v:"< 5 min",     l:"Tiempo de instalación"         },
              { v:"100%",        l:"Datos en tu propio servidor"   },
              { v:"4 planes",    l:"Según tamaño de tu empresa"    },
              { v:"Anual",       l:"Renovación con soporte incluido" },
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
                <div key={title} className="glass rounded-2xl p-5 group hover:shadow-[0_8px_48px_rgba(37,99,235,.09)] hover:-translate-y-0.5 transition-all duration-300">
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
                    Define un radio personalizado alrededor de cada sede.
                    Si el empleado no está dentro del área al fichar, la checada
                    se registra como fuera de zona y genera una alerta.
                  </p>
                  <div className="space-y-3">
                    {[
                      { Icon: IBuildings, text:"Multi-sede: cada sucursal con su propia geo-cerca" },
                      { Icon: ICompass,   text:"Radio ajustable desde 50 hasta 2,000 metros"       },
                      { Icon: IShieldOff, text:"Detecta checadas fuera del área autorizada"         },
                      { Icon: IMap,       text:"Visualiza en mapa exactamente dónde ficharon"       },
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

                {/* map mock */}
                <div className="bg-white/30 border-l border-[rgba(200,192,178,.2)] p-8 lg:p-10 flex flex-col gap-4">
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
                      <div key={i} className="absolute w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{left:d.x,top:d.y,background:d.c}}/>
                    ))}
                    <div className="absolute bottom-2 right-3 flex items-center gap-1 text-[10px] text-[#78786E] font-mono">
                      <ICompass size={9} color="#78786E"/>Radio: 150m
                    </div>
                  </div>

                  <p className="text-[12px] font-bold text-[#0D0D0C]">Movimientos recientes</p>
                  <div className="space-y-1.5">
                    {TODAY_LOGS.map((l, i) => (
                      <div key={i} className="flex items-center gap-2.5 py-1.5 px-3 rounded-xl bg-white/55 hover:bg-white/80 transition-colors">
                        <span className="font-mono text-[10.5px] font-bold text-[#AEAEA4] w-10 shrink-0">{l.time}</span>
                        <div className="av text-[10px]" style={{background:l.bg,color:l.tc}}>{l.ini}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11.5px] font-semibold text-[#0D0D0C] truncate leading-none">{l.name.split(" ")[0]}</p>
                          <p className="text-[9.5px] text-[#AEAEA4] flex items-center gap-0.5 mt-0.5">
                            <IPin size={7} color="#AEAEA4"/>{l.loc}
                          </p>
                        </div>
                        {l.geo
                          ? <span className="tag tag-geo text-[9px]"><IPin size={7} color="#7C3AED"/>{l.geo.split(" ")[0]}</span>
                          : <span className="tag tag-late text-[9px]">Fuera</span>
                        }
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ APP MÓVIL ═════════════════════════════════════ */}
        <section id="mobile" className="py-28 px-6 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">

              {/* copy */}
              <div>
                <div className="inline-flex items-center gap-2 text-[11px] font-bold text-[#2563EB] bg-[#DBEAFE] px-3 py-1.5 rounded-full mb-5">
                  <IPhone size={12} color="#2563EB" />
                  App móvil D-CLOCK
                </div>
                <h2 className="text-[2.1rem] font-extrabold tracking-[-0.025em] text-[#0D0D0C] mb-5 leading-snug">
                  El empleado ficha en segundos
                  <br /><span className="text-[#2563EB]">desde su celular.</span>
                </h2>
                <p className="text-[#78786E] text-[14px] leading-relaxed mb-8">
                  La app D-CLOCK para Android e iOS permite registrar entrada y salida con{" "}
                  <strong className="text-[#0D0D0C] font-semibold">selfie de verificación</strong> y{" "}
                  <strong className="text-[#0D0D0C] font-semibold">GPS</strong>. Se conecta directamente
                  al servidor de tu empresa. Sin cuentas externas, sin suscripciones adicionales.
                </p>
                <div className="space-y-3.5">
                  {[
                    { Icon: IBolt,    title:"Selfie al registrar",      desc:"Cada entrada y salida queda respaldada con una foto del empleado." },
                    { Icon: IPin,     title:"GPS en cada ficha",         desc:"Coordenadas exactas validadas contra la geo-cerca configurada." },
                    { Icon: IHistory, title:"Historial personal",        desc:"El empleado ve sus propios registros del día con mapa y foto." },
                    { Icon: IUsers,   title:"Perfil completo",           desc:"Muestra datos laborales, contacto y datos personales del empleado." },
                  ].map(({ Icon, title, desc }) => (
                    <div key={title} className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-[9px] bg-[#EFF6FF] flex items-center justify-center shrink-0 mt-0.5">
                        <Icon size={15} color="#2563EB" />
                      </div>
                      <div>
                        <p className="font-bold text-[#0D0D0C] text-[13.5px] leading-none mb-0.5">{title}</p>
                        <p className="text-[12.5px] text-[#78786E] leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex items-center gap-3">
                  <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2.5">
                    {/* Android robot */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#3DDC84">
                      <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85a.637.637 0 0 0-.83.22l-1.88 3.24a11.463 11.463 0 0 0-8.94 0L5.65 5.67a.643.643 0 0 0-.87-.2c-.28.18-.37.54-.22.83L6.4 9.48A10.78 10.78 0 0 0 1 18h22a10.78 10.78 0 0 0-5.4-8.52zM7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z"/>
                    </svg>
                    <span className="text-[12px] font-semibold text-[#0D0D0C]">Android</span>
                  </div>
                  <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2.5">
                    {/* Apple logo */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#0D0D0C">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    <span className="text-[12px] font-semibold text-[#0D0D0C]">iPhone</span>
                  </div>
                  <span className="text-[11px] text-[#AEAEA4]">Próximamente en tiendas</span>
                </div>
              </div>

              {/* phone mockups */}
              <div className="flex justify-center gap-4 items-end">
                {/* Phone 1 — Registro */}
                <div className="relative w-[165px] shrink-0">
                  <div className="bg-[#1a1a1a] rounded-[32px] p-[3px] shadow-[0_32px_80px_rgba(13,13,12,.28)]">
                    <div className="bg-[#F5F1EB] rounded-[30px] overflow-hidden">
                      {/* notch */}
                      <div className="h-7 bg-[#1a1a1a] flex items-center justify-center">
                        <div className="w-16 h-4 bg-[#111] rounded-full"/>
                      </div>
                      <div className="px-4 pt-3 pb-5 space-y-3">
                        {/* company row */}
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-[3px] bg-[#2563EB] flex items-center justify-center">
                            <span className="text-[6px] text-white font-black">D</span>
                          </div>
                          <span className="text-[7px] font-bold text-[#aaa] tracking-widest">D-CLOCK</span>
                        </div>
                        {/* clock */}
                        <div>
                          <p className="text-[28px] font-black text-[#0D0D0C] leading-none tracking-tight">09:24</p>
                          <p className="text-[7px] text-[#aaa] capitalize mt-0.5">jueves 15 de mayo</p>
                        </div>
                        {/* employee */}
                        <div>
                          <p className="text-[11px] font-extrabold text-[#0D0D0C]">Ana García</p>
                          <p className="text-[7px] text-[#aaa]">#EMP-001 · Directora</p>
                        </div>
                        {/* status */}
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"/>
                          <span className="text-[8px] font-bold text-[#555] tracking-wide">DENTRO DEL TURNO</span>
                        </div>
                        {/* button */}
                        <div className="bg-[#0D0D0C] rounded-[10px] py-3 text-center">
                          <p className="text-[8px] font-black text-white tracking-widest">REGISTRAR</p>
                          <p className="text-[8px] font-black text-white tracking-widest">SALIDA</p>
                          <p className="text-[6px] text-white/40 mt-0.5">Toca para fichar</p>
                        </div>
                        {/* log */}
                        <div>
                          <p className="text-[6.5px] font-bold text-[#aaa] tracking-widest mb-1.5">REGISTROS HOY</p>
                          <div className="space-y-1">
                            {[{type:"ENTRADA",time:"09:24",c:"#16A34A"},{type:"—",time:"—",c:"#ccc"}].map((r,i)=>(
                              <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full" style={{background:r.c}}/>
                                  <span className="text-[7px] font-bold text-[#0D0D0C]">{r.type}</span>
                                </div>
                                <span className="text-[7px] font-mono text-[#555]">{r.time}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {/* tab bar */}
                      <PhoneTabBar active={0} />
                    </div>
                  </div>
                </div>

                {/* Phone 2 — Historial (taller, center) */}
                <div className="relative w-[165px] shrink-0 -mb-6">
                  <div className="bg-[#1a1a1a] rounded-[32px] p-[3px] shadow-[0_40px_100px_rgba(13,13,12,.32)]">
                    <div className="bg-[#F5F1EB] rounded-[30px] overflow-hidden">
                      <div className="h-7 bg-[#1a1a1a] flex items-center justify-center">
                        <div className="w-16 h-4 bg-[#111] rounded-full"/>
                      </div>
                      <div className="px-4 pt-3 pb-2 space-y-2.5">
                        <p className="text-[9px] font-black text-[#0D0D0C] tracking-widest">REGISTROS HOY</p>
                        {/* record card */}
                        <div className="bg-white rounded-[10px] overflow-hidden border border-[#eee]">
                          {/* card header */}
                          <div className="flex items-center gap-2 p-2.5 border-b border-[#f5f5f5]">
                            <div className="w-6 h-6 rounded-full bg-[#DBEAFE] flex items-center justify-center">
                              <span className="text-[7px] font-bold text-[#1D4ED8]">AG</span>
                            </div>
                            <div>
                              <p className="text-[8px] font-bold text-[#0D0D0C] leading-none">Ana García</p>
                              <p className="text-[6.5px] text-[#aaa]">#EMP-001</p>
                            </div>
                          </div>
                          {/* entrada col */}
                          <div className="grid grid-cols-2 divide-x divide-[#f0f0f0]">
                            {[{label:"ENTRADA",time:"09:24",c:"#16A34A"},{label:"SALIDA",time:"18:05",c:"#2563EB"}].map(col=>(
                              <div key={col.label} className="p-2 space-y-1.5">
                                <p className="text-[6px] font-bold text-[#aaa] tracking-widest">{col.label}</p>
                                <p className="text-[10px] font-black leading-none" style={{color:col.c}}>{col.time}</p>
                                {/* selfie placeholder */}
                                <div className="w-full h-10 rounded-[5px] bg-gradient-to-br from-[#EDE8DF] to-[#DDD8CE] flex items-center justify-center">
                                  <div className="w-6 h-6 rounded-full bg-[#ccc] flex items-center justify-center">
                                    <span className="text-[7px] text-[#999]">foto</span>
                                  </div>
                                </div>
                                {/* geo badge */}
                                <div className="flex items-center gap-0.5">
                                  <div className="w-1 h-1 rounded-full bg-[#16A34A]"/>
                                  <span className="text-[5.5px] font-bold text-[#16A34A]">Oficina</span>
                                </div>
                                {/* mini map */}
                                <div className="w-full h-8 rounded-[5px] bg-[#E8F0FE] flex items-center justify-center border border-[rgba(37,99,235,.15)]">
                                  <div className="w-2 h-2 rounded-full bg-[#2563EB] shadow-sm"/>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <PhoneTabBar active={1} />
                    </div>
                  </div>
                </div>

                {/* Phone 3 — Perfil */}
                <div className="relative w-[165px] shrink-0">
                  <div className="bg-[#1a1a1a] rounded-[32px] p-[3px] shadow-[0_32px_80px_rgba(13,13,12,.28)]">
                    <div className="bg-[#F5F1EB] rounded-[30px] overflow-hidden">
                      <div className="h-7 bg-[#1a1a1a] flex items-center justify-center">
                        <div className="w-16 h-4 bg-[#111] rounded-full"/>
                      </div>
                      {/* avatar strip */}
                      <div className="bg-[#0D0D0C] px-4 py-3 flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-[#DBEAFE] flex items-center justify-center border-2 border-[#333]">
                          <span className="text-[9px] font-bold text-[#1D4ED8]">AG</span>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-white">Ana García</p>
                          <p className="text-[6.5px] text-[#666]">Almaguer Marín</p>
                          <div className="flex gap-1 mt-1">
                            <span className="text-[5.5px] bg-[#222] text-[#888] px-1 py-0.5 rounded">#EMP-001</span>
                            <span className="text-[5.5px] bg-[#14532d] text-[#4ade80] px-1 py-0.5 rounded">Activo</span>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 pt-2.5 pb-2 space-y-1.5">
                        {/* section */}
                        <p className="text-[5.5px] font-black text-[#aaa] tracking-widest mb-1">EMPRESA</p>
                        <div className="bg-white rounded-[8px] overflow-hidden divide-y divide-[#f5f5f5]">
                          {[
                            ["Empresa","D99-TECH"],
                            ["Depto","DIRECCIÓN"],
                            ["Área","OFICINA"],
                            ["Horario","Matutino"],
                          ].map(([l,v])=>(
                            <div key={l} className="flex items-center justify-between px-2 py-1">
                              <span className="text-[6px] text-[#999]">{l}</span>
                              <span className="text-[6px] font-bold text-[#0D0D0C]">{v}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-[5.5px] font-black text-[#aaa] tracking-widest mt-1.5 mb-1">CONTACTO</p>
                        <div className="bg-white rounded-[8px] overflow-hidden divide-y divide-[#f5f5f5]">
                          {[
                            ["Email","ana@d99-tech.com"],
                            ["Tel","55 2180 0566"],
                          ].map(([l,v])=>(
                            <div key={l} className="flex items-center justify-between px-2 py-1">
                              <span className="text-[6px] text-[#999]">{l}</span>
                              <span className="text-[6px] font-bold text-[#0D0D0C] truncate max-w-[70px]">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <PhoneTabBar active={2} />
                    </div>
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
                Licencia anual. Tu servidor.
                <br/><span className="text-[#78786E]">Soporte incluido todo el año.</span>
              </h2>
              <p className="text-[#78786E] mt-3 text-[14px]">
                Renovación anual · Actualizaciones incluidas · Soporte técnico · Sin costos ocultos
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PLANS.map(p => (
                <div key={p.tier}
                  className={`glass rounded-2xl p-6 flex flex-col ${p.feat?"plan-feat":""} hover:-translate-y-1 transition-all duration-300`}>
                  {p.badge && (
                    <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#2563EB] bg-[#DBEAFE] px-2.5 py-0.5 rounded-full self-start mb-4">
                      <IBolt size={10} color="#2563EB"/>{p.badge}
                    </div>
                  )}
                  <p className="text-[10px] font-bold text-[#AEAEA4] uppercase tracking-wider mb-0.5">{p.label}</p>
                  <div className="mb-1">
                    <span className="text-5xl font-black text-[#0D0D0C] tracking-tighter">{p.tier}</span>
                    <span className="text-[13px] text-[#78786E] ml-1">empleados</span>
                  </div>
                  <p className="text-[11px] font-semibold text-[#2563EB] mb-1">{p.sub}</p>
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
                { n:"01", Icon:IDownload,  title:"Descarga el instalador",      body:"Descarga D-CLOCK para Windows desde esta página. Un solo archivo .exe de instalación rápida." },
                { n:"02", Icon:IBolt,      title:"Se instala en segundos",       body:"El instalador configura el servicio, abre el puerto y deja la app lista. Sin conocimientos técnicos." },
                { n:"03", Icon:ILock,      title:"Activa tu licencia anual",     body:"Ingresa tu clave. D-CLOCK se conecta para validarla y activa todas las funciones según tu plan." },
                { n:"04", Icon:ICompass,   title:"Configura tus geo-cercas",     body:"Desde el panel, ajusta el radio de cada sede. Los empleados solo podrán fichar dentro del área." },
                { n:"05", Icon:IPhone,     title:"Empleados fichan desde el cel", body:"Descargan la app, ingresan la IP de tu servidor y fichan con selfie y GPS en tiempo real." },
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
        <section id="download" className="py-28 px-6 relative overflow-hidden">
          <div className="blob w-[600px] h-[600px] bg-blue-200 opacity-[.13] -top-40 -right-40"/>
          <div className="blob w-[400px] h-[400px] bg-indigo-100 opacity-[.10] bottom-0 -left-32"/>
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 text-[11px] font-bold text-[#2563EB] bg-[#DBEAFE] px-3 py-1.5 rounded-full mb-5">
                <IDownload size={11} color="#2563EB"/>
                Disponible ahora · v1.0.0 · Windows 64-bit
              </div>
              <h2 className="text-[2.5rem] font-extrabold tracking-[-0.03em] text-[#0D0D0C] leading-[1.08]">
                Descarga D-CLOCK
                <br/><span className="text-[#78786E]">e instala en 2 minutos.</span>
              </h2>
            </div>

            <div className="glass rounded-3xl overflow-hidden shadow-[0_32px_100px_rgba(13,13,12,.09)]">
              <div className="flex items-center justify-between gap-4 flex-wrap px-10 py-6 border-b border-[rgba(200,192,178,.18)]">
                <div className="flex items-center gap-4">
                  <Image src="/D-CLOCKlogo.png" alt="D-CLOCK" width={48} height={48} className="object-contain drop-shadow-md"/>
                  <div>
                    <p className="font-extrabold text-[1.1rem] tracking-tight text-[#0D0D0C] leading-none">D-CLOCK</p>
                    <p className="text-[11.5px] text-[#78786E] mt-0.5">by D99-TECH</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { label:"v1.0.0",          bg:"#EFF6FF", c:"#2563EB" },
                    { label:"Windows 10 / 11", bg:"#F3F4F6", c:"#374151" },
                    { label:"64-bit",          bg:"#F3F4F6", c:"#374151" },
                    { label:"~90 MB",          bg:"#F3F4F6", c:"#374151" },
                  ].map(b => (
                    <span key={b.label} className="text-[11.5px] font-semibold px-2.5 py-1 rounded-full" style={{background:b.bg,color:b.c}}>
                      {b.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-[rgba(200,192,178,.18)]">
                <div className="p-10 flex flex-col gap-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#2563EB] flex items-center justify-center shrink-0 shadow-[0_8px_24px_rgba(37,99,235,.35)]">
                      <IDownload size={20} color="white"/>
                    </div>
                    <div>
                      <p className="font-extrabold text-[16px] text-[#0D0D0C]">Instalador <span className="text-[#2563EB]">· Recomendado</span></p>
                      <p className="text-[13px] text-[#78786E] mt-0.5 leading-relaxed">
                        Instala D-CLOCK con asistente paso a paso. Crea acceso directo en el escritorio y se ejecuta automáticamente al encender el equipo.
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {["Acceso directo en escritorio","Inicia con Windows (opcional)","Desinstalador incluido","Instalación sin conocimientos técnicos"].map(f => (
                      <li key={f} className="flex items-center gap-2 text-[12.5px] text-[#38382F]">
                        <div className="w-[14px] h-[14px] rounded-full bg-[#2563EB] flex items-center justify-center shrink-0">
                          <ICheck size={9} color="white"/>
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a href="https://github.com/aalmaguerd99/D-CLOCK/releases/download/v1.0.0/D-CLOCK-Setup-1.0.0.exe"
                    className="btn-primary justify-center text-[14.5px]" download>
                    <IDownload size={16} color="white"/>
                    Descargar instalador
                    <span className="ml-1 text-white/60 text-[12px]">.exe</span>
                  </a>
                </div>

                <div className="p-10 flex flex-col gap-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#F3F4F6] flex items-center justify-center shrink-0">
                      <IBolt size={20} color="#374151"/>
                    </div>
                    <div>
                      <p className="font-extrabold text-[16px] text-[#0D0D0C]">Portable</p>
                      <p className="text-[13px] text-[#78786E] mt-0.5 leading-relaxed">
                        Sin instalación. Copia en USB o carpeta de red y ejecuta en cualquier equipo Windows.
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {["Sin instalación requerida","Funciona desde USB o red","Sin permisos de administrador","Mismo rendimiento que el instalador"].map(f => (
                      <li key={f} className="flex items-center gap-2 text-[12.5px] text-[#38382F]">
                        <div className="w-[14px] h-[14px] rounded-full bg-[#F0F0EC] flex items-center justify-center shrink-0">
                          <ICheck size={9} color="#78786E"/>
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a href="https://github.com/aalmaguerd99/D-CLOCK/releases/download/v1.0.0/D-CLOCK-Portable-1.0.0.exe"
                    className="btn-ghost justify-center text-[14.5px]" download>
                    <IDownload size={16} color="#38382F"/>
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
                    <IGlobe size={13} color="#AEAEA4"/>
                    <a href="https://github.com/aalmaguerd99/D-CLOCK/releases" target="_blank" rel="noopener noreferrer" className="hover:text-[#2563EB] transition-colors">
                      Ver todas las versiones en GitHub
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ FOOTER ════════════════════════════════════════ */}
        <footer className="border-t border-[rgba(200,192,178,.2)] py-10 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-2.5">
              <Image src="/D-CLOCKlogo.png" alt="D-CLOCK" width={26} height={26} className="object-contain"/>
              <span className="font-extrabold text-[13px] text-[#0D0D0C]">D-CLOCK</span>
              <span className="text-[#D0CBC0]">·</span>
              <span className="text-[11.5px] text-[#AEAEA4]">by D99-TECH</span>
            </div>
            <p className="text-[11.5px] text-[#AEAEA4]">© {new Date().getFullYear()} D99-TECH. Todos los derechos reservados.</p>
            <div className="flex gap-5 text-[11.5px] text-[#AEAEA4]">
              <a href="mailto:contacto@d99-tech.com" className="hover:text-[#2563EB] transition-colors">Contacto</a>
              <a href="/privacidad" className="hover:text-[#2563EB] transition-colors">Privacidad</a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}

function PhoneTabBar({ active }: { active: 0 | 1 | 2 }) {
  const tabs = [
    { label: "Registro",
      icon: (on: boolean) => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke={on?"#0D0D0C":"#ccc"} strokeWidth="2"/>
          <path d="M8.5 12.5l2.5 2.5 4.5-5" stroke={on?"#0D0D0C":"#ccc"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    { label: "Historial",
      icon: (on: boolean) => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke={on?"#0D0D0C":"#ccc"} strokeWidth="2"/>
          <path d="M12 7v5l3.5 2" stroke={on?"#0D0D0C":"#ccc"} strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    },
    { label: "Perfil",
      icon: (on: boolean) => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke={on?"#0D0D0C":"#ccc"} strokeWidth="2"/>
          <path d="M4 20c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" stroke={on?"#0D0D0C":"#ccc"} strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    },
  ];
  return (
    <div className="bg-white border-t border-[#eee] flex py-2 px-3">
      {tabs.map((t, i) => (
        <div key={t.label} className="flex-1 flex flex-col items-center gap-0.5">
          {t.icon(i === active)}
          <span className={`text-[5.5px] font-bold ${i === active ? "text-[#0D0D0C]" : "text-[#bbb]"}`}>{t.label}</span>
        </div>
      ))}
    </div>
  );
}
