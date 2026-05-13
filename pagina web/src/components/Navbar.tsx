"use client";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-[3.75rem] flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 select-none">
          <div className="w-8 h-8 rounded-[10px] bg-[#2563EB] flex items-center justify-center shadow-[0_2px_8px_rgba(37,99,235,0.35)]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="5.5" stroke="white" strokeWidth="1.4"/>
              <path d="M8 4.5v3.8l2.2 1.4" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-bold text-[15px] tracking-tight text-[#0F0F0F]">D-CLOCK</span>
          <span className="hidden sm:inline-block text-[11px] font-medium text-[#2563EB] bg-[#DBEAFE] px-2 py-0.5 rounded-full">by D99-TECH</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7 text-[13.5px] font-medium text-[#7A7A72]">
          <Link href="#features" className="hover:text-[#0F0F0F] transition-colors">Características</Link>
          <Link href="#demo"     className="hover:text-[#0F0F0F] transition-colors">Demo</Link>
          <Link href="#plans"    className="hover:text-[#0F0F0F] transition-colors">Planes</Link>
          <Link href="#download" className="hover:text-[#0F0F0F] transition-colors">Descargar</Link>
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-2.5">
          <a href="#download" className="btn-primary" style={{ fontSize:"13.5px", padding:"0.5rem 1.1rem", borderRadius:"0.75rem" }}>
            Descargar gratis
          </a>
        </div>

        {/* Mobile */}
        <button className="md:hidden p-2 rounded-xl hover:bg-white/50 transition-colors" onClick={() => setOpen(!open)}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            {open
              ? <path d="M4 4l10 10M14 4L4 14" stroke="#0F0F0F" strokeWidth="1.5" strokeLinecap="round"/>
              : <path d="M2.5 5.5h13M2.5 9h13M2.5 12.5h13" stroke="#0F0F0F" strokeWidth="1.5" strokeLinecap="round"/>
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[rgba(200,192,178,0.25)] bg-[rgba(245,241,235,0.97)] backdrop-blur-2xl px-6 py-5 flex flex-col gap-4">
          {["#features","#demo","#plans","#download"].map(href => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className="text-sm font-medium text-[#3A3A35] capitalize">
              {href.replace("#","")}
            </Link>
          ))}
          <a href="#download" onClick={() => setOpen(false)} className="btn-primary justify-center mt-1">Descargar gratis</a>
        </div>
      )}
    </nav>
  );
}
