import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { launchDemoSession, ReoApiError } from './lib/api';
import type { DemoSessionUser, ReoLang } from './lib/api';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from './i18n/translations';
import { AuthGate } from './components/AuthGate';
import { TopHudBar } from './components/TopHudBar';
import type { ModuleTab } from './components/TopHudBar';
import { StudyCoachModule } from './components/StudyCoachModule';
import { RedBlueArenaModule } from './components/RedBlueArenaModule';
import { CveLabModule } from './components/CveLabModule';
import { SocDashboardModule } from './components/SocDashboardModule';
import {
  RefreshSyncIcon,
  ShieldCoreIcon,
  WarningTriangleIcon,
} from './components/icons/NeonIcons';

const LANG_STORAGE_KEY = 'reo_ui_lang';
const DEMO_META_STORAGE_KEY = 'reo_demo_jury_meta';

interface StoredDemoMeta {
  userId: string;
  isDemoJury: boolean;
  expiresAt: string;
}

interface GlobalAlert {
  type: 'session_expired' | 'rate_limit';
  message: string;
}

function readInitialLang(): ReoLang {
  try {
    const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.includes(saved as ReoLang)) {
      return saved as ReoLang;
    }
  } catch {
    // Ignore storage unavailability
  }
  return 'en';
}

function readDemoMeta(userId: string): StoredDemoMeta | null {
  try {
    const raw = window.sessionStorage.getItem(DEMO_META_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as StoredDemoMeta;
    if (parsed.userId === userId && parsed.isDemoJury && parsed.expiresAt) {
      return parsed;
    }
  } catch {
    // Ignore parse/storage issues
  }
  return null;
}

function persistDemoMeta(meta: StoredDemoMeta | null): void {
  try {
    if (!meta) {
      window.sessionStorage.removeItem(DEMO_META_STORAGE_KEY);
    } else {
      window.sessionStorage.setItem(DEMO_META_STORAGE_KEY, JSON.stringify(meta));
    }
  } catch {
    // Ignore storage issues
  }
}

function deriveDemoMetaFromSession(session: Session): {
  isDemoJury: boolean;
  expiresAt: string | null;
} {
  const stored = readDemoMeta(session.user.id);
  if (stored) {
    return { isDemoJury: stored.isDemoJury, expiresAt: stored.expiresAt };
  }
  const email = session.user.email || '';
  const metadata = session.user.user_metadata as Record<string, unknown> | undefined;
  const isDemo =
    email.endsWith('@demo.reo-shield.local') || metadata?.is_demo_jury === true;
  if (!isDemo) {
    return { isDemoJury: false, expiresAt: null };
  }
  const metaExpiry =
    typeof metadata?.expires_at === 'string'
      ? metadata.expires_at
      : session.expires_at
        ? new Date(session.expires_at * 1000).toISOString()
        : null;
  return { isDemoJury: true, expiresAt: metaExpiry };
}

export default function App() {
  const [lang, setLang] = useState<ReoLang>(readInitialLang);
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [isDemoJury, setIsDemoJury] = useState(false);
  const [demoExpiresAt, setDemoExpiresAt] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ModuleTab>('coach');
  const [renewingSandbox, setRenewingSandbox] = useState(false);
  const [globalAlert, setGlobalAlert] = useState<GlobalAlert | null>(null);

  const t = TRANSLATIONS[lang];

  const handleLangChange = useCallback((nextLang: ReoLang) => {
    setLang(nextLang);
    document.documentElement.lang = nextLang;
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, nextLang);
    } catch {
      // Ignore storage errors
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) {
        return;
      }
      const initialSession = data.session ?? null;
      setSession(initialSession);
      if (initialSession) {
        const derived = deriveDemoMetaFromSession(initialSession);
        setIsDemoJury(derived.isDemoJury);
        setDemoExpiresAt(derived.expiresAt);
      }
      setSessionLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) {
        const derived = deriveDemoMetaFromSession(nextSession);
        setIsDemoJury(derived.isDemoJury);
        setDemoExpiresAt(derived.expiresAt);
      } else {
        setIsDemoJury(false);
        setDemoExpiresAt(null);
        persistDemoMeta(null);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [session?.user?.id]);

  const handleDemoSessionStarted = useCallback((demoUser: DemoSessionUser) => {
    setIsDemoJury(demoUser.is_demo_jury);
    setDemoExpiresAt(demoUser.expires_at);
    setGlobalAlert(null);
    persistDemoMeta({
      userId: demoUser.id,
      isDemoJury: demoUser.is_demo_jury,
      expiresAt: demoUser.expires_at,
    });
  }, []);

  const handleApiError = useCallback(
    (err: unknown) => {
      if (err instanceof ReoApiError) {
        if (err.code === 'demo_session_expired' || err.code === 'unauthorized') {
          setGlobalAlert({
            type: 'session_expired',
            message: t.hud.sessionExpiredBanner,
          });
          return;
        }
        if (err.code === 'rate_limit_exceeded') {
          setGlobalAlert({
            type: 'rate_limit',
            message: t.hud.rateLimitBanner,
          });
        }
      }
    },
    [t.hud.rateLimitBanner, t.hud.sessionExpiredBanner],
  );

  const handleRenewSandbox = useCallback(async () => {
    setRenewingSandbox(true);
    try {
      const data = await launchDemoSession();
      const { error } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
      if (error) {
        throw new Error(error.message);
      }
      handleDemoSessionStarted(data.user);
    } catch (err) {
      handleApiError(err);
    } finally {
      setRenewingSandbox(false);
    }
  }, [handleApiError, handleDemoSessionStarted]);

  const handleSignOut = useCallback(async () => {
    setGlobalAlert(null);
    persistDemoMeta(null);
    await supabase.auth.signOut();
  }, []);

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-[#070B14] text-slate-200 flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-sm font-mono-tabular text-slate-300">
          <ShieldCoreIcon size={20} className="text-[#00F0FF]" />
          <span>{t.hud.loadingSession}</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <AuthGate
        lang={lang}
        onLangChange={handleLangChange}
        t={t}
        onDemoSessionStarted={handleDemoSessionStarted}
      />
    );
  }

  const userEmail = session.user.email || session.user.id;

  return (
    <div className="min-h-screen bg-[#070B14] soc-grid-bg text-slate-100 flex flex-col">
      <TopHudBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        lang={lang}
        onLangChange={handleLangChange}
        t={t}
        userEmail={userEmail}
        isDemoJury={isDemoJury}
        demoExpiresAt={demoExpiresAt}
        onRenewSandbox={handleRenewSandbox}
        renewingSandbox={renewingSandbox}
        onSignOut={handleSignOut}
      />

      {globalAlert && (
        <div
          role="alert"
          className={`border-b px-4 sm:px-6 py-3 ${
            globalAlert.type === 'session_expired'
              ? 'bg-[#EF4444]/12 border-[#EF4444]/35 text-red-100'
              : 'bg-[#F59E0B]/12 border-[#F59E0B]/35 text-amber-100'
          }`}
        >
          <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <WarningTriangleIcon
                size={18}
                className={
                  globalAlert.type === 'session_expired' ? 'text-[#EF4444]' : 'text-[#F59E0B]'
                }
              />
              <span>{globalAlert.message}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {globalAlert.type === 'session_expired' && (
                <button
                  type="button"
                  onClick={handleRenewSandbox}
                  disabled={renewingSandbox}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#00F0FF] text-[#070B14] font-semibold text-xs cursor-pointer disabled:opacity-60"
                >
                  <RefreshSyncIcon size={14} />
                  <span>{renewingSandbox ? t.hud.renewingSession : t.hud.renewSession}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setGlobalAlert(null)}
                className="px-2.5 py-1.5 rounded-md border border-slate-600/70 text-xs text-slate-200 hover:bg-slate-800/70 cursor-pointer"
              >
                {t.hud.dismissNotice}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {activeTab === 'coach' && (
          <StudyCoachModule
            accessToken={session.access_token}
            userId={session.user.id}
            lang={lang}
            t={t}
            isDemoJury={isDemoJury}
            onRenewSandbox={handleRenewSandbox}
            renewingSandbox={renewingSandbox}
            onSignOut={handleSignOut}
          />
        )}
        {activeTab === 'arena' && (
          <RedBlueArenaModule
            accessToken={session.access_token}
            userId={session.user.id}
            lang={lang}
            t={t}
            isDemoJury={isDemoJury}
            onRenewSandbox={handleRenewSandbox}
            renewingSandbox={renewingSandbox}
            onSignOut={handleSignOut}
          />
        )}
        {activeTab === 'cve' && (
          <CveLabModule
            accessToken={session.access_token}
            userId={session.user.id}
            lang={lang}
            t={t}
            isDemoJury={isDemoJury}
            onRenewSandbox={handleRenewSandbox}
            renewingSandbox={renewingSandbox}
            onSignOut={handleSignOut}
          />
        )}
        {activeTab === 'soc' && (
          <SocDashboardModule
            accessToken={session.access_token}
            userId={session.user.id}
            lang={lang}
            t={t}
            isDemoJury={isDemoJury}
            onRenewSandbox={handleRenewSandbox}
            renewingSandbox={renewingSandbox}
            onSignOut={handleSignOut}
          />
        )}
      </main>
    </div>
  );
}
