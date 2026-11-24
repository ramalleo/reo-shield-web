import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { supabase } from '../lib/supabase';
import type { ReoMessage, ReoThread } from '../lib/supabase';
import { callReoGateway, ReoApiError } from '../lib/api';
import type { ModelProfile, ReoLang, ReoSubject } from '../lib/api';
import { useKeystrokeTelemetry } from '../lib/biometrics';
import {
  MAX_HISTORY_TURNS,
  MAX_PROMPT_LENGTH,
  MODEL_PROFILES,
  REO_SUBJECTS,
  buildCleanGatewayHistory,
  isValidSubject,
  shortSessionHash,
  sortThreadsByRecent,
} from '../lib/coachUtils';
import type { CoachMessage } from '../lib/coachUtils';
import type { TranslationDictionary } from '../i18n/translations';
import { SafeMarkdown } from './SafeMarkdown';
import { ShieldTelemetryStrip } from './ShieldTelemetryStrip';
import { HoneypotInterceptCard } from './HoneypotInterceptCard';
import {
  BiometricsPulseIcon,
  BoltFastIcon,
  BrainDeepIcon,
  CloseXIcon,
  CpuPlusIcon,
  LayersMaxIcon,
  MessageThreadIcon,
  PlusSessionIcon,
  RefreshSyncIcon,
  SendArrowIcon,
  ShieldCoreIcon,
  SidebarMenuIcon,
  SignOutIcon,
  StudyCoachIcon,
  TrashDeleteIcon,
  WarningTriangleIcon,
} from './icons/NeonIcons';

interface StudyCoachModuleProps {
  accessToken: string;
  userId: string;
  lang: ReoLang;
  t: TranslationDictionary;
  isDemoJury: boolean;
  onRenewSandbox: () => void;
  renewingSandbox: boolean;
  onSignOut: () => void;
}

type CoachErrorState =
  | { kind: '401'; detail?: string }
  | { kind: '429'; retryAfterSeconds: number | null }
  | { kind: 'network'; detail?: string }
  | { kind: 'threads_load' }
  | { kind: 'thread_delete' };

const PROFILE_ICONS: Record<ModelProfile, typeof BoltFastIcon> = {
  fast: BoltFastIcon,
  deep: BrainDeepIcon,
  qwen_plus: CpuPlusIcon,
  qwen_max: LayersMaxIcon,
};

export function StudyCoachModule({
  accessToken,
  userId,
  lang,
  t,
  isDemoJury,
  onRenewSandbox,
  renewingSandbox,
  onSignOut,
}: StudyCoachModuleProps) {
  const [threads, setThreads] = useState<ReoThread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const [subject, setSubject] = useState<ReoSubject>('Cybersecurity');
  const [modelProfile, setModelProfile] = useState<ModelProfile>('fast');
  const [prompt, setPrompt] = useState('');
  const [sending, setSending] = useState(false);
  const [pendingUserPrompt, setPendingUserPrompt] = useState<string | null>(null);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingThreadId, setDeletingThreadId] = useState<string | null>(null);
  const [errorState, setErrorState] = useState<CoachErrorState | null>(null);

  const biometrics = useKeystrokeTelemetry();
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const fetchThreads = useCallback(async () => {
    setThreadsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reo_threads')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        setErrorState({ kind: 'threads_load' });
        return;
      }
      setThreads(sortThreadsByRecent((data || []) as ReoThread[]));
    } catch {
      setErrorState({ kind: 'threads_load' });
    } finally {
      setThreadsLoading(false);
    }
  }, []);

  useEffect(() => {
    setActiveThreadId(null);
    setMessages([]);
    setConfirmDeleteId(null);
    setErrorState(null);
    fetchThreads();
  }, [userId, fetchThreads]);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length, sending]);

  const handleSelectThread = useCallback(async (thread: ReoThread) => {
    setActiveThreadId(thread.id);
    setConfirmDeleteId(null);
    setMobileSidebarOpen(false);
    setErrorState(null);
    if (isValidSubject(thread.subject)) {
      setSubject(thread.subject);
    }

    setMessagesLoading(true);
    try {
      const { data, error } = await supabase
        .from('reo_messages')
        .select('*')
        .eq('thread_id', thread.id)
        .order('created_at', { ascending: true });

      if (error) {
        setErrorState({ kind: 'threads_load' });
        setMessages([]);
        return;
      }

      const mapped: CoachMessage[] = ((data || []) as ReoMessage[]).map((row) => ({
        id: row.id,
        role: row.role,
        content: row.content,
        createdAt: row.created_at,
      }));
      setMessages(mapped);
    } catch {
      setErrorState({ kind: 'threads_load' });
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  const handleNewSession = useCallback(() => {
    setActiveThreadId(null);
    setMessages([]);
    setConfirmDeleteId(null);
    setErrorState(null);
    setMobileSidebarOpen(false);
    biometrics.reset();
    textareaRef.current?.focus();
  }, [biometrics]);

  const handleDeleteThread = useCallback(
    async (threadId: string) => {
      setDeletingThreadId(threadId);
      setErrorState(null);
      try {
        const { error } = await supabase.from('reo_threads').delete().eq('id', threadId);
        if (error) {
          setErrorState({ kind: 'thread_delete' });
          return;
        }
        setThreads((prev) => prev.filter((item) => item.id !== threadId));
        if (activeThreadId === threadId) {
          setActiveThreadId(null);
          setMessages([]);
        }
        setConfirmDeleteId(null);
      } catch {
        setErrorState({ kind: 'thread_delete' });
      } finally {
        setDeletingThreadId(null);
      }
    },
    [activeThreadId],
  );

  const submitPrompt = useCallback(
    async (overridePrompt?: string) => {
      const rawText = typeof overridePrompt === 'string' ? overridePrompt : prompt;
      const trimmed = rawText.trim();
      if (!trimmed || sending || trimmed.length > MAX_PROMPT_LENGTH) {
        return;
      }

      const submittedPrompt = trimmed;

      setErrorState(null);
      setSending(true);
      setPendingUserPrompt(submittedPrompt);
      setPrompt('');

      const telemetryHeader = biometrics.buildHeader();
      biometrics.reset();

      const cleanHistory = buildCleanGatewayHistory(messages, MAX_HISTORY_TURNS);

      try {
        const response = await callReoGateway(
          {
            prompt: submittedPrompt,
            history: cleanHistory,
            ...(activeThreadId ? { thread_id: activeThreadId } : {}),
            lang,
            subject,
            model_profile: modelProfile,
            is_simulation: false,
          },
          {
            accessToken,
            telemetryHeader,
          },
        );

        const nowIso = new Date().toISOString();
        const isHoneypot =
          response.shield_status === 'HONEYPOT_ENGAGED' || response.shield?.blocked === true;

        const userMsg: CoachMessage = {
          id: `local-user-${Date.now()}`,
          role: 'user',
          content: submittedPrompt,
          createdAt: nowIso,
        };

        const assistantMsg: CoachMessage = {
          id: `local-model-${Date.now() + 1}`,
          role: 'model',
          content: response.reply,
          createdAt: nowIso,
          isHoneypot,
          shieldStatus: response.shield_status,
          modelUsed: response.model_used,
          providerUsed: response.provider_used,
          failoverUsed: response.failover_used,
          latencyMs: response.latency_ms,
          shield: response.shield,
        };

        setMessages((prev) => [...prev, userMsg, assistantMsg]);
        setPendingUserPrompt(null);

        // Anti-duplication rule: reo-gateway already persisted clean turns server-side.
        // Only bind the server-returned thread_id and refresh the RLS threads list.
        if (!isHoneypot && response.thread_id) {
          setActiveThreadId(response.thread_id);
          void fetchThreads();
        }
      } catch (err) {
        setPendingUserPrompt(null);
        if (err instanceof ReoApiError) {
          if (err.code === 'demo_session_expired' || err.code === 'unauthorized') {
            setErrorState({ kind: '401', detail: err.message });
          } else if (err.code === 'rate_limit_exceeded') {
            setPrompt(submittedPrompt);
            setErrorState({ kind: '429', retryAfterSeconds: err.retryAfterSeconds });
          } else {
            setPrompt(submittedPrompt);
            setErrorState({ kind: 'network', detail: err.message });
          }
        } else {
          setPrompt(submittedPrompt);
          setErrorState({
            kind: 'network',
            detail: err instanceof Error ? err.message : undefined,
          });
        }
      } finally {
        setSending(false);
      }
    },
    [
      accessToken,
      activeThreadId,
      biometrics,
      fetchThreads,
      lang,
      messages,
      modelProfile,
      prompt,
      sending,
      subject,
    ],
  );

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitPrompt();
  };

  const handleTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    biometrics.onKeyDown(event);
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void submitPrompt();
    }
  };

  const handleStarterPromptClick = (text: string, starterSubject: ReoSubject) => {
    setSubject(starterSubject);
    setPrompt(text);
    textareaRef.current?.focus();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0A101E]">
      <div className="px-3.5 py-3 border-b border-[#00F0FF]/14 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <MessageThreadIcon size={16} className="text-[#00F0FF] shrink-0" />
          <h2 className="font-display text-[13px] font-bold text-slate-100 whitespace-nowrap truncate">
            {t.coach.sidebarTitle}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleNewSession}
            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#00F0FF]/12 hover:bg-[#00F0FF]/20 border border-[#00F0FF]/35 text-[#00F0FF] text-[11px] font-semibold transition-colors whitespace-nowrap cursor-pointer"
          >
            <PlusSessionIcon size={13} />
            <span>{t.coach.newSession}</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label={t.coach.closeSidebarAria}
            className="lg:hidden inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-700/70 text-slate-300 hover:text-slate-50 cursor-pointer"
          >
            <CloseXIcon size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
        {threadsLoading ? (
          <div className="px-3 py-6 text-xs font-mono-tabular text-slate-400">
            {t.coach.loadingThreads}
          </div>
        ) : threads.length === 0 ? (
          <div className="px-3 py-6 text-xs text-slate-400 leading-relaxed">
            {t.coach.emptyThreads}
          </div>
        ) : (
          threads.map((thread) => {
            const isActive = thread.id === activeThreadId;
            const isConfirming = confirmDeleteId === thread.id;
            const isDeleting = deletingThreadId === thread.id;
            const subjectDisplay = isValidSubject(thread.subject)
              ? t.coach.subjects[thread.subject]
              : thread.subject;

            return (
              <div
                key={thread.id}
                className={`rounded-lg border transition-colors ${
                  isActive
                    ? 'bg-[#121C31] border-[#00F0FF]/35'
                    : 'bg-transparent border-transparent hover:bg-[#0E1525] hover:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-1.5 p-2.5">
                  <button
                    type="button"
                    onClick={() => handleSelectThread(thread)}
                    className="flex-1 min-w-0 text-left space-y-1 cursor-pointer"
                  >
                    <div
                      className={`text-xs font-medium truncate ${
                        isActive ? 'text-[#00F0FF]' : 'text-slate-200'
                      }`}
                    >
                      {thread.title || t.coach.newSession}
                    </div>
                    <div className="text-[11px] font-mono-tabular text-slate-500 truncate">
                      {subjectDisplay}
                    </div>
                  </button>

                  {!isConfirming && (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(thread.id)}
                      aria-label={`${t.coach.deleteThreadAria}: ${thread.title || thread.id}`}
                      className="p-1.5 rounded text-slate-500 hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors shrink-0 cursor-pointer"
                    >
                      <TrashDeleteIcon size={14} />
                    </button>
                  )}
                </div>

                {isConfirming && (
                  <div className="px-2.5 pb-2.5 pt-1 flex items-center justify-end gap-1.5 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      disabled={isDeleting}
                      className="px-2 py-1 rounded text-[11px] text-slate-300 hover:bg-slate-800 cursor-pointer"
                    >
                      {t.coach.cancelDelete}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeleteThread(thread.id)}
                      disabled={isDeleting}
                      className="px-2.5 py-1 rounded bg-[#EF4444]/20 hover:bg-[#EF4444]/30 border border-[#EF4444]/45 text-[11px] font-semibold text-red-200 cursor-pointer disabled:opacity-50"
                    >
                      {t.coach.confirmDelete}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="soc-surface rounded-xl overflow-hidden flex min-h-[calc(100vh-8.5rem)] lg:h-[calc(100vh-7.5rem)] relative">
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-[292px] shrink-0 border-r border-[#00F0FF]/14">
        {sidebarContent}
      </aside>

      {/* Mobile / Tablet Slide-Over Drawer */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <button
            type="button"
            aria-label={t.coach.closeSidebarAria}
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs cursor-pointer"
          />
          <aside className="relative z-50 w-[290px] max-w-[85vw] h-full border-r border-[#00F0FF]/25 shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Study Coach Column */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0E1525]/70">
        {/* Top Controls Toolbar */}
        <div className="px-4 sm:px-5 py-3 border-b border-[#00F0FF]/14 bg-[#0B1120] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label={t.coach.toggleSidebarAria}
              className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-700/80 bg-[#070B14] text-slate-200 hover:border-[#00F0FF]/40 hover:text-[#00F0FF] cursor-pointer shrink-0"
            >
              <SidebarMenuIcon size={17} />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <label
                htmlFor="coach-subject-select"
                className="text-xs text-slate-400 whitespace-nowrap hidden sm:inline"
              >
                {t.coach.subjectLabel}
              </label>
              <select
                id="coach-subject-select"
                aria-label={t.coach.subjectLabel}
                value={subject}
                onChange={(e) => setSubject(e.target.value as ReoSubject)}
                className="min-h-[36px] px-2.5 py-1.5 rounded-lg bg-[#070B14] border border-slate-700/80 text-xs font-medium text-slate-100 focus:border-[#00F0FF]/60 cursor-pointer"
              >
                {REO_SUBJECTS.map((subj) => (
                  <option key={subj} value={subj}>
                    {t.coach.subjects[subj]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Model Profile Switcher */}
          <div
            role="group"
            aria-label={t.coach.modelProfileLabel}
            className="flex items-center gap-1 p-1 rounded-lg bg-[#070B14] border border-slate-800/90 overflow-x-auto max-w-full"
          >
            {MODEL_PROFILES.map((profile) => {
              const Icon = PROFILE_ICONS[profile];
              const active = modelProfile === profile;
              return (
                <button
                  key={profile}
                  type="button"
                  onClick={() => setModelProfile(profile)}
                  aria-pressed={active}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/35'
                      : 'text-slate-400 hover:text-slate-100 border border-transparent'
                  }`}
                >
                  <Icon size={14} />
                  <span>{t.coach.profiles[profile]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inline Error Banner (401 / 429 / Network / RLS) */}
        {errorState && (
          <div
            role="alert"
            className={`px-4 sm:px-5 py-3 border-b text-xs sm:text-sm ${
              errorState.kind === '401'
                ? 'bg-[#EF4444]/12 border-[#EF4444]/40 text-red-100'
                : 'bg-[#F59E0B]/12 border-[#F59E0B]/40 text-amber-100'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <WarningTriangleIcon
                  size={17}
                  className={
                    errorState.kind === '401'
                      ? 'text-[#EF4444] shrink-0 mt-0.5'
                      : 'text-[#F59E0B] shrink-0 mt-0.5'
                  }
                />
                <div className="space-y-0.5 min-w-0">
                  <div className="font-semibold">
                    {errorState.kind === '401'
                      ? t.coach.error401Title
                      : errorState.kind === '429'
                        ? t.coach.error429Title
                        : errorState.kind === 'threads_load'
                          ? t.coach.errorLoadThreads
                          : errorState.kind === 'thread_delete'
                            ? t.coach.errorDeleteThread
                            : t.coach.errorNetworkTitle}
                  </div>
                  <p className="text-xs opacity-90">
                    {errorState.kind === '401'
                      ? t.coach.error401Desc
                      : errorState.kind === '429'
                        ? `${t.coach.error429Desc}${
                            errorState.retryAfterSeconds
                              ? ` (${errorState.retryAfterSeconds}s)`
                              : ''
                          }`
                        : errorState.kind === 'network'
                          ? errorState.detail || t.coach.errorNetworkDesc
                          : ''}
                  </p>
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
                    <RefreshSyncIcon size={13} />
                    <span>{renewingSandbox ? t.hud.renewingSession : t.hud.renewSession}</span>
                  </button>
                )}
                {errorState.kind === '401' && (
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-red-300/40 text-xs text-red-100 hover:bg-red-500/20 cursor-pointer"
                  >
                    <SignOutIcon size={13} />
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
          </div>
        )}

        {/* Messages Viewport */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5">
          {messagesLoading ? (
            <div className="py-12 flex items-center justify-center gap-2.5 text-xs font-mono-tabular text-slate-400">
              <ShieldCoreIcon size={18} className="text-[#00F0FF]" />
              <span>{t.coach.loadingMessages}</span>
            </div>
          ) : messages.length === 0 && !pendingUserPrompt ? (
            <div className="max-w-2xl mx-auto py-8 sm:py-12 space-y-7">
              <div className="space-y-2.5">
                <div className="w-11 h-11 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/25 flex items-center justify-center text-[#00F0FF]">
                  <StudyCoachIcon size={22} />
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-50">
                  {t.coach.welcomeTitle}
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  {t.coach.welcomeDescription}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-800/80">
                <div className="text-xs font-mono-tabular text-slate-400">
                  {t.coach.starterPromptsLabel}
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {(
                    [
                      { key: 'cyber', subj: 'Cybersecurity' as ReoSubject, text: t.coach.starterPrompts.cyber },
                      { key: 'math', subj: 'Mathematics' as ReoSubject, text: t.coach.starterPrompts.math },
                      { key: 'informatics', subj: 'Informatics' as ReoSubject, text: t.coach.starterPrompts.informatics },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleStarterPromptClick(item.text, item.subj)}
                      className="text-left p-3.5 rounded-lg bg-[#070B14]/85 hover:bg-[#121C31] border border-slate-800 hover:border-[#00F0FF]/35 transition-colors space-y-1 cursor-pointer"
                    >
                      <div className="text-[11px] font-mono-tabular text-[#00F0FF]">
                        {t.coach.subjects[item.subj]}
                      </div>
                      <div className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                        {item.text}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-5">
              {messages.map((msg) => {
                if (msg.role === 'user') {
                  return (
                    <div key={msg.id} className="flex justify-end">
                      <div className="max-w-[88%] sm:max-w-[78%] rounded-xl bg-[#121C31] border border-[#00F0FF]/25 px-4 py-3 space-y-1">
                        <div className="text-[11px] font-mono-tabular text-[#00F0FF]">
                          {t.coach.roleUser}
                        </div>
                        <p className="text-sm sm:text-[15px] text-slate-100 whitespace-pre-wrap break-words leading-relaxed">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  );
                }

                const isHoneypot =
                  msg.isHoneypot ||
                  msg.shieldStatus === 'HONEYPOT_ENGAGED' ||
                  msg.shield?.blocked === true;

                if (isHoneypot && msg.shield) {
                  return (
                    <div key={msg.id} className="w-full">
                      <HoneypotInterceptCard
                        reply={msg.content}
                        shieldStatus={msg.shieldStatus || 'HONEYPOT_ENGAGED'}
                        shield={msg.shield}
                        modelUsed={msg.modelUsed}
                        providerUsed={msg.providerUsed}
                        failoverUsed={msg.failoverUsed}
                        latencyMs={msg.latencyMs}
                        t={t.coach}
                      />
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className="w-full">
                    <div className="rounded-xl bg-[#0B1221] border border-slate-800/90 px-4 sm:px-5 py-4">
                      <div className="flex items-center gap-2 mb-2.5 text-xs font-mono-tabular text-slate-400">
                        <ShieldCoreIcon size={15} className="text-[#00F0FF]" />
                        <span className="text-slate-200 font-semibold">
                          {t.coach.roleAssistant}
                        </span>
                      </div>

                      <SafeMarkdown
                        content={msg.content}
                        copyLabel={t.coach.copyCode}
                        copiedLabel={t.coach.copiedCode}
                      />

                      {msg.shield && msg.shieldStatus && (
                        <ShieldTelemetryStrip
                          shieldStatus={msg.shieldStatus}
                          shield={msg.shield}
                          modelUsed={msg.modelUsed}
                          providerUsed={msg.providerUsed}
                          failoverUsed={msg.failoverUsed}
                          latencyMs={msg.latencyMs}
                          t={t.coach.shield}
                        />
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Optimistic Pending Turn + Analyzing SOC Indicator */}
              {pendingUserPrompt && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <div className="max-w-[88%] sm:max-w-[78%] rounded-xl bg-[#121C31] border border-[#00F0FF]/25 px-4 py-3 space-y-1">
                      <div className="text-[11px] font-mono-tabular text-[#00F0FF]">
                        {t.coach.roleUser}
                      </div>
                      <p className="text-sm sm:text-[15px] text-slate-100 whitespace-pre-wrap break-words leading-relaxed">
                        {pendingUserPrompt}
                      </p>
                    </div>
                  </div>

                  <div
                    role="status"
                    data-testid="shield-analyzing-indicator"
                    className="rounded-xl border border-[#00F0FF]/35 bg-[#070B14] px-4 py-3.5 flex items-center gap-3"
                  >
                    <ShieldCoreIcon size={18} className="text-[#00F0FF] animate-spin shrink-0" />
                    <span className="text-xs sm:text-sm font-mono-tabular text-[#00F0FF]">
                      {t.coach.analyzingStatus}
                    </span>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Composer + Compact Live Biometrics HUD */}
        <div className="px-4 sm:px-6 py-3.5 border-t border-[#00F0FF]/14 bg-[#0B1120]">
          <form onSubmit={handleFormSubmit} className="max-w-4xl mx-auto space-y-2.5">
            {/* Compact Live Biometrics HUD Strip */}
            <div
              data-testid="composer-biometrics-hud"
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[11px] font-mono-tabular text-slate-400"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="inline-flex items-center gap-1.5 text-[#00F0FF]">
                  <BiometricsPulseIcon size={14} />
                  <span>x-reo-telemetry</span>
                </span>
                <span aria-hidden="true" className="text-slate-600">
                  ·
                </span>
                <span>
                  {t.coach.bioSamplesLabel}:{' '}
                  <strong className="text-slate-100" data-testid="composer-bio-samples">
                    {biometrics.sampleCount}
                  </strong>
                </span>
                <span aria-hidden="true" className="text-slate-600">
                  ·
                </span>
                <span>
                  {t.coach.bioPastesLabel}:{' '}
                  <strong
                    className={biometrics.pasteEvents > 0 ? 'text-[#F59E0B]' : 'text-slate-100'}
                    data-testid="composer-bio-pastes"
                  >
                    {biometrics.pasteEvents}
                  </strong>
                </span>
                <span aria-hidden="true" className="text-slate-600">
                  ·
                </span>
                <span>
                  {t.coach.bioSessionLabel}:{' '}
                  <span className="text-slate-300">{shortSessionHash(biometrics.sessionId)}</span>
                </span>
              </div>

              <span
                className={
                  prompt.length > MAX_PROMPT_LENGTH - 500 ? 'text-[#F59E0B]' : 'text-slate-500'
                }
              >
                {prompt.length} / {MAX_PROMPT_LENGTH}
              </span>
            </div>

            <div className="flex items-end gap-2.5">
              <div className="flex-1 min-w-0">
                <label htmlFor="coach-prompt-textarea" className="sr-only">
                  {t.coach.composerLabel}
                </label>
                <textarea
                  ref={textareaRef}
                  id="coach-prompt-textarea"
                  rows={2}
                  maxLength={MAX_PROMPT_LENGTH}
                  value={prompt}
                  disabled={sending}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleTextareaKeyDown}
                  onPaste={biometrics.onPaste}
                  placeholder={t.coach.composerPlaceholder}
                  className="w-full rounded-lg bg-[#070B14] border border-slate-700/80 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[#00F0FF]/60 transition-colors resize-y min-h-[48px] max-h-[200px] disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={sending || !prompt.trim()}
                className="min-h-[48px] px-4 sm:px-5 rounded-lg bg-[#00F0FF] hover:bg-[#38F4FF] active:bg-[#00D7E5] disabled:opacity-45 disabled:cursor-not-allowed text-[#070B14] font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <SendArrowIcon size={16} />
                <span>{sending ? t.coach.sendingLabel : t.coach.sendButton}</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 hidden sm:block">
              {t.coach.shiftEnterHint}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
