import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@glyphui/ui'

const covers = ['Theming', 'Forms', 'Data tables', 'Layouts', 'Charts', 'Blocks']

export default function Example() {
  return (
    <Carousel aria-label="Guides" opts={{ align: 'start' }} className="w-full max-w-lg">
      <CarouselContent>
        {covers.map((title, i) => (
          <CarouselItem key={title} className="basis-1/2 sm:basis-1/3">
            <div className="flex aspect-[4/5] flex-col justify-end rounded-md border border-border bg-subtle p-4">
              <span className="font-mono text-caption text-faint-foreground">Guide {i + 1}</span>
              <span className="font-display text-h4">{title}</span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
