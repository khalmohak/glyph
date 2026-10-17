import { fireEvent, render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './carousel'

beforeAll(() => {
  // jsdom has no IntersectionObserver; Embla uses it to track visible slides.
  globalThis.IntersectionObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  } as unknown as typeof IntersectionObserver
})

describe('Carousel', () => {
  it('uses the WAI-ARIA carousel pattern and numbers its slides', () => {
    render(
      <Carousel aria-label="Customer stories">
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
          <CarouselItem>Three</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>,
    )
    const region = screen.getByRole('region', { name: 'Customer stories' })
    expect(region).toHaveAttribute('aria-roledescription', 'carousel')
    const slides = screen.getAllByRole('group')
    expect(slides).toHaveLength(3)
    expect(slides[1]).toHaveAttribute('aria-roledescription', 'slide')
    expect(slides[1]).toHaveAccessibleName('2 of 3')
    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeDisabled()
  })

  it('hands the Embla API to setApi', async () => {
    const setApi = vi.fn()
    render(
      <Carousel aria-label="Photos" setApi={setApi}>
        <CarouselContent>
          <CarouselItem>A</CarouselItem>
        </CarouselContent>
      </Carousel>,
    )
    await vi.waitFor(() => expect(setApi).toHaveBeenCalled())
  })

  it('leaves arrow keys alone inside text fields in a slide', () => {
    const onKeyDownCapture = vi.fn()
    render(
      <Carousel aria-label="Steps" onKeyDownCapture={onKeyDownCapture}>
        <CarouselContent>
          <CarouselItem>
            <input aria-label="Name" defaultValue="Ada" />
          </CarouselItem>
          <CarouselItem>Two</CarouselItem>
        </CarouselContent>
      </Carousel>,
    )
    const input = screen.getByRole('textbox', { name: 'Name' })
    // fireEvent returns false when the default action was prevented.
    expect(fireEvent.keyDown(input, { key: 'ArrowLeft' })).toBe(true)
    expect(onKeyDownCapture).toHaveBeenCalledTimes(1)
    expect(
      fireEvent.keyDown(screen.getByRole('region', { name: 'Steps' }), { key: 'ArrowRight' }),
    ).toBe(false)
  })

  it('still scrolls when the controls get their own onClick', async () => {
    const onClick = vi.fn()
    const setApi = vi.fn()
    render(
      <Carousel aria-label="Photos" setApi={setApi}>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
        </CarouselContent>
        <CarouselNext onClick={onClick} disabled={false} />
      </Carousel>,
    )
    await vi.waitFor(() => expect(setApi).toHaveBeenCalled())
    const api = setApi.mock.calls[0]![0]
    const scrollNext = vi.spyOn(api, 'scrollNext')
    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(scrollNext).toHaveBeenCalledTimes(1)
  })
})
