import { Container, cn, Section } from '@glyphui/ui'
import { type ComponentProps, isValidElement, type ReactNode, useId } from 'react'
import { useBlocksStylesCheck } from '../internal/styles-check'

export interface LogoItem {
  /** Company name, used as the accessible label. */
  name: string
  logo: ReactNode
}

export interface LogoCloudProps extends Omit<ComponentProps<'section'>, 'title'> {
  /** Short line above the logos, e.g. "Trusted by teams at". */
  title?: ReactNode
  logos: readonly (LogoItem | ReactNode)[]
}

function isLogoItem(value: LogoItem | ReactNode): value is LogoItem {
  return typeof value === 'object' && value !== null && !isValidElement(value) && 'logo' in value
}

/** A row of customer or partner logos, muted so they support rather than compete. */
export function LogoCloud({ title, logos, className, ...props }: LogoCloudProps) {
  useBlocksStylesCheck()
  const titleId = useId()
  return (
    <Section
      spacing="sm"
      data-slot="logo-cloud"
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : 'Logos'}
      className={className}
      {...props}
    >
      <Container className="grid gap-6">
        {title && (
          <p id={titleId} className="text-center text-small text-muted-foreground">
            {title}
          </p>
        )}
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {logos.map((item, i) => (
            <li
              key={isLogoItem(item) ? item.name : i}
              className={cn(
                'flex h-8 items-center text-faint-foreground grayscale transition-colors duration-(--glyph-duration-base) hover:text-muted-foreground',
                '[&_img]:h-full [&_img]:w-auto [&_svg]:h-full [&_svg]:w-auto',
              )}
            >
              {isLogoItem(item) ? (
                <span role="img" aria-label={item.name} className="flex h-full items-center">
                  {item.logo}
                </span>
              ) : (
                item
              )}
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  )
}
