"use client"

import { cn } from "@/lib/utils"
import { Check, CircleDashed } from "lucide-react"

interface Step {
  id: string
  name: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function DiscountFormStepper({ steps, currentStep, className }: StepperProps) {
  return (
    <nav className={cn("my-8", className)}>
      <ol role="list" className="flex items-center">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={cn(index !== steps.length - 1 ? "pr-8 sm:pr-20" : "", "relative flex items-center")}
          >
            {currentStep > index ? (
              // Completed step
              <div className="flex flex-shrink-0 h-8 w-8 items-center justify-center rounded-full bg-primary">
                <Check className="h-5 w-5 text-white" aria-hidden="true" />
                <span className="sr-only">Complete</span>
              </div>
            ) : currentStep === index ? (
              // Current step
              <div className="flex flex-shrink-0 h-8 w-8 items-center justify-center rounded-full border-2 border-primary">
                <span className="text-primary font-semibold text-sm">{index + 1}</span>
                <span className="sr-only">Step {index + 1}</span>
              </div>
            ) : (
              // Upcoming step
              <div className="flex flex-shrink-0 h-8 w-8 items-center justify-center rounded-full border-2 border-muted">
                <CircleDashed className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <span className="sr-only">Step {index + 1}</span>
              </div>
            )}

            <div className="ml-3 hidden md:flex flex-col">
              <span className="text-xs font-semibold">Step {index + 1}</span>
              <span
                className={cn("text-sm", currentStep === index ? "text-primary font-medium" : "text-muted-foreground")}
              >
                {step.name}
              </span>
            </div>

            {index !== steps.length - 1 && (
              <div
                className={cn(
                  "absolute top-4 left-0 -ml-px mt-0.5 h-0.5 w-full",
                  index < currentStep ? "bg-primary" : "bg-muted",
                )}
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
