import { useState } from 'react';
import type { ProviderUsed, ShieldStatus, ShieldTelemetry } from '../lib/api';
import type { ReoSeverity } from '../lib/supabase';
import { formatShieldMetric } from '../lib/coachUtils';
import { resolveShieldProviderLabel } from '../lib/socUtils';
import type { TranslationDictionary } from '../i18n/translations';
import {
  CheckVerifiedIcon,
  ChevronDownIcon,
  HoneypotAlertIcon,
  InspectMathIcon,
  WarningTriangleIcon,
} from './icons/NeonIcons';

interface ShieldTelemetryStripProps {
  shieldStatus: ShieldStatus;
  shield: ShieldTelemetry;
  modelUsed?: string;
  providerUsed?: ProviderUsed;
  failoverUsed?: boolean;
  latencyMs?: number;
  t: TranslationDictionary['coach']['shield'];
}

function reoIndexColorClass(severity: ReoSeverity): string {
  switch (severity) {
    case 'CRITICAL':
      return 'text-[#EF4444]';
    case 'HIGH':
      return 'text-orange-400';
    case 'MEDIUM':
      return 'text-[#F59E0B]';
    case 'LOW':
    default:
      return 'text-[#10B981]';
  }
}

export function ShieldTelemetryStrip({
  shieldStatus,
  shield,
  modelUsed,
  providerUsed,
  failoverUsed,
  latencyMs,
  t,
}: ShieldTelemetryStripProps) {
  const [expanded, setExpanded] = useState(false);

  const isBlocked = shieldStatus === 'HONEYPOT_ENGAGED' || shield.blocked;
  const reoColor = reoIndexColorClass(shield.severity);
  const dJsDisplay = formatShieldMetric(shield.d_js, 4);
  const hBioDisplay = formatShieldMetric(shield.h_bio, 2);
  const cvDisplay = formatShieldMetric(shield.cv_ratio, 2);
  const reoIndexDisplay = formatShieldMetric(shield.reo_index, 3);
  const consensusMalDisplay = formatShieldMetric(shield.consensus_mal, 4);
  const bioPenaltyDisplay = formatShieldMetric(shield.bio_penalty, 3);
  const heuristicScoreDisplay = formatShieldMetric(shield.heuristic_score, 2);

  const providerLabel = resolveShieldProviderLabel({
    shieldStatus,
    blocked: shield.blocked,
    modelUsed,
    providerUsed,
  });

  return (
    <div
      data-testid="shield-telemetry-strip"
      className={`mt-3 rounded-lg border font-mono-tabular text-[11px] sm:text-xs ${
        isBlocked
          ? 'border-[#EF4444]/35 bg-[#070B14]/95'
          : 'border-[#00F0FF]/18 bg-[#070B14]/90'
      }`}
    >
      <div className="px-3 py-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 min-w-0">
          {/* Status Indicator */}
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-semibold whitespace-nowrap ${
              isBlocked
                ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40'
                : 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/35'
            }`}
          >
            {isBlocked ? <HoneypotAlertIcon size={13} /> : <CheckVerifiedIcon size={13} />}
            <span>{isBlocked ? t.statusHoneypot : t.statusClean}</span>
          </span>

          {/* Exact Server Metrics */}
          <span className="text-slate-400 whitespace-nowrap">
            {t.reoIndex}:{' '}
            <span className={`font-semibold ${reoColor}`}>{reoIndexDisplay}</span>
          </span>

          <span className="text-slate-600" aria-hidden="true">
            ·
          </span>

          <span className="text-slate-400 whitespace-nowrap">
            {t.dJs}: <span className="text-slate-200">{dJsDisplay}</span>
          </span>

          <span className="text-slate-600" aria-hidden="true">
            ·
          </span>

          <span className="text-slate-400 whitespace-nowrap">
            {t.hBio}: <span className="text-slate-200">{hBioDisplay}</span>
          </span>

          <span className="text-slate-600" aria-hidden="true">
            ·
          </span>

          <span className="text-slate-400 whitespace-nowrap">
            {t.cv}: <span className="text-slate-200">{cvDisplay}</span>
          </span>

          <span className="text-slate-600" aria-hidden="true">
            ·
          </span>

          <span className="text-slate-300 truncate max-w-[300px]" title={providerLabel}>
            {providerLabel}
          </span>

          {typeof latencyMs === 'number' && Number.isFinite(latencyMs) && (
            <>
              <span className="text-slate-600" aria-hidden="true">
                ·
              </span>
              <span className="text-slate-400 whitespace-nowrap">{Math.round(latencyMs)} ms</span>
            </>
          )}

          {failoverUsed === true && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/40 font-semibold whitespace-nowrap">
              <WarningTriangleIcon size={12} />
              <span>{t.failoverBadge}</span>
            </span>
          )}

          {shield.degraded_mode === true && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/40 font-semibold whitespace-nowrap">
              <WarningTriangleIcon size={12} />
              <span>{t.degradedBadge}</span>
            </span>
          )}
        </div>

        {/* Expandable Math Shield Toggle */}
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] text-[#00F0FF] hover:bg-[#00F0FF]/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <InspectMathIcon size={13} />
          <span>{expanded ? t.hideToggle : t.inspectToggle}</span>
          <ChevronDownIcon
            size={13}
            className={`transition-transform duration-150 ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {expanded && (
        <div
          data-testid="math-shield-breakdown"
          className="px-3.5 py-3 border-t border-slate-800/90 bg-[#050810] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
        >
          <div>
            <div className="text-[10px] text-slate-500">{t.consensusMal}</div>
            <div className="text-slate-100 mt-0.5">{consensusMalDisplay}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500">{t.bioPenalty}</div>
            <div className="text-slate-100 mt-0.5">{bioPenaltyDisplay}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500">{t.heuristicScore}</div>
            <div className="text-slate-100 mt-0.5">{heuristicScoreDisplay}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500">{t.threatType}</div>
            <div className="text-slate-100 mt-0.5 break-all">{shield.threat_type}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500">{t.severity}</div>
            <div className={`mt-0.5 font-semibold ${reoColor}`}>{shield.severity}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500">{t.canaryIssued}</div>
            <div className="text-slate-200 mt-0.5">
              {shield.canary_issued ? t.yesLabel : t.noLabel}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500">{t.canaryVerified}</div>
            <div
              className={`mt-0.5 ${
                shield.canary_verified ? 'text-[#EF4444] font-semibold' : 'text-slate-200'
              }`}
            >
              {shield.canary_verified ? t.yesLabel : t.noLabel}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500">{t.crossAccountReplay}</div>
            <div
              className={`mt-0.5 ${
                shield.cross_account_replay ? 'text-[#EF4444] font-semibold' : 'text-slate-200'
              }`}
            >
              {shield.cross_account_replay ? t.yesLabel : t.noLabel}
            </div>
          </div>
          <div className="col-span-2">
            <div className="text-[10px] text-slate-500">{t.matchedRules}</div>
            <div className="text-slate-200 mt-0.5 break-words">
              {shield.matched_rules && shield.matched_rules.length > 0
                ? shield.matched_rules.join(', ')
                : t.noneLabel}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
