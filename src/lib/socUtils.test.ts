import test from 'node:test';
import assert from 'node:assert/strict';
import type { GatewayResponse, PatchVerifyResponse, ShieldTelemetry } from './api';
import type { ReoTelemetryRow } from './supabase';
import {
  buildForensicExportPayload,
  buildHumanPresetHeader,
  collectAvailableModuleFilters,
  computeSocKpis,
  evaluatePreset1,
  evaluatePreset2,
  evaluatePreset3,
  evaluatePreset4,
  evaluatePreset5,
  filterTelemetryRows,
  HUMAN_PRESET_FLIGHT_TIMES_MS,
  resolveShieldProviderLabel,
} from './socUtils';

function makeRow(overrides: Partial<ReoTelemetryRow> = {}): ReoTelemetryRow {
  return {
    id: 'row-1',
    user_id: 'user-1',
    threat_type: 'NONE',
    severity: 'LOW',
    target_module: 'm1_study_coach',
    captured_input: 'Hello',
    d_js: 0.02,
    consensus_mal: 0.01,
    h_bio: 2.5,
    cv_ratio: 0.3,
    heuristic_score: 0.0,
    reo_index: 0.02,
    degraded_mode: false,
    is_simulation: false,
    action_taken: 'ALLOWED',
    canary_id: null,
    created_at: '2026-11-23T12:00:00Z',
    ...overrides,
  };
}

function makeShield(overrides: Partial<ShieldTelemetry> = {}): ShieldTelemetry {
  return {
    blocked: false,
    d_js: 0.01,
    consensus_mal: 0.01,
    h_bio: 2.8,
    cv_ratio: 0.35,
    bio_penalty: 0,
    heuristic_score: 0,
    reo_index: 0.01,
    degraded_mode: false,
    threat_type: 'NONE',
    severity: 'LOW',
    matched_rules: [],
    canary_issued: false,
    canary_verified: false,
    cross_account_replay: false,
    is_simulation: true,
    ...overrides,
  };
}

test('computeSocKpis returns null averages on empty telemetry without fabricating zeros', () => {
  const kpis = computeSocKpis([]);
  assert.equal(kpis.totalRows, 0);
  assert.equal(kpis.totalBlocked, 0);
  assert.equal(kpis.canaryTrapsIssued, 0);
  assert.equal(kpis.canaryReplaysVerified, 0);
  assert.equal(kpis.avgDjs, null);
  assert.equal(kpis.avgHbio, null);
  assert.equal(kpis.simCount, 0);
  assert.equal(kpis.liveCount, 0);
});

test('computeSocKpis counts distinct canary_id traps separately from canary_replay_verified rows and ignores null metrics', () => {
  const sharedCanaryUuid = '7c3e4f91-0b8d-4f6a-9f12-111111111111';
  const secondCanaryUuid = '9a1b2c3d-4e5f-6789-abcd-222222222222';
  const rows: ReoTelemetryRow[] = [
    makeRow({
      id: '1',
      threat_type: 'exfiltration',
      action_taken: 'HONEYPOT_ENGAGED',
      severity: 'HIGH',
      canary_id: sharedCanaryUuid,
      d_js: 0.4,
      h_bio: 1.0,
      is_simulation: true,
    }),
    makeRow({
      id: '2',
      threat_type: 'canary_replay_verified',
      action_taken: 'HONEYPOT_ENGAGED',
      severity: 'CRITICAL',
      canary_id: sharedCanaryUuid,
      d_js: null,
      h_bio: 3.0,
      is_simulation: true,
    }),
    makeRow({
      id: '3',
      threat_type: 'prompt_injection',
      action_taken: 'HONEYPOT_ENGAGED',
      severity: 'CRITICAL',
      canary_id: secondCanaryUuid,
      d_js: 0.2,
      h_bio: 0.0,
      is_simulation: true,
    }),
    makeRow({
      id: '4',
      threat_type: 'benign',
      action_taken: 'ALLOWED',
      severity: 'LOW',
      canary_id: null,
      d_js: 0.0,
      h_bio: null,
      is_simulation: false,
    }),
  ];

  const kpis = computeSocKpis(rows);
  assert.equal(kpis.totalRows, 4);
  assert.equal(kpis.totalBlocked, 3);
  assert.equal(kpis.canaryTrapsIssued, 2);
  assert.equal(kpis.canaryReplaysVerified, 1);
  assert.ok(kpis.avgDjs !== null && Math.abs(kpis.avgDjs - 0.2) < 1e-9);
  assert.ok(kpis.avgHbio !== null && Math.abs(kpis.avgHbio - 4 / 3) < 1e-9);
  assert.equal(kpis.simCount, 3);
  assert.equal(kpis.liveCount, 1);
});

test('filterTelemetryRows and collectAvailableModuleFilters support red_team_lab and dynamic target_module values', () => {
  const rows: ReoTelemetryRow[] = [
    makeRow({ id: 'a', is_simulation: true, severity: 'CRITICAL', target_module: 'red_team_lab' }),
    makeRow({ id: 'b', is_simulation: false, severity: 'LOW', target_module: 'red_blue_arena' }),
    makeRow({ id: 'c', is_simulation: true, severity: 'HIGH', target_module: 'cve_patch_challenge' }),
    makeRow({ id: 'd', is_simulation: false, severity: 'MEDIUM', target_module: 'custom_edge_probe' }),
  ];

  assert.equal(filterTelemetryRows(rows, 'ALL', 'ALL', 'ALL').length, 4);
  assert.deepEqual(
    filterTelemetryRows(rows, 'SIMULATION', 'CRITICAL', 'red_team_lab').map((r) => r.id),
    ['a'],
  );
  assert.deepEqual(
    filterTelemetryRows(rows, 'LIVE', 'LOW', 'red_blue_arena').map((r) => r.id),
    ['b'],
  );
  assert.deepEqual(
    filterTelemetryRows(rows, 'SIMULATION', 'HIGH', 'cve_patch_challenge').map((r) => r.id),
    ['c'],
  );
  assert.deepEqual(
    filterTelemetryRows(rows, 'ALL', 'ALL', 'custom_edge_probe').map((r) => r.id),
    ['d'],
  );

  const availableModules = collectAvailableModuleFilters(rows);
  assert.deepEqual(availableModules, [
    'ALL',
    'm1_study_coach',
    'red_blue_arena',
    'cve_patch_challenge',
    'red_team_lab',
    'custom_edge_probe',
  ]);
});

test('resolveShieldProviderLabel defaults blocked/honeypot missing model_used to reo-static-honeypot (none)', () => {
  assert.equal(
    resolveShieldProviderLabel({
      shieldStatus: 'HONEYPOT_ENGAGED',
      blocked: true,
      modelUsed: undefined,
      providerUsed: 'none',
    }),
    'reo-static-honeypot (none)',
  );
  assert.equal(
    resolveShieldProviderLabel({
      shieldStatus: 'HONEYPOT_ENGAGED',
      blocked: true,
      modelUsed: '',
      providerUsed: undefined,
    }),
    'reo-static-honeypot (none)',
  );
  assert.equal(
    resolveShieldProviderLabel({
      shieldStatus: 'CLEAN',
      blocked: true,
      modelUsed: 'none',
      providerUsed: 'none',
    }),
    'reo-static-honeypot (none)',
  );
  assert.equal(
    resolveShieldProviderLabel({
      shieldStatus: 'CLEAN',
      blocked: false,
      modelUsed: 'qwen3.7-plus',
      providerUsed: 'qwen',
    }),
    'qwen3.7-plus (qwen)',
  );
  assert.equal(
    resolveShieldProviderLabel({
      shieldStatus: 'CLEAN',
      blocked: false,
      modelUsed: 'gemini-2.5-flash vs qwen-plus',
      providerUsed: undefined,
    }),
    'gemini-2.5-flash vs qwen-plus',
  );
});

test('buildHumanPresetHeader emits benign human flight_times_ms and paste_events=0', () => {
  const parsed = JSON.parse(buildHumanPresetHeader('sess-human-1'));
  assert.deepEqual(parsed.flight_times_ms, HUMAN_PRESET_FLIGHT_TIMES_MS);
  assert.equal(parsed.paste_events, 0);
  assert.equal(parsed.session_id, 'sess-human-1');
});

test('5-preset evaluators enforce exact defense pass criteria and canary extraction', () => {
  const p1Res: GatewayResponse = {
    reply: 'Diagnostic trace: REO-CANARY-AABBCCDDEEFF0011',
    shield_status: 'HONEYPOT_ENGAGED',
    model_used: 'honeypot',
    provider_used: 'none',
    failover_used: false,
    latency_ms: 42,
    thread_id: null,
    shield: makeShield({ blocked: true, canary_issued: true }),
  };
  const eval1 = evaluatePreset1(p1Res);
  assert.equal(eval1.verified, true);
  assert.equal(eval1.extractedCanary, 'REO-CANARY-AABBCCDDEEFF0011');

  const eval2 = evaluatePreset2(p1Res);
  assert.equal(eval2.verified, true);

  const p3Res: GatewayResponse = {
    ...p1Res,
    latency_ms: 0,
    shield: makeShield({ blocked: true, canary_verified: true }),
  };
  assert.equal(evaluatePreset3(p3Res).verified, true);
  assert.equal(evaluatePreset3({ ...p3Res, latency_ms: 5 }).verified, false);

  const p4Res: PatchVerifyResponse = {
    action: 'verify',
    shield_status: 'HONEYPOT_ENGAGED',
    lang: 'en',
    cve_id: 'cve-1',
    vuln_code: 'CVE-EDU-SIM-01',
    passed: false,
    score: 0,
    feedback: 'Intercepted',
    parse_failed: false,
    previous_status: 'VULNERABLE',
    new_status: 'VULNERABLE',
    patch_verified_at: null,
    repetition_scheduled: false,
    model_used: 'honeypot',
    provider_used: 'none',
    failover_used: false,
    latency_ms: 15,
    shield: makeShield({ blocked: true }),
  };
  assert.equal(evaluatePreset4(p4Res).verified, true);
  assert.equal(evaluatePreset4({ ...p4Res, new_status: 'PATCHED' }).verified, false);

  const p5Res: GatewayResponse = {
    reply: '4',
    shield_status: 'CLEAN',
    model_used: 'gemini-2.5-flash',
    provider_used: 'gemini',
    failover_used: false,
    latency_ms: 350,
    thread_id: null,
    shield: makeShield({ blocked: false }),
  };
  assert.equal(evaluatePreset5(p5Res).verified, true);
  assert.equal(evaluatePreset5({ ...p5Res, shield: makeShield({ blocked: true }) }).verified, false);
});

test('buildForensicExportPayload serializes filtered rows and exact distinct canary summary', () => {
  const sharedUuid = 'aaaa-bbbb-cccc';
  const json = buildForensicExportPayload(
    [
      makeRow({ id: '1', canary_id: sharedUuid, threat_type: 'exfiltration' }),
      makeRow({ id: '2', canary_id: sharedUuid, threat_type: 'canary_replay_verified' }),
    ],
    {
      source: 'ALL',
      severity: 'ALL',
      module: 'red_team_lab',
    },
  );
  const parsed = JSON.parse(json);
  assert.equal(parsed.event_count, 2);
  assert.equal(parsed.summary.canaryTrapsIssued, 1);
  assert.equal(parsed.summary.canaryReplaysVerified, 1);
  assert.equal(parsed.filters.module, 'red_team_lab');
  assert.equal(parsed.platform, 'REO AI & REO-Shield v2.0');
});
