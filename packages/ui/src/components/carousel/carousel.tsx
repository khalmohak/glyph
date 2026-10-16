import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react'
import {
  Children,
  type ComponentProps,
  createContext,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { type SlotClasses, useComponentConfig } from '../../hooks/use-component-config'
import { cn } from '../../utils/cn'
import { IconButton, type IconButtonProps } from '../button'
import { type CarouselVariants, carouselStyles } from './carousel.styles'

export type CarouselApi = UseEmblaCarouselType[1]
type EmblaArgs = Parameters<typeof useEmblaCarousel>
export type CarouselOptions = EmblaArgs[0]
export type CarouselPlugin = NonNullable<EmblaArgs[1]>[number]

type Orientation = NonNullable<CarouselVariants['orientation']>

interface CarouselContextValue {
  viewportRef: UseEmblaCarouselType[0]
  api: CarouselApi
  orientation: Orientation
  selectedIndex: number
  snapCount: number
  canScrollPrev: boolean
  canScrollNext: boolean
  scrollPrev: () => void
  scrollNext: () => void
  scrollTo: (index: number) => void
  s: ReturnType<typeof carouselStyles>
  slots: SlotClasses<'Carousel'>
}

const CarouselContext = createContext<CarouselContextValue | null>(null)

function useCarousel(): CarouselContextValue {
  const value = useContext(CarouselContext)
  if (!value) throw new Error('Carousel parts must be used inside <Carousel>.')
  return value
}

export interface CarouselProps
  extends Omit<ComponentProps<'section'>, 'aria-label'>,
    CarouselVariants {
  /** Embla options, e.g. `{ align: 'start', loop: true }`. */
  opts?: CarouselOptions
  plugins?: CarouselPlugin[]
  /** Shortcut for `opts.loop`. */
  loop?: boolean
  /** Receives the Embla API for custom controls. */
  setApi?: (api: CarouselApi) => void
  /** Required: describes the content, e.g. "Customer stories". */
  'aria-label': string
}

/**
 * Swipeable, keyboard-accessible slides. Compose with CarouselContent, CarouselItem,
 * CarouselPrevious, CarouselNext and CarouselDots.
 */
export function Carousel(inProps: CarouselProps) {
  const [props, slots] = useComponentConfig('Carousel', inProps)
  const {
    opts,
    plugins,
    loop,
    setApi,
    orientation = 'horizontal',
    className,
    children,
    ...rest
  } = props
  const [viewportRef, api] = useEmblaCarousel(
    {
      ...opts,
      ...(loop !== undefined && { loop }),
      axis: orientation === 'horizontal' ? 'x' : 'y',
    },
    plugins,
  )
  const [state, setState] = useState({
    selectedIndex: 0,
    snapCount: 0,
    canScrollPrev: false,
    canScrollNext: false,
  })

  const sync = useCallback((embla: NonNullable<CarouselApi>) => {
    setState({
      selectedIndex: embla.selectedScrollSnap(),
      snapCount: embla.scrollSnapList().length,
      canScrollPrev: embla.canScrollPrev(),
      canScrollNext: embla.canScrollNext(),
    })
  }, [])

  useEffect(() => {
    if (!api) return
    setApi?.(api)
    sync(api)
    api.on('select', sync).on('reInit', sync)
    return () => {
      api.off('select', sync).off('reInit', sync)
    }
  }, [api, setApi, sync])

  const scrollPrev = useCallback(() => api?.scrollPrev(), [api])
  const scrollNext = useCallback(() => api?.scrollNext(), [api])
  const scrollTo = useCallback((index: number) => api?.scrollTo(index), [api])

  const onKeyDownCapture = (event: KeyboardEvent<HTMLElement>) => {
    const prevKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp'
    const nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown'
    if (event.key === prevKey) {
      event.preventDefault()
      scrollPrev()
    } else if (event.key === nextKey) {
      event.preventDefault()
      scrollNext()
    }
  }

  const s = carouselStyles({ orientation })
  return (
    <CarouselContext.Provider
      value={{
        viewportRef,
        api,
        orientation,
        ...state,
        scrollPrev,
        scrollNext,
        scrollTo,
        s,
        slots,
      }}
    >
      {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: a labelled section is a region, which supports aria-roledescription */}
      <section
        data-slot="carousel"
        aria-roledescription="carousel"
        onKeyDownCapture={onKeyDownCapture}
        className={s.root({ class: [slots.root, className] })}
        {...rest}
      >
        {children}
      </section>
    </CarouselContext.Provider>
  )
}

const SlideContext = createContext<{ index: number; total: number } | null>(null)

export function CarouselContent({ className, children, ...props }: ComponentProps<'div'>) {
  const { viewportRef, s, slots } = useCarousel()
  const items = Children.toArray(children)
  return (
    <div
      ref={viewportRef}
      data-slot="carousel-viewport"
      className={s.viewport({ class: slots.viewport })}
    >
      <div
        data-slot="carousel-content"
        className={s.container({ class: [slots.container, className] })}
        {...props}
      >
        {items.map((child, index) => (
          <SlideContext.Provider key={index} value={{ index, total: items.length }}>
            {child}
          </SlideContext.Provider>
        ))}
      </div>
    </div>
  )
}

export function CarouselItem({ className, ...props }: ComponentProps<'div'>) {
  const { s, slots } = useCarousel()
  const slide = useContext(SlideContext)
  return (
    // biome-ignore lint/a11y/useSemanticElements: role="group" + aria-roledescription is the WAI-ARIA carousel slide pattern
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={slide ? `${slide.index + 1} of ${slide.total}` : undefined}
      data-slot="carousel-item"
      className={s.item({ class: [slots.item, className] })}
      {...props}
    />
  )
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={direction === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
    </svg>
  )
}

type ControlProps = Omit<IconButtonProps, 'icon' | 'aria-label'> & {
  'aria-label'?: string
  icon?: ReactNode
}

export function CarouselPrevious({ className, icon, ...props }: ControlProps) {
  const { scrollPrev, canScrollPrev, orientation, s, slots } = useCarousel()
  return (
    <IconButton
      variant="outline"
      size="sm"
      aria-label="Previous slide"
      icon={icon ?? <Chevron direction="left" />}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      className={s.control({
        class: [slots.control, orientation === 'horizontal' ? 'left-3' : 'top-3', className],
      })}
      {...props}
    />
  )
}

export function CarouselNext({ className, icon, ...props }: ControlProps) {
  const { scrollNext, canScrollNext, orientation, s, slots } = useCarousel()
  return (
    <IconButton
      variant="outline"
      size="sm"
      aria-label="Next slide"
      icon={icon ?? <Chevron direction="right" />}
      disabled={!canScrollNext}
      onClick={scrollNext}
      className={s.control({
        class: [slots.control, orientation === 'horizontal' ? 'right-3' : 'bottom-3', className],
      })}
      {...props}
    />
  )
}

/** One button per snap point; the current one is highlighted. */
export function CarouselDots({ className, ...props }: ComponentProps<'div'>) {
  const { snapCount, selectedIndex, scrollTo, s, slots } = useCarousel()
  if (snapCount < 2) return null
  return (
    <div
      data-slot="carousel-dots"
      className={s.dots({ class: [slots.dots, className] })}
      {...props}
    >
      {Array.from({ length: snapCount }, (_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`Go to slide ${index + 1}`}
          aria-current={index === selectedIndex}
          onClick={() => scrollTo(index)}
          className={cn(s.dot({ class: slots.dot }))}
        />
      ))}
    </div>
  )
}
