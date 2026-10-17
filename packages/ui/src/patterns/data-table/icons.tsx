import type { ReactNode, SVGProps } from 'react'

function icon(path: ReactNode) {
  return function Icon(props: SVGProps<SVGSVGElement>) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
      >
        {path}
      </svg>
    )
  }
}

export const MoreIcon = icon(
  <>
    <circle cx="5" cy="12" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
  </>,
)
export const FilterIcon = icon(<path d="M3 5h18l-7 8.5V19l-4 2v-7.5z" />)
export const PlusIcon = icon(<path d="M12 5v14M5 12h14" />)
export const SlidersIcon = icon(
  <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M14 4v4M8 10v4M16 16v4" />,
)
export const DownloadIcon = icon(<path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" />)
export const EyeOffIcon = icon(
  <path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c5 0 9 4.5 10 7a13 13 0 0 1-2.5 3.6M6.6 6.6A13 13 0 0 0 2 12c1 2.5 5 7 10 7a9.9 9.9 0 0 0 4.4-1M9.9 9.9a3 3 0 0 0 4.2 4.2" />,
)
export const PinIcon = icon(<path d="M12 17v5M9 3h6l-1 6 3 3v2H7v-2l3-3z" />)
export const UnpinIcon = icon(<path d="M12 17v5M3 3l18 18M9 3h6l-1 6 3 3v2h-2M7 14v-2l2-2" />)
export const ArrowLeftIcon = icon(<path d="M19 12H5m0 0 6-6m-6 6 6 6" />)
export const ArrowRightIcon = icon(<path d="M5 12h14m0 0-6-6m6 6-6 6" />)
export const RotateIcon = icon(<path d="M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5" />)
