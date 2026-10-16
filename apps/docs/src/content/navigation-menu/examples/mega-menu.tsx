import {
  NavigationMenu,
  NavigationMenuCard,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@glyphui/ui'
import { BookOpen, Boxes, LayoutTemplate, Palette, Rocket, Users } from 'lucide-react'

export default function Example() {
  return (
    <div className="flex h-80 w-full justify-center pt-2">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Product</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-[min(34rem,calc(100vw-3rem))] gap-1 sm:grid-cols-2">
                <NavigationMenuCard
                  href="#components"
                  icon={<Boxes />}
                  title="Components"
                  description="Themed parts for every screen."
                />
                <NavigationMenuCard
                  href="#themes"
                  icon={<Palette />}
                  title="Themes"
                  description="One file sets the whole look."
                />
                <NavigationMenuCard
                  href="#blocks"
                  icon={<LayoutTemplate />}
                  title="Blocks"
                  description="Hero, pricing, FAQ and more."
                />
                <NavigationMenuCard
                  href="#start"
                  icon={<Rocket />}
                  title="Get started"
                  description="Install and ship in minutes."
                />
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-72 gap-1">
                <NavigationMenuCard
                  href="#docs"
                  icon={<BookOpen />}
                  title="Documentation"
                  description="Guides and API reference."
                />
                <NavigationMenuCard
                  href="#community"
                  icon={<Users />}
                  title="Community"
                  description="Discussions on GitHub."
                />
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#pricing" active>
              Pricing
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}
