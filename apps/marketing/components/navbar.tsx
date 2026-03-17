"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Beranda", href: "#beranda" },
  { label: "Keunggulan", href: "#keunggulan" },
  { label: "Cara Kerja", href: "#cara-kerja" },
  { label: "Kontak", href: "#kontak" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleNavClick = useCallback((href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled || mobileOpen
          ? "bg-white/95 shadow-sm backdrop-blur-lg"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a
          href="#beranda"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick("#beranda");
          }}
          className="relative z-10 flex items-center gap-2"
        >
          <Image
            src="/img_logo-gadai-top.png"
            alt="Gadai Top"
            width={140}
            height={48}
            className="h-10 w-auto"
            priority
          />
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="relative text-sm font-medium text-dark/70 transition-colors after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-brand after:transition-all hover:text-brand hover:after:w-full"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => handleNavClick("#kontak")}
            className="hidden cursor-pointer rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-dark hover:shadow-lg hover:shadow-brand/25 md:block"
          >
            Gadaikan Sekarang
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="relative z-10 cursor-pointer text-dark md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="size-6" />
            ) : (
              <Menu className="size-6" />
            )}
          </button>
        </div>
      </nav>

      <div
        className={`fixed inset-0 top-[72px] bg-white transition-all duration-300 md:hidden ${
          mobileOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-4 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-2 px-4 pt-4">
          {navLinks.map((link, i) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="rounded-xl px-4 py-3 text-left text-lg font-medium text-dark/80 transition-colors hover:bg-brand-50 hover:text-brand"
              style={{
                transitionDelay: mobileOpen ? `${i * 50}ms` : "0ms",
              }}
            >
              {link.label}
            </button>
          ))}
          <div className="mt-4 px-4">
            <button
              onClick={() => handleNavClick("#kontak")}
              className="w-full cursor-pointer rounded-full bg-brand px-6 py-3.5 text-center text-base font-semibold text-white transition-all hover:bg-brand-dark"
            >
              Gadaikan Sekarang
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
