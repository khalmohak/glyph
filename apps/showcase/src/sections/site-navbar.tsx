import { Button, Navbar } from '@glyphui/ui'
import { Logo } from '../components/logo'
import { ModeToggle } from '../components/mode-toggle'
import { ThemeSelect } from '../components/theme-select'

export function SiteNavbar() {
  return (
    <Navbar
      brand={<Logo />}
      links={[
        { label: 'Overview', href: '#overview' },
        { label: 'Tokens', href: '#tokens' },
        { label: 'Components', href: '#components' },
        { label: 'Patterns', href: '#patterns' },
      ]}
      actions={
        <>
          <ThemeSelect className="w-32" />
          <ModeToggle />
          <Button size="sm" asChild>
            <a href="#patterns">Get started</a>
          </Button>
        </>
      }
    />
  )
}
