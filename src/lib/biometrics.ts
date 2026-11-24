import { useCallback, useRef, useState } from 'react';
import type { ClipboardEvent, KeyboardEvent } from 'react';

export const MAX_FLIGHT_BUFFER = 120;
export const MIN_FLIGHT_MS = 0;
export const MAX_FLIGHT_MS = 10000;

export interface KeystrokeTelemetryPayload {
  flight_times_ms: number[];
  paste_events: number;
  session_id: string;
}

export function generateTelemetrySessionId(): string {
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(bytes);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Pure helper to append a keystroke inter-key flight interval into a capped buffer.
 * Keeps strictly intervals where interval > 0 and interval < 10000 ms, capped at last 120 values.
 */
export function appendFlightInterval(
  buffer: readonly number[],
  intervalMs: number,
  maxLength: number = MAX_FLIGHT_BUFFER,
): number[] {
  if (!Number.isFinite(intervalMs) || intervalMs <= MIN_FLIGHT_MS || intervalMs >= MAX_FLIGHT_MS) {
    return [...buffer];
  }
  const rounded = Math.round(intervalMs);
  if (rounded <= MIN_FLIGHT_MS || rounded >= MAX_FLIGHT_MS) {
    return [...buffer];
  }
  const next = [...buffer, rounded];
  return next.length > maxLength ? next.slice(next.length - maxLength) : next;
}

export function serializeTelemetryHeader(payload: KeystrokeTelemetryPayload): string {
  return JSON.stringify({
    flight_times_ms: payload.flight_times_ms.slice(-MAX_FLIGHT_BUFFER),
    paste_events: Math.max(0, Math.floor(payload.paste_events)),
    session_id: payload.session_id,
  });
}

/**
 * Exported strictly for the Attack Simulator's bot-cadence test preset.
 * Produces deterministic mechanical 10ms flight cadence with a paste event.
 */
export function buildBotPresetHeader(sessionId?: string): string {
  return serializeTelemetryHeader({
    flight_times_ms: [10, 10, 10, 10, 10],
    paste_events: 1,
    session_id: sessionId || generateTelemetrySessionId(),
  });
}

let tabSessionIdCache: string | null = null;
function getTabSessionId(): string {
  if (!tabSessionIdCache) {
    tabSessionIdCache = generateTelemetrySessionId();
  }
  return tabSessionIdCache;
}

export interface KeystrokeTelemetryHook {
  sessionId: string;
  sampleCount: number;
  pasteEvents: number;
  lastFlightMs: number | null;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  onPaste: (event: ClipboardEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  buildHeader: () => string;
  reset: () => void;
}

/**
 * Reusable keystroke biometrics hook for prompt and answer inputs.
 * Captures inter-key flight times (0 < dt < 10000 ms, max 120 samples) and paste counts,
 * serializing into the `x-reo-telemetry` JSON HTTP header on submission.
 */
export function useKeystrokeTelemetry(): KeystrokeTelemetryHook {
  const sessionIdRef = useRef<string>(getTabSessionId());
  const flightTimesRef = useRef<number[]>([]);
  const pasteEventsRef = useRef<number>(0);
  const lastKeyDownMsRef = useRef<number | null>(null);

  const [sampleCount, setSampleCount] = useState<number>(0);
  const [pasteEvents, setPasteEvents] = useState<number>(0);
  const [lastFlightMs, setLastFlightMs] = useState<number | null>(null);

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (event.repeat) {
      return;
    }
    const now = Date.now();
    const prev = lastKeyDownMsRef.current;
    lastKeyDownMsRef.current = now;

    if (prev !== null) {
      const dt = now - prev;
      if (dt > MIN_FLIGHT_MS && dt < MAX_FLIGHT_MS) {
        const nextBuffer = appendFlightInterval(flightTimesRef.current, dt, MAX_FLIGHT_BUFFER);
        flightTimesRef.current = nextBuffer;
        setSampleCount(nextBuffer.length);
        setLastFlightMs(Math.round(dt));
      }
    }
  }, []);

  const onPaste = useCallback((_event: ClipboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    pasteEventsRef.current += 1;
    setPasteEvents(pasteEventsRef.current);
  }, []);

  const buildHeader = useCallback((): string => {
    return serializeTelemetryHeader({
      flight_times_ms: flightTimesRef.current,
      paste_events: pasteEventsRef.current,
      session_id: sessionIdRef.current,
    });
  }, []);

  const reset = useCallback((): void => {
    flightTimesRef.current = [];
    pasteEventsRef.current = 0;
    lastKeyDownMsRef.current = null;
    setSampleCount(0);
    setPasteEvents(0);
    setLastFlightMs(null);
  }, []);

  return {
    sessionId: sessionIdRef.current,
    sampleCount,
    pasteEvents,
    lastFlightMs,
    onKeyDown,
    onPaste,
    buildHeader,
    reset,
  };
}
