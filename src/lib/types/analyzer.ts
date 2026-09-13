/**
 * FinLen Smart Document Analyzer type definitions.
 * Mirrors `POST /api/v1/analyzer/documents` exactly as documented in
 * docs/API_DOCUMENTATION.md (section 4.11 / DocumentAnalysisResponse).
 *
 * Only fields the backend actually returns are declared here.
 */

export type RiskLevel = "low" | "medium" | "high" | "critical" | "unknown";

export type RiskSeverity = "low" | "medium" | "high" | "critical";

export interface FinancialTerms {
  principal: number | null;
  interest_rate: number | null;
  interest_period: string | null;
  due_date: string | null;
  currency: string | null;
}

export interface RiskFactor {
  title: string;
  description: string;
  severity: RiskSeverity;
}

export interface FinancialLiteracyConcept {
  concept: string;
  explanation: string;
}

export interface DocumentAnalysis {
  document_type: string;
  summary: string;
  financial_terms: FinancialTerms;
  risk_level: RiskLevel;
  risk_factors: RiskFactor[];
  red_flags: string[];
  recommended_actions: string[];
  financial_literacy: FinancialLiteracyConcept[];
}

export interface AnalyzeDocumentResponse {
  analysis: DocumentAnalysis;
}
