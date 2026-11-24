import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyEdgeError,
  computeRemainingSeconds,
  formatCountdown,
  getTimerUrgency,
} from './sessionTimer';

test('computeRemainingSeconds and formatCountdown calculate accurate HH:MM:SS', () => {
  const now = Date.parse('2026-11-23T12:00:00.000Z');
  const expires = '2026-11-23T13:59:05.000Z';
  const remaining = computeRemainingSeconds(expires, now);
  assert.equal(remaining, 7145);
  assert.equal(formatCountdown(remaining), '01:59:05');
});

test('computeRemainingSeconds clamps expired timestamps to 0', () => {
  const now = Date.parse('2026-11-23T15:00:00.000Z');
  const expires = '2026-11-23T14:00:00.000Z';
  assert.equal(computeRemainingSeconds(expires, now), 0);
  assert.equal(formatCountdown(0), '00:00:00');
});

test('getTimerUrgency classifies nominal, warning, and expired thresholds', () => {
  assert.equal(getTimerUrgency(3600), 'nominal');
  assert.equal(getTimerUrgency(600), 'warning');
  assert.equal(getTimerUrgency(1), 'warning');
  assert.equal(getTimerUrgency(0), 'expired');
});

test('classifyEdgeError maps HTTP 401 demo_session_expired and unauthorized cleanly', () => {
  const expiredErr = classifyEdgeError(401, { error: 'demo_session_expired' });
  assert.equal(expiredErr.status, 401);
  assert.equal(expiredErr.code, 'demo_session_expired');

  const unauthErr = classifyEdgeError(401, { error: 'unauthorized' });
  assert.equal(unauthErr.status, 401);
  assert.equal(unauthErr.code, 'unauthorized');
});

test('classifyEdgeError maps HTTP 429 rate_limit_exceeded with Retry-After header', () => {
  const rateErr = classifyEdgeError(429, { error: 'rate_limit_exceeded' }, '45');
  assert.equal(rateErr.status, 429);
  assert.equal(rateErr.code, 'rate_limit_exceeded');
  assert.equal(rateErr.retryAfterSeconds, 45);
});
