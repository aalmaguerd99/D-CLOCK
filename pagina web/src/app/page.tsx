'use client';
import { useState, useEffect } from 'react';

const steps = [
  { n:'1', t:'Descarga el .apk',         d:'Toca «Descargar APK» en tu teléfono Android. El archivo se guarda en Descargas.' },
  { n:'2', t:'Permite la instalación',   d:'Al abrirlo, Android pedirá activar «Instalar apps desconocidas» para tu navegador. Actívalo.' },
  { n:'3', t:'Instala D-CLOCK',          d:'Toca Instalar y espera unos segundos. Aparecerá el ícono de D-CLOCK en tu pantalla.' },
  { n:'4', t:'Conecta y ficha',          d:'Abre la app, ingresa la IP del servidor de tu empresa y ficha con foto y GPS.' },
];

const features = [
  { title:'Entrada y salida con foto',   desc:'Cada registro queda respaldado con la foto del empleado, hora exacta y GPS.',
    icon:'<span style="display:inline-flex"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></span>' },
  { title:'Reconocimiento facial',       desc:'Verifica la identidad del empleado al registrar asistencia, evitando suplantaciones.',
    icon:'<span style="display:inline-flex"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M9 10h.01M15 10h.01M9.5 15a3.5 3.5 0 0 0 5 0"/></svg></span>' },
  { title:'Geo-cercas inteligentes',     desc:'Define un radio por sede. Solo registra dentro del área y avisa si alguien ficha fuera.',
    icon:'<span style="display:inline-flex"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg></span>' },
  { title:'Credencial Apple Wallet',     desc:'Diseña la credencial con colores, fondos y campos. Genera pases .pkpass para iPhone.',
    icon:'<span style="display:inline-flex"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="3"/><circle cx="8" cy="12" r="2.5"/><path d="M13 10h5M13 14h3"/></svg></span>' },
  { title:'Reportes a Excel',            desc:'Genera reportes de asistencia por periodo con columnas configurables, listos para nómina.',
    icon:'<span style="display:inline-flex"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></span>' },
  { title:'Turnos y horarios',           desc:'Asigna turnos por semana, define tolerancias y administra descansos y vacaciones.',
    icon:'<span style="display:inline-flex"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>' },
  { title:'Equipos',                     desc:'Cada responsable ve la asistencia de su propio equipo en tiempo real desde la app.',
    icon:'<span style="display:inline-flex"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg></span>' },
  { title:'Servidor en tu empresa',      desc:'Base de datos local en tu equipo. Tus datos nunca salen de tu red. Sin nube, sin terceros.',
    icon:'<span style="display:inline-flex"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="8" rx="2"/><rect x="2" y="13" width="20" height="8" rx="2"/><line x1="6" y1="7" x2="6.01" y2="7"/><line x1="6" y1="17" x2="6.01" y2="17"/></svg></span>' },
];

const plans = [
  { tier:'50',  label:'Starter',    desc:'Para PyMEs y negocios pequeños.',
    feats:['Hasta 50 empleados','App Android & iPhone','2 geo-cercas','Foto, GPS y facial','Reportes básicos'],
    feat:false, btnBg:'rgba(255,255,255,.6)', btnColor:'#1a1a1a', btnBorder:'rgba(0,0,0,.12)' },
  { tier:'100', label:'Business',   desc:'El más elegido por empresas medianas.',
    feats:['Hasta 100 empleados','App Android & iPhone','5 geo-cercas','Reportes Excel / PDF','Credencial Wallet','Soporte prioritario'],
    feat:true,  btnBg:'#2563EB',              btnColor:'#fff',    btnBorder:'#2563EB' },
  { tier:'200', label:'Pro',        desc:'Para empresas en expansión.',
    feats:['Hasta 200 empleados','Geo-cercas ilimitadas','Excel / PDF / XML','Multi-sede','Equipos y turnos','Soporte 24/7'],
    feat:false, btnBg:'rgba(255,255,255,.6)', btnColor:'#1a1a1a', btnBorder:'rgba(0,0,0,.12)' },
  { tier:'500', label:'Enterprise', desc:'Máxima capacidad, sin límites.',
    feats:['Hasta 500 empleados','Todo lo de Pro','Reconocimiento facial','API REST','Soporte dedicado'],
    feat:false, btnBg:'rgba(255,255,255,.6)', btnColor:'#1a1a1a', btnBorder:'rgba(0,0,0,.12)' },
];

export default function Home() {
  const [os, setOs] = useState<string|null>(null);

  useEffect(() => {
    const ua = navigator.userAgent || '';
    const p  = navigator.platform  || '';
    if      (/Android/i.test(ua))           setOs('android');
    else if (/iPhone|iPad|iPod/i.test(ua))  setOs('ios');
    else if (/Mac/i.test(p)||/Mac/i.test(ua)) setOs('mac');
    else                                     setOs('windows');
  }, []);

  const recWin    = os === 'windows' || os === 'mac';
  const recAndroid = os === 'android';
  const recApple   = os === 'ios';

  return (
    <div style={{position:'relative',width:'100%',overflow:'hidden'}}>

      {/* ambient blobs */}
      <div style={{position:'fixed',width:'680px',height:'680px',borderRadius:'50%',filter:'blur(120px)',background:'#bfdbfe',opacity:.18,top:'-220px',right:'-180px',pointerEvents:'none',zIndex:0}}/>
      <div style={{position:'fixed',width:'520px',height:'520px',borderRadius:'50%',filter:'blur(120px)',background:'#c7d2fe',opacity:.13,bottom:'-120px',left:'-160px',pointerEvents:'none',zIndex:0}}/>

      {/* ══ NAVBAR ══ */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:50,background:'rgba(245,241,235,.84)',backdropFilter:'blur(24px) saturate(160%)',WebkitBackdropFilter:'blur(24px) saturate(160%)',borderBottom:'1px solid rgba(0,0,0,.07)'}}>
        <div style={{maxWidth:'1180px',margin:'0 auto',padding:'0 24px',height:'62px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <a href="#top" style={{display:'flex',alignItems:'center',gap:'10px'}}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/D-CLOCKlogo.png" alt="D-CLOCK" width={30} height={30} style={{objectFit:'contain',display:'block'}}/>
            <span style={{fontWeight:800,fontSize:'15px',letterSpacing:'-.3px'}}>D-CLOCK</span>
            <span style={{fontSize:'10px',fontWeight:700,color:'#2563EB',background:'#dbeafe',padding:'3px 8px',borderRadius:'99px',lineHeight:1}}>by D99-TECH</span>
          </a>
          <div style={{display:'flex',alignItems:'center',gap:'28px',fontSize:'13.5px',fontWeight:500,color:'#6a6a6a'}}>
            <a href="#descargas" className="dcl-nav-link" style={{transition:'color .15s'}}>Descargas</a>
            <a href="#instalar"  className="dcl-nav-link" style={{transition:'color .15s'}}>Instalar APK</a>
            <a href="#funciones" className="dcl-nav-link" style={{transition:'color .15s'}}>Funciones</a>
            <a href="#planes"    className="dcl-nav-link" style={{transition:'color .15s'}}>Planes</a>
          </div>
          <a href="#descargas" className="dcl-nav-btn" style={{display:'inline-flex',alignItems:'center',gap:'7px',background:'#1a1a1a',color:'#fff',fontWeight:700,fontSize:'13px',padding:'9px 18px',borderRadius:'11px',transition:'transform .15s,box-shadow .18s'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Descargar
          </a>
        </div>
      </nav>

      {/* ══ HERO / DESCARGAS ══ */}
      <section id="top" style={{position:'relative',zIndex:1,padding:'118px 24px 56px'}}>
        <div style={{maxWidth:'1060px',margin:'0 auto',textAlign:'center'}}>

          <div style={{display:'inline-flex',alignItems:'center',gap:'8px',fontSize:'12px',fontWeight:700,color:'#15803d',background:'#dcfce7',border:'1px solid #bbf7d0',padding:'7px 14px',borderRadius:'99px',marginBottom:'24px'}}>
            <span className="pdot" style={{width:'7px',height:'7px',borderRadius:'50%',background:'#16a34a',display:'inline-block'}}/>
            Disponible ahora · v1.3.2 · Junio 2026
          </div>

          <h1 style={{fontSize:'clamp(2.5rem,6vw,4.3rem)',fontWeight:900,letterSpacing:'-.04em',lineHeight:1.02,margin:'0 0 20px',textWrap:'balance' as never}}>
            Descarga D-CLOCK y controla
            <span style={{background:'linear-gradient(90deg,#2563EB,#60A5FA)',WebkitBackgroundClip:'text',backgroundClip:'text',color:'transparent'}}> la asistencia hoy.</span>
          </h1>

          <p style={{fontSize:'clamp(1rem,1.6vw,1.16rem)',color:'#6a6a6a',lineHeight:1.65,maxWidth:'600px',margin:'0 auto 42px'}}>
            Checador con <strong style={{color:'#1a1a1a',fontWeight:700}}>geo-cercas</strong>, selfie y GPS. App de escritorio para tu servidor + apps móviles para tus empleados. <strong style={{color:'#1a1a1a',fontWeight:700}}>Elige tu plataforma y empieza en minutos.</strong>
          </p>

          {/* 3 platform cards */}
          <div id="descargas" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'18px',maxWidth:'1000px',margin:'0 auto',textAlign:'left',scrollMarginTop:'88px'}}>

            {/* WINDOWS */}
            <div className="dcl-card dcl-card-win" style={{position:'relative',background:'rgba(255,255,255,.78)',backdropFilter:'blur(28px) saturate(160%)',WebkitBackdropFilter:'blur(28px) saturate(160%)',border:'1px solid rgba(0,0,0,.07)',borderRadius:'22px',padding:'26px 22px 24px',boxShadow:'0 1px 0 rgba(255,255,255,.9) inset,0 10px 44px rgba(0,0,0,.06)',display:'flex',flexDirection:'column'}}>
              {recWin && <span style={{position:'absolute',top:'14px',right:'14px',fontSize:'9.5px',fontWeight:800,color:'#2563EB',background:'#dbeafe',padding:'4px 9px',borderRadius:'99px',letterSpacing:'.3px'}}>★ PARA TI</span>}
              <div style={{width:'54px',height:'54px',borderRadius:'15px',background:'#EFF6FF',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'16px'}}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="#2563EB"><path d="M3 5.1 10.3 4v7.3H3V5.1zm0 13.8 7.3 1v-7.2H3v6.2zM11.2 3.85 21 2.5v8.8h-9.8V3.85zm0 16.3L21 21.5v-8.7h-9.8v7.35z"/></svg>
              </div>
              <p style={{fontSize:'11px',fontWeight:800,color:'#2563EB',letterSpacing:'.7px',textTransform:'uppercase',margin:'0 0 5px'}}>Escritorio · Windows</p>
              <h3 style={{fontSize:'19px',fontWeight:800,letterSpacing:'-.3px',margin:'0 0 7px'}}>App de Escritorio</h3>
              <p style={{fontSize:'13px',color:'#6a6a6a',lineHeight:1.5,margin:'0 0 16px'}}>El panel de control y servidor. Se instala en la computadora de tu empresa.</p>
              <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'20px'}}>
                <span style={{fontSize:'11px',fontWeight:600,color:'#374151',background:'#F3F4F6',padding:'4px 9px',borderRadius:'99px'}}>Win 10 / 11</span>
                <span style={{fontSize:'11px',fontWeight:600,color:'#374151',background:'#F3F4F6',padding:'4px 9px',borderRadius:'99px'}}>64-bit</span>
                <span style={{fontSize:'11px',fontWeight:600,color:'#374151',background:'#F3F4F6',padding:'4px 9px',borderRadius:'99px'}}>~95 MB</span>
              </div>
              <a href="https://github.com/aalmaguerd99/D-CLOCK/releases/download/v1.3.2/D-CLOCK-Setup-1.3.2.exe" download className="dcl-dl-btn" style={{marginTop:'auto',display:'inline-flex',alignItems:'center',justifyContent:'center',gap:'8px',background:'#1a1a1a',color:'#fff',fontWeight:700,fontSize:'14.5px',padding:'13px',borderRadius:'13px',transition:'transform .15s,box-shadow .18s'}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Descargar .exe
              </a>
              <a href="https://github.com/aalmaguerd99/D-CLOCK/releases/download/v1.3.2/D-CLOCK-Portable-1.3.2.exe" download className="dcl-sec-win" style={{textAlign:'center',fontSize:'12px',fontWeight:600,color:'#6a6a6a',marginTop:'11px',transition:'color .15s'}}>Descargar versión portable →</a>
            </div>

            {/* ANDROID */}
            <div className="dcl-card dcl-card-android" style={{position:'relative',background:'rgba(255,255,255,.78)',backdropFilter:'blur(28px) saturate(160%)',WebkitBackdropFilter:'blur(28px) saturate(160%)',border:'1px solid rgba(0,0,0,.07)',borderRadius:'22px',padding:'26px 22px 24px',boxShadow:'0 1px 0 rgba(255,255,255,.9) inset,0 10px 44px rgba(0,0,0,.06)',display:'flex',flexDirection:'column'}}>
              {recAndroid && <span style={{position:'absolute',top:'14px',right:'14px',fontSize:'9.5px',fontWeight:800,color:'#15803d',background:'#dcfce7',padding:'4px 9px',borderRadius:'99px',letterSpacing:'.3px'}}>★ PARA TI</span>}
              <div style={{width:'54px',height:'54px',borderRadius:'15px',background:'#dcfce7',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'16px'}}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#16a34a"><path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85a.637.637 0 0 0-.83.22l-1.88 3.24a11.463 11.463 0 0 0-8.94 0L5.65 5.67a.643.643 0 0 0-.87-.2c-.28.18-.37.54-.22.83L6.4 9.48A10.78 10.78 0 0 0 1 18h22a10.78 10.78 0 0 0-5.4-8.52zM7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z"/></svg>
              </div>
              <p style={{fontSize:'11px',fontWeight:800,color:'#15803d',letterSpacing:'.7px',textTransform:'uppercase',margin:'0 0 5px'}}>Móvil · Android</p>
              <h3 style={{fontSize:'19px',fontWeight:800,letterSpacing:'-.3px',margin:'0 0 7px'}}>App Android (APK)</h3>
              <p style={{fontSize:'13px',color:'#6a6a6a',lineHeight:1.5,margin:'0 0 16px'}}>Para que tus empleados fichen con selfie y GPS desde su celular.</p>
              <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'20px'}}>
                <span style={{fontSize:'11px',fontWeight:600,color:'#374151',background:'#F3F4F6',padding:'4px 9px',borderRadius:'99px'}}>Android 8+</span>
                <span style={{fontSize:'11px',fontWeight:600,color:'#374151',background:'#F3F4F6',padding:'4px 9px',borderRadius:'99px'}}>v1.3.1</span>
                <span style={{fontSize:'11px',fontWeight:600,color:'#374151',background:'#F3F4F6',padding:'4px 9px',borderRadius:'99px'}}>~95 MB</span>
              </div>
              <a href="https://github.com/aalmaguerd99/D-CLOCK/releases/download/v1.3.2/D-CLOCK-1.3.2.apk" download className="dcl-dl-btn" style={{marginTop:'auto',display:'inline-flex',alignItems:'center',justifyContent:'center',gap:'8px',background:'#1a1a1a',color:'#fff',fontWeight:700,fontSize:'14.5px',padding:'13px',borderRadius:'13px',transition:'transform .15s,box-shadow .18s'}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Descargar APK
              </a>
              <a href="#instalar" className="dcl-sec-android" style={{textAlign:'center',fontSize:'12px',fontWeight:600,color:'#6a6a6a',marginTop:'11px',transition:'color .15s'}}>¿Cómo se instala el APK? →</a>
            </div>

            {/* APPLE */}
            <div className="dcl-card dcl-card-apple" style={{position:'relative',background:'rgba(255,255,255,.78)',backdropFilter:'blur(28px) saturate(160%)',WebkitBackdropFilter:'blur(28px) saturate(160%)',border:'1px solid rgba(0,0,0,.07)',borderRadius:'22px',padding:'26px 22px 24px',boxShadow:'0 1px 0 rgba(255,255,255,.9) inset,0 10px 44px rgba(0,0,0,.06)',display:'flex',flexDirection:'column'}}>
              {recApple && <span style={{position:'absolute',top:'14px',right:'14px',fontSize:'9.5px',fontWeight:800,color:'#1a1a1a',background:'#EDE8DF',padding:'4px 9px',borderRadius:'99px',letterSpacing:'.3px'}}>★ PARA TI</span>}
              <div style={{width:'54px',height:'54px',borderRadius:'15px',background:'#F3F4F6',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'16px'}}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="#1a1a1a"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              </div>
              <p style={{fontSize:'11px',fontWeight:800,color:'#1a1a1a',letterSpacing:'.7px',textTransform:'uppercase',margin:'0 0 5px'}}>Móvil · iPhone</p>
              <h3 style={{fontSize:'19px',fontWeight:800,letterSpacing:'-.3px',margin:'0 0 7px'}}>App para iPhone</h3>
              <p style={{fontSize:'13px',color:'#6a6a6a',lineHeight:1.5,margin:'0 0 16px'}}>Descarga oficial desde la App Store. Incluye credencial Apple Wallet.</p>
              <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'20px'}}>
                <span style={{fontSize:'11px',fontWeight:600,color:'#374151',background:'#F3F4F6',padding:'4px 9px',borderRadius:'99px'}}>iOS 15+</span>
                <span style={{fontSize:'11px',fontWeight:600,color:'#374151',background:'#F3F4F6',padding:'4px 9px',borderRadius:'99px'}}>App Store</span>
                <span style={{fontSize:'11px',fontWeight:600,color:'#374151',background:'#F3F4F6',padding:'4px 9px',borderRadius:'99px'}}>Wallet</span>
              </div>
              <a href="https://apps.apple.com/app/d-clock/id6769932290" target="_blank" rel="noopener noreferrer" className="dcl-dl-btn" style={{marginTop:'auto',display:'inline-flex',alignItems:'center',justifyContent:'center',gap:'8px',background:'#1a1a1a',color:'#fff',fontWeight:700,fontSize:'14.5px',padding:'13px',borderRadius:'13px',transition:'transform .15s,box-shadow .18s'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                Ver en App Store
              </a>
              <a href="https://apps.apple.com/app/d-clock/id6769932290" target="_blank" rel="noopener noreferrer" className="dcl-sec-apple" style={{textAlign:'center',fontSize:'12px',fontWeight:600,color:'#6a6a6a',marginTop:'11px',transition:'color .15s'}}>Requiere iPhone 8 o superior</a>
            </div>
          </div>

          {/* trust strip */}
          <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:'8px 18px',marginTop:'28px',fontSize:'12.5px',fontWeight:500,color:'#6a6a6a'}}>
            <span style={{display:'inline-flex',alignItems:'center',gap:'6px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>Repositorio oficial verificado</span>
            <span style={{color:'#cfcabf'}}>·</span>
            <span style={{display:'inline-flex',alignItems:'center',gap:'6px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Datos 100% en tu servidor</span>
            <span style={{color:'#cfcabf'}}>·</span>
            <span style={{display:'inline-flex',alignItems:'center',gap:'6px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>Listo en menos de 5 min</span>
          </div>
        </div>
      </section>

      {/* ══ PRODUCT MOCKUP ══ */}
      <section style={{position:'relative',zIndex:1,padding:'30px 24px 72px'}}>
        <div style={{maxWidth:'1020px',margin:'0 auto',position:'relative'}}>

          <div className="float1" style={{position:'absolute',top:'-22px',right:'14px',zIndex:20,background:'rgba(255,255,255,.9)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,.95)',borderRadius:'16px',padding:'11px 14px',display:'flex',alignItems:'center',gap:'10px',boxShadow:'0 12px 40px rgba(0,0,0,.12)'}}>
            <div style={{width:'34px',height:'34px',borderRadius:'11px',background:'linear-gradient(135deg,#dcfce7,#bbf7d0)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:800,color:'#15803d'}}>AG</div>
            <div>
              <p style={{fontSize:'11.5px',fontWeight:800,margin:0}}>Ana García — Entrada</p>
              <p style={{fontSize:'10.5px',fontWeight:700,color:'#16a34a',margin:'2px 0 0'}}>07:58 · Oficina Central</p>
            </div>
            <span className="pdot" style={{width:'7px',height:'7px',borderRadius:'50%',background:'#16a34a'}}/>
          </div>

          <div className="float2" style={{position:'absolute',bottom:'-18px',left:'8px',zIndex:20,background:'rgba(255,255,255,.9)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,.95)',borderRadius:'16px',padding:'11px 14px',display:'flex',alignItems:'center',gap:'10px',boxShadow:'0 12px 40px rgba(0,0,0,.12)'}}>
            <div style={{width:'32px',height:'32px',borderRadius:'10px',background:'#f5f3ff',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/></svg>
            </div>
            <div>
              <p style={{fontSize:'11.5px',fontWeight:800,margin:0}}>3 geo-cercas activas</p>
              <p style={{fontSize:'10.5px',fontWeight:700,color:'#7c3aed',margin:'2px 0 0'}}>47 presentes · 4 tarde · 2 ausentes</p>
            </div>
          </div>

          <div style={{background:'#FDFAF6',border:'1px solid rgba(0,0,0,.08)',borderRadius:'18px',overflow:'hidden',boxShadow:'0 30px 90px rgba(0,0,0,.13)'}}>
            {/* browser bar */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',borderBottom:'1px solid rgba(0,0,0,.06)',background:'rgba(255,255,255,.6)'}}>
              <div style={{display:'flex',gap:'6px'}}>
                <span style={{width:'10px',height:'10px',borderRadius:'50%',background:'#fca5a5'}}/>
                <span style={{width:'10px',height:'10px',borderRadius:'50%',background:'#fcd34d'}}/>
                <span style={{width:'10px',height:'10px',borderRadius:'50%',background:'#86efac'}}/>
              </div>
              <span style={{fontSize:'11px',color:'#9a9a92'}}>D-CLOCK · Panel de Control</span>
              <span style={{fontSize:'11px',fontWeight:700,color:'#16a34a',display:'inline-flex',alignItems:'center',gap:'5px'}}><span className="pdot" style={{width:'6px',height:'6px',borderRadius:'50%',background:'#16a34a',display:'inline-block'}}/>En vivo</span>
            </div>
            <div style={{display:'flex',height:'430px'}}>
              {/* sidebar */}
              <div style={{width:'188px',flexShrink:0,background:'rgba(255,255,255,.7)',borderRight:'1px solid rgba(0,0,0,.07)',display:'flex',flexDirection:'column'}}>
                <div style={{padding:'14px 14px 12px',borderBottom:'1px solid rgba(0,0,0,.07)',display:'flex',alignItems:'center',gap:'9px'}}>
                  <div style={{width:'30px',height:'30px',borderRadius:'9px',background:'#FDFAF6',border:'1.5px solid rgba(37,99,235,.18)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/D-CLOCKlogo.png" alt="" width={20} height={20} style={{objectFit:'contain'}}/>
                  </div>
                  <div><p style={{fontSize:'14px',fontWeight:800,margin:0,letterSpacing:'-.3px'}}>D-CLOCK</p><p style={{fontSize:'10px',color:'#9a9a92',margin:'1px 0 0'}}>Panel de Control</p></div>
                </div>
                <div style={{padding:'8px',flex:1,overflow:'hidden'}}>
                  <p style={{fontSize:'9px',fontWeight:700,color:'#aaa',textTransform:'uppercase',letterSpacing:'.6px',padding:'8px 10px 4px',margin:0}}>Principal</p>
                  <div style={{display:'flex',alignItems:'center',gap:'9px',padding:'8px 11px',borderRadius:'9px',background:'#EFF6FF',color:'#2563EB',fontSize:'12.5px',fontWeight:600,marginBottom:'1px'}}><svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>Dashboard</div>
                  <div style={{display:'flex',alignItems:'center',gap:'9px',padding:'8px 11px',borderRadius:'9px',color:'#6a6a6a',fontSize:'12.5px',fontWeight:500,marginBottom:'1px'}}><svg width="15" height="15" fill="none" stroke="#aaa" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Registros</div>
                  <div style={{display:'flex',alignItems:'center',gap:'9px',padding:'8px 11px',borderRadius:'9px',color:'#6a6a6a',fontSize:'12.5px',fontWeight:500,marginBottom:'1px'}}><svg width="15" height="15" fill="none" stroke="#aaa" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Reportes</div>
                  <p style={{fontSize:'9px',fontWeight:700,color:'#aaa',textTransform:'uppercase',letterSpacing:'.6px',padding:'10px 10px 4px',margin:0}}>Organización</p>
                  <div style={{display:'flex',alignItems:'center',gap:'9px',padding:'8px 11px',borderRadius:'9px',color:'#6a6a6a',fontSize:'12.5px',fontWeight:500,marginBottom:'1px'}}><svg width="15" height="15" fill="none" stroke="#aaa" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>Empleados</div>
                  <div style={{display:'flex',alignItems:'center',gap:'9px',padding:'8px 11px',borderRadius:'9px',color:'#6a6a6a',fontSize:'12.5px',fontWeight:500,marginBottom:'1px'}}><svg width="15" height="15" fill="none" stroke="#aaa" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>Equipos</div>
                  <p style={{fontSize:'9px',fontWeight:700,color:'#aaa',textTransform:'uppercase',letterSpacing:'.6px',padding:'10px 10px 4px',margin:0}}>Herramientas</p>
                  <div style={{display:'flex',alignItems:'center',gap:'9px',padding:'8px 11px',borderRadius:'9px',color:'#6a6a6a',fontSize:'12.5px',fontWeight:500,marginBottom:'1px'}}><svg width="15" height="15" fill="none" stroke="#aaa" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>Geocercas</div>
                  <div style={{display:'flex',alignItems:'center',gap:'9px',padding:'8px 11px',borderRadius:'9px',color:'#6a6a6a',fontSize:'12.5px',fontWeight:500}}><svg width="15" height="15" fill="none" stroke="#aaa" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>Credencial</div>
                </div>
              </div>
              {/* main panel */}
              <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column'}}>
                <div style={{height:'48px',padding:'0 18px',borderBottom:'1px solid rgba(0,0,0,.06)',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(255,255,255,.55)'}}>
                  <span style={{fontSize:'15px',fontWeight:700,letterSpacing:'-.3px'}}>Dashboard</span>
                  <span style={{fontSize:'11.5px',color:'#16a34a',display:'inline-flex',alignItems:'center',gap:'5px'}}><span className="pdot" style={{width:'7px',height:'7px',borderRadius:'50%',background:'#16a34a',display:'inline-block'}}/>En vivo</span>
                </div>
                <div style={{flex:1,padding:'16px',overflow:'hidden'}}>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'11px',marginBottom:'14px'}}>
                    <div style={{background:'rgba(255,255,255,.75)',border:'1px solid rgba(0,0,0,.06)',borderRadius:'13px',padding:'13px'}}><p style={{fontSize:'9.5px',fontWeight:700,color:'#9a9a92',textTransform:'uppercase',letterSpacing:'.4px',margin:'0 0 7px'}}>Empleados activos</p><p style={{fontSize:'28px',fontWeight:800,margin:0,color:'#2563EB',lineHeight:1,letterSpacing:'-.5px'}}>58</p></div>
                    <div style={{background:'rgba(255,255,255,.75)',border:'1px solid rgba(0,0,0,.06)',borderRadius:'13px',padding:'13px'}}><p style={{fontSize:'9.5px',fontWeight:700,color:'#9a9a92',textTransform:'uppercase',letterSpacing:'.4px',margin:'0 0 7px'}}>Presentes hoy</p><p style={{fontSize:'28px',fontWeight:800,margin:0,color:'#16a34a',lineHeight:1,letterSpacing:'-.5px'}}>44</p></div>
                    <div style={{background:'rgba(255,255,255,.75)',border:'1px solid rgba(0,0,0,.06)',borderRadius:'13px',padding:'13px'}}><p style={{fontSize:'9.5px',fontWeight:700,color:'#9a9a92',textTransform:'uppercase',letterSpacing:'.4px',margin:'0 0 7px'}}>Ausentes hoy</p><p style={{fontSize:'28px',fontWeight:800,margin:0,color:'#dc2626',lineHeight:1,letterSpacing:'-.5px'}}>2</p></div>
                    <div style={{background:'rgba(255,255,255,.75)',border:'1px solid rgba(0,0,0,.06)',borderRadius:'13px',padding:'13px'}}><p style={{fontSize:'9.5px',fontWeight:700,color:'#9a9a92',textTransform:'uppercase',letterSpacing:'.4px',margin:'0 0 7px'}}>En oficina ahora</p><p style={{fontSize:'28px',fontWeight:800,margin:0,color:'#7c3aed',lineHeight:1,letterSpacing:'-.5px'}}>31</p></div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr',gap:'11px'}}>
                    <div style={{background:'rgba(255,255,255,.75)',border:'1px solid rgba(0,0,0,.06)',borderRadius:'13px',padding:'14px'}}>
                      <p style={{fontSize:'12px',fontWeight:700,margin:'0 0 12px'}}>Asistencia — últimos 7 días</p>
                      <div style={{display:'flex',alignItems:'flex-end',gap:'8px',height:'110px'}}>
                        {[{h:'62%',l:'L',bold:false},{h:'78%',l:'M',bold:false},{h:'70%',l:'X',bold:false},{h:'85%',l:'J',bold:false},{h:'92%',l:'V',bold:true},{h:'30%',l:'S',bold:false},{h:'8%',l:'D',bold:false}].map(({h,l,bold})=>(
                          <div key={l} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',height:'100%'}}>
                            <div style={{flex:1,width:'100%',display:'flex',alignItems:'flex-end'}}>
                              <div style={{width:'100%',borderRadius:'4px 4px 0 0',background:bold?'#2563EB':'#EFF6FF',height:h}}/>
                            </div>
                            <span style={{fontSize:'10px',color:bold?'#1a1a1a':'#aaa',fontWeight:bold?700:400}}>{l}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{background:'rgba(255,255,255,.75)',border:'1px solid rgba(0,0,0,.06)',borderRadius:'13px',padding:'14px'}}>
                      <p style={{fontSize:'12px',fontWeight:700,margin:'0 0 10px',display:'flex',alignItems:'center',gap:'7px'}}><span className="pdot" style={{width:'7px',height:'7px',borderRadius:'50%',background:'#16a34a',display:'inline-block'}}/>Actividad reciente</p>
                      <div style={{display:'flex',flexDirection:'column',gap:'9px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'9px'}}><div style={{width:'28px',height:'28px',borderRadius:'50%',background:'#dbeafe',color:'#1d4ed8',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:800,flexShrink:0}}>AG</div><div style={{flex:1,minWidth:0}}><p style={{fontSize:'11.5px',fontWeight:600,margin:0}}>Ana García</p></div><span style={{fontSize:'9.5px',fontWeight:700,color:'#16a34a',background:'#dcfce7',padding:'2px 7px',borderRadius:'99px'}}>entrada</span><span style={{fontSize:'10px',color:'#aaa'}}>07:58</span></div>
                        <div style={{display:'flex',alignItems:'center',gap:'9px'}}><div style={{width:'28px',height:'28px',borderRadius:'50%',background:'#fef9c3',color:'#92400e',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:800,flexShrink:0}}>CR</div><div style={{flex:1,minWidth:0}}><p style={{fontSize:'11.5px',fontWeight:600,margin:0}}>Carlos Ruiz</p></div><span style={{fontSize:'9.5px',fontWeight:700,color:'#16a34a',background:'#dcfce7',padding:'2px 7px',borderRadius:'99px'}}>entrada</span><span style={{fontSize:'10px',color:'#aaa'}}>08:12</span></div>
                        <div style={{display:'flex',alignItems:'center',gap:'9px'}}><div style={{width:'28px',height:'28px',borderRadius:'50%',background:'#f5f3ff',color:'#6d28d9',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:800,flexShrink:0}}>JH</div><div style={{flex:1,minWidth:0}}><p style={{fontSize:'11.5px',fontWeight:600,margin:0}}>José Hernández</p></div><span style={{fontSize:'9.5px',fontWeight:700,color:'#d97706',background:'#fffbeb',padding:'2px 7px',borderRadius:'99px'}}>salida</span><span style={{fontSize:'10px',color:'#aaa'}}>16:55</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ INSTALAR APK ══ */}
      <section id="instalar" style={{position:'relative',zIndex:1,padding:'64px 24px',scrollMarginTop:'78px'}}>
        <div style={{maxWidth:'1060px',margin:'0 auto'}}>
          <div style={{background:'rgba(255,255,255,.78)',backdropFilter:'blur(28px) saturate(160%)',WebkitBackdropFilter:'blur(28px) saturate(160%)',border:'1px solid rgba(0,0,0,.07)',borderRadius:'26px',overflow:'hidden',boxShadow:'0 1px 0 rgba(255,255,255,.9) inset,0 20px 70px rgba(0,0,0,.07)'}}>
            <div style={{padding:'36px 36px 6px'}}>
              <div style={{display:'inline-flex',alignItems:'center',gap:'8px',fontSize:'11.5px',fontWeight:800,color:'#15803d',background:'#dcfce7',padding:'6px 13px',borderRadius:'99px',marginBottom:'16px'}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#15803d"><path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85a.637.637 0 0 0-.83.22l-1.88 3.24a11.463 11.463 0 0 0-8.94 0L5.65 5.67a.643.643 0 0 0-.87-.2c-.28.18-.37.54-.22.83L6.4 9.48A10.78 10.78 0 0 0 1 18h22a10.78 10.78 0 0 0-5.4-8.52zM7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z"/></svg>
                Instalación del APK Android
              </div>
              <h2 style={{fontSize:'clamp(1.7rem,3.2vw,2.3rem)',fontWeight:900,letterSpacing:'-.03em',margin:'0 0 8px',lineHeight:1.1}}>Instala el APK en 4 pasos<span style={{color:'#9a9a92'}}> — sin Play Store.</span></h2>
              <p style={{fontSize:'14.5px',color:'#6a6a6a',lineHeight:1.6,maxWidth:'600px',margin:0}}>El APK se descarga directo de nuestro repositorio oficial. Android pedirá un permiso una sola vez; es totalmente seguro.</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',padding:'28px 36px 32px'}}>
              {steps.map(st=>(
                <div key={st.n} style={{padding:'0 18px',borderLeft:'1px solid rgba(0,0,0,.08)'}}>
                  <div style={{width:'38px',height:'38px',borderRadius:'11px',background:'#1a1a1a',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',fontWeight:900,marginBottom:'14px'}}>{st.n}</div>
                  <h3 style={{fontSize:'15px',fontWeight:800,margin:'0 0 6px',letterSpacing:'-.2px'}}>{st.t}</h3>
                  <p style={{fontSize:'12.5px',color:'#6a6a6a',lineHeight:1.5,margin:0}}>{st.d}</p>
                </div>
              ))}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1.3fr 1fr',borderTop:'1px solid rgba(0,0,0,.06)'}}>
              <div style={{padding:'24px 36px',display:'flex',gap:'14px',alignItems:'flex-start',background:'rgba(22,163,74,.04)'}}>
                <div style={{width:'40px',height:'40px',borderRadius:'12px',background:'#dcfce7',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
                </div>
                <div>
                  <p style={{fontSize:'14px',fontWeight:800,margin:'0 0 4px'}}>Descarga segura y firmada</p>
                  <p style={{fontSize:'12.5px',color:'#6a6a6a',lineHeight:1.5,margin:0}}>El APK proviene del repositorio oficial de D99-TECH en GitHub Releases. No pasa por tiendas de terceros y está firmado digitalmente.</p>
                </div>
              </div>
              <div style={{padding:'24px 36px',borderLeft:'1px solid rgba(0,0,0,.06)'}}>
                <p style={{fontSize:'10.5px',fontWeight:800,color:'#9a9a92',letterSpacing:'.7px',textTransform:'uppercase',margin:'0 0 12px'}}>Requisitos del sistema</p>
                <div style={{display:'flex',flexDirection:'column',gap:'8px',fontSize:'12.5px',color:'#3a3a3a'}}>
                  <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'#9a9a92'}}>Escritorio</span><span style={{fontWeight:700}}>Windows 10/11 · 64-bit</span></div>
                  <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'#9a9a92'}}>Android</span><span style={{fontWeight:700}}>8.0+ · cámara + GPS</span></div>
                  <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'#9a9a92'}}>iPhone</span><span style={{fontWeight:700}}>iOS 15+ · iPhone 8+</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FUNCIONES ══ */}
      <section id="funciones" style={{position:'relative',zIndex:1,padding:'76px 24px',scrollMarginTop:'70px'}}>
        <div style={{maxWidth:'1060px',margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:'46px'}}>
            <p style={{fontSize:'11px',fontWeight:800,color:'#2563EB',letterSpacing:'1.4px',textTransform:'uppercase',margin:'0 0 12px'}}>Por qué D-CLOCK</p>
            <h2 style={{fontSize:'clamp(1.8rem,3.4vw,2.4rem)',fontWeight:900,letterSpacing:'-.03em',margin:0,lineHeight:1.1}}>Todo lo que necesitas para<br/><span style={{color:'#9a9a92'}}>controlar la asistencia de verdad.</span></h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px'}}>
            {features.map(f=>(
              <div key={f.title} className="dcl-feature-card" style={{background:'rgba(255,255,255,.72)',backdropFilter:'blur(20px)',border:'1px solid rgba(0,0,0,.06)',borderRadius:'18px',padding:'22px'}}>
                <div style={{width:'42px',height:'42px',borderRadius:'12px',background:'#EFF6FF',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'14px'}} dangerouslySetInnerHTML={{__html:f.icon}}/>
                <h3 style={{fontSize:'15px',fontWeight:800,margin:'0 0 7px',letterSpacing:'-.2px'}}>{f.title}</h3>
                <p style={{fontSize:'13px',color:'#6a6a6a',lineHeight:1.5,margin:0}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ GEO-CERCAS ══ */}
      <section style={{position:'relative',zIndex:1,padding:'28px 24px 76px'}}>
        <div style={{maxWidth:'1060px',margin:'0 auto',background:'rgba(255,255,255,.72)',backdropFilter:'blur(24px) saturate(160%)',WebkitBackdropFilter:'blur(24px) saturate(160%)',border:'1px solid rgba(0,0,0,.07)',borderRadius:'26px',overflow:'hidden',boxShadow:'0 1px 0 rgba(255,255,255,.9) inset,0 20px 70px rgba(0,0,0,.06)'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr'}}>
            <div style={{padding:'46px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
              <div style={{display:'inline-flex',alignSelf:'flex-start',alignItems:'center',gap:'8px',fontSize:'11.5px',fontWeight:800,color:'#7c3aed',background:'#f5f3ff',padding:'6px 13px',borderRadius:'99px',marginBottom:'18px'}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
                Geo-cercas inteligentes
              </div>
              <h2 style={{fontSize:'clamp(1.5rem,2.8vw,2rem)',fontWeight:900,letterSpacing:'-.03em',margin:'0 0 16px',lineHeight:1.15}}>Solo registra si el empleado<br/><span style={{color:'#7c3aed'}}>está donde debe estar.</span></h2>
              <p style={{fontSize:'14px',color:'#6a6a6a',lineHeight:1.6,margin:'0 0 22px'}}>Define un radio alrededor de cada sede. Si el empleado no está dentro del área al fichar, se marca como fuera de zona y genera una alerta.</p>
              <div style={{display:'flex',flexDirection:'column',gap:'13px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'12px',fontSize:'13.5px',color:'#3a3a3a'}}><div style={{width:'28px',height:'28px',borderRadius:'9px',background:'#f5f3ff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><rect x="3" y="8" width="7" height="13"/><rect x="14" y="3" width="7" height="18"/></svg></div>Multi-sede: cada sucursal con su propia geo-cerca</div>
                <div style={{display:'flex',alignItems:'center',gap:'12px',fontSize:'13.5px',color:'#3a3a3a'}}><div style={{width:'28px',height:'28px',borderRadius:'9px',background:'#f5f3ff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/></svg></div>Radio ajustable desde 10 hasta 5,000 metros</div>
                <div style={{display:'flex',alignItems:'center',gap:'12px',fontSize:'13.5px',color:'#3a3a3a'}}><div style={{width:'28px',height:'28px',borderRadius:'9px',background:'#f5f3ff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><path d="M18 8c0 3-2 5-6 5s-6-2-6-5"/></svg></div>Alerta automática si alguien ficha fuera de zona</div>
              </div>
            </div>
            <div style={{background:'rgba(255,255,255,.4)',borderLeft:'1px solid rgba(0,0,0,.06)',padding:'40px',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <div style={{position:'relative',width:'100%',aspectRatio:'1.15',borderRadius:'18px',background:'#F0F5FF',border:'1px solid rgba(37,99,235,.1)',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(37,99,235,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,.06) 1px,transparent 1px)',backgroundSize:'38px 38px'}}/>
                <div className="map-circle" style={{width:'150px',height:'150px'}}/>
                <div style={{position:'relative',width:'110px',height:'110px',borderRadius:'50%',border:'2px dashed rgba(37,99,235,.35)',background:'rgba(37,99,235,.05)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <div style={{width:'42px',height:'42px',borderRadius:'50%',background:'#2563EB',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 6px 20px rgba(37,99,235,.45)'}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
                  </div>
                </div>
                <div style={{position:'absolute',left:'58%',top:'42%',width:'12px',height:'12px',borderRadius:'50%',background:'#16a34a',border:'2px solid #fff',boxShadow:'0 2px 6px rgba(0,0,0,.15)'}}/>
                <div style={{position:'absolute',left:'48%',top:'58%',width:'12px',height:'12px',borderRadius:'50%',background:'#16a34a',border:'2px solid #fff',boxShadow:'0 2px 6px rgba(0,0,0,.15)'}}/>
                <div style={{position:'absolute',left:'74%',top:'70%',width:'12px',height:'12px',borderRadius:'50%',background:'#dc2626',border:'2px solid #fff',boxShadow:'0 2px 6px rgba(0,0,0,.15)'}}/>
                <div style={{position:'absolute',bottom:'12px',right:'14px',fontSize:'11px',fontWeight:600,color:'#6a6a6a'}}>Radio: 150 m</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ APP MÓVIL — PHONES ══ */}
      <section style={{position:'relative',zIndex:1,padding:'46px 24px 86px',overflow:'hidden'}}>
        <div style={{maxWidth:'1060px',margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'54px',alignItems:'center'}}>
          <div>
            <div style={{display:'inline-flex',alignItems:'center',gap:'8px',fontSize:'11.5px',fontWeight:800,color:'#2563EB',background:'#dbeafe',padding:'6px 13px',borderRadius:'99px',marginBottom:'18px'}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/></svg>
              App móvil D-CLOCK
            </div>
            <h2 style={{fontSize:'clamp(1.7rem,3.2vw,2.3rem)',fontWeight:900,letterSpacing:'-.03em',margin:'0 0 16px',lineHeight:1.13}}>El empleado ficha en segundos<br/><span style={{color:'#2563EB'}}>desde su celular.</span></h2>
            <p style={{fontSize:'14px',color:'#6a6a6a',lineHeight:1.6,margin:'0 0 26px'}}>Registra entrada y salida con <strong style={{color:'#1a1a1a',fontWeight:700}}>foto de verificación</strong> y <strong style={{color:'#1a1a1a',fontWeight:700}}>GPS</strong>. Se conecta directo al servidor de tu empresa. Sin cuentas externas.</p>
            <div style={{display:'flex',flexDirection:'column',gap:'15px',marginBottom:'28px'}}>
              <div style={{display:'flex',gap:'13px',alignItems:'flex-start'}}><div style={{width:'34px',height:'34px',borderRadius:'10px',background:'#EFF6FF',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div><div><p style={{fontSize:'14px',fontWeight:800,margin:'0 0 2px'}}>Foto al registrar</p><p style={{fontSize:'12.5px',color:'#6a6a6a',lineHeight:1.5,margin:0}}>Toca para tomar foto y fichar: cada registro queda respaldado.</p></div></div>
              <div style={{display:'flex',gap:'13px',alignItems:'flex-start'}}><div style={{width:'34px',height:'34px',borderRadius:'10px',background:'#EFF6FF',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg></div><div><p style={{fontSize:'14px',fontWeight:800,margin:'0 0 2px'}}>GPS en cada ficha</p><p style={{fontSize:'12.5px',color:'#6a6a6a',lineHeight:1.5,margin:0}}>Coordenadas exactas validadas contra la geo-cerca.</p></div></div>
              <div style={{display:'flex',gap:'13px',alignItems:'flex-start'}}><div style={{width:'34px',height:'34px',borderRadius:'10px',background:'#EFF6FF',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="3"/><circle cx="8" cy="12" r="2.5"/><path d="M13 10h5M13 14h3"/></svg></div><div><p style={{fontSize:'14px',fontWeight:800,margin:'0 0 2px'}}>Credencial Apple Wallet</p><p style={{fontSize:'12.5px',color:'#6a6a6a',lineHeight:1.5,margin:0}}>Genera pases .pkpass personalizados para iPhone.</p></div></div>
            </div>
            <div style={{display:'flex',flexWrap:'wrap',gap:'10px'}}>
              <a href="https://github.com/aalmaguerd99/D-CLOCK/releases/download/v1.3.2/D-CLOCK-1.3.2.apk" download className="dcl-mob-android" style={{display:'inline-flex',alignItems:'center',gap:'9px',background:'rgba(255,255,255,.75)',border:'1px solid rgba(0,0,0,.1)',borderRadius:'12px',padding:'10px 15px',fontSize:'13px',fontWeight:700,transition:'all .18s'}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#16a34a"><path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85a.637.637 0 0 0-.83.22l-1.88 3.24a11.463 11.463 0 0 0-8.94 0L5.65 5.67a.643.643 0 0 0-.87-.2c-.28.18-.37.54-.22.83L6.4 9.48A10.78 10.78 0 0 0 1 18h22a10.78 10.78 0 0 0-5.4-8.52zM7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z"/></svg>
                APK Android
              </a>
              <a href="https://apps.apple.com/app/d-clock/id6769932290" target="_blank" rel="noopener noreferrer" className="dcl-mob-apple" style={{display:'inline-flex',alignItems:'center',gap:'9px',background:'rgba(255,255,255,.75)',border:'1px solid rgba(0,0,0,.1)',borderRadius:'12px',padding:'10px 15px',fontSize:'13px',fontWeight:700,transition:'all .18s'}}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="#1a1a1a"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                App Store
              </a>
              <span style={{display:'inline-flex',alignItems:'center',gap:'7px',fontSize:'11.5px',fontWeight:600,color:'#15803d',background:'#dcfce7',border:'1px solid #bbf7d0',padding:'9px 13px',borderRadius:'99px'}}><span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#15803d',display:'inline-block'}}/>v1.3.1 disponible</span>
            </div>
          </div>

          {/* phones */}
          <div style={{display:'flex',justifyContent:'center',gap:'16px',alignItems:'flex-end'}}>
            {/* Phone 1 — Registro */}
            <div style={{width:'178px',flexShrink:0,background:'#111',borderRadius:'32px',padding:'3px',boxShadow:'0 36px 90px rgba(0,0,0,.3)'}}>
              <div style={{background:'#F5F1EB',borderRadius:'29px',overflow:'hidden'}}>
                <div style={{height:'28px',background:'#F5F1EB',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px'}}>
                  <span style={{fontSize:'9px',fontWeight:800}}>10:12</span>
                  <div style={{display:'flex',gap:'3px',alignItems:'center'}}><svg width="11" height="8" viewBox="0 0 18 12" fill="#111"><rect x="0" y="7" width="3" height="5" rx="1"/><rect x="5" y="4" width="3" height="8" rx="1"/><rect x="10" y="1" width="3" height="11" rx="1"/></svg><span style={{fontSize:'7px',fontWeight:800,border:'1px solid #111',borderRadius:'3px',padding:'0 2px'}}>84</span></div>
                </div>
                <div style={{padding:'14px 16px 16px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'16px'}}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/D-CLOCKlogo.png" alt="" width={16} height={16} style={{objectFit:'contain'}}/>
                    <span style={{fontSize:'9px',fontWeight:800,color:'#b8b3a8',letterSpacing:'1.5px'}}>D99-TECH</span>
                  </div>
                  <p style={{fontSize:'36px',fontWeight:900,letterSpacing:'-.04em',margin:0,lineHeight:.95}}>9:16<span style={{fontSize:'20px'}}> a.m.</span></p>
                  <p style={{fontSize:'8.5px',color:'#a8a39a',margin:'4px 0 16px'}}>Lunes, 22 de Junio</p>
                  <p style={{fontSize:'14px',fontWeight:900,margin:0,letterSpacing:'-.3px'}}>Ana García Marín</p>
                  <p style={{fontSize:'8px',color:'#a8a39a',margin:'2px 0 12px'}}>001 · DIRECTORA</p>
                  <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'14px'}}><span style={{width:'7px',height:'7px',borderRadius:'50%',background:'#888'}}/><span style={{fontSize:'9px',fontWeight:800,color:'#777',letterSpacing:'1px'}}>SIN REGISTRO</span></div>
                  <div style={{background:'#111',borderRadius:'14px',padding:'18px 12px',textAlign:'center',marginBottom:'16px'}}><p style={{fontSize:'12px',fontWeight:900,color:'#fff',letterSpacing:'.5px',margin:0}}>REGISTRAR ENTRADA</p><p style={{fontSize:'7.5px',color:'rgba(255,255,255,.5)',margin:'4px 0 0'}}>Toca para tomar foto y fichar</p></div>
                  <p style={{fontSize:'8px',fontWeight:800,color:'#b8b3a8',letterSpacing:'1.5px',margin:'0 0 6px'}}>REGISTROS HOY</p>
                  <p style={{fontSize:'10px',color:'#b8b3a8',margin:0}}>Sin registros aún</p>
                </div>
                <div style={{background:'#FDFAF6',borderTop:'1px solid #eee',display:'flex',padding:'7px 2px'}}>
                  {[{s:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2"><path d="M12 11a3 3 0 0 0-3 3v3"/><path d="M6 11a6 6 0 0 1 12 0v2a8 8 0 0 1-.5 3"/><path d="M9 19a8 8 0 0 0 .5-3v-2a2.5 2.5 0 0 1 5 0v2"/></svg>,l:'Regist…',a:true},
                   {s:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>,l:'Histor…',a:false},
                   {s:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="10" r="3"/><path d="M6.5 18a6 6 0 0 1 11 0"/></svg>,l:'Perfil',a:false},
                   {s:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2.5"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,l:'Crede…',a:false},
                   {s:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3.5" y1="6" x2="3.51" y2="6"/><line x1="3.5" y1="12" x2="3.51" y2="12"/><line x1="3.5" y1="18" x2="3.51" y2="18"/></svg>,l:'Regist…',a:false},
                   {s:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><circle cx="9" cy="8" r="3"/><path d="M3 19a6 6 0 0 1 12 0"/><circle cx="17.5" cy="9" r="2.2"/></svg>,l:'Equipo',a:false}
                  ].map(({s,l,a},i)=>(
                    <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'2px'}}>{s}<span style={{fontSize:'5px',fontWeight:800,color:a?'#111':'#bbb'}}>{l}</span></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Phone 2 — Historial */}
            <div style={{width:'178px',flexShrink:0,marginBottom:'-26px',background:'#111',borderRadius:'32px',padding:'3px',boxShadow:'0 44px 100px rgba(0,0,0,.32)'}}>
              <div style={{background:'#F5F1EB',borderRadius:'29px',overflow:'hidden'}}>
                <div style={{height:'28px',background:'#F5F1EB',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:'9px',fontWeight:800}}>Historial</span></div>
                <div style={{padding:'12px 14px 16px'}}>
                  <p style={{fontSize:'9px',fontWeight:800,color:'#b8b3a8',letterSpacing:'1.2px',margin:'0 0 10px'}}>JUEVES 18 DE JUNIO</p>
                  <div style={{background:'#fff',borderRadius:'13px',overflow:'hidden',border:'1px solid #ececec'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'9px',padding:'11px 12px',borderBottom:'1px solid #f4f4f4'}}><div style={{width:'26px',height:'26px',borderRadius:'50%',background:'#dbeafe',color:'#1d4ed8',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px',fontWeight:800}}>AG</div><div><p style={{fontSize:'9.5px',fontWeight:800,margin:0,lineHeight:1}}>Ana García</p><p style={{fontSize:'7px',color:'#a8a39a',margin:'2px 0 0'}}>001 · DIRECTORA</p></div></div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr'}}>
                      <div style={{padding:'10px',borderRight:'1px solid #f4f4f4'}}>
                        <p style={{fontSize:'6.5px',fontWeight:800,color:'#16a34a',letterSpacing:'.8px',margin:'0 0 4px'}}>ENTRADA</p>
                        <p style={{fontSize:'14px',fontWeight:900,color:'#16a34a',margin:'0 0 6px',lineHeight:1}}>07:58</p>
                        <div style={{width:'100%',height:'44px',borderRadius:'6px',background:'linear-gradient(135deg,#e6e1d6,#d8d2c6)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'5px'}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b0a99c" strokeWidth="2"><circle cx="12" cy="9" r="3"/><path d="M5 20a7 7 0 0 1 14 0"/></svg></div>
                        <div style={{width:'100%',height:'30px',borderRadius:'6px',background:'#e8f0fe',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{width:'7px',height:'7px',borderRadius:'50%',background:'#2563EB'}}/></div>
                      </div>
                      <div style={{padding:'10px'}}>
                        <p style={{fontSize:'6.5px',fontWeight:800,color:'#2563EB',letterSpacing:'.8px',margin:'0 0 4px'}}>SALIDA</p>
                        <p style={{fontSize:'14px',fontWeight:900,color:'#2563EB',margin:'0 0 6px',lineHeight:1}}>17:02</p>
                        <div style={{width:'100%',height:'44px',borderRadius:'6px',background:'linear-gradient(135deg,#e6e1d6,#d8d2c6)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'5px'}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b0a99c" strokeWidth="2"><circle cx="12" cy="9" r="3"/><path d="M5 20a7 7 0 0 1 14 0"/></svg></div>
                        <div style={{width:'100%',height:'30px',borderRadius:'6px',background:'#e8f0fe',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{width:'7px',height:'7px',borderRadius:'50%',background:'#2563EB'}}/></div>
                      </div>
                    </div>
                  </div>
                  <div style={{marginTop:'9px',display:'flex',alignItems:'center',gap:'6px',padding:'8px 11px',background:'#dcfce7',borderRadius:'10px'}}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.4"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg><span style={{fontSize:'8.5px',fontWeight:800,color:'#15803d'}}>Jornada completa · 9h 04m</span></div>
                </div>
                <div style={{background:'#FDFAF6',borderTop:'1px solid #eee',display:'flex',padding:'7px 2px'}}>
                  {[false,true,false,false,false,false].map((a,i)=>(
                    <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'2px'}}>
                      {i===0&&<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={a?'#111':'#bbb'} strokeWidth="2"><path d="M12 11a3 3 0 0 0-3 3v3"/><path d="M6 11a6 6 0 0 1 12 0v2a8 8 0 0 1-.5 3"/></svg>}
                      {i===1&&<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={a?'#111':'#bbb'} strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>}
                      {i===2&&<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="10" r="3"/><path d="M6.5 18a6 6 0 0 1 11 0"/></svg>}
                      {i===3&&<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2.5"/><line x1="2" y1="10" x2="22" y2="10"/></svg>}
                      {i===4&&<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/></svg>}
                      {i===5&&<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><circle cx="9" cy="8" r="3"/><path d="M3 19a6 6 0 0 1 12 0"/><circle cx="17.5" cy="9" r="2.2"/></svg>}
                      <span style={{fontSize:'5px',fontWeight:800,color:a?'#111':'#bbb'}}>{['Regist…','Histor…','Perfil','Crede…','Regist…','Equipo'][i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Phone 3 — Credencial */}
            <div style={{width:'178px',flexShrink:0,background:'#111',borderRadius:'32px',padding:'3px',boxShadow:'0 36px 90px rgba(0,0,0,.3)'}}>
              <div style={{background:'#F5F1EB',borderRadius:'29px',overflow:'hidden'}}>
                <div style={{height:'28px',background:'#F5F1EB',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:'9px',fontWeight:800}}>Credencial</span></div>
                <div style={{padding:'14px 14px 16px'}}>
                  <p style={{fontSize:'9px',fontWeight:800,color:'#b8b3a8',letterSpacing:'1.2px',margin:'0 0 12px'}}>APPLE WALLET</p>
                  <div style={{borderRadius:'14px',overflow:'hidden',background:'linear-gradient(160deg,#1d4ed8,#2563EB 55%,#1e3a8a)',padding:'14px',boxShadow:'0 10px 30px rgba(37,99,235,.35)'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'12px'}}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/D-CLOCKlogo.png" alt="" width={16} height={16} style={{objectFit:'contain',filter:'brightness(0) invert(1)'}}/>
                      <span style={{fontSize:'7px',fontWeight:800,color:'#fff',letterSpacing:'1.4px',opacity:.85}}>D99-TECH</span>
                    </div>
                    <div style={{display:'flex',gap:'10px',alignItems:'center',marginBottom:'12px'}}>
                      <div style={{flex:1}}><p style={{fontSize:'13px',fontWeight:900,color:'#fff',margin:0,lineHeight:1.05}}>Ana García</p><p style={{fontSize:'8px',color:'rgba(255,255,255,.8)',margin:'3px 0 0'}}>DIRECTORA</p></div>
                      <div style={{width:'46px',height:'56px',borderRadius:'8px',background:'rgba(255,255,255,.18)',border:'1.5px solid rgba(255,255,255,.25)',display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" opacity=".7"><circle cx="12" cy="9" r="3"/><path d="M5 20a7 7 0 0 1 14 0"/></svg></div>
                    </div>
                    <div style={{display:'flex',gap:'14px',borderTop:'1px solid rgba(255,255,255,.15)',paddingTop:'9px',marginBottom:'11px'}}>
                      <div><p style={{fontSize:'6px',fontWeight:700,color:'rgba(255,255,255,.65)',letterSpacing:'.8px',margin:0}}>N° EMPLEADO</p><p style={{fontSize:'9px',fontWeight:700,color:'#fff',margin:'2px 0 0'}}>001</p></div>
                      <div><p style={{fontSize:'6px',fontWeight:700,color:'rgba(255,255,255,.65)',letterSpacing:'.8px',margin:0}}>ÁREA</p><p style={{fontSize:'9px',fontWeight:700,color:'#fff',margin:'2px 0 0'}}>Oficina</p></div>
                    </div>
                    <div style={{display:'flex',justifyContent:'center'}}>
                      <div style={{width:'62px',height:'62px',borderRadius:'8px',background:'#fff',padding:'5px',display:'grid',gridTemplateColumns:'repeat(5,1fr)',gridTemplateRows:'repeat(5,1fr)',gap:'1px'}}>
                        {[1,0,1,1,0, 0,1,0,0,1, 1,0,1,1,0, 1,0,0,1,1, 0,1,1,0,1].map((v,i)=>(
                          <div key={i} style={{background:v?'#111':'transparent'}}/>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{marginTop:'11px',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',padding:'9px',background:'#111',borderRadius:'11px'}}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    <span style={{fontSize:'8.5px',fontWeight:800,color:'#fff'}}>Añadir a Apple Wallet</span>
                  </div>
                </div>
                <div style={{background:'#FDFAF6',borderTop:'1px solid #eee',display:'flex',padding:'7px 2px'}}>
                  {[false,false,false,true,false,false].map((a,i)=>(
                    <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'2px'}}>
                      {i===0&&<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><path d="M12 11a3 3 0 0 0-3 3v3"/><path d="M6 11a6 6 0 0 1 12 0v2a8 8 0 0 1-.5 3"/></svg>}
                      {i===1&&<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>}
                      {i===2&&<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="10" r="3"/><path d="M6.5 18a6 6 0 0 1 11 0"/></svg>}
                      {i===3&&<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={a?'#111':'#bbb'} strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2.5"/><line x1="2" y1="10" x2="22" y2="10"/></svg>}
                      {i===4&&<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/></svg>}
                      {i===5&&<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><circle cx="9" cy="8" r="3"/><path d="M3 19a6 6 0 0 1 12 0"/><circle cx="17.5" cy="9" r="2.2"/></svg>}
                      <span style={{fontSize:'5px',fontWeight:800,color:a?'#111':'#bbb'}}>{['Regist…','Histor…','Perfil','Crede…','Regist…','Equipo'][i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PLANES ══ */}
      <section id="planes" style={{position:'relative',zIndex:1,padding:'30px 24px 80px',scrollMarginTop:'70px'}}>
        <div style={{maxWidth:'1060px',margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:'44px'}}>
            <p style={{fontSize:'11px',fontWeight:800,color:'#2563EB',letterSpacing:'1.4px',textTransform:'uppercase',margin:'0 0 12px'}}>Planes</p>
            <h2 style={{fontSize:'clamp(1.8rem,3.4vw,2.4rem)',fontWeight:900,letterSpacing:'-.03em',margin:'0 0 10px',lineHeight:1.1}}>Licencia anual. Tu servidor.<br/><span style={{color:'#9a9a92'}}>Soporte incluido todo el año.</span></h2>
            <p style={{fontSize:'14px',color:'#6a6a6a',margin:0}}>Renovación anual · Actualizaciones incluidas · Sin costos ocultos</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px'}}>
            {plans.map(p=>(
              <div key={p.tier} className="dcl-plan-card" style={{position:'relative',background:'rgba(255,255,255,.72)',backdropFilter:'blur(20px)',border:'1px solid rgba(0,0,0,.07)',borderRadius:'20px',padding:'24px',display:'flex',flexDirection:'column'}}>
                {p.feat && <span style={{position:'absolute',top:'-11px',left:'50%',transform:'translateX(-50%)',fontSize:'10px',fontWeight:800,color:'#fff',background:'#2563EB',padding:'4px 13px',borderRadius:'99px',whiteSpace:'nowrap'}}>★ Más popular</span>}
                <p style={{fontSize:'10px',fontWeight:800,color:'#9a9a92',textTransform:'uppercase',letterSpacing:'.6px',margin:'0 0 4px'}}>{p.label}</p>
                <div style={{marginBottom:'4px'}}><span style={{fontSize:'44px',fontWeight:900,letterSpacing:'-1.5px',lineHeight:1}}>{p.tier}</span><span style={{fontSize:'13px',color:'#6a6a6a',marginLeft:'5px'}}>empleados</span></div>
                <p style={{fontSize:'12px',color:'#6a6a6a',lineHeight:1.4,margin:'0 0 18px'}}>{p.desc}</p>
                <div style={{display:'flex',flexDirection:'column',gap:'9px',flex:1,marginBottom:'18px'}}>
                  {p.feats.map(ft=>(
                    <div key={ft} style={{display:'flex',alignItems:'flex-start',gap:'8px',fontSize:'12.5px',color:'#3a3a3a',lineHeight:1.4}}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:'2px'}}><polyline points="20 6 9 17 4 12"/></svg>
                      {ft}
                    </div>
                  ))}
                </div>
                <a href="mailto:contacto@d99-tech.com" className="dcl-plan-btn" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',background:p.btnBg,color:p.btnColor,border:`1px solid ${p.btnBorder}`,fontWeight:700,fontSize:'13px',padding:'11px',borderRadius:'11px',transition:'transform .15s'}}>Solicitar licencia</a>
              </div>
            ))}
          </div>
          <p style={{textAlign:'center',fontSize:'13px',color:'#6a6a6a',margin:'28px 0 0'}}>¿Necesitas más de 500 empleados o un plan a la medida? <a href="mailto:contacto@d99-tech.com" style={{color:'#2563EB',fontWeight:700}}>Escríbenos →</a></p>
        </div>
      </section>

      {/* ══ CTA FINAL ══ */}
      <section style={{position:'relative',zIndex:1,padding:'0 24px 80px'}}>
        <div style={{maxWidth:'1060px',margin:'0 auto',background:'linear-gradient(150deg,#1a1a1a,#262626)',borderRadius:'28px',padding:'54px 40px',textAlign:'center',overflow:'hidden',position:'relative',boxShadow:'0 30px 80px rgba(0,0,0,.25)'}}>
          <div style={{position:'absolute',width:'380px',height:'380px',borderRadius:'50%',filter:'blur(100px)',background:'#2563EB',opacity:.28,top:'-160px',left:'50%',transform:'translateX(-50%)'}}/>
          <div style={{position:'relative',zIndex:1}}>
            <h2 style={{fontSize:'clamp(1.8rem,3.6vw,2.5rem)',fontWeight:900,letterSpacing:'-.03em',color:'#fff',margin:'0 0 14px',lineHeight:1.1}}>Empieza a checar hoy mismo.</h2>
            <p style={{fontSize:'15px',color:'rgba(255,255,255,.7)',margin:'0 auto 28px',maxWidth:'480px',lineHeight:1.6}}>Descarga D-CLOCK para tu plataforma. Instalación en menos de 5 minutos.</p>
            <div style={{display:'flex',flexWrap:'wrap',gap:'12px',justifyContent:'center'}}>
              <a href="https://github.com/aalmaguerd99/D-CLOCK/releases/download/v1.3.2/D-CLOCK-Setup-1.3.2.exe" download className="dcl-cta-btn" style={{display:'inline-flex',alignItems:'center',gap:'9px',background:'#fff',color:'#1a1a1a',fontWeight:700,fontSize:'14px',padding:'13px 22px',borderRadius:'13px',transition:'transform .15s'}}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="#2563EB"><path d="M3 5.1 10.3 4v7.3H3V5.1zm0 13.8 7.3 1v-7.2H3v6.2zM11.2 3.85 21 2.5v8.8h-9.8V3.85zm0 16.3L21 21.5v-8.7h-9.8v7.35z"/></svg>
                Windows
              </a>
              <a href="https://github.com/aalmaguerd99/D-CLOCK/releases/download/v1.3.2/D-CLOCK-1.3.2.apk" download className="dcl-cta-btn" style={{display:'inline-flex',alignItems:'center',gap:'9px',background:'rgba(255,255,255,.12)',color:'#fff',border:'1px solid rgba(255,255,255,.2)',fontWeight:700,fontSize:'14px',padding:'13px 22px',borderRadius:'13px',transition:'transform .15s'}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#3DDC84"><path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85a.637.637 0 0 0-.83.22l-1.88 3.24a11.463 11.463 0 0 0-8.94 0L5.65 5.67a.643.643 0 0 0-.87-.2c-.28.18-.37.54-.22.83L6.4 9.48A10.78 10.78 0 0 0 1 18h22a10.78 10.78 0 0 0-5.4-8.52zM7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z"/></svg>
                Android APK
              </a>
              <a href="https://apps.apple.com/app/d-clock/id6769932290" target="_blank" rel="noopener noreferrer" className="dcl-cta-btn" style={{display:'inline-flex',alignItems:'center',gap:'9px',background:'rgba(255,255,255,.12)',color:'#fff',border:'1px solid rgba(255,255,255,.2)',fontWeight:700,fontSize:'14px',padding:'13px 22px',borderRadius:'13px',transition:'transform .15s'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                App Store
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{position:'relative',zIndex:1,borderTop:'1px solid rgba(0,0,0,.08)',padding:'32px 24px'}}>
        <div style={{maxWidth:'1060px',margin:'0 auto',display:'flex',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:'16px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/D-CLOCKlogo.png" alt="" width={26} height={26} style={{objectFit:'contain'}}/>
            <span style={{fontWeight:800,fontSize:'14px'}}>D-CLOCK</span>
            <span style={{color:'#cfcabf'}}>·</span>
            <span style={{fontSize:'12px',color:'#9a9a92'}}>by D99-TECH</span>
          </div>
          <p style={{fontSize:'12px',color:'#9a9a92',margin:0}}>© 2026 D99-TECH. Todos los derechos reservados.</p>
          <div style={{display:'flex',gap:'20px',fontSize:'12.5px',color:'#9a9a92'}}>
            <a href="mailto:contacto@d99-tech.com" className="dcl-footer-link" style={{transition:'color .15s'}}>Contacto</a>
            <a href="https://github.com/aalmaguerd99/D-CLOCK/releases" target="_blank" rel="noopener noreferrer" className="dcl-footer-link" style={{transition:'color .15s'}}>Todas las versiones</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
