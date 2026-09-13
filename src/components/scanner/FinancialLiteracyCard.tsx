"use client";

import { GraduationCap } from "@phosphor-icons/react";
import type { FinancialLiteracyConcept } from "@/lib/types/analyzer";

export interface FinancialLiteracyCardProps {
  concepts: FinancialLiteracyConcept[];
}

export function FinancialLiteracyCard({
  concepts,
}: FinancialLiteracyCardProps) {
  return (
    <section className="analysis-card literacy-card" aria-labelledby="analysis-literacy-title">
      <header className="analysis-card-head">
        <span className="analysis-card-icon" aria-hidden="true">
          <GraduationCap size={22} weight="duotone" />
        </span>
        <div>
          <h2 id="analysis-literacy-title">Pelajaran Finansial</h2>
          <p>Kenapa istilah di dokumen ini penting untuk kamu pahami.</p>
        </div>
      </header>

      {concepts.length > 0 ? (
        <ul className="literacy-list">
          {concepts.map((item, index) => (
            <li key={`${index}-${item.concept}`} className="literacy-item">
              <h3 className="literacy-concept">
                {item.concept || "Konsep finansial"}
              </h3>
              {item.explanation ? (
                <p className="literacy-explanation">{item.explanation}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="analysis-card-empty">
          Belum ada konsep finansial yang dapat dijelaskan dari dokumen ini.
        </p>
      )}
    </section>
  );
}

export default FinancialLiteracyCard;
