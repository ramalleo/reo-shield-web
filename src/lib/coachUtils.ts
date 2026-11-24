import type {
  GatewayHistoryItem,
  ModelProfile,
  ProviderUsed,
  ReoSubject,
  ShieldStatus,
  ShieldTelemetry,
} from './api';
import type { ReoThread } from './supabase';

export const MAX_PROMPT_LENGTH = 8000;
export const MAX_HISTORY_TURNS = 16;

export const REO_SUBJECTS: readonly ReoSubject[] = [
  'Cybersecurity',
  'Mathematics',
  'Physics',
  'Informatics',
  'English',
  'General',
] as const;

export const MODEL_PROFILES: readonly ModelProfile[] = [
  'fast',
  'deep',
  'qwen_plus',
  'qwen_max',
] as const;

export interface CoachMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  createdAt: string;
  isHoneypot?: boolean;
  shieldStatus?: ShieldStatus;
  modelUsed?: string;
  providerUsed?: ProviderUsed;
  failoverUsed?: boolean;
  latencyMs?: number;
  shield?: ShieldTelemetry;
}

const CANARY_TOKEN_REGEX = /REO-CANARY-[0-9A-F]{16}/g;

/**
 * Formats a server-computed telemetry number with fixed decimals.
 * Returns 'N/A' when value is null, undefined, or non-finite (never fabricates 0.000).
 */
export function formatShieldMetric(
  value: number | null | undefined,
  decimals: number,
): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 'N/A';
  }
  return value.toFixed(decimals);
}

/**
 * Extracts unique REO-CANARY-[0-9A-F]{16} tokens from a honeypot reply string.
 */
export function extractCanaryTokens(text: string): string[] {
  if (!text) {
    return [];
  }
  const matches = text.match(CANARY_TOKEN_REGEX);
  if (!matches) {
    return [];
  }
  return Array.from(new Set(matches));
}

/**
 * Builds the clean conversation history payload for POST /functions/v1/reo-gateway.
 * Excludes honeypot-engaged turns and user prompts paired with honeypot blocks,
 * keeping at most the last `maxTurns` (default 16) clean messages.
 */
export function buildCleanGatewayHistory(
  messages: readonly CoachMessage[],
  maxTurns: number = MAX_HISTORY_TURNS,
): GatewayHistoryItem[] {
  const clean: GatewayHistoryItem[] = [];
  for (let i = 0; i < messages.length; i += 1) {
    const msg = messages[i];
    if (msg.isHoneypot || msg.shieldStatus === 'HONEYPOT_ENGAGED' || msg.shield?.blocked) {
      continue;
    }
    // Skip a user prompt immediately followed by a honeypot intercept turn
    const next = messages[i + 1];
    if (
      msg.role === 'user' &&
      next &&
      (next.isHoneypot || next.shieldStatus === 'HONEYPOT_ENGAGED' || next.shield?.blocked)
    ) {
      continue;
    }
    clean.push({ role: msg.role, content: msg.content });
  }
  return clean.slice(-maxTurns);
}

/**
 * Sorts threads by updated_at DESC, falling back to created_at DESC.
 */
export function sortThreadsByRecent(threads: readonly ReoThread[]): ReoThread[] {
  return [...threads].sort((a, b) => {
    const aTime = Date.parse(a.updated_at || a.created_at) || 0;
    const bTime = Date.parse(b.updated_at || b.created_at) || 0;
    return bTime - aTime;
  });
}

export function isValidSubject(value: string): value is ReoSubject {
  return (REO_SUBJECTS as readonly string[]).includes(value);
}

export function shortSessionHash(sessionId: string): string {
  return sessionId.replace(/-/g, '').slice(0, 8);
}
