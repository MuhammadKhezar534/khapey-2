import type { ReactNode } from "react"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import type { UseFormReturn } from "react-hook-form"

interface FormFieldWrapperProps {
  form: UseFormReturn<any>
  name: string
  label?: string
  description?: string
  children: ReactNode
  className?: string
}

export function FormFieldWrapper({ form, name, label, description, children, className }: FormFieldWrapperProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>{typeof children === "function" ? children(field) : children}</FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
