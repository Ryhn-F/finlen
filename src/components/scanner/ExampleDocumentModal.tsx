"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  ArrowRight,
  Eye,
  FilePdf,
  X,
} from "@phosphor-icons/react";

const EXAMPLE_PDF_PATH = "/surat_perjanjian_hutang_piutang.pdf";
const EXAMPLE_FILE_NAME = "surat_perjanjian_hutang_piutang.pdf";

export interface ExampleDocumentModalProps {
  open: boolean;
  onClose: () => void;
  onUseExample: (file: File) => void;
  isLoading?: boolean;
}

/**
 * Fetches the example PDF from /public, converts it into a `File` object,
 * and hands it to the parent via `onUseExample`.
 */
async function fetchExampleAsFile(): Promise<File> {
  const res = await fetch(EXAMPLE_PDF_PATH);
  if (!res.ok) throw new Error("Gagal memuat contoh dokumen.");
  const blob = await res.blob();
  return new File([blob], EXAMPLE_FILE_NAME, { type: "application/pdf" });
}

export function ExampleDocumentModal({
  open,
  onClose,
  onUseExample,
  isLoading = false,
}: ExampleDocumentModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Focus trap entry — focus close button on open
  useEffect(() => {
    if (open) closeBtnRef.current?.focus();
  }, [open]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === backdropRef.current) onClose();
    },
    [onClose],
  );

  const handleUseExample = useCallback(async () => {
    try {
      const file = await fetchExampleAsFile();
      onUseExample(file);
    } catch {
      // Silently fail — the fetch error is unlikely for a local file
    }
  }, [onUseExample]);

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      className="example-modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Pratinjau contoh dokumen"
    >
      <div className="example-modal-container">
        {/* Header */}
        <header className="example-modal-header">
          <div className="example-modal-title-group">
            <span className="example-modal-badge">
              <Eye size={14} weight="bold" aria-hidden="true" />
              Contoh Dokumen
            </span>
            <h2 className="example-modal-title">Surat Perjanjian Hutang Piutang</h2>
            <p className="example-modal-subtitle">
              Lihat pratinjau dokumen contoh ini. Tekan tombol di bawah untuk
              langsung menganalisisnya dengan FinLen.
            </p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className="example-modal-close"
            onClick={onClose}
            aria-label="Tutup pratinjau"
          >
            <X size={20} weight="bold" />
          </button>
        </header>

        {/* PDF Preview */}
        <div className="example-modal-preview">
          <div className="example-modal-pdf-frame">
            <iframe
              src={`${EXAMPLE_PDF_PATH}#toolbar=0&navpanes=0`}
              title="Pratinjau contoh PDF"
              className="example-modal-iframe"
            />
          </div>
        </div>

        {/* Footer / Actions */}
        <footer className="example-modal-footer">
          <div className="example-modal-file-info">
            <FilePdf size={22} weight="duotone" aria-hidden="true" />
            <span>{EXAMPLE_FILE_NAME}</span>
          </div>
          <div className="example-modal-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={onClose}
            >
              Kembali
            </button>
            <button
              type="button"
              className="button button-primary"
              onClick={handleUseExample}
              disabled={isLoading}
            >
              <span>{isLoading ? "Memuat…" : "Gunakan dokumen ini"}</span>
              <span className="button-orb" aria-hidden="true">
                <ArrowRight size={16} weight="bold" />
              </span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default ExampleDocumentModal;
