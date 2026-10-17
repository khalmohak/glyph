import { IconButton, Input, Popover, PopoverContent, PopoverTrigger, Tooltip } from '@glyphui/ui'
import { RotateCcw } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { isValidColor, palette } from '../../lib/theme-studio'

interface ColorFieldProps {
  label: string
  /** The effective color: the override, or the preset's value. */
  value: string
  /** True when the value differs from the preset. */
  changed: boolean
  onChange: (value: string) => void
  onReset: () => void
}

/**
 * One color token: a swatch that opens a palette, and a text field that takes any CSS color
 * the theme engine can read (oklch, hex, rgb). Invalid text stays local until it parses.
 */
export function ColorField({ label, value, changed, onChange, onReset }: ColorFieldProps) {
  const id = useId()
  const [draft, setDraft] = useState(value)
  useEffect(() => setDraft(value), [value])
  const invalid = draft.trim() !== '' && !isValidColor(draft)

  const commit = (next: string) => {
    setDraft(next)
    if (isValidColor(next)) onChange(next)
  }

  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1">
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={`Pick ${label}`}
            className="size-8 shrink-0 cursor-pointer rounded-md border border-border shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ background: value }}
          />
        </PopoverTrigger>
        <PopoverContent align="start" className="grid w-60 gap-3 p-3">
          <p className="text-caption text-muted-foreground">Suggested</p>
          <div className="grid grid-cols-5 gap-2">
            {palette.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={color}
                title={color}
                onClick={() => commit(color)}
                className="aspect-square cursor-pointer rounded-md border border-border outline-none focus-visible:ring-2 focus-visible:ring-ring data-[selected=true]:ring-2 data-[selected=true]:ring-foreground"
                data-selected={color === value}
                style={{ background: color }}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <div className="grid min-w-0 gap-1">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor={id} className="truncate font-mono text-caption text-muted-foreground">
            {label}
            {changed && (
              <span className="ml-1.5 text-primary-text">
                <span aria-hidden="true">•</span>
                <span className="sr-only">(changed)</span>
              </span>
            )}
          </label>
          {changed && (
            <Tooltip content="Back to the preset">
              <IconButton
                size="sm"
                variant="ghost"
                icon={<RotateCcw />}
                aria-label={`Reset ${label}`}
                className="-my-1 size-6"
                onClick={onReset}
              />
            </Tooltip>
          )}
        </div>
        <Input
          id={id}
          size="sm"
          value={draft}
          spellCheck={false}
          aria-invalid={invalid || undefined}
          className="font-mono text-caption"
          onChange={(event) => commit(event.target.value)}
          onBlur={() => setDraft(value)}
        />
      </div>
    </div>
  )
}
