import { render, screen } from '@testing-library/react'
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
})
