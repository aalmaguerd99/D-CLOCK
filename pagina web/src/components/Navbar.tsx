"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const links = [
  { href:"#features", label:"Características" },
  { href:"#geo",      label:"Geo-cercas" },
  { href:"#plans",    label:"Planes" },
  { href:"#download", label:"Descargar" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-[3.75rem] flex items-center justify-between">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 select-none">
          <Image src="/D99logo.png" alt="D99-TECH" width={32} height={32}
            className="rounded-[8px] object-contain" style={{ background:"transparent" }} />
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-[15px] tracking-tight text-[#0D0D0C]">D-CLOCK</span>
            <span className="hidden sm:block text-[10px] font-semibold text-[#2563EB] bg-[#DBEAFE] px-2 py-0.5 rounded-full leading-none">
              by D99-TECH
            </span>
          </div>
        </Link>

        {/* ── Desktop nav ── */}
        <div className="hidden md:flex items-center gap-7 text-[13px] font-medium text-[#78786E]">
          {links.map(l => (
            <Link key={l.href} href={l.href} className="hover:text-[#0D0D0C] transition-colors">{l.label}</Link>
          ))}
        </div>

        {/* ── CTA ── */}
        <div className="hidden md:flex items-center gap-2.5">
          <a href="#download" className="btn-primary" style={{ fontSize:"13px", padding:".45rem 1.1rem", borderRadius:".75rem" }}>
            Descargar gratis
          </a>
        </div>

        {/* ── Mobile toggle ── */}
        <button onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-xl hover:bg-white/50 transition-colors">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            {open
              ? <path d="M4 4l10 10M14 4L4 14" stroke="#0D0D0C" strokeWidth="1.5" strokeLinecap="round"/>
              : <path d="M2.5 5h13M2.5 9h13M2.5 13h13"  stroke="#0D0D0C" strokeWidth="1.5" strokeLinecap="round"/>}
          </svg>
        </button>
      </div>

      {/* ── Mobile menu ── */}
      {open && (
        <div className="md:hidden border-t border-[rgba(200,192,178,.25)] bg-[rgba(245,241,235,.97)] backdrop-blur-2xl px-6 py-5 flex flex-col gap-4">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="text-sm font-medium text-[#38382F]">{l.label}</Link>
          ))}
          <a href="#download" onClick={() => setOpen(false)} className="btn-primary justify-center mt-1">Descargar gratis</a>
        </div>
      )}
    </nav>
  );
}
