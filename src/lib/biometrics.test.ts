import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_FLIGHT_BUFFER,
  appendFlightInterval,
  buildBotPresetHeader,
  serializeTelemetryHeader,
} from './biometrics';

test('appendFlightInterval filters out non-positive and >= 10000ms intervals', () => {
  let buf: number[] = [];
  buf = appendFlightInterval(buf, 0);
  buf = appendFlightInterval(buf, -50);
  buf = appendFlightInterval(buf, 10000);
  buf = appendFlightInterval(buf, 15000);
  buf = appendFlightInterval(buf, Number.NaN);
  assert.deepEqual(buf, []);

  buf = appendFlightInterval(buf, 145.4);
  buf = appendFlightInterval(buf, 9999.2);
  assert.deepEqual(buf, [145, 9999]);
});

test('appendFlightInterval caps buffer at 120 most recent values', () => {
  let buf: number[] = [];
  for (let i = 1; i <= 150; i += 1) {
    buf = appendFlightInterval(buf, i * 10);
  }
  assert.equal(buf.length, MAX_FLIGHT_BUFFER);
  assert.equal(buf[0], 310);
  assert.equal(buf[buf.length - 1], 1500);
});

test('serializeTelemetryHeader emits exact x-reo-telemetry JSON contract', () => {
  const header = serializeTelemetryHeader({
    flight_times_ms: [110, 95, 142],
    paste_events: 2,
    session_id: 'session-abc-123',
  });
  const parsed = JSON.parse(header) as Record<string, unknown>;
  assert.deepEqual(parsed, {
    flight_times_ms: [110, 95, 142],
    paste_events: 2,
    session_id: 'session-abc-123',
  });
});

test('buildBotPresetHeader emits deterministic bot cadence with paste_events=1', () => {
  const header = buildBotPresetHeader('bot-sim-session');
  const parsed = JSON.parse(header) as Record<string, unknown>;
  assert.deepEqual(parsed, {
    flight_times_ms: [10, 10, 10, 10, 10],
    paste_events: 1,
    session_id: 'bot-sim-session',
  });
});
