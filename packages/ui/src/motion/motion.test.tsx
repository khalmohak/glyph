import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Checkbox } from '../components/checkbox'
import { Pagination } from '../components/pagination'
import { SegmentedControl } from '../components/segmented-control'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/tabs'
import { AppShell, Sidebar, SidebarContent, SidebarItem } from '../patterns/app-shell'
import { GlyphProvider } from '../provider/glyph-provider'
import { ThemeScope } from '../provider/theme-scope'
import { installIntersectionObserver, intersect } from '../test/intersection-observer'
import { glyph, playful } from '../themes'
import { AnimatedNumber } from './animated-number'
import { PageTransition } from './page-transition'
import { PresenceItem, PresenceList } from './presence-list'
import { Reveal } from './reveal'
import { Stagger } from './stagger'

describe('Reveal', () => {
  it('leaves content visible when the browser cannot observe it', () => {
    render(<Reveal>Hello</Reveal>)
    expect(screen.getByText('Hello')).not.toHaveAttribute('data-reveal')
  })

  describe('with IntersectionObserver', () => {
    let restore: () => void
    beforeEach(() => {
      restore = installIntersectionObserver()
    })
    afterEach(() => restore())

    it('hides before paint, then shows once in view', () => {
      render(<Reveal delay={120}>Hello</Reveal>)
      const el = screen.getByText('Hello')
      expect(el).toHaveAttribute('data-reveal', 'hidden')
      expect(el.style.getPropertyValue('--glyph-reveal-delay')).toBe('120ms')
      act(() => intersect(el))
      expect(el).toHaveAttribute('data-reveal', 'shown')
    })

    it('does nothing when motion is off or the reveal is disabled', () => {
      render(
        <GlyphProvider storageKey={null} motion="none">
          <Reveal>Off</Reveal>
        </GlyphProvider>,
      )
      render(<Reveal enabled={false}>Disabled</Reveal>)
      expect(screen.getByText('Off')).not.toHaveAttribute('data-reveal')
      expect(screen.getByText('Disabled')).not.toHaveAttribute('data-reveal')
    })

    it('hides again when it leaves the viewport unless once', () => {
      render(<Reveal once={false}>Again</Reveal>)
      const el = screen.getByText('Again')
      act(() => intersect(el))
      act(() => intersect(el, false))
      expect(el).toHaveAttribute('data-reveal', 'hidden')
    })
  })
})

describe('Stagger', () => {
  let restore: () => void
  beforeEach(() => {
    restore = installIntersectionObserver()
  })
  afterEach(() => restore())

  it('indexes each child and cascades them in as a group', () => {
    render(
      <Stagger as="ul" step={80} aria-label="list">
        <li>One</li>
        {false}
        <li>Two</li>
      </Stagger>,
    )
    const list = screen.getByRole('list', { name: 'list' })
    expect(list).toHaveAttribute('data-stagger', 'hidden')
    expect(list.style.getPropertyValue('--glyph-stagger-step')).toBe('80ms')
    const items = screen.getAllByRole('listitem')
    expect(items.map((li) => li.style.getPropertyValue('--glyph-stagger-index'))).toEqual([
      '0',
      '1',
    ])
    expect(items[0]).toHaveAttribute('data-stagger-item')
    act(() => intersect(list))
    expect(list).toHaveAttribute('data-stagger', 'shown')
  })
})

describe('AnimatedNumber', () => {
  it('shows the formatted final value when it cannot animate', () => {
    render(
      <AnimatedNumber
        value={48210}
        locale="en-US"
        format={{ style: 'currency', currency: 'USD' }}
      />,
    )
    expect(screen.getByText('$48,210.00')).toBeInTheDocument()
  })

  it('uses a custom formatter', () => {
    render(<AnimatedNumber value={39} formatValue={(n) => `€${n}`} />)
    expect(screen.getByText('€39')).toBeInTheDocument()
  })

  describe('with IntersectionObserver', () => {
    let restore: () => void
    beforeEach(() => {
      restore = installIntersectionObserver()
    })
    afterEach(() => restore())

    it('counts up from `from` once in view and settles on the value', async () => {
      const { container } = render(<AnimatedNumber value={100} />)
      const el = container.querySelector('[data-slot="animated-number"]')!
      expect(el).toHaveTextContent('0')
      act(() => intersect(el))
      await screen.findByText('100', {}, { timeout: 2000 })
      expect(el.textContent).toBe('100')
    })

    it('renders the value straight away when motion is off', () => {
      render(
        <GlyphProvider storageKey={null} motion="none">
          <AnimatedNumber value={7} />
        </GlyphProvider>,
      )
      expect(screen.getByText('7')).toBeInTheDocument()
    })
  })
})

describe('PageTransition', () => {
  it('animates pages after the first one', () => {
    const { rerender } = render(<PageTransition transitionKey="/a">A</PageTransition>)
    expect(screen.getByText('A')).not.toHaveClass('animate-page-in')
    rerender(<PageTransition transitionKey="/b">B</PageTransition>)
    expect(screen.getByText('B')).toHaveClass('animate-page-in')
  })
})

describe('PresenceList', () => {
  function List() {
    const [items, setItems] = useState(['a', 'b'])
    return (
      <>
        <button type="button" onClick={() => setItems(['b'])}>
          remove
        </button>
        <ul>
          <PresenceList>
            {items.map((item) => (
              <PresenceItem key={item}>{item}</PresenceItem>
            ))}
          </PresenceList>
        </ul>
      </>
    )
  }

  it('removes items immediately when motion is off', async () => {
    render(
      <GlyphProvider storageKey={null} motion="none">
        <List />
      </GlyphProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'remove' }))
    expect(screen.queryByText('a')).not.toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
  })
})

describe('motion level attributes', () => {
  it('mirrors the level onto <html> and removes it on unmount', () => {
    const { unmount } = render(
      <GlyphProvider storageKey={null} theme={playful}>
        x
      </GlyphProvider>,
    )
    expect(document.documentElement).toHaveAttribute('data-motion', 'expressive')
    unmount()
    expect(document.documentElement).not.toHaveAttribute('data-motion')
  })

  it('lets the provider override the theme, and scopes follow their own theme', () => {
    render(
      <GlyphProvider storageKey={null} theme={glyph} motion="none">
        <ThemeScope theme={playful}>scoped</ThemeScope>
      </GlyphProvider>,
    )
    expect(document.documentElement).toHaveAttribute('data-motion', 'none')
    expect(screen.getByText('scoped')).toHaveAttribute('data-motion', 'none')
  })

  it('gives a scope its theme level when the provider does not override it', () => {
    render(<ThemeScope theme={playful}>scoped</ThemeScope>)
    expect(screen.getByText('scoped')).toHaveAttribute('data-motion', 'expressive')
  })
})

describe('Tabs indicator', () => {
  it('sits in the active trigger and follows the selection', async () => {
    render(
      <GlyphProvider storageKey={null} motion="none">
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">A</TabsTrigger>
            <TabsTrigger value="b">B</TabsTrigger>
          </TabsList>
          <TabsContent value="a">Panel A</TabsContent>
          <TabsContent value="b">Panel B</TabsContent>
        </Tabs>
      </GlyphProvider>,
    )
    const indicatorIn = (name: string) =>
      screen.getByRole('tab', { name }).querySelector('[data-slot="indicator"]')
    expect(indicatorIn('A')).not.toBeNull()
    expect(indicatorIn('B')).toBeNull()
    await userEvent.click(screen.getByRole('tab', { name: 'B' }))
    expect(indicatorIn('B')).not.toBeNull()
    expect(indicatorIn('A')).toBeNull()
    expect(screen.getByText('Panel B')).toBeVisible()
  })

  it('works controlled', async () => {
    function Controlled() {
      const [value, setValue] = useState('a')
      return (
        <Tabs value={value} onValueChange={setValue}>
          <TabsList>
            <TabsTrigger value="a">A</TabsTrigger>
            <TabsTrigger value="b">B</TabsTrigger>
          </TabsList>
          <p>value: {value}</p>
        </Tabs>
      )
    }
    render(<Controlled />)
    await userEvent.click(screen.getByRole('tab', { name: 'B' }))
    expect(screen.getByText('value: b')).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: 'B' }).querySelector('[data-slot="indicator"]'),
    ).not.toBeNull()
  })
})

describe('other sliding indicators', () => {
  it('SegmentedControl moves its thumb to the selected option', async () => {
    render(
      <SegmentedControl
        aria-label="View"
        defaultValue="list"
        options={[
          { value: 'list', label: 'List' },
          { value: 'board', label: 'Board' },
        ]}
      />,
    )
    const thumbIn = (name: string) =>
      screen.getByRole('radio', { name }).querySelector('[data-slot="indicator"]')
    expect(thumbIn('List')).not.toBeNull()
    await userEvent.click(screen.getByRole('radio', { name: 'Board' }))
    expect(thumbIn('Board')).not.toBeNull()
    expect(thumbIn('List')).toBeNull()
  })

  it('Pagination highlights only the current page', () => {
    render(<Pagination page={2} pageCount={5} onPageChange={() => {}} />)
    const current = screen.getByRole('button', { name: 'Page 2' })
    expect(current).toHaveAttribute('aria-current', 'page')
    expect(current.querySelector('[data-slot="indicator"]')).not.toBeNull()
    expect(
      screen.getByRole('button', { name: 'Page 3' }).querySelector('[data-slot="indicator"]'),
    ).toBeNull()
  })

  it('Sidebar highlights the active item', () => {
    render(
      <AppShell
        layout="embedded"
        sidebar={
          <Sidebar>
            <SidebarContent>
              <SidebarItem active>Inbox</SidebarItem>
              <SidebarItem>Issues</SidebarItem>
            </SidebarContent>
          </Sidebar>
        }
      >
        main
      </AppShell>,
    )
    const item = (name: string) => screen.getByRole('button', { name })
    expect(item('Inbox').querySelector('[data-slot="indicator"]')).not.toBeNull()
    expect(item('Issues').querySelector('[data-slot="indicator"]')).toBeNull()
  })
})

describe('Checkbox tick', () => {
  it('draws only when the user checks it, not when it loads checked', async () => {
    render(
      <>
        <Checkbox aria-label="preset" defaultChecked />
        <Checkbox aria-label="fresh" />
      </>,
    )
    const indicator = (name: string) =>
      screen.getByRole('checkbox', { name }).querySelector('[data-state="checked"]:not(button)')
    expect(indicator('preset')).not.toHaveAttribute('data-animate')
    await userEvent.click(screen.getByRole('checkbox', { name: 'fresh' }))
    expect(indicator('fresh')).toHaveAttribute('data-animate')
  })
})
