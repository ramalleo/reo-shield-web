import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './supabase';
import type { ReoArbiterVerdict, ReoCveStatus, ReoSeverity } from './supabase';
import { ReoApiError, classifyEdgeError } from './sessionTimer';

export type ReoLang = 'en' | 'ru' | 'az';

export type ReoSubject =
  | 'Cybersecurity'
  | 'Mathematics'
  | 'Physics'
  | 'Informatics'
  | 'English'
  | 'General';

export type ModelProfile = 'fast' | 'deep' | 'qwen_plus' | 'qwen_max';
export type ShieldStatus = 'CLEAN' | 'HONEYPOT_ENGAGED';
export type ProviderUsed = 'gemini' | 'qwen' | 'none';

export interface ShieldTelemetry {
  blocked: boolean;
  d_js: number | null;
  consensus_mal: number | null;
  h_bio: number | null;
  cv_ratio: number | null;
  bio_penalty: number | null;
  heuristic_score: number | null;
  reo_index: number | null;
  degraded_mode: boolean;
  threat_type: string;
  severity: ReoSeverity;
  matched_rules: string[];
  canary_issued: boolean;
  canary_verified: boolean;
  cross_account_replay: boolean;
  is_simulation: boolean;
}

export interface DemoSessionUser {
  id: string;
  email: string;
  is_demo_jury: boolean;
  expires_at: string;
}

export interface DemoSessionResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: DemoSessionUser;
}

export interface GatewayHistoryItem {
  role: 'user' | 'model';
  content: string;
}

export interface GatewayRequest {
  prompt: string;
  history: GatewayHistoryItem[];
  thread_id?: string;
  lang: ReoLang;
  subject: ReoSubject;
  model_profile: ModelProfile;
  is_simulation?: boolean;
}

export interface GatewayResponse {
  reply: string;
  shield_status: ShieldStatus;
  model_used: string;
  provider_used: ProviderUsed;
  failover_used: boolean;
  latency_ms: number;
  thread_id: string | null;
  shield: ShieldTelemetry;
}

export interface ArenaRequest {
  prompt: string;
  lang: ReoLang;
  subject: string;
  blue_profile?: ModelProfile;
  red_profile?: ModelProfile;
  deep_audit?: boolean;
  linked_cve_id?: string;
  is_simulation?: boolean;
}

export interface ArenaTeamOutput {
  text: string;
  model_used: string;
  provider_used: 'gemini' | 'qwen';
  failover_used: boolean;
  latency_ms: number;
  profile_requested: ModelProfile;
}

export interface ArenaCleanResponse {
  run_id: string | null;
  arbiter_verdict: ReoArbiterVerdict;
  linked_cve_id: string | null;
  shield_status: 'CLEAN';
  lang: ReoLang;
  subject: string;
  cross_family_verified: boolean;
  blue_team: ArenaTeamOutput;
  red_team: ArenaTeamOutput;
  total_latency_ms: number;
  shield: ShieldTelemetry;
}

export interface ArenaBlockedResponse {
  run_id: null;
  arbiter_verdict?: ReoArbiterVerdict;
  linked_cve_id?: string | null;
  shield_status: 'HONEYPOT_ENGAGED';
  reply: string;
  lang?: ReoLang;
  subject?: string;
  cross_family_verified: false;
  blue_team: null;
  red_team: null;
  total_latency_ms?: number;
  shield: ShieldTelemetry;
}

export type ArenaResponse = ArenaCleanResponse | ArenaBlockedResponse;

export interface PatchGenerateRequest {
  action: 'generate';
  cve_id: string;
  lang: ReoLang;
  model_profile?: ModelProfile;
}

export interface PatchGenerateResponse {
  action: 'generate';
  shield_status: ShieldStatus;
  lang: ReoLang;
  cve_id: string;
  vuln_code: string;
  current_status: ReoCveStatus;
  challenge_question: string;
  record_sanitized: boolean;
  model_used: string;
  provider_used: ProviderUsed;
  failover_used: boolean;
  latency_ms: number;
  reply?: string;
  shield?: ShieldTelemetry;
}

export interface PatchVerifyRequest {
  action: 'verify';
  cve_id: string;
  lang: ReoLang;
  challenge_question: string;
  student_answer: string;
  model_profile?: ModelProfile;
  is_simulation?: boolean;
}

export interface PatchVerifyResponse {
  action: 'verify';
  shield_status: ShieldStatus;
  lang: ReoLang;
  cve_id: string;
  vuln_code: string;
  passed: boolean;
  score: number;
  feedback: string;
  reply?: string;
  parse_failed: boolean;
  previous_status: ReoCveStatus;
  new_status: ReoCveStatus;
  patch_verified_at: string | null;
  repetition_scheduled: boolean;
  model_used: string;
  provider_used: ProviderUsed;
  failover_used: boolean;
  latency_ms: number;
  shield: ShieldTelemetry;
}

export interface ProtectedCallContext {
  accessToken: string;
  telemetryHeader: string;
  signal?: AbortSignal;
}

const FUNCTIONS_BASE_URL = `${SUPABASE_URL.replace(/\/+$/, '')}/functions/v1`;

async function parseJsonSafe(response: Response): Promise<Record<string, unknown> | null> {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { message: text };
  }
}

async function invokeEdgeFunction<TResponse>(
  functionName: 'reo-demo-session' | 'reo-gateway' | 'reo-arena' | 'reo-patch-challenge',
  body: unknown,
  options?: ProtectedCallContext,
): Promise<TResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: SUPABASE_PUBLISHABLE_KEY,
  };

  if (options) {
    headers['Authorization'] = `Bearer ${options.accessToken}`;
    headers['x-reo-telemetry'] = options.telemetryHeader;
  }

  let response: Response;
  try {
    response = await fetch(`${FUNCTIONS_BASE_URL}/${functionName}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: options?.signal,
    });
  } catch (err) {
    throw new ReoApiError({
      status: 0,
      code: 'network_error',
      message: err instanceof Error ? err.message : 'Network request failed',
    });
  }

  const parsed = await parseJsonSafe(response);

  if (!response.ok) {
    throw classifyEdgeError(response.status, parsed, response.headers.get('Retry-After'));
  }

  if (!parsed) {
    throw new ReoApiError({
      status: response.status,
      code: 'server_error',
      message: 'Empty response from Edge Function',
    });
  }

  return parsed as unknown as TResponse;
}

export interface RawDemoSessionPayload {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  session?: {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    token_type?: string;
    expires_at?: number | string;
  };
  user?: DemoSessionUser;
}

export function normalizeDemoSessionResponse(raw: RawDemoSessionPayload): DemoSessionResponse {
  const accessToken = raw.access_token || raw.session?.access_token;
  const refreshToken = raw.refresh_token || raw.session?.refresh_token;
  const expiresIn = raw.expires_in ?? raw.session?.expires_in ?? 3600;
  const tokenType = raw.token_type || raw.session?.token_type || 'bearer';

  if (!accessToken || !refreshToken || !raw.user) {
    throw new ReoApiError({
      status: 500,
      code: 'server_error',
      message: 'Malformed demo session payload from reo-demo-session',
      details: raw,
    });
  }

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: expiresIn,
    token_type: tokenType,
    user: raw.user,
  };
}

/**
 * ENDPOINT 1: POST /functions/v1/reo-demo-session
 * Provisions an isolated 2-hour Jury Sandbox session (no Authorization header required).
 */
export async function launchDemoSession(): Promise<DemoSessionResponse> {
  const raw = await invokeEdgeFunction<RawDemoSessionPayload>('reo-demo-session', {});
  return normalizeDemoSessionResponse(raw);
}

/**
 * ENDPOINT 2: POST /functions/v1/reo-gateway
 */
export async function callReoGateway(
  request: GatewayRequest,
  context: ProtectedCallContext,
): Promise<GatewayResponse> {
  return invokeEdgeFunction<GatewayResponse>('reo-gateway', request, context);
}

/**
 * ENDPOINT 3: POST /functions/v1/reo-arena
 */
export async function callReoArena(
  request: ArenaRequest,
  context: ProtectedCallContext,
): Promise<ArenaResponse> {
  return invokeEdgeFunction<ArenaResponse>('reo-arena', request, context);
}

/**
 * ENDPOINT 4 (Action A): POST /functions/v1/reo-patch-challenge (generate)
 */
export async function generatePatchChallenge(
  request: PatchGenerateRequest,
  context: ProtectedCallContext,
): Promise<PatchGenerateResponse> {
  return invokeEdgeFunction<PatchGenerateResponse>('reo-patch-challenge', request, context);
}

/**
 * ENDPOINT 4 (Action B): POST /functions/v1/reo-patch-challenge (verify)
 */
export async function verifyPatchChallenge(
  request: PatchVerifyRequest,
  context: ProtectedCallContext,
): Promise<PatchVerifyResponse> {
  return invokeEdgeFunction<PatchVerifyResponse>('reo-patch-challenge', request, context);
}

export { ReoApiError };
