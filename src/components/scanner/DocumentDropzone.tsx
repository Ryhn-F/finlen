"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import { FilePlus, UploadSimple, WarningCircle } from "@phosphor-icons/react";
import {
  DOCUMENT_ACCEPT_ATTRIBUTE,
  isAllowedDocumentType,
  validateDocumentFile,
} from "@/lib/utils/documentFile";

export interface DocumentDropzoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

type DragState = "idle" | "dragging" | "invalid";

/**
 * Reads the dragged payload metadata to preview whether the drop will be accepted.
 * Browsers expose `type` (not the name) during drag, so an empty type is treated
 * as "unknown but possibly valid" and only rejected on drop.
 */
function resolveDragState(event: DragEvent<HTMLElement>): DragState {
  const items = Array.from(event.dataTransfer?.items ?? []);
  const fileItems = items.filter((item) => item.kind === "file");

  if (fileItems.length === 0) return "dragging";

  const typedItems = fileItems.filter((item) => item.type.length > 0);
  if (typedItems.length === 0) return "dragging";

  const hasAllowed = typedItems.some((item) =>
    isAllowedDocumentType(item.type.toLowerCase()),
  );

  return hasAllowed ? "dragging" : "invalid";
}

export function DocumentDropzone({
  onFileSelected,
  disabled = false,
}: DocumentDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [dragState, setDragState] = useState<DragState>("idle");
  const [error, setError] = useState<string | null>(null);
  const hintId = useId();
  const errorId = useId();

  function handleFile(file: File | null | undefined) {
    const result = validateDocumentFile(file);
    if (!result.valid) {
      setError(result.message);
      return;
    }
    setError(null);
    onFileSelected(file as File);
  }

  function openFilePicker() {
    if (disabled) return;
    inputRef.current?.click();
  }

  function handleDragEnter(event: DragEvent<HTMLElement>) {
    if (disabled) return;
    event.preventDefault();
    dragDepth.current += 1;
    setDragState(resolveDragState(event));
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    if (disabled) return;
    event.preventDefault();
    const next = resolveDragState(event);
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = next === "invalid" ? "none" : "copy";
    }
    setDragState(next);
  }

  function handleDragLeave(event: DragEvent<HTMLElement>) {
    if (disabled) return;
    event.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) {
      setDragState("idle");
    }
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    if (disabled) return;
    event.preventDefault();
    dragDepth.current = 0;
    setDragState("idle");
    handleFile(event.dataTransfer?.files?.[0]);
  }

  const stateClass =
    dragState === "dragging"
      ? "is-dragging"
      : dragState === "invalid"
        ? "is-invalid"
        : "";

  return (
    <div className="doc-dropzone-wrap">
      <input
        ref={inputRef}
        aria-label="input-document"
        type="file"
        className="doc-dropzone-input"
        accept={DOCUMENT_ACCEPT_ATTRIBUTE}
        disabled={disabled}
        tabIndex={-1}
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          // Allow re-selecting the same file after a rejection
          event.target.value = "";
        }}
      />

      <button
        type="button"
        className={`doc-dropzone ${stateClass}`}
        onClick={openFilePicker}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        disabled={disabled}
        aria-label="Pilih dokumen finansial"
        aria-describedby={error ? `${hintId} ${errorId}` : hintId}
      >
        <span className="doc-dropzone-orb" aria-hidden="true">
          {dragState === "invalid" ? (
            <WarningCircle size={30} weight="duotone" />
          ) : dragState === "dragging" ? (
            <FilePlus size={30} weight="duotone" />
          ) : (
            <UploadSimple size={30} weight="duotone" />
          )}
        </span>

        <span className="doc-dropzone-copy">
          <strong className="doc-dropzone-title">
            {dragState === "invalid"
              ? "Format ini belum didukung"
              : dragState === "dragging"
                ? "Lepaskan dokumennya di sini"
                : "Pahami dokumen finansialmu"}
          </strong>
          <span className="doc-dropzone-desc">
            {dragState === "invalid"
              ? "FinLen hanya dapat membaca PDF, JPG, atau PNG."
              : "Upload kontrak, tagihan, atau dokumen finansial untuk melihat istilah penting, risiko, dan hal-hal yang perlu kamu perhatikan."}
          </span>
        </span>

        <span className="doc-dropzone-pill" aria-hidden="true">
          Pilih dokumen
        </span>
      </button>

      <p id={hintId} className="doc-dropzone-hint">
        Tarik dan lepas dokumen, atau tekan tombol di atas untuk memilih file.
        PDF, JPG, atau PNG · Maks. 10 MB.
      </p>

      {error ? (
        <p id={errorId} className="doc-dropzone-error" role="alert">
          <WarningCircle size={18} weight="fill" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

export default DocumentDropzone;
