import type { ReoLang } from '../lib/api';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';
import { GlobeLangIcon } from './icons/NeonIcons';

interface LanguageSwitcherProps {
  lang: ReoLang;
  onChange: (nextLang: ReoLang) => void;
  ariaLabel: string;
}

export function LanguageSwitcher({ lang, onChange, ariaLabel }: LanguageSwitcherProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex items-center gap-0.5 sm:gap-1 rounded-lg border border-slate-700/60 bg-[#070B14]/90 p-0.5 sm:p-1 shrink-0"
    >
      <span className="hidden sm:flex pl-1.5 pr-1 text-slate-400 items-center" aria-hidden="true">
        <GlobeLangIcon size={15} />
      </span>
      {SUPPORTED_LANGUAGES.map((code) => {
        const active = lang === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => onChange(code)}
            aria-pressed={active}
            className={`px-1.5 sm:px-2 py-1 text-[11px] sm:text-xs font-mono-tabular font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              active
                ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/35'
                : 'text-slate-400 hover:text-slate-100 border border-transparent'
            }`}
          >
            {code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
