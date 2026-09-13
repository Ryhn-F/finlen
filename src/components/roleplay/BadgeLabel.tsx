import { CATEGORY_LABELS, DIFFICULTY_LABELS, resolveBadgeLabel } from "@/lib/utils/scenarioDetail";

interface CategoryBadgeProps {
  category: string;
}

/**
 * Renders the `category` value as a badge with an Indonesian label,
 * falling back to the raw value when it has no defined label.
 *
 * Requirements: 3.3, 3.14
 */
export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span className={`category-badge category-badge-${category.toLowerCase()}`}>
      {resolveBadgeLabel(CATEGORY_LABELS, category)}
    </span>
  );
}

interface DifficultyBadgeProps {
  difficulty: string;
}

/**
 * Renders the `difficulty` value as a badge with an Indonesian label,
 * falling back to the raw value when it has no defined label.
 *
 * Requirements: 4.2
 */
export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  return (
    <span className={`difficulty-badge difficulty-badge-${difficulty.toLowerCase()}`}>
      {resolveBadgeLabel(DIFFICULTY_LABELS, difficulty)}
    </span>
  );
}
