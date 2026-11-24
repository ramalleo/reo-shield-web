import type { ModelProfile } from './api';
import type { ReoCveRecord, ReoCveStatus, ReoRepetition } from './supabase';

export type ModelFamily = 'gemini' | 'qwen';
export type CveFilterStatus = 'ALL' | ReoCveStatus;

export const GEMINI_PROFILES: readonly ModelProfile[] = ['fast', 'deep'] as const;
export const QWEN_PROFILES: readonly ModelProfile[] = ['qwen_plus', 'qwen_max'] as const;

export function getModelFamily(profile: ModelProfile): ModelFamily {
  return profile === 'fast' || profile === 'deep' ? 'gemini' : 'qwen';
}

export function getOppositeFamilyProfiles(blueProfile: ModelProfile): readonly ModelProfile[] {
  return getModelFamily(blueProfile) === 'gemini' ? QWEN_PROFILES : GEMINI_PROFILES;
}

export function getDefaultOppositeProfile(blueProfile: ModelProfile): ModelProfile {
  return getModelFamily(blueProfile) === 'gemini' ? 'qwen_plus' : 'fast';
}

export function isOppositeFamilyPair(blueProfile: ModelProfile, redProfile: ModelProfile): boolean {
  return getModelFamily(blueProfile) !== getModelFamily(redProfile);
}

export function formatFamilyPairingLabel(blueProfile: ModelProfile, redProfile: ModelProfile): string {
  const blueLabel = getModelFamily(blueProfile) === 'gemini' ? 'Gemini' : 'Qwen';
  const redLabel = getModelFamily(redProfile) === 'gemini' ? 'Gemini' : 'Qwen';
  return `${blueLabel} vs ${redLabel}`;
}

export interface CveKpiSummary {
  total: number;
  vulnerable: number;
  patched: number;
  regressed: number;
  pendingReviews: number;
}

export function computeCveKpis(
  records: readonly ReoCveRecord[],
  repetitions: readonly ReoRepetition[],
): CveKpiSummary {
  let vulnerable = 0;
  let patched = 0;
  let regressed = 0;

  for (const record of records) {
    if (record.status === 'VULNERABLE') vulnerable += 1;
    else if (record.status === 'PATCHED') patched += 1;
    else if (record.status === 'REGRESSED') regressed += 1;
  }

  const pendingReviews = repetitions.filter(
    (rep) => rep.source_type === 'cve' && rep.status === 'pending',
  ).length;

  return {
    total: records.length,
    vulnerable,
    patched,
    regressed,
    pendingReviews,
  };
}

export function filterCveRecords(
  records: readonly ReoCveRecord[],
  statusFilter: CveFilterStatus,
  searchQuery: string,
): ReoCveRecord[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  return records.filter((rec) => {
    if (statusFilter !== 'ALL' && rec.status !== statusFilter) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }
    return (
      rec.vuln_code.toLowerCase().includes(normalizedQuery) ||
      rec.topic.toLowerCase().includes(normalizedQuery)
    );
  });
}

export function findPendingRepetitionForCve(
  repetitions: readonly ReoRepetition[],
  cveId: string,
): ReoRepetition | null {
  const matches = repetitions.filter(
    (rep) => rep.source_type === 'cve' && rep.source_id === cveId && rep.status === 'pending',
  );
  if (matches.length === 0) {
    return null;
  }
  return [...matches].sort((a, b) => (Date.parse(a.due_at) || 0) - (Date.parse(b.due_at) || 0))[0];
}

export function generateNextVulnCode(
  existingRecords: readonly ReoCveRecord[],
  year: number = new Date().getFullYear(),
): string {
  const prefix = `CVE-EDU-${year}-`;
  let maxNum = 0;
  for (const rec of existingRecords) {
    if (rec.vuln_code.startsWith(prefix)) {
      const suffix = rec.vuln_code.slice(prefix.length);
      const parsed = Number.parseInt(suffix, 10);
      if (Number.isFinite(parsed) && parsed > maxNum) {
        maxNum = parsed;
      }
    }
  }
  return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
}

export function clampScore(score: number | null | undefined): number {
  if (typeof score !== 'number' || !Number.isFinite(score)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}
