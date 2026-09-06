"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ArrowRight, List, X } from "@phosphor-icons/react";
import type { ReactNode } from "react";

export type NavLink = {
  label: string;
  href: string;
  isExternal?: boolean;
};

export interface MarketingNavbarProps {
  brandText?: string;
  brandHref?: string;
  links?: NavLink[];
  ctaText?: string;
  ctaHref?: string;
  extraActions?: ReactNode;
}

const DEFAULT_LINKS: NavLink[] = [
  { label: "Belajar", href: "#learn" },
  { label: "Simulator", href: "/app/simulator" },
  { label: "Bermain Peran", href: "/app/roleplay" },
  { label: "Pemindai", href: "#scanner" },
];

export default function MarketingNavbar({
  brandText = "FinLen",
  brandHref = "/",
  links = DEFAULT_LINKS,
  ctaText = "Mulai Belajar",
  ctaHref = "/app/simulator",
  extraActions,
}: MarketingNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Close menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close mobile menu on resize to desktop width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="marketing-nav-wrap">
      {/* Backdrop overlay for mobile menu */}
      <div
        className={`mobile-menu-backdrop ${isOpen ? "is-open" : ""}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <nav className="marketing-nav" aria-label="Navigasi pemasaran">
        <Link
          href={brandHref}
          className="brand-lockup group"
          aria-label={`Beranda ${brandText}`}
          onClick={() => setIsOpen(false)}
        >
          <Image
            src="/logo-finlen.svg"
            alt=""
            width={26}
            height={26}
            className="transition-transform duration-300 ease-in-out group-hover:-rotate-10"
          />
          <span>{brandText}</span>
        </Link>

        {/* Desktop navigation links */}
        <div className="marketing-links" aria-label="Tautan utama">
          {links.map((link) => {
            const isInternalRoute =
              link.href.startsWith("/") && !link.href.startsWith("/#");
            if (isInternalRoute) {
              return (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              );
            }
            return (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            );
          })}
        </div>

        {/* Desktop CTA & Mobile Toggle Button */}
        <div className="marketing-nav-actions">
          {extraActions}
          {ctaText && ctaHref && (
            <Link href={ctaHref} className="button button-primary nav-cta">
              <span>{ctaText}</span>
              <span className="button-orb" aria-hidden="true">
                <ArrowRight size={16} weight="bold" />
              </span>
            </Link>
          )}

          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-controls="mobile-nav-panel"
            aria-label={isOpen ? "Tutup menu" : "Buka menu navigasi"}
          >
            {isOpen ? (
              <X size={22} weight="bold" />
            ) : (
              <List size={22} weight="bold" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      <div
        id="mobile-nav-panel"
        className={`mobile-menu-panel ${isOpen ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi utama"
      >
        <div className="mobile-menu-links">
          {links.map((link) => {
            const isInternalRoute =
              link.href.startsWith("/") && !link.href.startsWith("/#");
            if (isInternalRoute) {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="mobile-menu-link"
                  onClick={() => setIsOpen(false)}
                >
                  <span>{link.label}</span>
                  <ArrowRight
                    size={16}
                    weight="bold"
                    className="mobile-menu-link-arrow"
                  />
                </Link>
              );
            }
            return (
              <a
                key={link.href}
                href={link.href}
                className="mobile-menu-link"
                onClick={() => setIsOpen(false)}
              >
                <span>{link.label}</span>
                <ArrowRight
                  size={16}
                  weight="bold"
                  className="mobile-menu-link-arrow"
                />
              </a>
            );
          })}
        </div>

        {ctaText && ctaHref && (
          <>
            <div className="mobile-menu-divider" />
            <Link
              href={ctaHref}
              className="button button-primary mobile-menu-cta"
              onClick={() => setIsOpen(false)}
            >
              <span>{ctaText}</span>
              <span className="button-orb" aria-hidden="true">
                <ArrowRight size={16} weight="bold" />
              </span>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
