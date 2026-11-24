import { useState } from 'react';
import type { ProviderUsed, ShieldStatus, ShieldTelemetry } from '../lib/api';
import { extractCanaryTokens } from '../lib/coachUtils';
import type { TranslationDictionary } from '../i18n/translations';
import { ShieldTelemetryStrip } from './ShieldTelemetryStrip';
import {
  CheckVerifiedIcon,
  CopyClipboardIcon,
  HoneypotAlertIcon,
  ShieldCoreIcon,
  TerminalCodeIcon,
} from './icons/NeonIcons';

interface HoneypotInterceptCardProps {
  reply: string;
  shieldStatus: ShieldStatus;
  shield?: ShieldTelemetry;
  modelUsed?: string;
  providerUsed?: ProviderUsed;
  failoverUsed?: boolean;
  latencyMs?: number;
  t: TranslationDictionary['coach'];
}

export function HoneypotInterceptCard({
  reply,
  shieldStatus,
  shield,
  modelUsed,
  providerUsed,
  failoverUsed,
  latencyMs,
  t,
}: HoneypotInterceptCardProps) {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const extractedCanaries = extractCanaryTokens(reply);

  const handleCopyToken = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      setCopiedToken(token);
      window.setTimeout(() => setCopiedToken(null), 1800);
    } catch {
      // Clipboard API unavailable
    }
  };

  return (
    <div
      role="alert"
      data-testid="honeypot-intercept-card"
      className="rounded-xl border border-[#EF4444]/50 bg-[#1A0B12]/90 p-4 sm:p-5 space-y-4"
    >
      {/* Intercept Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EF4444]/25">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/45 flex items-center justify-center text-[#EF4444] shrink-0">
            <HoneypotAlertIcon size={18} />
          </div>
          <span className="font-mono-tabular text-xs sm:text-sm font-semibold text-red-200 tracking-wide">
            {t.honeypot.bannerTitle}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {providerUsed === 'none' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#10B981]/12 border border-[#10B981]/40 text-[11px] font-mono-tabular font-semibold text-[#10B981] whitespace-nowrap">
              <ShieldCoreIcon size={13} />
              <span>{t.honeypot.zeroSpendBadge}</span>
            </span>
          )}

          {shield?.canary_verified && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EF4444]/20 border border-[#EF4444]/50 text-[11px] font-mono-tabular font-semibold text-red-100 whitespace-nowrap">
              <HoneypotAlertIcon size={13} />
              <span>{t.honeypot.canaryVerifiedBadge}</span>
            </span>
          )}

          {!shield?.canary_verified && shield?.canary_issued && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F59E0B]/15 border border-[#F59E0B]/45 text-[11px] font-mono-tabular font-semibold text-[#F59E0B] whitespace-nowrap">
              <ShieldCoreIcon size={13} />
              <span>{t.honeypot.canaryIssuedBadge}</span>
            </span>
          )}
        </div>
      </div>

      {/* Threat Classification Metadata */}
      {shield && (
        <div className="space-y-2.5 text-xs font-mono-tabular">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div>
              <span className="text-red-300/70">{t.honeypot.threatLabel}: </span>
              <span className="text-red-100 font-semibold">{shield.threat_type}</span>
            </div>
            <div>
              <span className="text-red-300/70">{t.honeypot.severityLabel}: </span>
              <span className="text-[#EF4444] font-semibold">{shield.severity}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start gap-2">
            <span className="text-red-300/70 shrink-0 pt-0.5">{t.honeypot.rulesLabel}:</span>
            <div className="flex flex-wrap gap-1.5 min-w-0">
              {shield.matched_rules && shield.matched_rules.length > 0 ? (
                shield.matched_rules.map((rule) => (
                  <span
                    key={rule}
                    className="inline-flex items-center px-2 py-0.5 rounded bg-[#EF4444]/15 border border-[#EF4444]/35 text-[11px] text-red-100 break-all"
                  >
                    {rule}
                  </span>
                ))
              ) : (
                <span className="text-red-200/75 pt-0.5">{t.shield.noneLabel}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Extracted Canary Tokens with Copy Button */}
      {extractedCanaries.length > 0 && (
        <div className="rounded-lg border border-[#F59E0B]/40 bg-[#070B14]/90 p-3 space-y-2">
          <div className="text-[11px] font-mono-tabular text-[#F59E0B] font-semibold">
            {t.honeypot.canaryTokenLabel}
          </div>
          <div className="space-y-1.5">
            {extractedCanaries.map((token) => (
              <div
                key={token}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-[#0E1525] border border-[#F59E0B]/30 px-3 py-1.5"
              >
                <code className="font-mono-tabular text-xs sm:text-[13px] text-amber-200 select-all break-all">
                  {token}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopyToken(token)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F59E0B]/15 hover:bg-[#F59E0B]/25 text-[#F59E0B] text-[11px] font-mono-tabular font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copiedToken === token ? (
                    <>
                      <CheckVerifiedIcon size={13} />
                      <span>{t.honeypot.copiedCanary}</span>
                    </>
                  ) : (
                    <>
                      <CopyClipboardIcon size={13} />
                      <span>{t.honeypot.copyCanary}</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dark Monospace Diagnostic Terminal Block */}
      <div className="rounded-lg border border-[#EF4444]/30 bg-[#070B14] overflow-hidden">
        <div className="px-3.5 py-2 border-b border-slate-800/90 flex items-center gap-2 text-[11px] font-mono-tabular text-red-300/80">
          <TerminalCodeIcon size={14} className="text-[#EF4444]" />
          <span>{t.honeypot.terminalLabel}</span>
        </div>
        <pre className="p-3.5 text-xs sm:text-[13px] font-mono-tabular text-slate-200 whitespace-pre-wrap break-words leading-relaxed">
          {reply}
        </pre>
      </div>

      <p className="text-[11px] text-red-200/70">{t.honeypot.localOnlyNote}</p>

      {/* Live Shield Telemetry Strip */}
      {shield && (
        <ShieldTelemetryStrip
          shieldStatus={shieldStatus}
          shield={shield}
          modelUsed={modelUsed}
          providerUsed={providerUsed}
          failoverUsed={failoverUsed}
          latencyMs={latencyMs}
          t={t.shield}
        />
      )}
    </div>
  );
}
