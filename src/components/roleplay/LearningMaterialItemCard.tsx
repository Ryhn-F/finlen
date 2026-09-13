"use client";

import { ArrowSquareOut, FilePdf, Info } from "@phosphor-icons/react";
import type { LearningMaterialItem } from "@/lib/types/roleplay";

interface LearningMaterialItemCardProps {
  item: LearningMaterialItem;
}

/** Non-null and contains at least 1 non-whitespace character. */
function hasVisibleText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Renders a single Learning_Material_Item entry within the left column of
 * the Scenario Detail page.
 *
 * Requirements: 3.5, 3.6, 3.7, 3.8, 3.9, 3.13, 3.15
 */
export function LearningMaterialItemCard({ item }: LearningMaterialItemCardProps) {
  const { title, description, formal_file_url, brainrot_file_url, source_name, source_url } = item;

  const hasFormalLink = formal_file_url != null;
  const hasCasualLink = brainrot_file_url != null;
  const hasAnyDocumentLink = hasFormalLink || hasCasualLink;

  return (
    <article className="learning-material-card">
      <h4 className="learning-material-title">{title}</h4>

      {hasVisibleText(description) && (
        <p className="learning-material-desc">{description}</p>
      )}

      {hasAnyDocumentLink && (
        <div className="learning-material-links">
          {hasFormalLink && (
            <a
              href={formal_file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="learning-material-link"
            >
              <FilePdf size={16} weight="bold" aria-hidden="true" />
              <span>Versi Formal</span>
              <ArrowSquareOut size={14} weight="bold" aria-hidden="true" />
            </a>
          )}
          {hasCasualLink && (
            <a
              href={brainrot_file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="learning-material-link"
            >
              <FilePdf size={16} weight="bold" aria-hidden="true" />
              <span>Versi Santai</span>
              <ArrowSquareOut size={14} weight="bold" aria-hidden="true" />
            </a>
          )}
        </div>
      )}

      {!hasAnyDocumentLink && (
        <p className="learning-material-unavailable">
          <Info size={14} weight="bold" aria-hidden="true" />
          <span>Dokumen belum tersedia.</span>
        </p>
      )}

      {source_name != null && (
        <p className="learning-material-source">
          <span className="learning-material-source-label">Sumber: </span>
          {source_url != null ? (
            <a href={source_url} target="_blank" rel="noopener noreferrer">
              {source_name}
            </a>
          ) : (
            <span>{source_name}</span>
          )}
        </p>
      )}
    </article>
  );
}
