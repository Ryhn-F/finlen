/**
 * FinLen AI Roleplay & API Type Definitions
 * Based on docs/API_DOCUMENTATION.md
 */

export interface ScenarioListItem {
  id: string; // UUID
  title: string;
  slug: string;
  description: string;
  category: "debt" | "spending" | "fraud" | "emergency" | "social" | string;
  difficulty: "easy" | "medium" | "hard" | string;
  npc_role: string;
  max_turns: number;
}

export interface ScenarioFinancialContext {
  loan_amount?: number;
  currency?: string;
  interest_rate?: number;
  interest_type?: string;
  repayment_period_months?: number;
  overdue_months?: number;
  user_condition?: string;
  current_savings?: number;
  monthly_essential_expenses?: number;
  [key: string]: unknown;
}

export interface LearningMaterialItem {
  id: string;
  title: string;
  description?: string | null;
  formal_file_url?: string | null;
  brainrot_file_url?: string | null;
  source_name?: string | null;
  source_url?: string | null;
  created_at?: string;
}

export interface ScenarioDetail extends ScenarioListItem {
  financial_context: ScenarioFinancialContext;
  objective: string;
  initial_state: SessionStateData;
  created_at: string;
  learning_materials: LearningMaterialItem[];
}

/**
 * Runtime game state tracked in Firestore (0 to 10 scale)
 */
export interface SessionStateData {
  collector_pressure: number; // 0..10
  financial_risk: number;     // 0..10
  trust_level: number;        // 0..10
  negotiation_power: number;  // 0..10
  current_stage?: string;
  last_decision?: string;
  updated_at?: string | null;
}

/**
 * Per-turn evaluation skill deltas (-5 to +5)
 */
export interface EvaluationScores {
  critical_thinking: number;
  risk_awareness: number;
  impulse_control: number;
  decision_making: number;
}

export type ConsequenceSeverity = "positive" | "neutral" | "negative" | "critical";

export interface Consequence {
  description: string;
  severity: ConsequenceSeverity;
}

/**
 * Runtime state changes (-5 to +5)
 */
export interface StateChanges {
  collector_pressure: number;
  financial_risk: number;
  trust_level: number;
  negotiation_power: number;
}

/**
 * Full turn evaluation from backend AI
 */
export interface TurnEvaluation {
  scores: EvaluationScores;
  consequence: Consequence;
  feedback: string;
  state_changes: StateChanges;
}

/**
 * PostgreSQL persistent scores (0 to 100)
 */
export interface SessionScores {
  critical_thinking: number;
  risk_awareness: number;
  impulse_control: number;
  decision_making: number;
  financial_instinct: number;
}

export interface CreateSessionRequest {
  scenario_id: string;
}

export interface CreateSessionResponse {
  session_id: string;
  scenario: string;
  scenario_title: string;
  status: "active" | "completed";
  turn_number: number;
  initial_state: SessionStateData;
  first_npc_message: string;
  created_at: string;
  max_turns?: number;
}

export interface RoleplaySessionDetail {
  session_id: string;
  scenario: string;
  scenario_title: string;
  status: "active" | "completed";
  turn_number: number;
  scores: SessionScores;
  current_state: SessionStateData;
  xp_earned: number;
  created_at: string;
  completed_at: string | null;
  max_turns?: number;
}

export interface SendMessageRequest {
  message: string;
}

export interface SendMessageResponse {
  turn_number: number;
  user_message: string;
  npc_response: string;
  evaluation: TurnEvaluation;
  state_changes: StateChanges;
  current_state: SessionStateData;
  session_scores: SessionScores;
  xp_earned_this_turn: number;
  max_turns?: number;
}

export type MessageSender = "npc" | "user" | "system";

export interface RoleplayMessageItem {
  id: string;
  sender: MessageSender;
  message: string;
  turn_number: number;
  created_at: string;
  evaluation?: TurnEvaluation | null;
  // Local transient state for optimistic updates
  isPending?: boolean;
  isFailed?: boolean;
}

export interface UserProgressionUpdate {
  user_id: string;
  level: number;
  xp: number;
  xp_gained: number;
  financial_instinct: number;
}

export interface CompleteSessionResponse {
  session_id: string;
  status: "completed";
  scores: SessionScores;
  xp_earned: number;
  completed_at: string;
  progression: UserProgressionUpdate;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  level: number;
  xp: number;
  financial_instinct: number;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}
