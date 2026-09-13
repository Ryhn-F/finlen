"use client";

import {
  CheckCircle,
  Info,
  ShieldWarning,
  Siren,
  WarningCircle,
  type IconProps,
} from "@phosphor-icons/react";
import type { ComponentType } from "react";
import type { RiskLevel } from "@/lib/types/analyzer";
import { RISK_LEVEL_LABELS } from "@/lib/utils/analyzer";

export interface RiskLevelBadgeProps {
  level: RiskLevel;
  /** `large` is used in the analysis header, `compact` inside cards. */
  size?: "large" | "compact";
}

const LEVEL_ICONS: Record<RiskLevel, ComponentType<IconProps>> = {
  low: CheckCircle,
  medium: Info,
  high: WarningCircle,
  critical: Siren,
  unknown: ShieldWarning,
};

export function RiskLevelBadge({ level, size = "large" }: RiskLevelBadgeProps) {
  const Icon = LEVEL_ICONS[level];

  return (
    <span
      className={`risk-badge is-${level} ${size === "compact" ? "is-compact" : "is-large"}`}
    >
      <Icon
        size={size === "compact" ? 15 : 19}
        weight="fill"
        aria-hidden="true"
      />
      <span>{RISK_LEVEL_LABELS[level]}</span>
    </span>
  );
}

export default RiskLevelBadge;
