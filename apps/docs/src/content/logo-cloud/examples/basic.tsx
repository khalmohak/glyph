import { LogoCloud } from '@glyphui/blocks'

const names = ['Northwind', 'Contoso', 'Initech', 'Umbrella', 'Hooli', 'Vandelay']

export default function Example() {
  return (
    <LogoCloud
      title="Trusted by finance teams at"
      logos={names.map((name) => ({
        name,
        logo: <span className="font-display text-h4 tracking-tight">{name}</span>,
      }))}
    />
  )
}
