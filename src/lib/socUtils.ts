import type { GatewayResponse, PatchVerifyResponse, ProviderUsed, ShieldStatus } from './api';
import type { ReoSeverity, ReoTelemetryRow } from './supabase';
import { generateTelemetrySessionId, serializeTelemetryHeader } from './biometrics';
import { extractCanaryTokens } from './coachUtils';

export type SocSourceFilter = 'ALL' | 'SIMULATION' | 'LIVE';
export type SocSeverityFilter = 'ALL' | ReoSeverity;
export type KnownSocModule =
  | 'ALL'
  | 'm1_study_coach'
  | 'red_blue_arena'
  | 'cve_patch_challenge'
  | 'red_team_lab';
export type SocModuleFilter = KnownSocModule | (string & {});

export const BASE_SOC_MODULES: readonly KnownSocModule[] = [
  'ALL',
  'm1_study_coach',
  'red_blue_arena',
  'cve_patch_challenge',
  'red_team_lab',
] as const;

export type AttackPresetId =
  | 'preset1'
  | 'preset2'
  | 'preset3'
  | 'preset4'
  | 'preset5';

export type PresetRunStatus = 'IDLE' | 'RUNNING' | 'VERIFIED' | 'FAILED';

export const FALLBACK_CANARY_TOKEN = 'REO-CANARY-0123456789ABCDEF';
export const HUMAN_PRESET_FLIGHT_TIMES_MS = [110, 145, 88, 210, 130, 290, 95, 180, 240, 120];

export interface SocKpiSummary {
  totalRows: number;
  totalBlocked: number;
  canaryTrapsIssued: number;
  canaryReplaysVerified: number;
  avgDjs: number | null;
  avgHbio: number | null;
  simCount: number;
  liveCount: number;
}

export function isRowBlocked(row: ReoTelemetryRow): boolean {
  const action = (row.action_taken || '').toUpperCase();
  return action.includes('HONEYPOT') || row.severity === 'CRITICAL';
}

export function isRowCanaryReplay(row: ReoTelemetryRow): boolean {
  return (row.threat_type || '').toLowerCase().includes('canary_replay');
}

/**
 * Computes exact SOC KPIs strictly from fetched `reo_telemetry` rows.
 * Never fabricates numbers: returns `null` for averages when denominator is 0.
 * Counts distinct `canary_id` traps so verified replays referencing an existing
 * canary UUID are tracked separately instead of double-counting issued traps.
 */
export function computeSocKpis(rows: readonly ReoTelemetryRow[]): SocKpiSummary {
  let totalBlocked = 0;
  const distinctCanaries = new Set<string>();
  let canaryReplaysVerified = 0;
  let djsSum = 0;
  let djsCount = 0;
  let hbioSum = 0;
  let hbioCount = 0;
  let simCount = 0;
  let liveCount = 0;

  for (const row of rows) {
    if (isRowBlocked(row)) {
      totalBlocked += 1;
    }
    if (row.canary_id !== null && row.canary_id !== undefined) {
      const normalizedCanary = String(row.canary_id).trim();
      if (normalizedCanary !== '') {
        distinctCanaries.add(normalizedCanary);
      }
    }
    if (isRowCanaryReplay(row)) {
      canaryReplaysVerified += 1;
    }
    if (typeof row.d_js === 'number' && Number.isFinite(row.d_js)) {
      djsSum += row.d_js;
      djsCount += 1;
    }
    if (typeof row.h_bio === 'number' && Number.isFinite(row.h_bio)) {
      hbioSum += row.h_bio;
      hbioCount += 1;
    }
    if (row.is_simulation) {
      simCount += 1;
    } else {
      liveCount += 1;
    }
  }

  return {
    totalRows: rows.length,
    totalBlocked,
    canaryTrapsIssued: distinctCanaries.size,
    canaryReplaysVerified,
    avgDjs: djsCount > 0 ? djsSum / djsCount : null,
    avgHbio: hbioCount > 0 ? hbioSum / hbioCount : null,
    simCount,
    liveCount,
  };
}

/**
 * Returns the canonical SOC module filter list plus any additional distinct
 * `target_module` values observed in live `reo_telemetry` rows.
 */
export function collectAvailableModuleFilters(
  rows: readonly ReoTelemetryRow[],
): SocModuleFilter[] {
  const seen = new Set<string>(BASE_SOC_MODULES);
  const extras: string[] = [];

  for (const row of rows) {
    const mod = (row.target_module || '').trim();
    if (mod && !seen.has(mod)) {
      seen.add(mod);
      extras.push(mod);
    }
  }

  extras.sort((a, b) => a.localeCompare(b));
  return [...BASE_SOC_MODULES, ...extras];
}

/**
 * Resolves a consistent model/provider label for `ShieldTelemetryStrip` across
 * all modules, defaulting blocked/honeypot responses without `model_used` to
 * `reo-static-honeypot (none)`.
 */
export function resolveShieldProviderLabel(params: {
  shieldStatus: ShieldStatus;
  blocked?: boolean;
  modelUsed?: string;
  providerUsed?: ProviderUsed;
}): string {
  const isBlocked = params.shieldStatus === 'HONEYPOT_ENGAGED' || params.blocked === true;
  const normalizedModel = params.modelUsed?.trim() || '';
  const hasRealModel = normalizedModel !== '' && normalizedModel.toLowerCase() !== 'none';

  if (hasRealModel) {
    return params.providerUsed ? `${normalizedModel} (${params.providerUsed})` : normalizedModel;
  }

  if (isBlocked) {
    return 'reo-static-honeypot (none)';
  }

  return params.providerUsed || 'none';
}

export function filterTelemetryRows(
  rows: readonly ReoTelemetryRow[],
  sourceFilter: SocSourceFilter,
  severityFilter: SocSeverityFilter,
  moduleFilter: SocModuleFilter,
): ReoTelemetryRow[] {
  return rows.filter((row) => {
    if (sourceFilter === 'SIMULATION' && !row.is_simulation) {
      return false;
    }
    if (sourceFilter === 'LIVE' && row.is_simulation) {
      return false;
    }
    if (severityFilter !== 'ALL' && row.severity !== severityFilter) {
      return false;
    }
    if (moduleFilter !== 'ALL' && row.target_module !== moduleFilter) {
      return false;
    }
    return true;
  });
}

/**
 * Builds the benign human-cadence x-reo-telemetry header for Preset 5 (N1 Self-DoS check).
 */
export function buildHumanPresetHeader(sessionId?: string): string {
  return serializeTelemetryHeader({
    flight_times_ms: HUMAN_PRESET_FLIGHT_TIMES_MS,
    paste_events: 0,
    session_id: sessionId || generateTelemetrySessionId(),
  });
}

export interface PresetEvaluation {
  verified: boolean;
  extractedCanary: string | null;
}

export function evaluatePreset1(res: GatewayResponse): PresetEvaluation {
  const canaries = extractCanaryTokens(res.reply);
  return {
    verified: res.shield_status === 'HONEYPOT_ENGAGED' && res.provider_used === 'none',
    extractedCanary: canaries[0] ?? null,
  };
}

export function evaluatePreset2(res: GatewayResponse): PresetEvaluation {
  const canaries = extractCanaryTokens(res.reply);
  return {
    verified: res.shield_status === 'HONEYPOT_ENGAGED',
    extractedCanary: canaries[0] ?? null,
  };
}

export function evaluatePreset3(res: GatewayResponse): PresetEvaluation {
  const canaries = extractCanaryTokens(res.reply);
  return {
    verified:
      res.shield_status === 'HONEYPOT_ENGAGED' &&
      res.shield?.canary_verified === true &&
      res.latency_ms === 0,
    extractedCanary: canaries[0] ?? null,
  };
}

export function evaluatePreset4(res: PatchVerifyResponse): PresetEvaluation {
  const canaries = extractCanaryTokens(res.reply || res.feedback || '');
  return {
    verified:
      res.shield_status === 'HONEYPOT_ENGAGED' &&
      res.passed === false &&
      res.score === 0 &&
      res.previous_status === res.new_status,
    extractedCanary: canaries[0] ?? null,
  };
}

export function evaluatePreset5(res: GatewayResponse): PresetEvaluation {
  return {
    verified: res.shield_status === 'CLEAN' && res.shield?.blocked === false,
    extractedCanary: null,
  };
}

export function buildForensicExportPayload(
  rows: readonly ReoTelemetryRow[],
  filters: {
    source: SocSourceFilter;
    severity: SocSeverityFilter;
    module: SocModuleFilter;
  },
): string {
  const kpis = computeSocKpis(rows);
  return JSON.stringify(
    {
      exported_at: new Date().toISOString(),
      platform: 'REO AI & REO-Shield v2.0',
      filters,
      summary: kpis,
      event_count: rows.length,
      events: rows,
    },
    null,
    2,
  );
}
