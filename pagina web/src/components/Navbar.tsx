"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.5"/>
              <path d="M8 4.5V8.5L10.5 10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-semibold text-[#111111] tracking-tight text-base">
            D-CLOCK
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[#555550]">
          <Link href="#features" className="hover:text-[#111111] transition-colors">Características</Link>
          <Link href="#plans" className="hover:text-[#111111] transition-colors">Planes</Link>
          <Link href="#download" className="hover:text-[#111111] transition-colors">Descargar</Link>
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#download"
            className="btn-primary text-sm py-2 px-4"
            style={{ borderRadius: "0.75rem", padding: "0.5rem 1.25rem" }}
          >
            Descargar gratis
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-xl hover:bg-white/50 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            {open ? (
              <path d="M5 5L15 15M15 5L5 15" stroke="#111" strokeWidth="1.5" strokeLinecap="round"/>
            ) : (
              <path d="M3 6h14M3 10h14M3 14h14" stroke="#111" strokeWidth="1.5" strokeLinecap="round"/>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[rgba(180,170,155,0.2)] bg-[rgba(247,244,239,0.95)] backdrop-blur-xl px-6 py-4 flex flex-col gap-4">
          <Link href="#features" onClick={() => setOpen(false)} className="text-sm font-medium text-[#555550]">Características</Link>
          <Link href="#plans" onClick={() => setOpen(false)} className="text-sm font-medium text-[#555550]">Planes</Link>
          <Link href="#download" onClick={() => setOpen(false)} className="text-sm font-medium text-[#555550]">Descargar</Link>
          <a href="#download" onClick={() => setOpen(false)} className="btn-primary text-sm justify-center">Descargar gratis</a>
        </div>
      )}
    </nav>
  );
}
