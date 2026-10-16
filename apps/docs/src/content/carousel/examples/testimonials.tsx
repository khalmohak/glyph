import {
  Avatar,
  Card,
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Text,
} from '@glyphui/ui'

const quotes = [
  {
    name: 'Ada Lovelace',
    role: 'Staff engineer, Acme',
    quote: 'We swapped our whole design language by editing one theme file. Nothing else changed.',
  },
  {
    name: 'Grace Hopper',
    role: 'Founder, Compile',
    quote: 'Forms with server errors used to take a day. Now it is ten lines.',
  },
  {
    name: 'Alan Kay',
    role: 'Design lead, Smalltalk Labs',
    quote: 'The defaults are already good. We mostly delete code now.',
  },
]

export default function Example() {
  return (
    <Carousel aria-label="Customer stories" loop className="w-full max-w-md">
      <CarouselContent>
        {quotes.map((q) => (
          <CarouselItem key={q.name}>
            <Card className="h-full px-14">
              <Text size="lead">“{q.quote}”</Text>
              <div className="flex items-center gap-3">
                <Avatar name={q.name} size="sm" />
                <div>
                  <Text size="small" weight="medium">
                    {q.name}
                  </Text>
                  <Text size="caption" tone="muted">
                    {q.role}
                  </Text>
                </div>
              </div>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselDots />
    </Carousel>
  )
}
