import { type ClipboardEvent, type KeyboardEvent, useId, useRef, useState } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { useControllableState } from '../../hooks/use-controllable-state'
import { useFieldControl } from '../field/field-context'
import { type TagInputVariants, tagInputStyles } from './tag-input.styles'

export interface TagInputProps extends TagInputVariants {
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (tags: string[]) => void
  placeholder?: string
  /** Stop accepting tags after this many. */
  maxTags?: number
  /** Return an error message to reject a tag, or `true` to accept it. */
  validate?: (tag: string, tags: readonly string[]) => string | true
  /** Allow the same tag more than once. Default false. */
  allowDuplicates?: boolean
  /** Keys (besides Enter) that turn the typed text into a tag. Default `[',']`. */
  separators?: readonly string[]
  disabled?: boolean
  /** Submits each tag as its own hidden input with this name. */
  name?: string
  id?: string
  className?: string
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

/**
 * Free-form multi-value input. Enter or a comma turns the text into a removable tag;
 * Backspace on an empty input removes the last one. Pasting a comma-separated list adds them all.
 */
export function TagInput(inProps: TagInputProps) {
  const [props, slots] = useComponentConfig('TagInput', useFieldControl(inProps))
  const {
    value: valueProp,
    defaultValue = [],
    onValueChange,
    placeholder = 'Add a tag…',
    maxTags,
    validate,
    allowDuplicates = false,
    separators = [','],
    disabled,
    name,
    id,
    size,
    className,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
  } = props
  const [tags, setTags] = useControllableState<string[]>({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const errorId = useId()
  const s = tagInputStyles({ size })
  const full = maxTags !== undefined && tags.length >= maxTags
  const invalid = Boolean(error) || ariaInvalid === true

  const add = (raw: readonly string[]) => {
    let next = [...tags]
    let problem: string | null = null
    for (const candidate of raw.map((t) => t.trim()).filter(Boolean)) {
      if (maxTags !== undefined && next.length >= maxTags) {
        problem = `You can add up to ${maxTags} tags.`
        break
      }
      if (!allowDuplicates && next.includes(candidate)) {
        problem = `“${candidate}” is already added.`
        continue
      }
      const verdict = validate?.(candidate, next) ?? true
      if (verdict !== true) {
        problem = verdict
        continue
      }
      next = [...next, candidate]
    }
    if (next.length !== tags.length) setTags(next)
    setError(problem)
    return problem === null
  }

  const commitDraft = () => {
    if (!draft.trim()) return
    if (add([draft])) setDraft('')
  }

  const remove = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
    setError(null)
    inputRef.current?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || separators.includes(event.key)) {
      if (event.key === 'Enter' && !draft.trim()) return
      event.preventDefault()
      commitDraft()
    } else if (event.key === 'Backspace' && draft === '' && tags.length > 0) {
      event.preventDefault()
      remove(tags.length - 1)
    }
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData('text')
    const pattern = new RegExp(
      `[${['\n', ...separators].map((s) => s.replace(/[-\\^\]]/g, '\\$&')).join('')}]`,
    )
    if (!pattern.test(text)) return
    event.preventDefault()
    add(text.split(pattern))
  }

  const describedBy =
    [ariaDescribedBy, error ? errorId : undefined].filter(Boolean).join(' ') || undefined

  return (
    <div data-slot="tag-input" className={s.root({ class: [slots.root, className] })}>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: clicking the frame focuses the input, a convenience; the input itself is focusable */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: keyboard users reach the input directly */}
      <div
        data-invalid={invalid || undefined}
        className={s.frame({ class: slots.frame })}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag, index) => (
          <span key={`${tag}-${index}`} data-slot="tag" className={s.tag({ class: slots.tag })}>
            <span className={s.tagLabel({ class: slots.tagLabel })}>{tag}</span>
            {!disabled && (
              <button
                type="button"
                aria-label={`Remove ${tag}`}
                className={s.remove({ class: slots.remove })}
                onClick={(event) => {
                  event.stopPropagation()
                  remove(index)
                }}
              >
                <XIcon />
              </button>
            )}
          </span>
        ))}
        <input
          ref={inputRef}
          id={id}
          value={draft}
          disabled={disabled || full}
          placeholder={full ? undefined : tags.length === 0 ? placeholder : undefined}
          aria-label={ariaLabel}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={s.input({ class: slots.input })}
          onChange={(event) => {
            setDraft(event.target.value)
            if (error) setError(null)
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={commitDraft}
        />
      </div>
      {error && (
        <p id={errorId} role="alert" className={s.message({ class: slots.message })}>
          {error}
        </p>
      )}
      {name &&
        tags.map((tag, index) => (
          <input key={`${tag}-${index}`} type="hidden" name={name} value={tag} />
        ))}
    </div>
  )
}
