import type { ReactNode, SVGProps } from 'react'

/** Internal icon set (Lucide paths, ISC), so viewers don't force an icon library on apps. */
type IconProps = SVGProps<SVGSVGElement>

function icon(children: ReactNode) {
  return function Icon(props: IconProps) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
      >
        {children}
      </svg>
    )
  }
}

export const ChevronLeftIcon = icon(<path d="m15 18-6-6 6-6" />)
export const ChevronRightIcon = icon(<path d="m9 18 6-6-6-6" />)
export const ChevronUpIcon = icon(<path d="m18 15-6-6-6 6" />)
export const ChevronDownIcon = icon(<path d="m6 9 6 6 6-6" />)
export const ZoomInIcon = icon(
  <>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3M11 8v6M8 11h6" />
  </>,
)
export const ZoomOutIcon = icon(
  <>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3M8 11h6" />
  </>,
)
export const RotateIcon = icon(
  <>
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
  </>,
)
export const SearchIcon = icon(
  <>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </>,
)
export const DownloadIcon = icon(
  <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="m7 10 5 5 5-5M12 15V3" />
  </>,
)
export const PrinterIcon = icon(
  <>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
    <rect x="6" y="14" width="12" height="8" rx="1" />
  </>,
)
export const MaximizeIcon = icon(
  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />,
)
export const MinimizeIcon = icon(
  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />,
)
export const PanelLeftIcon = icon(
  <>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M9 3v18" />
  </>,
)
export const CopyIcon = icon(
  <>
    <rect width="14" height="14" x="8" y="8" rx="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </>,
)
export const CheckIcon = icon(<path d="M20 6 9 17l-5-5" />)
export const XIcon = icon(<path d="M18 6 6 18M6 6l12 12" />)
export const WrapIcon = icon(
  <>
    <path d="M3 6h18M3 12h15a3 3 0 1 1 0 6h-4" />
    <path d="m16 16-2 2 2 2M3 18h7" />
  </>,
)
export const PlayIcon = icon(<path d="m6 3 14 9-14 9V3z" fill="currentColor" />)
export const PauseIcon = icon(
  <>
    <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
    <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
  </>,
)
export const VolumeIcon = icon(
  <>
    <path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6A1.4 1.4 0 0 1 5.4 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4a.7.7 0 0 0 1.2-.5z" />
    <path d="M16 9a5 5 0 0 1 0 6M19.4 18.4a9 9 0 0 0 0-12.8" />
  </>,
)
export const MuteIcon = icon(
  <>
    <path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6A1.4 1.4 0 0 1 5.4 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4a.7.7 0 0 0 1.2-.5z" />
    <path d="m22 9-6 6M16 9l6 6" />
  </>,
)
export const CaptionsIcon = icon(
  <>
    <rect width="18" height="14" x="3" y="5" rx="2" />
    <path d="M7 15h4M15 15h2M7 11h2M13 11h4" />
  </>,
)
export const PipIcon = icon(
  <>
    <path d="M21 9V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10c0 1.1.9 2 2 2h4" />
    <rect width="10" height="7" x="12" y="13" rx="2" />
  </>,
)
export const FitIcon = icon(<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />)
export const ResetIcon = icon(
  <>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </>,
)
export const SplitIcon = icon(
  <>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M12 3v18" />
  </>,
)
export const UnifiedIcon = icon(
  <>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M3 12h18" />
  </>,
)
export const LockIcon = icon(
  <>
    <rect width="18" height="11" x="3" y="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </>,
)
export const FileIcon = icon(
  <>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
  </>,
)
export const FileTextIcon = icon(
  <>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8" />
  </>,
)
export const TableIcon = icon(
  <>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M3 9h18M3 15h18M9 3v18" />
  </>,
)
export const BracesIcon = icon(
  <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1" />,
)
export const CodeIcon = icon(<path d="m16 18 6-6-6-6M8 6l-6 6 6 6" />)
export const ImageIcon = icon(
  <>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
  </>,
)
export const FilmIcon = icon(
  <>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M7 3v18M3 7.5h4M3 12h18M3 16.5h4M17 3v18M17 7.5h4M17 16.5h4" />
  </>,
)
export const MusicIcon = icon(
  <>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </>,
)
export const DiffIcon = icon(<path d="M12 3v14M5 10h14M5 21h14" />)
export const ExpandRowsIcon = icon(<path d="m7 15 5 5 5-5M7 9l5-5 5 5" />)
export const CollapseRowsIcon = icon(<path d="m7 20 5-5 5 5M7 4l5 5 5-5" />)
