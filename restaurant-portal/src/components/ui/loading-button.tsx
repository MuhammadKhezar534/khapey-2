import type React from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ButtonProps } from "@/components/ui/button"

interface LoadingButtonProps extends ButtonProps {
  isLoading: boolean
  loadingText?: string
  children: React.ReactNode
}

/**
 * Button component with loading state
 */
export function LoadingButton({
  isLoading,
  loadingText = "Loading...",
  children,
  className,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <Button className={cn("relative", className)} disabled={disabled || isLoading} {...props}>
      {isLoading && (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin" />
        </span>
      )}
      <span className={cn(isLoading ? "invisible" : "visible")}>{children}</span>
      {isLoading && loadingText && <span className="sr-only">{loadingText}</span>}
    </Button>
  )
}
