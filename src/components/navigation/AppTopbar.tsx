"use client";

import { List } from "@phosphor-icons/react";
import type { ReactNode } from "react";

export interface AppTopbarProps {
  /**
   * Main title of the current page/view
   */
  title?: ReactNode;
  /**
   * Subtitle, breadcrumb or section descriptor
   */
  subtitle?: ReactNode;
  /**
   * Callback fired when sidebar toggle/menu button is clicked
   */
  onToggleSidebar?: () => void;
  onOpenMobileSidebar?: () => void;
  /**
   * Custom action buttons on the right (e.g. Reset, Export, Save)
   */
  actions?: ReactNode;
  /**
   * Optional custom left element (e.g. back button)
   */
  leftAddon?: ReactNode;
}

export default function AppTopbar({
  title = "Lab Pertumbuhan Utang",
  subtitle = "Visualisasi Data Interaktif",
  onToggleSidebar,
  onOpenMobileSidebar,
  actions,
  leftAddon,
}: AppTopbarProps) {
  const handleSidebarClick = onToggleSidebar || onOpenMobileSidebar;

  return (
    <header className="app-topbar">
      {handleSidebarClick && (
        <button
          type="button"
          className="icon-button topbar-sidebar-trigger mobile-sidebar-trigger lg:!hidden"
          onClick={handleSidebarClick}
          aria-label="Toggle bilah samping"
          title="Bilah samping"
        >
          <List size={22} weight="bold" />
        </button>
      )}

      {leftAddon}

      <div className="topbar-title-wrap sm:text-center lg:text-left">
        {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
        {typeof title === "string" ? (
          <strong className="topbar-title">{title}</strong>
        ) : (
          title
        )}
      </div>

      {actions && <div className="topbar-actions">{actions}</div>}
    </header>
  );
}
