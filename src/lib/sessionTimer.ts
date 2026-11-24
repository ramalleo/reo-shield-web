export type TimerUrgency = 'nominal' | 'warning' | 'expired';

export function computeRemainingSeconds(expiresAtIso: string | null | undefined, nowMs: number = Date.now()): number {
  if (!expiresAtIso) {
    return 0;
  }
  const expiresMs = Date.parse(expiresAtIso);
  if (!Number.isFinite(expiresMs)) {
    return 0;
  }
  return Math.max(0, Math.floor((expiresMs - nowMs) / 1000));
}

export function formatCountdown(remainingSeconds: number): string {
  const clamped = Math.max(0, Math.floor(remainingSeconds));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, '0')).join(':');
}

export function getTimerUrgency(remainingSeconds: number): TimerUrgency {
  if (remainingSeconds <= 0) {
    return 'expired';
  }
  if (remainingSeconds <= 600) {
    return 'warning';
  }
  return 'nominal';
}

export type ReoErrorCode =
  | 'demo_session_expired'
  | 'unauthorized'
  | 'rate_limit_exceeded'
  | 'network_error'
  | 'server_error';

export class ReoApiError extends Error {
  public readonly status: number;
  public readonly code: ReoErrorCode;
  public readonly retryAfterSeconds: number | null;
  public readonly details?: unknown;

  constructor(params: {
    message: string;
    status: number;
    code: ReoErrorCode;
    retryAfterSeconds?: number | null;
    details?: unknown;
  }) {
    super(params.message);
    this.name = 'ReoApiError';
    this.status = params.status;
    this.code = params.code;
    this.retryAfterSeconds = params.retryAfterSeconds ?? null;
    this.details = params.details;
  }
}

export function classifyEdgeError(
  status: number,
  body: Record<string, unknown> | null,
  retryAfterHeader?: string | null,
): ReoApiError {
  const rawError = typeof body?.error === 'string' ? body.error : '';
  const rawCode = typeof body?.code === 'string' ? body.code : rawError;
  const rawMessage = typeof body?.message === 'string' ? body.message : '';

  const parsedRetry =
    retryAfterHeader && /^\d+$/.test(retryAfterHeader.trim())
      ? Number.parseInt(retryAfterHeader.trim(), 10)
      : typeof body?.retry_after === 'number'
        ? body.retry_after
        : null;

  if (status === 401) {
    const isDemoExpired =
      rawCode.toLowerCase().includes('demo_session_expired') ||
      rawMessage.toLowerCase().includes('demo_session_expired') ||
      rawError.toLowerCase().includes('demo_session_expired');

    return new ReoApiError({
      status: 401,
      code: isDemoExpired ? 'demo_session_expired' : 'unauthorized',
      message: rawMessage || rawError || (isDemoExpired ? 'demo_session_expired' : 'unauthorized'),
      details: body,
    });
  }

  if (status === 429) {
    return new ReoApiError({
      status: 429,
      code: 'rate_limit_exceeded',
      retryAfterSeconds: parsedRetry,
      message: rawMessage || rawError || 'rate_limit_exceeded',
      details: body,
    });
  }

  return new ReoApiError({
    status,
    code: 'server_error',
    message: rawMessage || rawError || `HTTP ${status}`,
    details: body,
  });
}
