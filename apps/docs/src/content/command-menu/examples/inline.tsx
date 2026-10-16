import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@glyphui/ui'

const docs = ['Button', 'Card', 'Combobox', 'DataTable', 'Form', 'Sidebar', 'Tabs']

export default function Example() {
  return (
    <Command className="max-w-sm rounded-lg border border-border shadow-md">
      <CommandInput placeholder="Search components…" />
      <CommandList>
        <CommandEmpty>No components found.</CommandEmpty>
        {docs.map((name) => (
          <CommandItem key={name}>{name}</CommandItem>
        ))}
      </CommandList>
    </Command>
  )
}
