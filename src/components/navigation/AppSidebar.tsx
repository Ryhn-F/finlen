"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, type ComponentType, type ReactNode } from "react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
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
import { useAuth } from "@/lib/context/AuthContext";
import { useSidebarState } from "@/lib/hooks/useSidebarState";

export { useSidebarState };

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
  { id: "dashboard", label: "Dasbor", href: "/app/dashboard", icon: House },
  {
    id: "simulator",
    label: "Simulator",
    href: "/app/simulator",
    icon: ChartLineUp,
  },
  {
    id: "roleplay",
    label: "Bermain Peran",
    href: "/app/roleplay",
    icon: BookOpenText,
  },
  { id: "scanner", label: "Pemindai", href: "/app/scanner", icon: Scan },
  { id: "progress", label: "Progres", href: "/app/progress", icon: Gauge },
];

export default function AppSidebar({
  isMinimized: controlledMinimized,
  onToggleMinimize: controlledToggleMinimize,
  isOpen = false,
  onClose,
  activeItemId,
  navItems = DEFAULT_NAV_ITEMS,
  user,
  logoutHref = "/",
  onLogout,
  footerContent,
}: AppSidebarProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  // Persistent sidebar minimized state fallback
  const [persistedMinimized, setPersistedMinimized] = useSidebarState();
  const isMinimized =
    controlledMinimized !== undefined
      ? controlledMinimized
      : persistedMinimized;
  const handleToggleMinimize =
    controlledToggleMinimize || (() => setPersistedMinimized((prev) => !prev));

  // Optimistic active nav state for immediate click responsiveness.
  // The pathname it was set from is stored alongside it so the optimistic
  // value self-expires as soon as the router finishes navigating.
  const [optimisticActive, setOptimisticActive] = useState<{
    id: string;
    fromPathname: string | null;
  } | null>(null);

  const optimisticActiveId =
    optimisticActive && optimisticActive.fromPathname === pathname
      ? optimisticActive.id
      : null;

  const auth = useAuth();
  const resolvedUser =
    user ??
    (auth.user
      ? {
          name: auth.user.username,
          role: `Level ${auth.user.level} · ${auth.user.xp} XP`,
          profileHref: "/app/profile",
        }
      : {
          name: "Tamu",
          role: "Belum Masuk",
          profileHref: "/login",
        });
  const handleLogout =
    onLogout ?? (auth.isAuthenticated ? auth.logout : undefined);

  // Determine which nav item is active
  const isItemActive = (item: SidebarNavItem) => {
    if (optimisticActiveId) {
      return item.id === optimisticActiveId;
    }
    if (activeItemId) {
      return activeItemId === item.id || activeItemId === item.href;
    }
    if (pathname) {
      if (pathname === item.href) return true;
      if (
        item.href !== "/" &&
        !item.href.startsWith("/#") &&
        pathname.startsWith(item.href)
      ) {
        return true;
      }
    }
    return false;
  };

  const currentActiveItem =
    navItems.find((item) => isItemActive(item)) ||
    navItems.find((item) => item.id === "simulator") ||
    navItems[0];

  // Seamless cross-page transition: offset active indicator from previous page link position
  const [mountOffset, setMountOffset] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try {
      const prevId = sessionStorage.getItem("finlen_prev_active_nav");
      if (prevId) {
        sessionStorage.removeItem("finlen_prev_active_nav");
        const prevIdx = navItems.findIndex(
          (i) => i.id === prevId || i.href === prevId,
        );
        const curIdx = navItems.findIndex(
          (i) =>
            i.id === activeItemId ||
            i.href === activeItemId ||
            (pathname &&
              (pathname === i.href ||
                (i.href !== "/" && pathname.startsWith(i.href)))),
        );
        if (prevIdx !== -1 && curIdx !== -1 && prevIdx !== curIdx) {
          const step = isMinimized ? 54 : 52;
          return (prevIdx - curIdx) * step;
        }
      }
    } catch {}
    return 0;
  });

  useEffect(() => {
    if (mountOffset !== 0) {
      const timer = setTimeout(() => setMountOffset(0), 380);
      return () => clearTimeout(timer);
    }
  }, [mountOffset]);

  const handleItemClick = (item: SidebarNavItem) => {
    setOptimisticActive({ id: item.id, fromPathname: pathname });
    if (typeof window !== "undefined") {
      try {
        if (currentActiveItem) {
          sessionStorage.setItem(
            "finlen_prev_active_nav",
            currentActiveItem.id,
          );
        }
      } catch {}
    }
    if (onClose) {
      onClose();
    }
  };

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
            aria-label="Beranda FinLen"
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
          <button
            type="button"
            className="icon-button sidebar-minimize-btn"
            onClick={handleToggleMinimize}
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

        <LayoutGroup id="sidebar-nav">
          <nav className="app-nav" aria-label="Navigasi aplikasi">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item);
              const isInternalRoute =
                item.href.startsWith("/") && !item.href.startsWith("/#");

              const linkContent = (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActivePill"
                      className="nav-active-pill"
                      initial={
                        mountOffset !== 0
                          ? { y: mountOffset, opacity: 0.85 }
                          : false
                      }
                      animate={{ y: 0, opacity: 1 }}
                      transition={
                        shouldReduceMotion
                          ? { duration: 0 }
                          : {
                              type: "spring",
                              stiffness: 380,
                              damping: 30,
                              mass: 0.8,
                            }
                      }
                    />
                  )}
                  <motion.span
                    className="nav-icon-wrap"
                    aria-hidden="true"
                    animate={
                      isActive ? { scale: [1, 1.16, 1.05] } : { scale: 1 }
                    }
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <Icon
                      size={21}
                      weight={isActive ? "fill" : "duotone"}
                      className="nav-icon"
                    />
                  </motion.span>
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
                    onClick={() => handleItemClick(item)}
                    className={`nav-item has-pill ${isActive ? "active" : ""}`}
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
                  onClick={() => handleItemClick(item)}
                  className={`nav-item has-pill ${isActive ? "active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                  title={isMinimized ? item.label : undefined}
                >
                  {linkContent}
                </a>
              );
            })}
          </nav>
        </LayoutGroup>

        <div className="sidebar-profile">
          <Link
            href={resolvedUser.profileHref || "/app/profile"}
            className={`profile-link ${pathname?.startsWith("/app/profile") ? "active" : ""}`}
            aria-current={
              pathname?.startsWith("/app/profile") ? "page" : undefined
            }
            title={
              isMinimized
                ? `${resolvedUser.name} (${resolvedUser.role || "Profil"})`
                : undefined
            }
          >
            <span className="profile-icon" aria-hidden="true">
              <UserCircle size={22} weight="duotone" />
            </span>
            {!isMinimized && (
              <span className="profile-info">
                <strong>{resolvedUser.name}</strong>
                {resolvedUser.role && <small>{resolvedUser.role}</small>}
              </span>
            )}
          </Link>

          {handleLogout ? (
            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
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
