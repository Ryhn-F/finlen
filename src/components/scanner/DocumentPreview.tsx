"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { ArrowRight, FilePdf, FileImage, Repeat } from "@phosphor-icons/react";
import {
  describeDocumentType,
  isImageDocument,
} from "@/lib/utils/documentFile";
import { formatFileSize } from "@/lib/utils/format";

export interface DocumentPreviewProps {
  file: File;
  onChangeDocument: () => void;
  onAnalyze: () => void;
  isAnalyzing?: boolean;
  analyzeLabel?: string;
}

export function DocumentPreview({
  file,
  onChangeDocument,
  onAnalyze,
  isAnalyzing = false,
  analyzeLabel = "Analisis dokumen",
}: DocumentPreviewProps) {
  const isImage = isImageDocument(file);

  // Object URLs are only created for image documents and are always revoked
  // when the file changes or the preview unmounts.
  const previewUrl = useMemo(
    () => (isImage ? URL.createObjectURL(file) : null),
    [file, isImage],
  );

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const typeLabel = describeDocumentType(file);
  const sizeLabel = formatFileSize(file.size);

  return (
    <section className="doc-preview-card" aria-label="Dokumen terpilih">
      <div className="doc-preview-body">
        <div className={`doc-preview-thumb ${isImage ? "is-image" : "is-file"}`}>
          {isImage && previewUrl ? (
            <Image
              src={previewUrl}
              alt={`Pratinjau dokumen ${file.name}`}
              fill
              unoptimized
              sizes="180px"
              className="doc-preview-image"
            />
          ) : isImage ? (
            <FileImage size={34} weight="duotone" aria-hidden="true" />
          ) : (
            <FilePdf size={34} weight="duotone" aria-hidden="true" />
          )}
        </div>

        <div className="doc-preview-meta">
          <span className="doc-preview-eyebrow">Dokumen terpilih</span>
          <strong className="doc-preview-name" title={file.name}>
            {file.name}
          </strong>
          <span className="doc-preview-specs">
            {typeLabel} · {sizeLabel}
          </span>
          <p className="doc-preview-note">
            Pastikan ini dokumen yang benar. FinLen akan membaca isinya untuk
            menjelaskan istilah dan risikonya.
          </p>
        </div>
      </div>

      <div className="doc-preview-actions">
        <button
          type="button"
          className="button button-primary doc-analyze-btn"
          onClick={onAnalyze}
          disabled={isAnalyzing}
        >
          <span>{isAnalyzing ? "Menganalisis..." : analyzeLabel}</span>
          <span className="button-orb" aria-hidden="true">
            <ArrowRight size={16} weight="bold" />
          </span>
        </button>

        <button
          type="button"
          className="button button-secondary doc-change-btn"
          onClick={onChangeDocument}
          disabled={isAnalyzing}
          aria-label="Ganti dokumen terpilih"
        >
          <Repeat size={16} weight="bold" aria-hidden="true" />
          <span>Ganti dokumen</span>
        </button>
      </div>
    </section>
  );
}

export default DocumentPreview;
