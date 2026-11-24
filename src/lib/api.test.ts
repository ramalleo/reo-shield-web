import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDemoSessionResponse } from './api';

test('normalizeDemoSessionResponse supports nested session payload from production Edge Function', () => {
  const result = normalizeDemoSessionResponse({
    session: {
      access_token: 'tok-nested-access',
      refresh_token: 'tok-nested-refresh',
      expires_in: 3600,
      token_type: 'bearer',
    },
    user: {
      id: 'user-1',
      email: 'jury-123@demo.reo-shield.local',
      is_demo_jury: true,
      expires_at: '2026-11-23T23:55:00.000Z',
    },
  });

  assert.equal(result.access_token, 'tok-nested-access');
  assert.equal(result.refresh_token, 'tok-nested-refresh');
  assert.equal(result.expires_in, 3600);
  assert.equal(result.user.is_demo_jury, true);
});

test('normalizeDemoSessionResponse supports flat payload contract', () => {
  const result = normalizeDemoSessionResponse({
    access_token: 'tok-flat-access',
    refresh_token: 'tok-flat-refresh',
    expires_in: 7200,
    token_type: 'bearer',
    user: {
      id: 'user-2',
      email: 'jury-456@demo.reo-shield.local',
      is_demo_jury: true,
      expires_at: '2026-11-23T23:55:00.000Z',
    },
  });

  assert.equal(result.access_token, 'tok-flat-access');
  assert.equal(result.refresh_token, 'tok-flat-refresh');
  assert.equal(result.expires_in, 7200);
});

test('normalizeDemoSessionResponse throws ReoApiError on malformed payload', () => {
  assert.throws(() => {
    normalizeDemoSessionResponse({});
  }, /Malformed demo session payload/);
});
