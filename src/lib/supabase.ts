import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL: string =
  import.meta.env?.VITE_SUPABASE_URL || 'https://wtigalkwrcccpqwuvuou.supabase.co';

export const SUPABASE_PUBLISHABLE_KEY: string =
  import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_QeM4oKRrMdvnJlFJnm-ToA_JjwX1P2y';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

export type ReoMessageRole = 'user' | 'model';
export type ReoCveRootCause = 'knowledge_gap' | 'attention_slip';
export type ReoCveStatus = 'VULNERABLE' | 'PATCHED' | 'REGRESSED';
export type ReoArbiterVerdict = 'pending' | 'blue_clean' | 'red_found_flaw';
export type ReoRepetitionSourceType = 'cve' | 'note';
export type ReoRepetitionStatus = 'pending' | 'done';
export type ReoSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ReoThread {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  created_at: string;
  updated_at: string;
}

export interface ReoMessage {
  id: string;
  thread_id: string;
  user_id: string;
  role: ReoMessageRole;
  content: string;
  created_at: string;
}

export interface ReoCveRecord {
  id: string;
  user_id: string;
  vuln_code: string;
  subject: string;
  topic: string;
  problem_statement: string;
  derivation: string;
  root_cause: ReoCveRootCause;
  status: ReoCveStatus;
  patch_verified_at: string | null;
  created_at: string;
}

export interface ReoArenaRun {
  id: string;
  user_id: string;
  prompt: string;
  blue_model: string;
  blue_response: string;
  red_model: string;
  red_response: string;
  arbiter_verdict: ReoArbiterVerdict;
  linked_cve_id: string | null;
  created_at: string;
}

export interface ReoRepetition {
  id: string;
  user_id: string;
  source_type: ReoRepetitionSourceType;
  source_id: string;
  step_days: number;
  due_at: string;
  status: ReoRepetitionStatus;
}

export interface ReoTelemetryRow {
  id: string;
  user_id: string;
  threat_type: string;
  severity: ReoSeverity;
  target_module: string;
  captured_input: string;
  d_js: number | null;
  consensus_mal: number | null;
  h_bio: number | null;
  cv_ratio: number | null;
  heuristic_score: number | null;
  reo_index: number | null;
  degraded_mode: boolean;
  is_simulation: boolean;
  action_taken: string;
  canary_id: string | null;
  created_at: string;
}
