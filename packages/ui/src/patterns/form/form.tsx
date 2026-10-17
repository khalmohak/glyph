import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import type { StandardSchemaV1 } from '@standard-schema/spec'
import { type ComponentProps, type MouseEvent, type ReactNode, useCallback } from 'react'
import {
  type Control,
  Controller,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  type Resolver,
  type UseFormProps,
  type UseFormReturn,
  useFormContext,
  useFormState,
  useForm as useHookForm,
} from 'react-hook-form'
import { Button, type ButtonProps } from '../../components/button'
import { Field, type FieldProps } from '../../components/field'
import { AlertIcon } from '../../internal/icons'
import { tv } from '../../utils/tv'

type AnySchema = StandardSchemaV1<FieldValues, FieldValues>
type InputOf<S extends AnySchema> = StandardSchemaV1.InferInput<S>
type OutputOf<S extends AnySchema> = StandardSchemaV1.InferOutput<S>

export interface UseFormOptions<S extends AnySchema>
  extends Omit<UseFormProps<InputOf<S>, unknown, OutputOf<S>>, 'resolver'> {
  /** Any Standard Schema validator: zod, valibot, arktype, ... */
  schema: S
}

/**
 * react-hook-form's `useForm`, validated by a schema. Field names and submitted values are
 * typed from the schema.
 */
export function useForm<S extends AnySchema>({
  schema,
  ...options
}: UseFormOptions<S>): UseFormReturn<InputOf<S>, unknown, OutputOf<S>> {
  return useHookForm<InputOf<S>, unknown, OutputOf<S>>({
    mode: 'onTouched',
    ...options,
    resolver: standardSchemaResolver(schema) as Resolver<InputOf<S>, unknown, OutputOf<S>>,
  })
}

/** Field-level errors from the server, keyed by field name. `root` shows above the form. */
export type FormErrors<TInput extends FieldValues> = Partial<
  Record<FieldPath<TInput> | 'root', string>
>

// biome-ignore lint/suspicious/noConfusingVoidType: submit handlers usually return nothing
export type SubmitResult<TInput extends FieldValues> = void | { errors: FormErrors<TInput> }

export interface FormProps<TInput extends FieldValues, TOutput>
  extends Omit<ComponentProps<'form'>, 'onSubmit'> {
  form: UseFormReturn<TInput, unknown, TOutput>
  /**
   * Receives validated values. Return `{ errors }` to show server-side field errors, or throw
   * to show a form-level error. The submit button shows a spinner until this settles.
   */
  onSubmit: (values: TOutput) => SubmitResult<TInput> | Promise<SubmitResult<TInput>>
}

// biome-ignore lint/suspicious/noExplicitAny: keyed by any form's control object
type AnyControl = Control<any, any, any>

/** The rendered `<form>` of each form, so a FormSubmit outside it can submit it. */
const formElements = new WeakMap<AnyControl, HTMLFormElement>()

export function Form<TInput extends FieldValues, TOutput>({
  form,
  onSubmit,
  children,
  ref,
  ...props
}: FormProps<TInput, TOutput>) {
  const control = form.control as AnyControl
  const registerElement = useCallback(
    (element: HTMLFormElement | null) => {
      if (element) formElements.set(control, element)
      else formElements.delete(control)
      if (typeof ref === 'function') ref(element)
      else if (ref) ref.current = element
    },
    [control, ref],
  )
  const submit = form.handleSubmit(async (values) => {
    try {
      const result = await onSubmit(values)
      if (!result?.errors) return
      for (const [name, message] of Object.entries(result.errors)) {
        if (message) form.setError(name as FieldPath<TInput>, { type: 'server', message })
      }
    } catch (error) {
      form.setError('root', {
        type: 'server',
        message: error instanceof Error ? error.message : 'Something went wrong. Try again.',
      })
    }
  })

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={submit} ref={registerElement} {...props}>
        {children}
      </form>
    </FormProvider>
  )
}

export interface FormFieldProps<TInput extends FieldValues, TName extends FieldPath<TInput>>
  extends Omit<FieldProps, 'children' | 'error'> {
  // biome-ignore lint/suspicious/noExplicitAny: accepts forms with any transformed output type
  control: Control<TInput, unknown, any>
  /** Typed from the schema: a misspelled name is a compile error. */
  name: TName
  /** Render the control and spread `field` onto it: `{(field) => <Input {...field} />}`. */
  children: (field: ControllerRenderProps<TInput, TName>) => ReactNode
}

/** One schema field: label, control, description and validation message, all wired. */
export function FormField<TInput extends FieldValues, TName extends FieldPath<TInput>>({
  control,
  name,
  children,
  ...fieldProps
}: FormFieldProps<TInput, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field {...fieldProps} error={fieldState.error?.message}>
          {children(field)}
        </Field>
      )}
    />
  )
}

export interface FormSubmitProps extends Omit<ButtonProps, 'type' | 'form'> {
  /**
   * The form to submit, for a button outside `<Form>` such as a Modal footer:
   * `<FormSubmit form={form}>`. Not needed inside `<Form>`.
   */
  // biome-ignore lint/suspicious/noExplicitAny: accepts any form regardless of its value types
  form?: UseFormReturn<any, any, any>
}

/** Submit button that shows progress while the form submits. */
export function FormSubmit({ form, onClick, ...props }: FormSubmitProps) {
  const context = useFormContext()
  const control = (form ?? context)?.control
  if (!control) {
    throw new Error(
      'FormSubmit must be inside <Form> or receive form={form}, e.g. <FormSubmit form={form}> in a Modal footer.',
    )
  }
  const { isSubmitting } = useFormState({ control })

  if (!form) return <Button type="submit" loading={isSubmitting} onClick={onClick} {...props} />

  // Outside <Form>, submit its element explicitly so validation and onSubmit run as usual.
  const submitOutside = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (!event.defaultPrevented) formElements.get(control)?.requestSubmit()
  }
  return <Button type="button" loading={isSubmitting} onClick={submitOutside} {...props} />
}

export const formErrorStyles = tv({
  slots: {
    base: 'flex items-start gap-2 rounded-md border border-danger/30 bg-danger/8 px-3 py-2.5 text-small text-danger-text',
    icon: 'mt-0.5 size-4 shrink-0',
  },
})

/** Form-level error (thrown from `onSubmit` or returned as `errors.root`). */
export function FormError({ className }: { className?: string }) {
  const { errors } = useFormState()
  const message = errors.root?.message
  if (!message) return null
  const s = formErrorStyles()
  return (
    <div role="alert" data-slot="form-error" className={s.base({ class: className })}>
      <AlertIcon className={s.icon()} />
      <span>{message}</span>
    </div>
  )
}
