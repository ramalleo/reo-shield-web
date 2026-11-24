import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type { Components } from 'react-markdown';
import { CheckVerifiedIcon, CopyClipboardIcon } from './icons/NeonIcons';

interface SafeMarkdownProps {
  content: string;
  copyLabel: string;
  copiedLabel: string;
}

function safeUrlTransform(url: string): string {
  const trimmed = url.trim();
  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('#')
  ) {
    return trimmed;
  }
  return '';
}

function CodeBlock({
  language,
  code,
  copyLabel,
  copiedLabel,
}: {
  language: string;
  code: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable
    }
  };

  return (
    <div className="my-3 rounded-lg border border-[#00F0FF]/18 bg-[#070B14] overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-3.5 py-2 border-b border-slate-800/90 bg-[#0B1220]">
        <span className="text-[11px] font-mono-tabular text-slate-400 uppercase tracking-wider">
          {language || 'code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono-tabular text-slate-300 hover:text-[#00F0FF] hover:bg-[#00F0FF]/10 transition-colors cursor-pointer whitespace-nowrap"
        >
          {copied ? (
            <>
              <CheckVerifiedIcon size={13} className="text-[#10B981]" />
              <span className="text-[#10B981]">{copiedLabel}</span>
            </>
          ) : (
            <>
              <CopyClipboardIcon size={13} />
              <span>{copyLabel}</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-xs sm:text-[13px] leading-relaxed font-mono-tabular text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * Strict XSS-safe Markdown + KaTeX renderer using react-markdown, remark-math, and rehype-katex only.
 */
export function SafeMarkdown({ content, copyLabel, copiedLabel }: SafeMarkdownProps) {
  const components: Components = {
    h1: ({ children }) => (
      <h1 className="font-display text-lg sm:text-xl font-bold text-slate-50 mt-4 mb-2 first:mt-0">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="font-display text-base sm:text-lg font-bold text-slate-100 mt-4 mb-2 first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-display text-sm sm:text-base font-semibold text-[#00F0FF] mt-3.5 mb-1.5 first:mt-0">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="text-sm sm:text-[15px] leading-relaxed text-slate-200 my-2.5 first:mt-0 last:mb-0">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-5 space-y-1.5 my-2.5 text-sm sm:text-[15px] text-slate-200">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-5 space-y-1.5 my-2.5 text-sm sm:text-[15px] text-slate-200">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="my-3 px-4 py-2.5 rounded-lg bg-[#070B14]/80 border border-[#00F0FF]/20 text-slate-300 text-sm">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-4 border-slate-800" />,
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#00F0FF] underline decoration-[#00F0FF]/40 hover:decoration-[#00F0FF] transition-colors break-words"
      >
        {children}
      </a>
    ),
    table: ({ children }) => (
      <div className="my-3 overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-[#070B14] border-b border-slate-800 text-slate-300 font-semibold">
        {children}
      </thead>
    ),
    tbody: ({ children }) => <tbody className="divide-y divide-slate-800/80">{children}</tbody>,
    tr: ({ children }) => <tr className="hover:bg-[#121C31]/50 transition-colors">{children}</tr>,
    th: ({ children }) => <th className="px-3 py-2 whitespace-nowrap">{children}</th>,
    td: ({ children }) => <td className="px-3 py-2 text-slate-200 align-top">{children}</td>,
    pre: ({ children }) => <>{children}</>,
    code: ({ className, children }) => {
      const match = /language-([\w-]+)/.exec(className || '');
      const text = String(children).replace(/\n$/, '');
      const isBlock = Boolean(match) || text.includes('\n');

      if (isBlock) {
        return (
          <CodeBlock
            language={match ? match[1] : ''}
            code={text}
            copyLabel={copyLabel}
            copiedLabel={copiedLabel}
          />
        );
      }

      return (
        <code className="px-1.5 py-0.5 rounded bg-[#070B14] border border-slate-700/80 text-[#00F0FF] font-mono-tabular text-[12px] sm:text-[13px]">
          {children}
        </code>
      );
    },
  };

  return (
    <div className="reo-markdown min-w-0 break-words [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden [&_.katex-display]:max-w-full [&_.katex-display]:py-2 [&_.katex-display]:pb-1 [&_.katex]:text-slate-100">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        urlTransform={safeUrlTransform}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
