import { useState } from 'react';
import type { FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { launchDemoSession, ReoApiError } from '../lib/api';
import type { DemoSessionUser, ReoLang } from '../lib/api';
import type { TranslationDictionary } from '../i18n/translations';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  ArrowRightIcon,
  AuditArenaIcon,
  CheckVerifiedIcon,
  CveLabIcon,
  JurySandboxIcon,
  LockAccessIcon,
  ShieldCoreIcon,
  SocRadarIcon,
  StudyCoachIcon,
  WarningTriangleIcon,
} from './icons/NeonIcons';

interface AuthGateProps {
  lang: ReoLang;
  onLangChange: (lang: ReoLang) => void;
  t: TranslationDictionary;
  onDemoSessionStarted: (demoUser: DemoSessionUser) => void;
}

type AuthMode = 'signin' | 'signup';
type AuthErrorState =
  | { kind: 'validation_email' }
  | { kind: 'validation_password' }
  | { kind: 'rate_limit' }
  | { kind: 'fallback' }
  | { kind: 'raw'; message: string };

export function AuthGate({ lang, onLangChange, t, onDemoSessionStarted }: AuthGateProps) {
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [errorState, setErrorState] = useState<AuthErrorState | null>(null);
  const [showSignUpNotice, setShowSignUpNotice] = useState(false);

  const resolvedErrorMessage = errorState
    ? errorState.kind === 'validation_email'
      ? t.auth.validationEmailRequired
      : errorState.kind === 'validation_password'
        ? t.auth.validationPasswordMin
        : errorState.kind === 'rate_limit'
          ? t.hud.rateLimitBanner
          : errorState.kind === 'fallback'
            ? t.auth.authErrorFallback
            : errorState.message
    : null;

  const handleLaunchSandbox = async () => {
    setErrorState(null);
    setShowSignUpNotice(false);
    setSandboxLoading(true);
    try {
      const data = await launchDemoSession();
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
      if (sessionError) {
        throw new Error(sessionError.message);
      }
      onDemoSessionStarted(data.user);
    } catch (err) {
      if (err instanceof ReoApiError && err.code === 'rate_limit_exceeded') {
        setErrorState({ kind: 'rate_limit' });
      } else if (err instanceof Error && err.message) {
        setErrorState({ kind: 'raw', message: err.message });
      } else {
        setErrorState({ kind: 'fallback' });
      }
    } finally {
      setSandboxLoading(false);
    }
  };

  const handleEmailAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorState(null);
    setShowSignUpNotice(false);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorState({ kind: 'validation_email' });
      return;
    }
    if (password.length < 6) {
      setErrorState({ kind: 'validation_password' });
      return;
    }

    setAuthLoading(true);
    try {
      if (authMode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (error) {
          setErrorState(
            error.message ? { kind: 'raw', message: error.message } : { kind: 'fallback' },
          );
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
        });
        if (error) {
          setErrorState(
            error.message ? { kind: 'raw', message: error.message } : { kind: 'fallback' },
          );
        } else if (!data.session) {
          setShowSignUpNotice(true);
        }
      }
    } catch (err) {
      setErrorState(
        err instanceof Error && err.message
          ? { kind: 'raw', message: err.message }
          : { kind: 'fallback' },
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const modules = [
    {
      id: 'coach',
      icon: StudyCoachIcon,
      title: t.auth.featureCoachTitle,
      desc: t.auth.featureCoachDesc,
    },
    {
      id: 'arena',
      icon: AuditArenaIcon,
      title: t.auth.featureArenaTitle,
      desc: t.auth.featureArenaDesc,
    },
    {
      id: 'cve',
      icon: CveLabIcon,
      title: t.auth.featureCveTitle,
      desc: t.auth.featureCveDesc,
    },
    {
      id: 'soc',
      icon: SocRadarIcon,
      title: t.auth.featureSocTitle,
      desc: t.auth.featureSocDesc,
    },
  ];

  return (
    <div className="min-h-screen bg-[#070B14] soc-grid-bg text-slate-100 flex flex-col">
      <header className="w-full max-w-[1360px] mx-auto px-6 sm:px-8 py-5 flex items-center justify-between gap-4 border-b border-slate-800/70">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF] shrink-0">
            <ShieldCoreIcon size={20} />
          </div>
          <span className="font-display text-base sm:text-lg font-bold tracking-tight text-slate-50 whitespace-nowrap truncate">
            {t.brand.name}
          </span>
        </div>
        <LanguageSwitcher lang={lang} onChange={onLangChange} ariaLabel={t.langSwitcher.label} />
      </header>

      <main className="flex-1 w-full max-w-[1360px] mx-auto px-6 sm:px-8 py-10 lg:py-14 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: Platform Architecture Identity */}
          <section className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <p className="text-xs font-mono-tabular text-[#00F0FF] tracking-wide">
                {t.brand.platformTagline}
              </p>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-bold leading-[1.15] tracking-tight text-slate-50 [text-wrap:balance] max-w-2xl">
                {t.auth.heroTitle}
              </h1>
              <p className="text-base text-slate-300 leading-relaxed max-w-[64ch]">
                {t.auth.heroDescription}
              </p>
            </div>

            <div className="pt-6 border-t border-slate-800/80 space-y-5">
              <h2 className="text-sm font-semibold text-slate-200 tracking-wide">
                {t.auth.modulesHeading}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                {modules.map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <div key={mod.id} className="flex items-start gap-3.5">
                      <div className="mt-0.5 w-9 h-9 rounded-lg bg-[#0E1525] border border-[#00F0FF]/18 flex items-center justify-center text-[#00F0FF] shrink-0">
                        <Icon size={18} />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-100">{mod.title}</h3>
                        <p className="text-xs sm:text-[13px] text-slate-400 leading-relaxed">
                          {mod.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Right Column: Access Gate & 1-Click Jury Sandbox */}
          <section className="lg:col-span-5">
            <div className="soc-surface rounded-xl p-6 sm:p-7 space-y-6">
              {/* Primary Action: 1-Click 2-Hour Jury Sandbox */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-2 text-xs font-mono-tabular text-[#00F0FF]">
                  <JurySandboxIcon size={16} />
                  <span>{t.auth.sandboxEyebrow}</span>
                </div>
                <div className="space-y-1.5">
                  <h2 className="font-display text-xl font-bold text-slate-50">
                    {t.auth.sandboxTitle}
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {t.auth.sandboxDescription}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLaunchSandbox}
                  disabled={sandboxLoading || authLoading}
                  className="w-full min-h-[46px] px-5 py-3 rounded-lg bg-[#00F0FF] hover:bg-[#38F4FF] active:bg-[#00D7E5] disabled:opacity-60 disabled:cursor-not-allowed text-[#070B14] font-semibold text-sm flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
                >
                  <JurySandboxIcon size={18} />
                  <span>{sandboxLoading ? t.auth.sandboxLaunching : t.auth.sandboxButton}</span>
                  {!sandboxLoading && <ArrowRightIcon size={16} />}
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-slate-800" />
                <span className="px-3 text-xs text-slate-400 whitespace-nowrap">
                  {t.auth.orDivider}
                </span>
                <div className="flex-grow border-t border-slate-800" />
              </div>

              {/* Auth Mode Switcher */}
              <div
                role="tablist"
                aria-label={t.auth.authModeAriaLabel}
                className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-[#070B14] border border-slate-800/90"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={authMode === 'signin'}
                  onClick={() => {
                    setAuthMode('signin');
                    setErrorState(null);
                    setShowSignUpNotice(false);
                  }}
                  className={`py-2 px-3 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    authMode === 'signin'
                      ? 'bg-[#121C31] text-slate-50 border border-[#00F0FF]/25'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  {t.auth.signInTab}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={authMode === 'signup'}
                  onClick={() => {
                    setAuthMode('signup');
                    setErrorState(null);
                    setShowSignUpNotice(false);
                  }}
                  className={`py-2 px-3 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    authMode === 'signup'
                      ? 'bg-[#121C31] text-slate-50 border border-[#00F0FF]/25'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  {t.auth.signUpTab}
                </button>
              </div>

              {/* Feedback Alerts */}
              {resolvedErrorMessage && (
                <div
                  role="alert"
                  className="rounded-lg border border-[#EF4444]/40 bg-[#EF4444]/10 px-4 py-3 text-xs text-red-200 flex items-start gap-2.5"
                >
                  <WarningTriangleIcon size={16} className="text-[#EF4444] shrink-0 mt-0.5" />
                  <span>{resolvedErrorMessage}</span>
                </div>
              )}

              {showSignUpNotice && (
                <div
                  role="status"
                  className="rounded-lg border border-[#10B981]/40 bg-[#10B981]/10 px-4 py-3 text-xs text-emerald-200 flex items-start gap-2.5"
                >
                  <CheckVerifiedIcon size={16} className="text-[#10B981] shrink-0 mt-0.5" />
                  <span>{t.auth.signUpSuccessNotice}</span>
                </div>
              )}

              {/* Email / Password Form */}
              <form onSubmit={handleEmailAuth} noValidate className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="auth-email" className="block text-xs font-medium text-slate-300">
                    {t.auth.emailLabel}
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.auth.emailPlaceholder}
                    className="w-full min-h-[42px] px-3.5 py-2.5 rounded-lg bg-[#070B14] border border-slate-700/80 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[#00F0FF]/60 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="auth-password"
                    className="block text-xs font-medium text-slate-300"
                  >
                    {t.auth.passwordLabel}
                  </label>
                  <input
                    id="auth-password"
                    type="password"
                    autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.auth.passwordPlaceholder}
                    className="w-full min-h-[42px] px-3.5 py-2.5 rounded-lg bg-[#070B14] border border-slate-700/80 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[#00F0FF]/60 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading || sandboxLoading}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-[#121C31] hover:bg-[#182642] border border-[#00F0FF]/30 disabled:opacity-60 disabled:cursor-not-allowed text-slate-100 font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LockAccessIcon size={16} className="text-[#00F0FF]" />
                  <span>
                    {authLoading
                      ? t.auth.authenticating
                      : authMode === 'signin'
                        ? t.auth.signInButton
                        : t.auth.signUpButton}
                  </span>
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
