import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampScore,
  computeCveKpis,
  filterCveRecords,
  findPendingRepetitionForCve,
  formatFamilyPairingLabel,
  generateNextVulnCode,
  getDefaultOppositeProfile,
  getOppositeFamilyProfiles,
  isOppositeFamilyPair,
} from './milestone3Utils';
import type { ReoCveRecord, ReoRepetition } from './supabase';

test('cross-family profile pairing enforces strict Gemini vs Qwen opposition', () => {
  assert.deepEqual(getOppositeFamilyProfiles('fast'), ['qwen_plus', 'qwen_max']);
  assert.deepEqual(getOppositeFamilyProfiles('deep'), ['qwen_plus', 'qwen_max']);
  assert.deepEqual(getOppositeFamilyProfiles('qwen_plus'), ['fast', 'deep']);
  assert.deepEqual(getOppositeFamilyProfiles('qwen_max'), ['fast', 'deep']);

  assert.equal(getDefaultOppositeProfile('fast'), 'qwen_plus');
  assert.equal(getDefaultOppositeProfile('qwen_max'), 'fast');

  assert.equal(isOppositeFamilyPair('fast', 'qwen_plus'), true);
  assert.equal(isOppositeFamilyPair('fast', 'deep'), false);
  assert.equal(isOppositeFamilyPair('qwen_plus', 'qwen_max'), false);

  assert.equal(formatFamilyPairingLabel('fast', 'qwen_plus'), 'Gemini vs Qwen');
  assert.equal(formatFamilyPairingLabel('qwen_max', 'deep'), 'Qwen vs Gemini');
});

const SAMPLE_CVES: ReoCveRecord[] = [
  {
    id: 'cve-1',
    user_id: 'u1',
    vuln_code: 'CVE-EDU-2026-001',
    subject: 'Cybersecurity',
    topic: 'SQL Injection Parameterization',
    problem_statement: 'Used string interpolation in SQL WHERE clause',
    derivation: 'Assumed escaping single quotes alone was sufficient',
    root_cause: 'knowledge_gap',
    status: 'VULNERABLE',
    patch_verified_at: null,
    created_at: '2026-05-01T10:00:00Z',
  },
  {
    id: 'cve-2',
    user_id: 'u1',
    vuln_code: 'CVE-EDU-2026-002',
    subject: 'Mathematics',
    topic: 'Chain Rule Sign Error',
    problem_statement: 'Dropped minus sign differentiating cos(2x)',
    derivation: 'Wrote 2sin(2x) instead of -2sin(2x)',
    root_cause: 'attention_slip',
    status: 'PATCHED',
    patch_verified_at: '2026-05-02T12:00:00Z',
    created_at: '2026-05-02T10:00:00Z',
  },
  {
    id: 'cve-3',
    user_id: 'u1',
    vuln_code: 'CVE-EDU-2026-005',
    subject: 'Informatics',
    topic: 'Binary Search Mid Overflow',
    problem_statement: 'Used (low + high) / 2 in 32-bit signed integers',
    derivation: 'Forgot low + (high - low) / 2 bound',
    root_cause: 'knowledge_gap',
    status: 'REGRESSED',
    patch_verified_at: null,
    created_at: '2026-05-03T10:00:00Z',
  },
];

const SAMPLE_REPS: ReoRepetition[] = [
  {
    id: 'rep-1',
    user_id: 'u1',
    source_type: 'cve',
    source_id: 'cve-1',
    step_days: 1,
    due_at: '2026-05-04T10:00:00Z',
    status: 'pending',
  },
  {
    id: 'rep-2',
    user_id: 'u1',
    source_type: 'cve',
    source_id: 'cve-2',
    step_days: 3,
    due_at: '2026-05-05T10:00:00Z',
    status: 'done',
  },
  {
    id: 'rep-3',
    user_id: 'u1',
    source_type: 'note',
    source_id: 'note-1',
    step_days: 1,
    due_at: '2026-05-04T10:00:00Z',
    status: 'pending',
  },
];

test('computeCveKpis computes exact server row counts without fabrication', () => {
  assert.deepEqual(computeCveKpis(SAMPLE_CVES, SAMPLE_REPS), {
    total: 3,
    vulnerable: 1,
    patched: 1,
    regressed: 1,
    pendingReviews: 1,
  });
});

test('filterCveRecords filters by status and vuln_code/topic search query', () => {
  assert.equal(filterCveRecords(SAMPLE_CVES, 'ALL', '').length, 3);
  assert.equal(filterCveRecords(SAMPLE_CVES, 'PATCHED', '').length, 1);
  assert.deepEqual(
    filterCveRecords(SAMPLE_CVES, 'ALL', '005').map((r) => r.id),
    ['cve-3'],
  );
  assert.deepEqual(
    filterCveRecords(SAMPLE_CVES, 'VULNERABLE', 'injection').map((r) => r.id),
    ['cve-1'],
  );
});

test('findPendingRepetitionForCve matches earliest pending cve repetition only', () => {
  assert.equal(findPendingRepetitionForCve(SAMPLE_REPS, 'cve-1')?.id, 'rep-1');
  assert.equal(findPendingRepetitionForCve(SAMPLE_REPS, 'cve-2'), null);
});

test('generateNextVulnCode increments past highest matching year suffix', () => {
  assert.equal(generateNextVulnCode([], 2026), 'CVE-EDU-2026-001');
  assert.equal(generateNextVulnCode(SAMPLE_CVES, 2026), 'CVE-EDU-2026-006');
});

test('clampScore bounds numeric values to 0..100', () => {
  assert.equal(clampScore(100), 100);
  assert.equal(clampScore(-10), 0);
  assert.equal(clampScore(145), 100);
  assert.equal(clampScore(74.6), 75);
  assert.equal(clampScore(null), 0);
});
