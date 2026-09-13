"use client";

import { useMutation } from "@tanstack/react-query";
import { analyzeDocument } from "../api/analyzer";
import type { AnalyzeDocumentResponse } from "../types/analyzer";

export const ANALYZER_MUTATION_KEY = ["analyzer", "documents"] as const;

/**
 * Stateless document analysis mutation.
 * Retries are disabled: OCR + AI analysis is expensive and user-triggered.
 */
export function useAnalyzeDocument() {
  return useMutation<AnalyzeDocumentResponse, Error, File>({
    mutationKey: ANALYZER_MUTATION_KEY,
    mutationFn: (file: File) => analyzeDocument(file),
    retry: false,
  });
}
