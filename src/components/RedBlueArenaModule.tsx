import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import type { ReoArbiterVerdict, ReoArenaRun, ReoCveRecord } from '../lib/supabase';
import { callReoArena, ReoApiError } from '../lib/api';
import type {
  ArenaTeamOutput,
  ModelProfile,
  ReoLang,
  ReoSubject,
  ShieldStatus,
  ShieldTelemetry,
} from '../lib/api';
import { useKeystrokeTelemetry } from '../lib/biometrics';
import {
  MAX_PROMPT_LENGTH,
  MODEL_PROFILES,
  REO_SUBJECTS,
  shortSessionHash,
} from '../lib/coachUtils';
import {
  formatFamilyPairingLabel,
  getDefaultOppositeProfile,
  getOppositeFamilyProfiles,
  isOppositeFamilyPair,
} from '../lib/milestone3Utils';
import type { TranslationDictionary } from '../i18n/translations';
import { SafeMarkdown } from './SafeMarkdown';
import { ShieldTelemetryStrip } from './ShieldTelemetryStrip';
import { HoneypotInterceptCard } from './HoneypotInterceptCard';
import {
  ArbiterScaleIcon,
  AuditArenaIcon,
  BiometricsPulseIcon,
  BoltFastIcon,
  BrainDeepIcon,
  CheckVerifiedIcon,
  CloseXIcon,
  CpuPlusIcon,
  HistoryLogIcon,
  HoneypotAlertIcon,
  LayersMaxIcon,
  LinkCveIcon,
  PlusSessionIcon,
  RefreshSyncIcon,
  SendArrowIcon,
  SignOutIcon,
  WarningTriangleIcon,
} from './icons/NeonIcons';

interface RedBlueArenaModuleProps {
  accessToken: string;
  userId: string;
  lang: ReoLang;
  t: TranslationDictionary;
  isDemoJury: boolean;
  onRenewSandbox: () => Promise<void>;
  renewingSandbox: boolean;
  onSignOut: () => Promise<void>;
}

interface ArenaInlineError {
  kind: '401' | '429' | 'network' | 'db';
  title: string;
  description: string;
}

interface ActiveArenaView {
  source: 'live' | 'history';
  runId: string | null;
  prompt: string;
  subject?: string;
  linkedCveId: string | null;
  arbiterVerdict: ReoArbiterVerdict;
  shieldStatus: ShieldStatus;
  crossFamilyVerified?: boolean;
  totalLatencyMs?: number;
  blueTeam: {
    text: string;
    modelUsed: string;
    providerUsed?: 'gemini' | 'qwen';
    failoverUsed?: boolean;
    latencyMs?: number;
  } | null;
  redTeam: {
    text: string;
    modelUsed: string;
    providerUsed?: 'gemini' | 'qwen';
    failoverUsed?: boolean;
    latencyMs?: number;
  } | null;
  honeypotReply?: string;
  shield?: ShieldTelemetry;
  createdAt?: string;
}

function ProfileIcon({ profile, size = 14 }: { profile: ModelProfile; size?: number }) {
  switch (profile) {
    case 'fast':
      return <BoltFastIcon size={size} />;
    case 'deep':
      return <BrainDeepIcon size={size} />;
    case 'qwen_plus':
      return <CpuPlusIcon size={size} />;
    case 'qwen_max':
      return <LayersMaxIcon size={size} />;
  }
}

function formatVerdictBadge(
  verdict: ReoArbiterVerdict,
  arenaT: TranslationDictionary['arena'],
): { label: string; className: string } {
  switch (verdict) {
    case 'blue_clean':
      return {
        label: arenaT.verdictBlueClean,
        className: 'bg-[#00F0FF]/12 text-[#00F0FF] border-[#00F0FF]/40',
      };
    case 'red_found_flaw':
      return {
        label: arenaT.verdictRedFoundFlaw,
        className: 'bg-[#EF4444]/15 text-red-200 border-[#EF4444]/45',
      };
    case 'pending':
    default:
      return {
        label: arenaT.verdictPending,
        className: 'bg-slate-800/80 text-slate-300 border-slate-700/80',
      };
  }
}

function mapTeamOutput(team: ArenaTeamOutput) {
  return {
    text: team.text,
    modelUsed: team.model_used,
    providerUsed: team.provider_used,
    failoverUsed: team.failover_used,
    latencyMs: team.latency_ms,
  };
}

export function RedBlueArenaModule({
  accessToken,
  userId,
  lang,
  t,
  isDemoJury,
  onRenewSandbox,
  renewingSandbox,
  onSignOut,
}: RedBlueArenaModuleProps) {
  const [prompt, setPrompt] = useState('');
  const [subject, setSubject] = useState<ReoSubject>('Cybersecurity');
  const [blueProfile, setBlueProfile] = useState<ModelProfile>('fast');
  const [redProfile, setRedProfile] = useState<ModelProfile>('qwen_plus');
  const [deepAudit, setDeepAudit] = useState(false);
  const [linkedCveId, setLinkedCveId] = useState('');

  const [cveOptions, setCveOptions] = useState<ReoCveRecord[]>([]);
  const [historyRuns, setHistoryRuns] = useState<ReoArenaRun[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);

  const [running, setRunning] = useState(false);
  const [updatingVerdict, setUpdatingVerdict] = useState<ReoArbiterVerdict | null>(null);
  const [activeView, setActiveView] = useState<ActiveArenaView | null>(null);
  const [errorState, setErrorState] = useState<ArenaInlineError | null>(null);

  const biometrics = useKeystrokeTelemetry();
  const oppositeProfiles = useMemo(
    () => getOppositeFamilyProfiles(blueProfile),
    [blueProfile],
  );
  const pairingLabel = useMemo(
    () => formatFamilyPairingLabel(blueProfile, redProfile),
    [blueProfile, redProfile],
  );

  const cveMap = useMemo(() => {
    const map = new Map<string, ReoCveRecord>();
    for (const rec of cveOptions) {
      map.set(rec.id, rec);
    }
    return map;
  }, [cveOptions]);

  const loadArenaData = useCallback(async () => {
    setHistoryLoading(true);
    const [runsRes, cveRes] = await Promise.all([
      supabase
        .from('reo_arena_runs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(25),
      supabase
        .from('reo_cve_records')
        .select('*')
        .order('created_at', { ascending: false }),
    ]);

    if (runsRes.error) {
      setErrorState({
        kind: 'db',
        title: t.arena.errorLoadHistory,
        description: runsRes.error.message,
      });
    } else {
      setHistoryRuns((runsRes.data ?? []) as ReoArenaRun[]);
    }

    if (!cveRes.error && cveRes.data) {
      setCveOptions(cveRes.data as ReoCveRecord[]);
    }
    setHistoryLoading(false);
  }, [t.arena.errorLoadHistory]);

  useEffect(() => {
    void loadArenaData();
  }, [loadArenaData, userId]);

  const handleBlueProfileChange = (nextBlue: ModelProfile) => {
    setBlueProfile(nextBlue);
    if (!isOppositeFamilyPair(nextBlue, redProfile)) {
      setRedProfile(getDefaultOppositeProfile(nextBlue));
    }
  };

  const handleSelectHistoryRun = (run: ReoArenaRun) => {
    setErrorState(null);
    setActiveView({
      source: 'history',
      runId: run.id,
      prompt: run.prompt,
      linkedCveId: run.linked_cve_id,
      arbiterVerdict: run.arbiter_verdict,
      shieldStatus: 'CLEAN',
      blueTeam: {
        text: run.blue_response,
        modelUsed: run.blue_model,
      },
      redTeam: {
        text: run.red_response,
        modelUsed: run.red_model,
      },
      createdAt: run.created_at,
    });
  };

  const handleArbiterVerdict = async (verdict: 'blue_clean' | 'red_found_flaw') => {
    if (!activeView?.runId || updatingVerdict) {
      return;
    }
    setUpdatingVerdict(verdict);
    setErrorState(null);

    const { error } = await supabase
      .from('reo_arena_runs')
      .update({ arbiter_verdict: verdict })
      .eq('id', activeView.runId);

    if (error) {
      setErrorState({
        kind: 'db',
        title: t.arena.errorUpdateVerdict,
        description: error.message,
      });
      setUpdatingVerdict(null);
      return;
    }

    setActiveView((prev) =>
      prev && prev.runId === activeView.runId ? { ...prev, arbiterVerdict: verdict } : prev,
    );
    setHistoryRuns((prev) =>
      prev.map((run) =>
        run.id === activeView.runId ? { ...run, arbiter_verdict: verdict } : run,
      ),
    );
    setUpdatingVerdict(null);
  };

  const handleSubmit = async (e?: FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    const submittedPrompt = prompt.trim();
    if (!submittedPrompt || running) {
      return;
    }

    setErrorState(null);
    setRunning(true);

    const telemetryHeader = biometrics.buildHeader();
    setPrompt('');
    biometrics.reset();

    try {
      const response = await callReoArena(
        {
          prompt: submittedPrompt,
          lang,
          subject,
          blue_profile: blueProfile,
          red_profile: redProfile,
          deep_audit: deepAudit,
          linked_cve_id: linkedCveId || undefined,
          is_simulation: false,
        },
        {
          accessToken,
          telemetryHeader,
        },
      );

      if (response.shield_status === 'HONEYPOT_ENGAGED' || response.shield?.blocked) {
        const blockedReply =
          'reply' in response && typeof response.reply === 'string'
            ? response.reply
            : t.coach.honeypot.terminalLabel;
        setActiveView({
          source: 'live',
          runId: null,
          prompt: submittedPrompt,
          subject,
          linkedCveId: linkedCveId || null,
          arbiterVerdict: 'pending',
          shieldStatus: 'HONEYPOT_ENGAGED',
          crossFamilyVerified: false,
          totalLatencyMs: response.total_latency_ms,
          blueTeam: null,
          redTeam: null,
          honeypotReply: blockedReply,
          shield: response.shield,
        });
      } else {
        setActiveView({
          source: 'live',
          runId: response.run_id,
          prompt: submittedPrompt,
          subject: response.subject,
          linkedCveId: response.linked_cve_id,
          arbiterVerdict: response.arbiter_verdict,
          shieldStatus: 'CLEAN',
          crossFamilyVerified: response.cross_family_verified,
          totalLatencyMs: response.total_latency_ms,
          blueTeam: mapTeamOutput(response.blue_team),
          redTeam: mapTeamOutput(response.red_team),
          shield: response.shield,
        });

        // reo-arena persists clean runs server-side — only refresh SELECT list, never INSERT
        const { data: refreshedRuns } = await supabase
          .from('reo_arena_runs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(25);
        if (refreshedRuns) {
          setHistoryRuns(refreshedRuns as ReoArenaRun[]);
        }
      }
    } catch (err) {
      if (err instanceof ReoApiError) {
        if (err.code === 'demo_session_expired' || err.code === 'unauthorized') {
          setErrorState({
            kind: '401',
            title: t.coach.error401Title,
            description: t.coach.error401Desc,
          });
        } else if (err.code === 'rate_limit_exceeded') {
          setPrompt(submittedPrompt);
          setErrorState({
            kind: '429',
            title: t.coach.error429Title,
            description: t.coach.error429Desc,
          });
        } else {
          setPrompt(submittedPrompt);
          setErrorState({
            kind: 'network',
            title: t.coach.errorNetworkTitle,
            description: err.message || t.arena.errorNetworkDesc,
          });
        }
      } else {
        setPrompt(submittedPrompt);
        setErrorState({
          kind: 'network',
          title: t.coach.errorNetworkTitle,
          description: t.arena.errorNetworkDesc,
        });
      }
    } finally {
      setRunning(false);
    }
  };

  const linkedCveObj = activeView?.linkedCveId ? cveMap.get(activeView.linkedCveId) : null;
  const activeVerdictMeta = activeView
    ? formatVerdictBadge(activeView.arbiterVerdict, t.arena)
    : null;

  return (
    <div className="space-y-5" data-testid="red-blue-arena-module">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF] shrink-0">
            <AuditArenaIcon size={21} />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-50">
              {t.arena.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 max-w-3xl">
              {t.arena.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeView && (
            <button
              type="button"
              onClick={() => setActiveView(null)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700/80 bg-[#0E1525] text-xs text-slate-200 hover:border-[#00F0FF]/40 hover:text-[#00F0FF] transition-colors cursor-pointer"
            >
              <PlusSessionIcon size={14} />
              <span>{t.arena.clearActiveRun}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setHistoryOpen((prev) => !prev)}
            data-testid="arena-history-toggle"
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              historyOpen
                ? 'border-[#00F0FF]/45 bg-[#00F0FF]/12 text-[#00F0FF]'
                : 'border-slate-700/80 bg-[#0E1525] text-slate-200 hover:border-[#00F0FF]/35'
            }`}
          >
            <HistoryLogIcon size={15} />
            <span>{historyOpen ? t.arena.historyToggleHide : t.arena.historyToggleShow}</span>
            <span className="font-mono-tabular text-[11px] px-1.5 py-0.5 rounded bg-[#070B14] border border-slate-800 text-slate-300">
              {historyRuns.length}
            </span>
          </button>
        </div>
      </div>

      {/* Collapsible Past Arena Runs Panel */}
      {historyOpen && (
        <section
          data-testid="arena-history-panel"
          className="soc-surface rounded-xl p-4 sm:p-5 space-y-3"
        >
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <HistoryLogIcon size={16} className="text-[#00F0FF]" />
              <h2 className="text-sm font-semibold text-slate-100">{t.arena.historyTitle}</h2>
              <span className="text-xs font-mono-tabular text-slate-500">
                ({historyRuns.length} {t.arena.historyCountSuffix})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setHistoryOpen(false)}
              aria-label={t.arena.historyToggleHide}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 cursor-pointer"
            >
              <CloseXIcon size={15} />
            </button>
          </div>

          {historyLoading ? (
            <div className="py-4 text-xs font-mono-tabular text-slate-400">
              {t.arena.historyLoading}
            </div>
          ) : historyRuns.length === 0 ? (
            <div className="py-4 text-xs text-slate-400">{t.arena.historyEmpty}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
              {historyRuns.map((run) => {
                const verdictMeta = formatVerdictBadge(run.arbiter_verdict, t.arena);
                const isSelected = activeView?.runId === run.id;
                const linkedCve = run.linked_cve_id ? cveMap.get(run.linked_cve_id) : null;
                return (
                  <button
                    key={run.id}
                    type="button"
                    onClick={() => handleSelectHistoryRun(run)}
                    className={`text-left rounded-lg border p-3 transition-colors cursor-pointer space-y-2 ${
                      isSelected
                        ? 'border-[#00F0FF]/50 bg-[#00F0FF]/10'
                        : 'border-slate-800/90 bg-[#070B14]/85 hover:border-[#00F0FF]/35'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-mono-tabular font-semibold ${verdictMeta.className}`}
                      >
                        {verdictMeta.label}
                      </span>
                      <span className="text-[10px] font-mono-tabular text-slate-500">
                        {new Date(run.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                      {run.prompt}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono-tabular text-slate-400">
                      <span className="text-[#00F0FF] truncate max-w-[120px]">{run.blue_model}</span>
                      <span className="text-slate-600">vs</span>
                      <span className="text-[#EF4444] truncate max-w-[120px]">{run.red_model}</span>
                      {linkedCve && (
                        <span className="text-[#F59E0B] ml-auto">{linkedCve.vuln_code}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Arena Command Composer */}
      <form
        onSubmit={handleSubmit}
        className="soc-surface rounded-xl p-4 sm:p-5 space-y-4"
        data-testid="arena-composer-form"
      >
        {/* Top Configuration Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Subject */}
          <div className="space-y-1.5">
            <label
              htmlFor="arena-subject"
              className="block text-[11px] font-mono-tabular uppercase tracking-wider text-slate-400"
            >
              {t.coach.subjectLabel}
            </label>
            <select
              id="arena-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value as ReoSubject)}
              className="w-full rounded-lg border border-slate-700/80 bg-[#070B14] px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-[#00F0FF]/60"
            >
              {REO_SUBJECTS.map((subj) => (
                <option key={subj} value={subj}>
                  {t.coach.subjects[subj]}
                </option>
              ))}
            </select>
          </div>

          {/* Blue Team Architect Profile */}
          <div className="space-y-1.5">
            <label
              htmlFor="arena-blue-profile"
              className="block text-[11px] font-mono-tabular uppercase tracking-wider text-[#00F0FF]"
            >
              {t.arena.blueTeamLabel}
            </label>
            <select
              id="arena-blue-profile"
              data-testid="arena-blue-select"
              value={blueProfile}
              onChange={(e) => handleBlueProfileChange(e.target.value as ModelProfile)}
              className="w-full rounded-lg border border-[#00F0FF]/35 bg-[#070B14] px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-[#00F0FF]"
            >
              {MODEL_PROFILES.map((prof) => (
                <option key={prof} value={prof}>
                  {t.coach.profiles[prof]}
                </option>
              ))}
            </select>
          </div>

          {/* Red Team Auditor Profile (Strictly Opposite Family) */}
          <div className="space-y-1.5">
            <label
              htmlFor="arena-red-profile"
              className="block text-[11px] font-mono-tabular uppercase tracking-wider text-[#EF4444]"
            >
              {t.arena.redTeamLabel}
            </label>
            <select
              id="arena-red-profile"
              data-testid="arena-red-select"
              value={redProfile}
              onChange={(e) => setRedProfile(e.target.value as ModelProfile)}
              className="w-full rounded-lg border border-[#EF4444]/35 bg-[#070B14] px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-[#EF4444]"
            >
              {oppositeProfiles.map((prof) => (
                <option key={prof} value={prof}>
                  {t.coach.profiles[prof]}
                </option>
              ))}
            </select>
          </div>

          {/* Optional Linked CVE */}
          <div className="space-y-1.5">
            <label
              htmlFor="arena-linked-cve"
              className="flex items-center gap-1.5 text-[11px] font-mono-tabular uppercase tracking-wider text-slate-400"
            >
              <LinkCveIcon size={12} className="text-[#F59E0B]" />
              <span>{t.arena.linkCveLabel}</span>
            </label>
            <select
              id="arena-linked-cve"
              value={linkedCveId}
              onChange={(e) => setLinkedCveId(e.target.value)}
              className="w-full rounded-lg border border-slate-700/80 bg-[#070B14] px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-[#00F0FF]/60"
            >
              <option value="">{t.arena.noLinkedCve}</option>
              {cveOptions.map((rec) => (
                <option key={rec.id} value={rec.id}>
                  {rec.vuln_code} — {rec.topic}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pairing Indicator + Deep Audit Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tabular">
            <span className="text-slate-400">{t.arena.pairingLabel}:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#00F0FF]/30 bg-[#00F0FF]/10 text-[#00F0FF]">
              <ProfileIcon profile={blueProfile} size={13} />
              <span>{t.coach.profiles[blueProfile]}</span>
            </span>
            <span className="text-slate-500">vs</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#EF4444]/35 bg-[#EF4444]/10 text-red-200">
              <ProfileIcon profile={redProfile} size={13} />
              <span>{t.coach.profiles[redProfile]}</span>
            </span>
            <span className="text-slate-500 hidden sm:inline">({pairingLabel})</span>
          </div>

          <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={deepAudit}
              onChange={(e) => setDeepAudit(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-[#070B14] accent-[#00F0FF] cursor-pointer"
            />
            <span className="text-xs font-medium text-slate-200">{t.arena.deepAuditLabel}</span>
            <span className="text-[11px] text-slate-400 hidden md:inline">
              ({t.arena.deepAuditHint})
            </span>
          </label>
        </div>

        {/* Prompt Textarea Wired to Keystroke Biometrics */}
        <div className="space-y-2">
          <label
            htmlFor="arena-prompt-input"
            className="block text-xs font-medium text-slate-300"
          >
            {t.arena.promptLabel}
          </label>
          <textarea
            id="arena-prompt-input"
            data-testid="arena-prompt-input"
            rows={4}
            maxLength={MAX_PROMPT_LENGTH}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              biometrics.onKeyDown(e);
            }}
            onPaste={biometrics.onPaste}
            placeholder={t.arena.promptPlaceholder}
            disabled={running}
            className="w-full rounded-lg border border-slate-700/80 bg-[#070B14] px-3.5 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00F0FF]/60 resize-y leading-relaxed disabled:opacity-60"
          />

          {/* Live Biometrics HUD + Launch CTA */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono-tabular text-slate-400">
              <span className="inline-flex items-center gap-1.5 text-[#00F0FF]">
                <BiometricsPulseIcon size={14} />
                <span>
                  {t.coach.bioSamplesLabel}:{' '}
                  <strong className="text-slate-100">{biometrics.sampleCount}</strong>
                </span>
              </span>
              <span className="text-slate-600" aria-hidden="true">
                ·
              </span>
              <span>
                {t.coach.bioPastesLabel}:{' '}
                <strong className="text-slate-100">{biometrics.pasteEvents}</strong>
              </span>
              <span className="text-slate-600" aria-hidden="true">
                ·
              </span>
              <span>
                {t.coach.bioSessionLabel}:{' '}
                <strong className="text-slate-300">
                  {shortSessionHash(biometrics.sessionId)}
                </strong>
              </span>
              <span className="text-slate-600" aria-hidden="true">
                ·
              </span>
              <span className={prompt.length > MAX_PROMPT_LENGTH - 500 ? 'text-[#F59E0B]' : ''}>
                {prompt.length} / {MAX_PROMPT_LENGTH}
              </span>
            </div>

            <button
              type="submit"
              data-testid="arena-launch-button"
              disabled={running || !prompt.trim()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#00F0FF] text-[#070B14] font-semibold text-xs sm:text-sm hover:bg-[#33F3FF] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SendArrowIcon size={15} />
              <span>{running ? t.arena.runningDuelLabel : t.arena.launchDuelButton}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Inline Error Banner */}
      {errorState && (
        <div
          role="alert"
          className={`rounded-xl border p-4 flex flex-wrap items-start justify-between gap-3 ${
            errorState.kind === '401'
              ? 'border-[#EF4444]/45 bg-[#EF4444]/10 text-red-100'
              : 'border-[#F59E0B]/45 bg-[#F59E0B]/10 text-amber-100'
          }`}
        >
          <div className="flex items-start gap-2.5 min-w-0">
            <WarningTriangleIcon
              size={18}
              className={
                errorState.kind === '401'
                  ? 'text-[#EF4444] shrink-0 mt-0.5'
                  : 'text-[#F59E0B] shrink-0 mt-0.5'
              }
            />
            <div className="space-y-0.5 text-xs sm:text-sm">
              <div className="font-semibold">{errorState.title}</div>
              <p className="text-slate-200/90 text-xs">{errorState.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {errorState.kind === '401' && isDemoJury && (
              <button
                type="button"
                onClick={onRenewSandbox}
                disabled={renewingSandbox}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#00F0FF] text-[#070B14] font-semibold text-xs cursor-pointer disabled:opacity-60"
              >
                <RefreshSyncIcon size={14} />
                <span>{renewingSandbox ? t.hud.renewingSession : t.hud.renewSession}</span>
              </button>
            )}
            {errorState.kind === '401' && (
              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-600 text-xs text-slate-200 hover:bg-slate-800 cursor-pointer"
              >
                <SignOutIcon size={14} />
                <span>{t.hud.signOut}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setErrorState(null)}
              className="px-2.5 py-1.5 rounded-md border border-slate-600/70 text-xs text-slate-200 hover:bg-slate-800/70 cursor-pointer"
            >
              {t.hud.dismissNotice}
            </button>
          </div>
        </div>
      )}

      {/* Active Execution Loading Indicator */}
      {running && (
        <div
          data-testid="arena-loading-status"
          className="soc-surface rounded-xl p-5 flex items-center gap-3 text-xs sm:text-sm font-mono-tabular text-[#00F0FF]"
        >
          <AuditArenaIcon size={18} className="animate-pulse shrink-0" />
          <span>{t.arena.runningDuelStatus}</span>
        </div>
      )}

      {/* Active Audit Result */}
      {!running && activeView && (
        <section className="space-y-4" data-testid="arena-active-result">
          {/* Prompt Recap & Historical Banner */}
          <div className="soc-surface rounded-xl p-4 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono-tabular">
              <div className="flex flex-wrap items-center gap-2">
                {activeView.source === 'history' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-800/90 border border-slate-700 text-slate-300">
                    <HistoryLogIcon size={12} />
                    <span>{t.arena.viewingPastRunBanner}</span>
                  </span>
                )}
                {linkedCveObj && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#F59E0B]/12 border border-[#F59E0B]/35 text-[#F59E0B]">
                    <LinkCveIcon size={12} />
                    <span>
                      {t.arena.linkedCveBadge}: {linkedCveObj.vuln_code}
                    </span>
                  </span>
                )}
              </div>

              {activeView.createdAt && (
                <span className="text-slate-500">
                  {new Date(activeView.createdAt).toLocaleString()}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-100 whitespace-pre-wrap break-words leading-relaxed">
              {activeView.prompt}
            </p>
          </div>

          {/* Honeypot Intercept vs Clean Dual-Column Output */}
          {activeView.shieldStatus === 'HONEYPOT_ENGAGED' || activeView.shield?.blocked ? (
            <HoneypotInterceptCard
              reply={activeView.honeypotReply || t.coach.honeypot.terminalLabel}
              shieldStatus="HONEYPOT_ENGAGED"
              shield={activeView.shield}
              providerUsed="none"
              latencyMs={activeView.totalLatencyMs}
              t={t.coach}
            />
          ) : (
            <>
              {/* Honest Cross-Family Verification Status Banner (live runs) */}
              {activeView.source === 'live' && typeof activeView.crossFamilyVerified === 'boolean' && (
                <div
                  data-testid="arena-verification-banner"
                  className={`rounded-xl border px-4 py-3 flex flex-wrap items-center justify-between gap-3 font-mono-tabular text-xs ${
                    activeView.crossFamilyVerified
                      ? 'border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981]'
                      : 'border-[#F59E0B]/45 bg-[#F59E0B]/12 text-[#F59E0B]'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2.5">
                    {activeView.crossFamilyVerified ? (
                      <CheckVerifiedIcon size={16} />
                    ) : (
                      <WarningTriangleIcon size={16} />
                    )}
                    <span className="font-semibold tracking-wide">
                      {activeView.crossFamilyVerified
                        ? t.arena.crossFamilyVerified
                        : t.arena.singleFamilyFailover}
                    </span>
                    {activeView.blueTeam?.providerUsed && activeView.redTeam?.providerUsed && (
                      <span className="text-slate-200">
                        ({activeView.blueTeam.providerUsed} vs {activeView.redTeam.providerUsed})
                      </span>
                    )}
                  </div>
                  {typeof activeView.totalLatencyMs === 'number' && (
                    <span className="text-slate-200">
                      {t.arena.totalLatencyLabel}: {Math.round(activeView.totalLatencyMs)} ms
                    </span>
                  )}
                </div>
              )}

              {/* Dual-Column Blue Team vs Red Team Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Blue Team Architect Column */}
                {activeView.blueTeam && (
                  <article
                    data-testid="arena-blue-column"
                    className="rounded-xl border border-[#00F0FF]/30 bg-[#0E1525]/92 flex flex-col overflow-hidden"
                  >
                    <header className="px-4 py-3 border-b border-[#00F0FF]/20 bg-[#070B14]/80 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF]" />
                        <h2 className="text-xs sm:text-sm font-semibold text-[#00F0FF]">
                          {t.arena.blueColumnTitle}
                        </h2>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono-tabular">
                        <span className="px-2 py-0.5 rounded bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-slate-100">
                          {activeView.blueTeam.modelUsed}
                          {activeView.blueTeam.providerUsed
                            ? ` (${activeView.blueTeam.providerUsed})`
                            : ''}
                        </span>
                        {typeof activeView.blueTeam.latencyMs === 'number' && (
                          <span className="text-slate-400">
                            {Math.round(activeView.blueTeam.latencyMs)} ms
                          </span>
                        )}
                        {activeView.blueTeam.failoverUsed && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/40 font-semibold">
                            <WarningTriangleIcon size={11} />
                            <span>{t.coach.shield.failoverBadge}</span>
                          </span>
                        )}
                      </div>
                    </header>
                    <div className="p-4 sm:p-5 flex-1 overflow-x-hidden">
                      <SafeMarkdown
                        content={activeView.blueTeam.text}
                        copyLabel={t.coach.copyCode}
                        copiedLabel={t.coach.copiedCode}
                      />
                    </div>
                  </article>
                )}

                {/* Red Team Auditor Column */}
                {activeView.redTeam && (
                  <article
                    data-testid="arena-red-column"
                    className="rounded-xl border border-[#EF4444]/35 bg-[#0E1525]/92 flex flex-col overflow-hidden"
                  >
                    <header className="px-4 py-3 border-b border-[#EF4444]/25 bg-[#070B14]/80 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                        <h2 className="text-xs sm:text-sm font-semibold text-red-300">
                          {t.arena.redColumnTitle}
                        </h2>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono-tabular">
                        <span className="px-2 py-0.5 rounded bg-[#EF4444]/12 border border-[#EF4444]/35 text-red-100">
                          {activeView.redTeam.modelUsed}
                          {activeView.redTeam.providerUsed
                            ? ` (${activeView.redTeam.providerUsed})`
                            : ''}
                        </span>
                        {typeof activeView.redTeam.latencyMs === 'number' && (
                          <span className="text-slate-400">
                            {Math.round(activeView.redTeam.latencyMs)} ms
                          </span>
                        )}
                        {activeView.redTeam.failoverUsed && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/40 font-semibold">
                            <WarningTriangleIcon size={11} />
                            <span>{t.coach.shield.failoverBadge}</span>
                          </span>
                        )}
                      </div>
                    </header>
                    <div className="p-4 sm:p-5 flex-1 overflow-x-hidden">
                      <SafeMarkdown
                        content={activeView.redTeam.text}
                        copyLabel={t.coach.copyCode}
                        copiedLabel={t.coach.copiedCode}
                      />
                    </div>
                  </article>
                )}
              </div>

              {/* Arbiter Verdict Control Bar (for persisted run_id) */}
              {activeView.runId && activeVerdictMeta && (
                <div
                  data-testid="arena-arbiter-bar"
                  className="soc-surface rounded-xl px-4 py-3.5 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="flex flex-wrap items-center gap-2.5">
                    <ArbiterScaleIcon size={18} className="text-[#00F0FF]" />
                    <span className="text-xs sm:text-sm font-semibold text-slate-100">
                      {t.arena.arbiterTitle}
                    </span>
                    <span
                      data-testid="arena-verdict-badge"
                      className={`inline-flex items-center px-2.5 py-0.5 rounded border text-xs font-mono-tabular font-semibold ${activeVerdictMeta.className}`}
                    >
                      {activeVerdictMeta.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      data-testid="arbiter-mark-blue-clean"
                      disabled={updatingVerdict !== null}
                      onClick={() => handleArbiterVerdict('blue_clean')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60 ${
                        activeView.arbiterVerdict === 'blue_clean'
                          ? 'bg-[#00F0FF]/20 border-[#00F0FF] text-[#00F0FF]'
                          : 'bg-[#070B14] border-[#00F0FF]/35 text-slate-200 hover:bg-[#00F0FF]/12 hover:text-[#00F0FF]'
                      }`}
                    >
                      <CheckVerifiedIcon size={14} />
                      <span>
                        {updatingVerdict === 'blue_clean'
                          ? t.arena.savingVerdict
                          : t.arena.markBlueClean}
                      </span>
                    </button>

                    <button
                      type="button"
                      data-testid="arbiter-mark-red-flaw"
                      disabled={updatingVerdict !== null}
                      onClick={() => handleArbiterVerdict('red_found_flaw')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60 ${
                        activeView.arbiterVerdict === 'red_found_flaw'
                          ? 'bg-[#EF4444]/20 border-[#EF4444] text-red-100'
                          : 'bg-[#070B14] border-[#EF4444]/40 text-slate-200 hover:bg-[#EF4444]/15 hover:text-red-100'
                      }`}
                    >
                      <HoneypotAlertIcon size={14} />
                      <span>
                        {updatingVerdict === 'red_found_flaw'
                          ? t.arena.savingVerdict
                          : t.arena.markRedFlaw}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Live REO-Shield Telemetry Strip */}
              {activeView.shield && (
                <ShieldTelemetryStrip
                  shieldStatus={activeView.shieldStatus}
                  shield={activeView.shield}
                  modelUsed={
                    activeView.blueTeam && activeView.redTeam
                      ? `${activeView.blueTeam.modelUsed} vs ${activeView.redTeam.modelUsed}`
                      : undefined
                  }
                  failoverUsed={
                    Boolean(activeView.blueTeam?.failoverUsed) ||
                    Boolean(activeView.redTeam?.failoverUsed)
                  }
                  latencyMs={activeView.totalLatencyMs}
                  t={t.coach.shield}
                />
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}
