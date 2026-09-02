"use client";

import Link from "next/link";
import { type ComponentType, type ReactNode } from "react";
import {
  BookOpenText,
  CaretLeft,
  CaretRight,
  ChartLineUp,
  Gauge,
  House,
  Scan,
  SignOut,
  UserCircle,
  X,
  type IconProps,
} from "@phosphor-icons/react";

import Image from "next/image";

export type SidebarNavItem = {
  id: string;
  label: string;
  href: string;
  icon: ComponentType<IconProps>;
  badge?: string | number;
};

export interface AppSidebarProps {
  /**
   * Whether the sidebar is minimized (icon-only mode) on desktop
   */
  isMinimized?: boolean;
  /**
   * Callback fired when user clicks the minimize/expand toggle button
   */
  onToggleMinimize?: () => void;
  /**
   * Mobile drawer open state
   */
  isOpen?: boolean;
  /**
   * Callback fired when user closes the mobile drawer
   */
  onClose?: () => void;
  /**
   * Active item identifier or route path
   */
  activeItemId?: string;
  /**
   * Custom list of navigation items
   */
  navItems?: SidebarNavItem[];
  /**
   * User profile information
   */
  user?: {
    name: string;
    role?: string;
    profileHref?: string;
  };
  /**
   * Logout link href or onClick callback
   */
  logoutHref?: string;
  onLogout?: () => void;
  /**
   * Extra content to render at the bottom
   */
  footerContent?: ReactNode;
}

const DEFAULT_NAV_ITEMS: SidebarNavItem[] = [
  { id: "dashboard", label: "Dasbor", href: "#dashboard", icon: House },
  {
    id: "simulator",
    label: "Simulator",
    href: "/app/simulator",
    icon: ChartLineUp,
  },
  {
    id: "roleplay",
    label: "Bermain Peran",
    href: "#roleplay",
    icon: BookOpenText,
  },
  { id: "scanner", label: "Pemindai", href: "#scanner", icon: Scan },
  { id: "progress", label: "Progres", href: "#progress", icon: Gauge },
];

export default function AppSidebar({
  isMinimized = false,
  onToggleMinimize,
  isOpen = false,
  onClose,
  activeItemId = "simulator",
  navItems = DEFAULT_NAV_ITEMS,
  user = { name: "Raka", role: "Profil", profileHref: "#profile" },
  logoutHref = "/",
  onLogout,
  footerContent,
}: AppSidebarProps) {
  return (
    <>
      <aside
        className={`app-sidebar ${isOpen ? "is-open" : ""} ${isMinimized ? "is-minimized" : ""}`}
        aria-label="Bilah Samping Aplikasi"
      >
        <div className="sidebar-head">
          <Link
            href="/"
            className="brand-lockup group"
            aria-label={`Beranda FinLen`}
          >
            <Image
              src="/logo-finlen.svg"
              alt=""
              width={26}
              height={26}
              className="transition-transform duration-300 ease-in-out group-hover:-rotate-10"
            />
            {!isMinimized && <span className="brand-text">FinLen</span>}
          </Link>

          {/* Desktop minimize toggle button */}
          {onToggleMinimize && (
            <button
              type="button"
              className="icon-button sidebar-minimize-btn"
              onClick={onToggleMinimize}
              aria-label={
                isMinimized ? "Perluas bilah samping" : "Kecilkan bilah samping"
              }
              title={
                isMinimized ? "Perluas bilah samping" : "Kecilkan bilah samping"
              }
            >
              {isMinimized ? (
                <CaretRight size={18} weight="bold" />
              ) : (
                <CaretLeft size={18} weight="bold" />
              )}
            </button>
          )}

          {/* Mobile close button */}
          {onClose && (
            <button
              type="button"
              className="icon-button sidebar-close lg:!hidden"
              onClick={onClose}
              aria-label="Tutup bilah samping"
            >
              <X size={20} weight="bold" />
            </button>
          )}
        </div>

        <nav className="app-nav" aria-label="Navigasi aplikasi">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeItemId === item.id || activeItemId === item.href;

            const isInternalRoute =
              item.href.startsWith("/") && !item.href.startsWith("/#");

            const linkContent = (
              <>
                <span className="nav-icon-wrap" aria-hidden="true">
                  <Icon size={21} weight="duotone" />
                </span>
                {!isMinimized && (
                  <span className="nav-label">{item.label}</span>
                )}
                {!isMinimized && item.badge && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </>
            );

            if (isInternalRoute) {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`nav-item ${isActive ? "active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                  title={isMinimized ? item.label : undefined}
                >
                  {linkContent}
                </Link>
              );
            }

            return (
              <a
                key={item.id}
                href={item.href}
                className={`nav-item ${isActive ? "active" : ""}`}
                aria-current={isActive ? "page" : undefined}
                title={isMinimized ? item.label : undefined}
              >
                {linkContent}
              </a>
            );
          })}
        </nav>

        <div className="sidebar-profile">
          <a
            href={user.profileHref || "#profile"}
            className="profile-link"
            title={
              isMinimized
                ? `${user.name} (${user.role || "Profil"})`
                : undefined
            }
          >
            <span className="profile-icon" aria-hidden="true">
              <UserCircle size={22} weight="duotone" />
            </span>
            {!isMinimized && (
              <span className="profile-info">
                <strong>{user.name}</strong>
                {user.role && <small>{user.role}</small>}
              </span>
            )}
          </a>

          {onLogout ? (
            <button
              type="button"
              className="logout-button"
              onClick={onLogout}
              title={isMinimized ? "Keluar" : undefined}
              aria-label="Keluar dari akun"
            >
              <SignOut size={21} weight="duotone" />
              {!isMinimized && <span>Keluar</span>}
            </button>
          ) : (
            <Link
              href={logoutHref}
              className="logout-link"
              title={isMinimized ? "Keluar" : undefined}
              aria-label="Keluar dari akun"
            >
              <SignOut size={21} weight="duotone" />
              {!isMinimized && <span>Keluar</span>}
            </Link>
          )}

          {footerContent}
        </div>
      </aside>

      {/* Mobile scrim overlay */}
      {isOpen && onClose && (
        <button
          type="button"
          className="sidebar-scrim"
          onClick={onClose}
          aria-label="Tutup lapisan bilah samping"
        />
      )}
    </>
  );
}
