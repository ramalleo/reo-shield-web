import type { SVGProps } from 'react';

export interface NeonIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

const baseProps = (size: number, className?: string): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  className,
});

export function ShieldCoreIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path d="M12 2.5L4.5 5.8v5.6c0 4.9 3.2 9.1 7.5 10.6 4.3-1.5 7.5-5.7 7.5-10.6V5.8L12 2.5z" />
      <circle cx="12" cy="11.5" r="2.2" />
      <path d="M12 6.8v2.5M12 13.7v3.1M8.2 11.5h1.6M14.2 11.5h1.6" />
    </svg>
  );
}

export function StudyCoachIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v16.5H6.5A2.5 2.5 0 0 0 4 22V5.5z" />
      <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v16.5h5.5A2.5 2.5 0 0 1 20 22V5.5z" />
      <path d="M7.5 8h2M7.5 11.5h2M14.5 8h2M14.5 11.5h2" />
    </svg>
  );
}

export function AuditArenaIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path d="M12 3v18" />
      <path d="M4 7.5L8.5 5v14L4 16.5v-9z" />
      <path d="M20 7.5L15.5 5v14l4.5-2.5v-9z" />
      <path d="M8.5 12h7" />
    </svg>
  );
}

export function CveLabIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path d="M9 3h6M10 3v5.2L5.3 17a2.5 2.5 0 0 0 2.2 3.7h9a2.5 2.5 0 0 0 2.2-3.7L14 8.2V3" />
      <path d="M7.8 14.5h8.4" />
      <circle cx="10.5" cy="17.2" r="0.8" />
      <circle cx="14" cy="16.8" r="0.8" />
    </svg>
  );
}

export function SocRadarIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <path d="M12 12l5.8-5.8" />
      <circle cx="12" cy="12" r="1.4" />
    </svg>
  );
}

export function JurySandboxIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <polygon points="12 2.8 20 7.4 20 16.6 12 21.2 4 16.6 4 7.4 12 2.8" />
      <path d="M12 2.8v9.2m0 0l8-4.6m-8 4.6L4 7.4" />
      <path d="M12 12v9.2" />
    </svg>
  );
}

export function BiometricsPulseIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path d="M3 12h3.5l2-5.5 3.2 11 2.4-7.5 1.9 2H21" />
    </svg>
  );
}

export function HoneypotAlertIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path d="M12 3l8.5 4.8v8.4L12 21l-8.5-4.8V7.8L12 3z" />
      <path d="M12 8.2v4.6" />
      <circle cx="12" cy="15.8" r="0.7" />
    </svg>
  );
}

export function CheckVerifiedIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.2l2.4 2.4 4.8-5.2" />
    </svg>
  );
}

export function WarningTriangleIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path d="M10.4 4.2L3.2 17a1.8 1.8 0 0 0 1.6 2.7h14.4a1.8 1.8 0 0 0 1.6-2.7L13.6 4.2a1.8 1.8 0 0 0-3.2 0z" />
      <path d="M12 9.2v4.3" />
      <circle cx="12" cy="16.2" r="0.65" />
    </svg>
  );
}

export function ClockCountdownIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <circle cx="12" cy="12.5" r="8" />
      <path d="M12 8.5v4l2.8 1.8" />
      <path d="M9.5 2.8h5" />
    </svg>
  );
}

export function GlobeLangIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3.6 9h16.8M3.6 15h16.8" />
      <path d="M12 3a13.5 13.5 0 0 1 3.6 9 13.5 13.5 0 0 1-3.6 9 13.5 13.5 0 0 1-3.6-9A13.5 13.5 0 0 1 12 3z" />
    </svg>
  );
}

export function SignOutIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path d="M10 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H10" />
      <path d="M15 8l4 4-4 4" />
      <path d="M19 12H9" />
    </svg>
  );
}

export function LockAccessIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <rect x="5" y="11" width="14" height="9.5" rx="2" />
      <path d="M8.2 11V7.8a3.8 3.8 0 1 1 7.6 0V11" />
      <circle cx="12" cy="15.7" r="1.1" />
    </svg>
  );
}

export function RefreshSyncIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path d="M20 6v5h-5" />
      <path d="M4 18v-5h5" />
      <path d="M19.2 11a7.5 7.5 0 0 0-12.8-3.8L4 9.5M4.8 13a7.5 7.5 0 0 0 12.8 3.8l2.4-2.3" />
    </svg>
  );
}

export function TerminalCodeIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <path d="M7.5 9.5l3 2.5-3 2.5" />
      <path d="M12.5 14.5h4" />
    </svg>
  );
}

export function DatabaseRlsIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <ellipse cx="12" cy="6" rx="7.5" ry="2.8" />
      <path d="M4.5 6v12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8V6" />
      <path d="M4.5 12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8" />
    </svg>
  );
}

export function ArrowRightIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path d="M5 12h14" />
      <path d="M13.5 6.5L19 12l-5.5 5.5" />
    </svg>
  );
}

export function KeystrokeKeyIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M7 9.5h1.5M11.2 9.5h1.6M15.5 9.5H17M7 13h2M11 13h6M8 16h8" />
    </svg>
  );
}

export function PlusSessionIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function TrashDeleteIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path d="M4.5 6.5h15" />
      <path d="M9.5 3.5h5a1 1 0 0 1 1 1v2h-7v-2a1 1 0 0 1 1-1z" />
      <path d="M6.5 6.5l1 13a1.5 1.5 0 0 0 1.5 1.4h6a1.5 1.5 0 0 0 1.5-1.4l1-13" />
      <path d="M10 10.5v6M14 10.5v6" />
    </svg>
  );
}

export function CopyClipboardIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5" />
    </svg>
  );
}

export function ChevronDownIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function SidebarMenuIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
      <path d="M5.5 8.5h1M5.5 12h1M5.5 15.5h1" />
    </svg>
  );
}

export function CloseXIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function SendArrowIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path d="M20.5 3.5L10 14" />
      <path d="M20.5 3.5L14 20.5l-4-6.5-6.5-4 17-6.5z" />
    </svg>
  );
}

export function BoltFastIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path d="M13 2.5L4.5 13.5h6.5L10 21.5l9.5-11.5h-6.5L13 2.5z" />
    </svg>
  );
}

export function BrainDeepIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 3.5v5M12 15.5v5M3.5 12h5M15.5 12h5" />
    </svg>
  );
}

export function CpuPlusIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <path d="M9 2.5v3.5M15 2.5v3.5M9 18v3.5M15 18v3.5M2.5 9H6M2.5 15H6M18 9h3.5M18 15h3.5" />
      <path d="M12 9.5v5M9.5 12h5" />
    </svg>
  );
}

export function LayersMaxIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <polygon points="12 3 21 7.5 12 12 3 7.5 12 3" />
      <path d="M3 12l9 4.5 9-4.5" />
      <path d="M3 16.5L12 21l9-4.5" />
    </svg>
  );
}

export function MessageThreadIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path d="M4.5 5.5h15a1.5 1.5 0 0 1 1.5 1.5v8.5a1.5 1.5 0 0 1-1.5 1.5H9.5L5 20.5V17H4.5A1.5 1.5 0 0 1 3 15.5V7a1.5 1.5 0 0 1 1.5-1.5z" />
      <path d="M7.5 10h9M7.5 13.5h6" />
    </svg>
  );
}

export function InspectMathIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path d="M4 5h12l-5 7 5 7H4" />
      <circle cx="18.5" cy="12" r="2" />
    </svg>
  );
}

export function SearchFilterIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5L20.5 20.5" />
    </svg>
  );
}

export function LinkCveIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path d="M10 13.5a4.5 4.5 0 0 1 0-6.4l2.1-2.1a4.5 4.5 0 0 1 6.4 6.4l-1.4 1.4" />
      <path d="M14 10.5a4.5 4.5 0 0 1 0 6.4l-2.1 2.1a4.5 4.5 0 0 1-6.4-6.4l1.4-1.4" />
    </svg>
  );
}

export function HistoryLogIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.5-6l-2.5 2.5" />
      <path d="M3.5 4.5v4h4" />
      <path d="M12 7.5v4.8l3.2 1.8" />
    </svg>
  );
}

export function ArbiterScaleIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path d="M12 3.5v17" />
      <path d="M5 7h14" />
      <path d="M8 20.5h8" />
      <path d="M5 7l-2.5 6h5L5 7z" />
      <path d="M19 7l-2.5 6h5L19 7z" />
    </svg>
  );
}

export function SparkChallengeIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path d="M12 2.8l2.2 6.2 6.3 2.2-6.3 2.2-2.2 6.3-2.2-6.3-6.3-2.2 6.3-2.2L12 2.8z" />
    </svg>
  );
}

export function CalendarDueIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
      <path d="M9.5 14.5l2 2 3.5-3.8" />
    </svg>
  );
}

export function DownloadExportIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path d="M12 4v11" />
      <path d="M8 11.5L12 15.5l4-4" />
      <path d="M4.5 16.5v2A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5v-2" />
    </svg>
  );
}

export function PlayAttackIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <polygon points="6.5 4.5 19.5 12 6.5 19.5 6.5 4.5" />
    </svg>
  );
}

export function EyeInspectIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />
      <circle cx="12" cy="12" r="2.7" />
    </svg>
  );
}

export function AutoPulseIcon({ size = 20, className, ...props }: NeonIconProps) {
  return (
    <svg {...baseProps(size, className)} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4" />
      <path d="M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14" />
    </svg>
  );
}
