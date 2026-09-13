"use client";

import type { LearningMaterialItem } from "@/lib/types/roleplay";
import { LearningMaterialItemCard } from "./LearningMaterialItemCard";

interface LearningMaterialsListProps {
  items: LearningMaterialItem[];
}

/**
 * Renders the Learning_Material_Item collection in the left column of the
 * Scenario Detail page: one card per item, in array order, or an Indonesian
 * empty-state message when the collection has 0 items. No pagination
 * control and no expand control are rendered.
 *
 * Requirements: 3.4, 3.10
 */
export function LearningMaterialsList({ items }: LearningMaterialsListProps) {
  if (items.length === 0) {
    return (
      <p className="learning-materials-empty">
        Belum ada materi pendukung untuk skenario ini.
      </p>
    );
  }

  return (
    <div className="learning-materials-list">
      {items.map((item) => (
        <LearningMaterialItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
