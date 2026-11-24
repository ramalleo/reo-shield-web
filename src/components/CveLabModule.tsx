import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import type {
  ReoCveRecord,
  ReoCveRootCause,
  ReoCveStatus,
  ReoRepetition,
} from '../lib/supabase';
import {
  generatePatchChallenge,
  ReoApiError,
  verifyPatchChallenge,
} from '../lib/api';
import type {
  ModelProfile,
  PatchGenerateResponse,
  PatchVerifyResponse,
  ReoLang,
  ReoSubject,
} from '../lib/api';
import { useKeystrokeTelemetry } from '../lib/biometrics';
import {
  MAX_PROMPT_LENGTH,
  MODEL_PROFILES,
  REO_SUBJECTS,
  shortSessionHash,
} from '../lib/coachUtils';
import {
  clampScore,
  computeCveKpis,
  filterCveRecords,
  findPendingRepetitionForCve,
  generateNextVulnCode,
} from '../lib/milestone3Utils';
import type { CveFilterStatus } from '../lib/milestone3Utils';
import type { TranslationDictionary } from '../i18n/translations';
import { SafeMarkdown } from './SafeMarkdown';
import { ShieldTelemetryStrip } from './ShieldTelemetryStrip';
import { HoneypotInterceptCard } from './HoneypotInterceptCard';
import {
  ArrowRightIcon,
  BiometricsPulseIcon,
  CalendarDueIcon,
  CheckVerifiedIcon,
  CloseXIcon,
  CveLabIcon,
  HoneypotAlertIcon,
  PlusSessionIcon,
  RefreshSyncIcon,
  SearchFilterIcon,
  SignOutIcon,
  SparkChallengeIcon,
  TrashDeleteIcon,
  WarningTriangleIcon,
} from './icons/NeonIcons';

interface CveLabModuleProps {
  accessToken: string;
  userId: string;
  lang: ReoLang;
  t: TranslationDictionary;
  isDemoJury: boolean;
  onRenewSandbox: () => Promise<void>;
  renewingSandbox: boolean;
  onSignOut: () => Promise<void>;
}

interface CveInlineError {
  kind: '401' | '429' | 'network' | 'db' | 'validation';
  title: string;
  description: string;
}

function statusBadgeStyle(status: ReoCveStatus): string {
  switch (status) {
    case 'PATCHED':
      return 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40';
    case 'REGRESSED':
      return 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/45';
    case 'VULNERABLE':
    default:
      return 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/45';
  }
}

function ScoreGaugeSvg({
  score,
  passed,
  label,
}: {
  score: number;
  passed: boolean;
  label: string;
}) {
  const clamped = clampScore(score);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (clamped / 100) * circumference;

  const strokeColor = passed
    ? '#10B981'
    : clamped >= 40
      ? '#F59E0B'
      : '#EF4444';

  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0" data-testid="patch-score-gauge">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90" aria-hidden="true">
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="rgba(148, 163, 184, 0.18)"
            strokeWidth="7"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center font-mono-tabular">
          <span className="text-xl font-bold text-slate-50 leading-none">{clamped}</span>
          <span className="text-[10px] text-slate-400 mt-0.5">/ 100</span>
        </div>
      </div>
      <span className="text-[11px] font-mono-tabular text-slate-400">{label}</span>
    </div>
  );
}

export function CveLabModule({
  accessToken,
  userId,
  lang,
  t,
  isDemoJury,
  onRenewSandbox,
  renewingSandbox,
  onSignOut,
}: CveLabModuleProps) {
  const [records, setRecords] = useState<ReoCveRecord[]>([]);
  const [repetitions, setRepetitions] = useState<ReoRepetition[]>([]);
  const [loading, setLoading] = useState(true);
  const [ledgerError, setLedgerError] = useState<CveInlineError | null>(null);

  const [statusFilter, setStatusFilter] = useState<CveFilterStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [markingRepId, setMarkingRepId] = useState<string | null>(null);

  // Create CVE Modal State
  const [createOpen, setCreateOpen] = useState(false);
  const [vulnCode, setVulnCode] = useState('');
  const [subject, setSubject] = useState<ReoSubject>('Cybersecurity');
  const [topic, setTopic] = useState('');
  const [rootCause, setRootCause] = useState<ReoCveRootCause>('knowledge_gap');
  const [problemStatement, setProblemStatement] = useState('');
  const [derivation, setDerivation] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Patch Challenge Drawer State
  const [activeCveId, setActiveCveId] = useState<string | null>(null);
  const [modelProfile, setModelProfile] = useState<ModelProfile>('fast');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<PatchGenerateResponse | null>(null);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<PatchVerifyResponse | null>(null);
  const [drawerError, setDrawerError] = useState<CveInlineError | null>(null);

  const biometrics = useKeystrokeTelemetry();

  const loadLabData = useCallback(async () => {
    setLoading(true);
    const [cveRes, repRes] = await Promise.all([
      supabase
        .from('reo_cve_records')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('reo_repetitions')
        .select('*')
        .eq('source_type', 'cve'),
    ]);

    if (cveRes.error) {
      setLedgerError({
        kind: 'db',
        title: t.cve.errorLoadRecords,
        description: cveRes.error.message,
      });
    } else {
      setRecords((cveRes.data ?? []) as ReoCveRecord[]);
    }

    if (!repRes.error && repRes.data) {
      setRepetitions(repRes.data as ReoRepetition[]);
    }
    setLoading(false);
  }, [t.cve.errorLoadRecords]);

  useEffect(() => {
    void loadLabData();
  }, [loadLabData, userId]);

  const kpis = useMemo(() => computeCveKpis(records, repetitions), [records, repetitions]);
  const filteredRecords = useMemo(
    () => filterCveRecords(records, statusFilter, searchQuery),
    [records, statusFilter, searchQuery],
  );
  const activeCve = useMemo(
    () => records.find((r) => r.id === activeCveId) ?? null,
    [records, activeCveId],
  );

  const openCreateModal = () => {
    setVulnCode(generateNextVulnCode(records));
    setSubject('Cybersecurity');
    setTopic('');
    setRootCause('knowledge_gap');
    setProblemStatement('');
    setDerivation('');
    setCreateError(null);
    setCreateOpen(true);
  };

  const handleCreateCve = async (e: FormEvent) => {
    e.preventDefault();
    const cleanCode = vulnCode.trim();
    const cleanTopic = topic.trim();
    const cleanProblem = problemStatement.trim();
    const cleanDerivation = derivation.trim();

    if (!cleanCode || !cleanTopic || !cleanProblem || !cleanDerivation) {
      setCreateError(t.cve.validationRequiredFields);
      return;
    }

    setCreating(true);
    setCreateError(null);

    const { error } = await supabase.from('reo_cve_records').insert({
      user_id: userId,
      vuln_code: cleanCode,
      subject,
      topic: cleanTopic,
      problem_statement: cleanProblem,
      derivation: cleanDerivation,
      root_cause: rootCause,
      status: 'VULNERABLE',
    });

    if (error) {
      setCreateError(error.message || t.cve.errorCreateRecord);
      setCreating(false);
      return;
    }

    setCreating(false);
    setCreateOpen(false);
    await loadLabData();
  };

  const handleDeleteRecord = async (recordId: string) => {
    setDeletingId(recordId);
    setLedgerError(null);

    const { error } = await supabase.from('reo_cve_records').delete().eq('id', recordId);
    if (error) {
      setLedgerError({
        kind: 'db',
        title: t.cve.errorDeleteRecord,
        description: error.message,
      });
    } else {
      setRecords((prev) => prev.filter((r) => r.id !== recordId));
      if (activeCveId === recordId) {
        setActiveCveId(null);
      }
    }
    setConfirmDeleteId(null);
    setDeletingId(null);
  };

  const handleMarkRepetitionDone = async (repId: string) => {
    setMarkingRepId(repId);
    setLedgerError(null);

    const { error } = await supabase
      .from('reo_repetitions')
      .update({ status: 'done' })
      .eq('id', repId);

    if (error) {
      setLedgerError({
        kind: 'db',
        title: t.cve.errorMarkReview,
        description: error.message,
      });
    } else {
      setRepetitions((prev) =>
        prev.map((rep) => (rep.id === repId ? { ...rep, status: 'done' } : rep)),
      );
    }
    setMarkingRepId(null);
  };

  const openPatchDrawer = (cve: ReoCveRecord) => {
    setActiveCveId(cve.id);
    setGenerated(null);
    setStudentAnswer('');
    setVerifyResult(null);
    setDrawerError(null);
    biometrics.reset();
  };

  const closePatchDrawer = () => {
    setActiveCveId(null);
    setDrawerError(null);
    biometrics.reset();
  };

  const handleGenerateChallenge = async () => {
    if (!activeCve || generating) {
      return;
    }
    setGenerating(true);
    setDrawerError(null);
    setVerifyResult(null);
    setStudentAnswer('');

    const telemetryHeader = biometrics.buildHeader();

    try {
      const res = await generatePatchChallenge(
        {
          action: 'generate',
          cve_id: activeCve.id,
          lang,
          model_profile: modelProfile,
        },
        {
          accessToken,
          telemetryHeader,
        },
      );
      setGenerated(res);
      biometrics.reset();
    } catch (err) {
      if (err instanceof ReoApiError) {
        if (err.code === 'demo_session_expired' || err.code === 'unauthorized') {
          setDrawerError({
            kind: '401',
            title: t.coach.error401Title,
            description: t.coach.error401Desc,
          });
        } else if (err.code === 'rate_limit_exceeded') {
          setDrawerError({
            kind: '429',
            title: t.coach.error429Title,
            description: t.coach.error429Desc,
          });
        } else {
          setDrawerError({
            kind: 'network',
            title: t.coach.errorNetworkTitle,
            description: err.message || t.cve.errorNetworkDesc,
          });
        }
      } else {
        setDrawerError({
          kind: 'network',
          title: t.coach.errorNetworkTitle,
          description: t.cve.errorNetworkDesc,
        });
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleVerifyPatch = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeCve || !generated?.challenge_question || verifying) {
      return;
    }
    const cleanAnswer = studentAnswer.trim();
    if (!cleanAnswer) {
      return;
    }

    setVerifying(true);
    setDrawerError(null);

    const telemetryHeader = biometrics.buildHeader();
    biometrics.reset();

    try {
      const res = await verifyPatchChallenge(
        {
          action: 'verify',
          cve_id: activeCve.id,
          lang,
          model_profile: modelProfile,
          challenge_question: generated.challenge_question,
          student_answer: cleanAnswer,
          is_simulation: false,
        },
        {
          accessToken,
          telemetryHeader,
        },
      );

      setVerifyResult(res);

      // Immediately refresh live CVE records and spaced repetitions from Supabase
      const [cveRes, repRes] = await Promise.all([
        supabase
          .from('reo_cve_records')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('reo_repetitions')
          .select('*')
          .eq('source_type', 'cve'),
      ]);
      if (!cveRes.error && cveRes.data) {
        setRecords(cveRes.data as ReoCveRecord[]);
      }
      if (!repRes.error && repRes.data) {
        setRepetitions(repRes.data as ReoRepetition[]);
      }
    } catch (err) {
      if (err instanceof ReoApiError) {
        if (err.code === 'demo_session_expired' || err.code === 'unauthorized') {
          setDrawerError({
            kind: '401',
            title: t.coach.error401Title,
            description: t.coach.error401Desc,
          });
        } else if (err.code === 'rate_limit_exceeded') {
          setDrawerError({
            kind: '429',
            title: t.coach.error429Title,
            description: t.coach.error429Desc,
          });
        } else {
          setDrawerError({
            kind: 'network',
            title: t.coach.errorNetworkTitle,
            description: err.message || t.cve.errorNetworkDesc,
          });
        }
      } else {
        setDrawerError({
          kind: 'network',
          title: t.coach.errorNetworkTitle,
          description: t.cve.errorNetworkDesc,
        });
      }
    } finally {
      setVerifying(false);
    }
  };

  const filterOptions: { key: CveFilterStatus; label: string }[] = [
    { key: 'ALL', label: t.cve.filterAll },
    { key: 'VULNERABLE', label: t.cve.filterVulnerable },
    { key: 'PATCHED', label: t.cve.filterPatched },
    { key: 'REGRESSED', label: t.cve.filterRegressed },
  ];

  return (
    <div className="space-y-5" data-testid="cve-lab-module">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF] shrink-0">
            <CveLabIcon size={21} />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-50">
              {t.cve.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 max-w-3xl">
              {t.cve.subtitle}
            </p>
          </div>
        </div>

        <button
          type="button"
          data-testid="cve-log-new-button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#00F0FF] text-[#070B14] font-semibold text-xs sm:text-sm hover:bg-[#33F3FF] transition-colors cursor-pointer shrink-0"
        >
          <PlusSessionIcon size={15} />
          <span>{t.cve.logNewButton}</span>
        </button>
      </div>

      {/* Flat KPI Summary Bar */}
      <div
        data-testid="cve-kpi-bar"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
      >
        <div className="soc-surface rounded-xl px-4 py-3">
          <div className="text-[11px] font-mono-tabular uppercase tracking-wider text-slate-400">
            {t.cve.kpiTotal}
          </div>
          <div className="text-2xl font-mono-tabular font-bold text-slate-50 mt-1">
            {kpis.total}
          </div>
        </div>
        <div className="soc-surface rounded-xl px-4 py-3 border-[#EF4444]/30">
          <div className="text-[11px] font-mono-tabular uppercase tracking-wider text-red-300/80">
            {t.cve.kpiVulnerable}
          </div>
          <div className="text-2xl font-mono-tabular font-bold text-[#EF4444] mt-1">
            {kpis.vulnerable}
          </div>
        </div>
        <div className="soc-surface rounded-xl px-4 py-3 border-[#10B981]/30">
          <div className="text-[11px] font-mono-tabular uppercase tracking-wider text-emerald-300/80">
            {t.cve.kpiPatched}
          </div>
          <div className="text-2xl font-mono-tabular font-bold text-[#10B981] mt-1">
            {kpis.patched}
          </div>
        </div>
        <div className="soc-surface rounded-xl px-4 py-3 border-[#F59E0B]/30">
          <div className="text-[11px] font-mono-tabular uppercase tracking-wider text-amber-300/80">
            {t.cve.kpiRegressed}
          </div>
          <div className="text-2xl font-mono-tabular font-bold text-[#F59E0B] mt-1">
            {kpis.regressed}
          </div>
        </div>
        <div className="soc-surface rounded-xl px-4 py-3 col-span-2 sm:col-span-1 border-[#00F0FF]/25">
          <div className="text-[11px] font-mono-tabular uppercase tracking-wider text-[#00F0FF]/85">
            {t.cve.kpiPendingReviews}
          </div>
          <div className="text-2xl font-mono-tabular font-bold text-[#00F0FF] mt-1">
            {kpis.pendingReviews}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="soc-surface rounded-xl p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5" role="tablist">
          {filterOptions.map((opt) => {
            const active = statusFilter === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setStatusFilter(opt.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono-tabular font-semibold border transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/45'
                    : 'bg-[#070B14] text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72">
          <SearchFilterIcon
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label={t.cve.searchAriaLabel}
            placeholder={t.cve.searchPlaceholder}
            className="w-full rounded-lg border border-slate-700/80 bg-[#070B14] pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00F0FF]/60"
          />
        </div>
      </div>

      {/* Ledger Error Banner */}
      {ledgerError && (
        <div
          role="alert"
          className="rounded-xl border border-[#EF4444]/40 bg-[#EF4444]/10 p-3.5 flex items-center justify-between gap-3 text-xs text-red-100"
        >
          <div className="flex items-center gap-2">
            <WarningTriangleIcon size={16} className="text-[#EF4444] shrink-0" />
            <span>
              <strong>{ledgerError.title}:</strong> {ledgerError.description}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setLedgerError(null)}
            className="px-2 py-1 rounded border border-red-400/30 hover:bg-red-500/15 cursor-pointer"
          >
            {t.hud.dismissNotice}
          </button>
        </div>
      )}

      {/* CVE Records List */}
      {loading ? (
        <div className="soc-surface rounded-xl p-8 text-center text-xs sm:text-sm font-mono-tabular text-slate-400">
          {t.cve.loadingRecords}
        </div>
      ) : records.length === 0 ? (
        <div className="soc-surface rounded-xl p-8 text-center space-y-3">
          <p className="text-sm text-slate-300 max-w-lg mx-auto">{t.cve.emptyRecords}</p>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00F0FF]/12 border border-[#00F0FF]/40 text-[#00F0FF] text-xs font-semibold hover:bg-[#00F0FF]/20 cursor-pointer"
          >
            <PlusSessionIcon size={14} />
            <span>{t.cve.logNewButton}</span>
          </button>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="soc-surface rounded-xl p-8 text-center text-sm text-slate-400">
          {t.cve.emptyFiltered}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4" data-testid="cve-records-list">
          {filteredRecords.map((rec) => {
            const pendingRep = findPendingRepetitionForCve(repetitions, rec.id);
            const isConfirmingDelete = confirmDeleteId === rec.id;
            const subjectLabel =
              t.coach.subjects[rec.subject as ReoSubject] || rec.subject;

            return (
              <article
                key={rec.id}
                data-testid={`cve-card-${rec.vuln_code}`}
                className="soc-surface rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  {/* Card Top Row */}
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      <span className="font-mono-tabular text-xs sm:text-sm font-bold text-[#00F0FF] tracking-wide">
                        {rec.vuln_code}
                      </span>
                      <span
                        data-testid={`cve-status-${rec.vuln_code}`}
                        className={`inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-mono-tabular font-semibold ${statusBadgeStyle(rec.status)}`}
                      >
                        {t.cve.statusLabels[rec.status]}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300">
                        {subjectLabel}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-300">
                        {t.cve.rootCauseLabels[rec.root_cause]}
                      </span>
                    </div>

                    {/* Inline Confirm Delete */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isConfirmingDelete ? (
                        <>
                          <button
                            type="button"
                            disabled={deletingId === rec.id}
                            onClick={() => handleDeleteRecord(rec.id)}
                            className="px-2 py-1 rounded bg-[#EF4444]/20 border border-[#EF4444]/50 text-[11px] font-semibold text-red-100 hover:bg-[#EF4444]/30 cursor-pointer"
                          >
                            {t.coach.confirmDelete}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 rounded border border-slate-700 text-[11px] text-slate-300 hover:bg-slate-800 cursor-pointer"
                          >
                            {t.coach.cancelDelete}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(rec.id)}
                          aria-label={t.cve.deleteRecordAria}
                          className="p-1.5 rounded-md text-slate-500 hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer"
                        >
                          <TrashDeleteIcon size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Topic */}
                  <h2 className="font-display text-base sm:text-lg font-semibold text-slate-50 leading-snug">
                    {rec.topic}
                  </h2>

                  {/* Problem & Flawed Derivation */}
                  <div className="grid grid-cols-1 gap-2.5 text-xs">
                    <div className="rounded-lg bg-[#070B14]/85 border border-slate-800/90 p-3">
                      <div className="text-[10px] font-mono-tabular uppercase tracking-wider text-slate-400 mb-1">
                        {t.cve.problemLabel}
                      </div>
                      <p className="text-slate-200 whitespace-pre-wrap break-words leading-relaxed">
                        {rec.problem_statement}
                      </p>
                    </div>
                    <div className="rounded-lg bg-[#070B14]/85 border border-slate-800/90 p-3">
                      <div className="text-[10px] font-mono-tabular uppercase tracking-wider text-amber-300/80 mb-1">
                        {t.cve.derivationLabel}
                      </div>
                      <p className="text-slate-300 whitespace-pre-wrap break-words leading-relaxed">
                        {rec.derivation}
                      </p>
                    </div>
                  </div>

                  {/* Spaced Repetition Due Badge */}
                  {pendingRep && (
                    <div
                      data-testid={`cve-repetition-badge-${rec.vuln_code}`}
                      className="rounded-lg border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex flex-wrap items-center gap-2 font-mono-tabular text-[#F59E0B]">
                        <CalendarDueIcon size={14} />
                        <span className="font-semibold">{t.cve.repetitionDueBadge}</span>
                        <span className="text-amber-200/85">
                          ({t.cve.stepDaysPrefix} {pendingRep.step_days} ·{' '}
                          {new Date(pendingRep.due_at).toLocaleDateString()})
                        </span>
                      </div>
                      <button
                        type="button"
                        disabled={markingRepId === pendingRep.id}
                        onClick={() => handleMarkRepetitionDone(pendingRep.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#F59E0B]/20 hover:bg-[#F59E0B]/30 border border-[#F59E0B]/45 text-amber-100 text-[11px] font-semibold cursor-pointer disabled:opacity-60"
                      >
                        <CheckVerifiedIcon size={12} />
                        <span>
                          {markingRepId === pendingRep.id
                            ? t.cve.markingReview
                            : t.cve.markReviewDone}
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Footer: Verified At + Launch Patch Challenge CTA */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] font-mono-tabular text-slate-400">
                    {rec.patch_verified_at ? (
                      <span className="text-[#10B981]">
                        {t.cve.verifiedAtLabel}:{' '}
                        {new Date(rec.patch_verified_at).toLocaleString()}
                      </span>
                    ) : (
                      <span>{new Date(rec.created_at).toLocaleDateString()}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    data-testid={`cve-launch-patch-${rec.vuln_code}`}
                    onClick={() => openPatchDrawer(rec)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#00F0FF]/12 border border-[#00F0FF]/45 text-[#00F0FF] hover:bg-[#00F0FF]/20 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <SparkChallengeIcon size={14} />
                    <span>{t.cve.launchPatchButton}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal: Log Cognitive Vulnerability */}
      {createOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#04070E]/82 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cve-create-modal-title"
          data-testid="cve-create-modal"
        >
          <div className="w-full max-w-2xl rounded-xl border border-[#00F0FF]/30 bg-[#0E1525] shadow-2xl overflow-hidden my-auto">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-[#070B14]/80">
              <div className="flex items-center gap-2.5">
                <CveLabIcon size={18} className="text-[#00F0FF]" />
                <h2
                  id="cve-create-modal-title"
                  className="font-display text-base sm:text-lg font-bold text-slate-50"
                >
                  {t.cve.modalCreateTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                aria-label={t.cve.modalCloseAria}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 cursor-pointer"
              >
                <CloseXIcon size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateCve} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label
                    htmlFor="cve-vuln-code"
                    className="block text-xs font-mono-tabular text-slate-300"
                  >
                    {t.cve.fieldVulnCode}
                  </label>
                  <input
                    id="cve-vuln-code"
                    data-testid="cve-input-vuln-code"
                    type="text"
                    required
                    value={vulnCode}
                    onChange={(e) => setVulnCode(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-[#070B14] px-3 py-2 text-sm font-mono-tabular text-[#00F0FF] focus:outline-none focus:border-[#00F0FF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="cve-subject"
                    className="block text-xs font-mono-tabular text-slate-300"
                  >
                    {t.cve.fieldSubject}
                  </label>
                  <select
                    id="cve-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as ReoSubject)}
                    className="w-full rounded-lg border border-slate-700 bg-[#070B14] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-[#00F0FF]"
                  >
                    {REO_SUBJECTS.map((subj) => (
                      <option key={subj} value={subj}>
                        {t.coach.subjects[subj]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label
                    htmlFor="cve-topic"
                    className="block text-xs font-mono-tabular text-slate-300"
                  >
                    {t.cve.fieldTopic}
                  </label>
                  <input
                    id="cve-topic"
                    data-testid="cve-input-topic"
                    type="text"
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder={t.cve.fieldTopicPlaceholder}
                    className="w-full rounded-lg border border-slate-700 bg-[#070B14] px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00F0FF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="cve-root-cause"
                    className="block text-xs font-mono-tabular text-slate-300"
                  >
                    {t.cve.fieldRootCause}
                  </label>
                  <select
                    id="cve-root-cause"
                    data-testid="cve-select-root-cause"
                    value={rootCause}
                    onChange={(e) => setRootCause(e.target.value as ReoCveRootCause)}
                    className="w-full rounded-lg border border-slate-700 bg-[#070B14] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-[#00F0FF]"
                  >
                    <option value="knowledge_gap">
                      {t.cve.rootCauseLabels.knowledge_gap}
                    </option>
                    <option value="attention_slip">
                      {t.cve.rootCauseLabels.attention_slip}
                    </option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="cve-problem"
                  className="block text-xs font-mono-tabular text-slate-300"
                >
                  {t.cve.fieldProblem}
                </label>
                <textarea
                  id="cve-problem"
                  data-testid="cve-input-problem"
                  rows={3}
                  required
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  placeholder={t.cve.fieldProblemPlaceholder}
                  className="w-full rounded-lg border border-slate-700 bg-[#070B14] px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00F0FF] resize-y"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="cve-derivation"
                  className="block text-xs font-mono-tabular text-slate-300"
                >
                  {t.cve.fieldDerivation}
                </label>
                <textarea
                  id="cve-derivation"
                  data-testid="cve-input-derivation"
                  rows={3}
                  required
                  value={derivation}
                  onChange={(e) => setDerivation(e.target.value)}
                  placeholder={t.cve.fieldDerivationPlaceholder}
                  className="w-full rounded-lg border border-slate-700 bg-[#070B14] px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00F0FF] resize-y"
                />
              </div>

              {createError && (
                <div className="rounded-lg border border-[#EF4444]/40 bg-[#EF4444]/10 px-3 py-2 text-xs text-red-200">
                  {createError}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-xs sm:text-sm text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  {t.coach.cancelDelete}
                </button>
                <button
                  type="submit"
                  data-testid="cve-create-submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-lg bg-[#00F0FF] text-[#070B14] font-semibold text-xs sm:text-sm hover:bg-[#33F3FF] cursor-pointer disabled:opacity-60"
                >
                  {creating ? t.cve.creatingButton : t.cve.createSubmitButton}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive 3-Step Patch Verification Drawer/Modal */}
      {activeCve && (
        <div
          className="fixed inset-0 z-50 bg-[#04070E]/82 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby="patch-drawer-title"
          data-testid="cve-patch-drawer"
        >
          <div className="w-full max-w-2xl h-full bg-[#0A101E] border-l border-[#00F0FF]/25 flex flex-col overflow-hidden shadow-2xl">
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-slate-800 bg-[#070B14] flex items-start justify-between gap-3 shrink-0">
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono-tabular text-xs font-bold text-[#00F0FF]">
                    {activeCve.vuln_code}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-mono-tabular font-semibold ${statusBadgeStyle(activeCve.status)}`}
                  >
                    {t.cve.statusLabels[activeCve.status]}
                  </span>
                </div>
                <h2
                  id="patch-drawer-title"
                  className="font-display text-base sm:text-lg font-bold text-slate-50 truncate"
                >
                  {t.cve.drawerTitle}: {activeCve.topic}
                </h2>
              </div>
              <button
                type="button"
                onClick={closePatchDrawer}
                aria-label={t.cve.modalCloseAria}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 cursor-pointer shrink-0"
              >
                <CloseXIcon size={17} />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Drawer Error Banner */}
              {drawerError && (
                <div
                  role="alert"
                  className={`rounded-xl border p-3.5 flex flex-wrap items-start justify-between gap-3 ${
                    drawerError.kind === '401'
                      ? 'border-[#EF4444]/45 bg-[#EF4444]/10 text-red-100'
                      : 'border-[#F59E0B]/45 bg-[#F59E0B]/10 text-amber-100'
                  }`}
                >
                  <div className="flex items-start gap-2 text-xs">
                    <WarningTriangleIcon
                      size={16}
                      className={
                        drawerError.kind === '401'
                          ? 'text-[#EF4444] shrink-0 mt-0.5'
                          : 'text-[#F59E0B] shrink-0 mt-0.5'
                      }
                    />
                    <div>
                      <div className="font-semibold">{drawerError.title}</div>
                      <p className="text-slate-200/90 mt-0.5">{drawerError.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {drawerError.kind === '401' && isDemoJury && (
                      <button
                        type="button"
                        onClick={onRenewSandbox}
                        disabled={renewingSandbox}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#00F0FF] text-[#070B14] font-semibold text-xs cursor-pointer"
                      >
                        <RefreshSyncIcon size={13} />
                        <span>
                          {renewingSandbox ? t.hud.renewingSession : t.hud.renewSession}
                        </span>
                      </button>
                    )}
                    {drawerError.kind === '401' && (
                      <button
                        type="button"
                        onClick={onSignOut}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-600 text-xs text-slate-200 cursor-pointer"
                      >
                        <SignOutIcon size={13} />
                        <span>{t.hud.signOut}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 1: Generate Novel Verification Challenge */}
              <section className="rounded-xl border border-slate-800 bg-[#0E1525]/85 p-4 space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-100">
                    {t.cve.step1Title}
                  </h3>
                  <select
                    aria-label={t.coach.modelProfileLabel}
                    value={modelProfile}
                    onChange={(e) => setModelProfile(e.target.value as ModelProfile)}
                    className="rounded-lg border border-slate-700 bg-[#070B14] px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-[#00F0FF]"
                  >
                    {MODEL_PROFILES.map((prof) => (
                      <option key={prof} value={prof}>
                        {t.coach.profiles[prof]}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  data-testid="patch-generate-button"
                  disabled={generating}
                  onClick={handleGenerateChallenge}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#00F0FF] text-[#070B14] font-semibold text-xs sm:text-sm hover:bg-[#33F3FF] transition-colors cursor-pointer disabled:opacity-60"
                >
                  <SparkChallengeIcon size={15} />
                  <span>{generating ? t.cve.generatingButton : t.cve.generateButton}</span>
                </button>

                {generated &&
                  (generated.shield_status === 'HONEYPOT_ENGAGED' || generated.shield?.blocked ? (
                    <HoneypotInterceptCard
                      reply={
                        generated.reply ||
                        generated.challenge_question ||
                        t.coach.honeypot.terminalLabel
                      }
                      shieldStatus="HONEYPOT_ENGAGED"
                      shield={generated.shield}
                      modelUsed={generated.model_used}
                      providerUsed={generated.provider_used}
                      failoverUsed={generated.failover_used}
                      latencyMs={generated.latency_ms}
                      t={t.coach}
                    />
                  ) : (
                    <div className="space-y-3" data-testid="patch-generated-challenge">
                      {generated.record_sanitized && (
                        <div className="rounded-lg border border-[#F59E0B]/45 bg-[#F59E0B]/12 px-3 py-2 text-xs text-amber-100 flex items-start gap-2">
                          <WarningTriangleIcon
                            size={15}
                            className="text-[#F59E0B] shrink-0 mt-0.5"
                          />
                          <span>{t.cve.recordSanitizedNotice}</span>
                        </div>
                      )}

                      <div className="rounded-lg border border-[#00F0FF]/25 bg-[#070B14] p-4 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-tabular text-slate-400 pb-2 border-b border-slate-800/80">
                          <span className="text-[#00F0FF] font-semibold">
                            {t.cve.challengePromptLabel}
                          </span>
                          <div className="flex items-center gap-2">
                            <span>
                              {generated.model_used} ({generated.provider_used})
                            </span>
                            <span>·</span>
                            <span>{Math.round(generated.latency_ms)} ms</span>
                            {generated.failover_used && (
                              <span className="px-1.5 py-0.5 rounded bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/40">
                                {t.coach.shield.failoverBadge}
                              </span>
                            )}
                          </div>
                        </div>

                        <SafeMarkdown
                          content={generated.challenge_question}
                          copyLabel={t.coach.copyCode}
                          copiedLabel={t.coach.copiedCode}
                        />
                      </div>
                    </div>
                  ))}
              </section>

              {/* STEP 2: Student Answer + Keystroke Biometrics */}
              {generated &&
                generated.shield_status === 'CLEAN' &&
                !generated.shield?.blocked && (
                  <form
                    onSubmit={handleVerifyPatch}
                    className="rounded-xl border border-slate-800 bg-[#0E1525]/85 p-4 space-y-3"
                    data-testid="patch-answer-form"
                  >
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-100">
                      {t.cve.step2Title}
                    </h3>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="patch-student-answer"
                        className="block text-xs text-slate-300"
                      >
                        {t.cve.answerLabel}
                      </label>
                      <textarea
                        id="patch-student-answer"
                        data-testid="patch-answer-input"
                        rows={5}
                        maxLength={MAX_PROMPT_LENGTH}
                        value={studentAnswer}
                        onChange={(e) => setStudentAnswer(e.target.value)}
                        onKeyDown={biometrics.onKeyDown}
                        onPaste={biometrics.onPaste}
                        placeholder={t.cve.answerPlaceholder}
                        disabled={verifying}
                        className="w-full rounded-lg border border-slate-700 bg-[#070B14] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00F0FF] resize-y leading-relaxed disabled:opacity-60"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono-tabular text-slate-400">
                        <span className="inline-flex items-center gap-1 text-[#00F0FF]">
                          <BiometricsPulseIcon size={13} />
                          <span>
                            {t.coach.bioSamplesLabel}:{' '}
                            <strong className="text-slate-100">{biometrics.sampleCount}</strong>
                          </span>
                        </span>
                        <span className="text-slate-600">·</span>
                        <span>
                          {t.coach.bioPastesLabel}:{' '}
                          <strong className="text-slate-100">{biometrics.pasteEvents}</strong>
                        </span>
                        <span className="text-slate-600">·</span>
                        <span>
                          {t.coach.bioSessionLabel}:{' '}
                          <strong className="text-slate-300">
                            {shortSessionHash(biometrics.sessionId)}
                          </strong>
                        </span>
                      </div>

                      <button
                        type="submit"
                        data-testid="patch-verify-button"
                        disabled={verifying || !studentAnswer.trim()}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#10B981] text-[#070B14] font-semibold text-xs sm:text-sm hover:bg-[#34D399] transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <CheckVerifiedIcon size={15} />
                        <span>{verifying ? t.cve.verifyingButton : t.cve.verifyButton}</span>
                      </button>
                    </div>
                  </form>
                )}

              {/* STEP 3: Verification Verdict & Score Gauge */}
              {verifyResult && (
                <section
                  data-testid="patch-verify-result"
                  className="rounded-xl border border-slate-800 bg-[#0E1525]/92 p-4 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-100">
                      {t.cve.step3Title}
                    </h3>

                    {/* Status Transition Pill */}
                    <div
                      data-testid="patch-status-transition"
                      className="inline-flex items-center gap-1.5 text-[11px] font-mono-tabular"
                    >
                      <span className="text-slate-400">{t.cve.statusTransitionLabel}:</span>
                      <span
                        className={`px-2 py-0.5 rounded border font-semibold ${statusBadgeStyle(verifyResult.previous_status)}`}
                      >
                        {t.cve.statusLabels[verifyResult.previous_status]}
                      </span>
                      <ArrowRightIcon size={13} className="text-slate-400" />
                      <span
                        className={`px-2 py-0.5 rounded border font-semibold ${statusBadgeStyle(verifyResult.new_status)}`}
                      >
                        {t.cve.statusLabels[verifyResult.new_status]}
                      </span>
                    </div>
                  </div>

                  {verifyResult.shield_status === 'HONEYPOT_ENGAGED' ||
                  verifyResult.shield?.blocked ? (
                    <HoneypotInterceptCard
                      reply={
                        verifyResult.reply ||
                        verifyResult.feedback ||
                        t.coach.honeypot.terminalLabel
                      }
                      shieldStatus="HONEYPOT_ENGAGED"
                      shield={verifyResult.shield}
                      modelUsed={verifyResult.model_used}
                      providerUsed={verifyResult.provider_used}
                      failoverUsed={verifyResult.failover_used}
                      latencyMs={verifyResult.latency_ms}
                      t={t.coach}
                    />
                  ) : (
                    <>
                      {/* Passed/Failed Banner + Score Gauge */}
                      <div className="flex flex-col sm:flex-row items-center gap-4 rounded-xl border border-slate-800/90 bg-[#070B14]/85 p-4">
                        <ScoreGaugeSvg
                          score={verifyResult.score}
                          passed={verifyResult.passed}
                          label={t.cve.scoreLabel}
                        />

                        <div className="flex-1 space-y-2.5 text-center sm:text-left min-w-0">
                          <div
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-md border font-mono-tabular text-xs font-bold ${
                              verifyResult.passed
                                ? 'bg-[#10B981]/15 border-[#10B981]/45 text-[#10B981]'
                                : 'bg-[#EF4444]/15 border-[#EF4444]/45 text-[#EF4444]'
                            }`}
                          >
                            {verifyResult.passed ? (
                              <CheckVerifiedIcon size={15} />
                            ) : (
                              <HoneypotAlertIcon size={15} />
                            )}
                            <span>
                              {verifyResult.passed
                                ? t.cve.patchPassedBanner
                                : t.cve.patchFailedBanner}
                            </span>
                          </div>

                          {verifyResult.repetition_scheduled && (
                            <div className="rounded-lg border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-3 py-2 text-xs text-amber-100 flex items-center gap-2">
                              <CalendarDueIcon size={14} className="text-[#F59E0B] shrink-0" />
                              <span>{t.cve.repetitionScheduledNotice}</span>
                            </div>
                          )}

                          {verifyResult.parse_failed && (
                            <div className="rounded-lg border border-[#F59E0B]/45 bg-[#F59E0B]/12 px-3 py-2 text-xs text-amber-100 flex items-center gap-2">
                              <WarningTriangleIcon
                                size={14}
                                className="text-[#F59E0B] shrink-0"
                              />
                              <span>{t.cve.parseFailedNotice}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Auditor Feedback Markdown */}
                      <div className="rounded-lg border border-slate-800/90 bg-[#070B14] p-4 space-y-2">
                        <div className="text-[11px] font-mono-tabular uppercase tracking-wider text-slate-400">
                          {t.cve.feedbackLabel}
                        </div>
                        <SafeMarkdown
                          content={verifyResult.feedback}
                          copyLabel={t.coach.copyCode}
                          copiedLabel={t.coach.copiedCode}
                        />
                      </div>

                      {/* Live Shield Telemetry Strip */}
                      <ShieldTelemetryStrip
                        shieldStatus={verifyResult.shield_status}
                        shield={verifyResult.shield}
                        modelUsed={verifyResult.model_used}
                        providerUsed={verifyResult.provider_used}
                        failoverUsed={verifyResult.failover_used}
                        latencyMs={verifyResult.latency_ms}
                        t={t.coach.shield}
                      />
                    </>
                  )}
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
