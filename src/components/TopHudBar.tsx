import { useEffect, useState } from 'react';
import type { ReoLang } from '../lib/api';
import type { TranslationDictionary } from '../i18n/translations';
import {
  computeRemainingSeconds,
  formatCountdown,
  getTimerUrgency,
} from '../lib/sessionTimer';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  AuditArenaIcon,
  ClockCountdownIcon,
  CveLabIcon,
  RefreshSyncIcon,
  ShieldCoreIcon,
  SignOutIcon,
  SocRadarIcon,
  StudyCoachIcon,
} from './icons/NeonIcons';

export type ModuleTab = 'coach' | 'arena' | 'cve' | 'soc';

interface TopHudBarProps {
  activeTab: ModuleTab;
  onTabChange: (tab: ModuleTab) => void;
  lang: ReoLang;
  onLangChange: (lang: ReoLang) => void;
  t: TranslationDictionary;
  userEmail: string;
  isDemoJury: boolean;
  demoExpiresAt: string | null;
  onRenewSandbox: () => void;
  renewingSandbox: boolean;
  onSignOut: () => void;
}

export function TopHudBar({
  activeTab,
  onTabChange,
  lang,
  onLangChange,
  t,
  userEmail,
  isDemoJury,
  demoExpiresAt,
  onRenewSandbox,
  renewingSandbox,
  onSignOut,
}: TopHudBarProps) {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() =>
    computeRemainingSeconds(demoExpiresAt),
  );

  useEffect(() => {
    if (!isDemoJury || !demoExpiresAt) {
      return;
    }
    const update = () => {
      setRemainingSeconds(computeRemainingSeconds(demoExpiresAt));
    };
    update();
    const intervalId = window.setInterval(update, 1000);
    return () => window.clearInterval(intervalId);
  }, [isDemoJury, demoExpiresAt]);

  const urgency = getTimerUrgency(remainingSeconds);

  const navItems: Array<{
    id: ModuleTab;
    label: string;
    icon: typeof StudyCoachIcon;
  }> = [
    { id: 'coach', label: t.hud.tabCoach, icon: StudyCoachIcon },
    { id: 'arena', label: t.hud.tabArena, icon: AuditArenaIcon },
    { id: 'cve', label: t.hud.tabCve, icon: CveLabIcon },
    { id: 'soc', label: t.hud.tabSoc, icon: SocRadarIcon },
  ];

  const timerTone =
    urgency === 'expired'
      ? 'border-[#EF4444]/45 bg-[#EF4444]/10 text-red-200'
      : urgency === 'warning'
        ? 'border-[#F59E0B]/45 bg-[#F59E0B]/10 text-amber-200'
        : 'border-[#00F0FF]/25 bg-[#00F0FF]/8 text-slate-100';

  const timerIconTone =
    urgency === 'expired'
      ? 'text-[#EF4444]'
      : urgency === 'warning'
        ? 'text-[#F59E0B]'
        : 'text-[#00F0FF]';

  return (
    <header className="sticky top-0 z-30 bg-[#070B14]/95 backdrop-blur-md border-b border-[#00F0FF]/14">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF] shrink-0">
            <ShieldCoreIcon size={18} />
          </div>
          <span className="font-display text-sm sm:text-base font-bold tracking-tight text-slate-50 whitespace-nowrap">
            REO AI
          </span>
        </div>

        {/* Zone 2: Primary Desktop Navigation */}
        <nav
          role="tablist"
          aria-label={t.hud.navAriaLabel}
          className="hidden lg:flex items-center gap-1"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const selected = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onTabChange(item.id)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selected
                    ? 'bg-[#0E1525] text-[#00F0FF] border border-[#00F0FF]/30'
                    : 'text-slate-300 hover:text-slate-50 hover:bg-[#0E1525]/60 border border-transparent'
                }`}
              >
                <Icon size={16} className={selected ? 'text-[#00F0FF]' : 'text-slate-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Session HUD & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {isDemoJury && demoExpiresAt && (
            <div
              data-testid="jury-countdown"
              className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border text-[11px] sm:text-xs whitespace-nowrap shrink-0 ${timerTone}`}
            >
              <ClockCountdownIcon size={14} className={timerIconTone} />
              <span className="hidden sm:inline text-slate-300">
                {urgency === 'expired' ? t.hud.juryExpiredLabel : t.hud.juryTimerLabel}
              </span>
              <span className="font-mono-tabular font-semibold">
                {formatCountdown(remainingSeconds)}
              </span>
              {urgency !== 'nominal' && (
                <button
                  type="button"
                  onClick={onRenewSandbox}
                  disabled={renewingSandbox}
                  className="ml-1 px-2 py-0.5 rounded bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 text-[#00F0FF] font-medium transition-colors cursor-pointer disabled:opacity-60"
                >
                  {renewingSandbox ? t.hud.renewingSession : t.hud.renewSession}
                </button>
              )}
            </div>
          )}

          {!isDemoJury && (
            <span className="hidden xl:inline text-xs font-mono-tabular text-slate-400 max-w-[180px] truncate">
              {userEmail}
            </span>
          )}

          <LanguageSwitcher lang={lang} onChange={onLangChange} ariaLabel={t.langSwitcher.label} />

          {isDemoJury && urgency === 'nominal' && (
            <button
              type="button"
              onClick={onRenewSandbox}
              disabled={renewingSandbox}
              aria-label={t.hud.renewSession}
              title={t.hud.renewSession}
              className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-700/70 bg-[#0E1525] hover:border-[#00F0FF]/35 text-slate-300 hover:text-[#00F0FF] transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshSyncIcon size={16} />
            </button>
          )}

          <button
            type="button"
            onClick={onSignOut}
            aria-label={t.hud.signOut}
            className="inline-flex items-center justify-center gap-1.5 min-h-[34px] sm:min-h-[36px] px-2 sm:px-3 py-1.5 rounded-lg border border-slate-700/70 bg-[#0E1525] hover:border-[#EF4444]/40 hover:text-red-200 text-slate-300 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <SignOutIcon size={15} />
            <span className="hidden sm:inline">{t.hud.signOut}</span>
          </button>
        </div>
      </div>

      {/* Tablet & Mobile Navigation Strip (visible below lg) */}
      <nav
        role="tablist"
        aria-label={t.hud.navAriaLabel}
        className="lg:hidden border-t border-slate-800/80 bg-[#070B14] px-3 py-2 flex items-center gap-1.5 overflow-x-auto"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const selected = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onTabChange(item.id)}
              className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selected
                  ? 'bg-[#0E1525] text-[#00F0FF] border border-[#00F0FF]/30'
                  : 'text-slate-300 hover:text-slate-100 border border-transparent'
              }`}
            >
              <Icon size={15} className={selected ? 'text-[#00F0FF]' : 'text-slate-400'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
