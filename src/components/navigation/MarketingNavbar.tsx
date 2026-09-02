import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "@phosphor-icons/react/ssr";
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
  { label: "Bermain Peran", href: "#roleplay" },
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
  return (
    <header className="marketing-nav-wrap">
      <nav className="marketing-nav" aria-label="Navigasi pemasaran">
        <Link
          href={brandHref}
          className="brand-lockup group"
          aria-label={`Beranda ${brandText}`}
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
        </div>

        <details className="mobile-menu">
          <summary aria-label="Buka navigasi">Menu</summary>
          <div className="mobile-menu-panel">
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
            {ctaText && ctaHref && <Link href={ctaHref}>{ctaText}</Link>}
          </div>
        </details>
      </nav>
    </header>
  );
}
