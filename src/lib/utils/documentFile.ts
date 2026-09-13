/**
 * Client-side document validation for the Smart Document Analyzer.
 * This is a UX guard only — the backend remains the authoritative validator.
 */

export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

export const ALLOWED_DOCUMENT_EXTENSIONS = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
] as const;

export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

export const DOCUMENT_ACCEPT_ATTRIBUTE = ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png";

export type DocumentValidationResult =
  | { valid: true }
  | { valid: false; message: string };

function hasAllowedExtension(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return ALLOWED_DOCUMENT_EXTENSIONS.some((extension) =>
    lower.endsWith(extension),
  );
}

/**
 * `true` when the MIME type is explicitly supported.
 * Browsers occasionally report an empty type, so the extension is the fallback.
 */
export function isAllowedDocumentType(mimeType: string): boolean {
  return (ALLOWED_DOCUMENT_TYPES as readonly string[]).includes(mimeType);
}

export function validateDocumentFile(
  file: File | null | undefined,
): DocumentValidationResult {
  if (!file) {
    return {
      valid: false,
      message: "Dokumen tidak dapat dibaca. Coba pilih file lain.",
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      message: "Dokumen ini kosong. Pilih file yang berisi dokumen finansial.",
    };
  }

  if (file.size > MAX_DOCUMENT_SIZE) {
    return {
      valid: false,
      message:
        "Ukuran dokumen terlalu besar. Maksimal ukuran file adalah 10 MB.",
    };
  }

  const mimeType = file.type.toLowerCase();
  const mimeIsKnown = mimeType.length > 0;

  if (mimeIsKnown && !isAllowedDocumentType(mimeType)) {
    return {
      valid: false,
      message: "Format dokumen tidak didukung. Gunakan PDF, JPG, atau PNG.",
    };
  }

  if (!hasAllowedExtension(file.name)) {
    return {
      valid: false,
      message: "Format dokumen tidak didukung. Gunakan PDF, JPG, atau PNG.",
    };
  }

  return { valid: true };
}

/** `application/pdf` -> `PDF`, `image/jpeg` -> `JPG` */
export function describeDocumentType(file: File): string {
  const mimeType = file.type.toLowerCase();
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType === "image/jpeg") return "JPG";
  if (mimeType === "image/png") return "PNG";

  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return "PDF";
  if (name.endsWith(".png")) return "PNG";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "JPG";
  return "Dokumen";
}

export function isImageDocument(file: File): boolean {
  const mimeType = file.type.toLowerCase();
  if (mimeType === "image/jpeg" || mimeType === "image/png") return true;
  if (mimeType.length > 0) return false;
  const name = file.name.toLowerCase();
  return name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg");
}
