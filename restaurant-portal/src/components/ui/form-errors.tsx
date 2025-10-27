import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface FormErrorsProps {
  errors: string[]
  title?: string
  className?: string
}

/**
 * Component to display form validation errors consistently
 */
export function FormErrors({ errors, title = "Form Errors", className }: FormErrorsProps) {
  if (!errors || errors.length === 0) return null

  return (
    <Alert variant="destructive" className={cn("mb-4 border-2 border-destructive animate-pulse-once", className)}>
      <AlertCircle className="h-5 w-5" />
      <AlertTitle className="font-semibold">{title}</AlertTitle>
      <AlertDescription className="mt-2">
        <ul className="list-disc pl-5 space-y-1">
          {errors.map((error, index) => (
            <li key={index} className="text-sm">
              {error}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}
