import { cn } from "@/lib/utils"

/**
 * Animation variants for common animations
 */
export const animations = {
  fadeIn: "animate-fade-in",
  fadeOut: "animate-fade-out",
  slideIn: "animate-slide-in",
  slideOut: "animate-slide-out",
  pulse: "animate-pulse",
  spin: "animate-spin",
  bounce: "animate-bounce",
  ping: "animate-ping",
}

/**
 * Apply animation classes with optional conditions
 * @param animation The animation to apply
 * @param condition Optional condition to determine if animation should be applied
 * @param additionalClasses Additional classes to apply
 */
export function withAnimation(animation: keyof typeof animations, condition = true, additionalClasses = ""): string {
  return cn(condition ? animations[animation] : "", additionalClasses)
}

/**
 * Apply a staggered animation to a list of elements
 * @param index The index of the current element
 * @param baseDelay The base delay in milliseconds
 * @param increment The increment for each element in milliseconds
 */
export function getStaggeredDelay(index: number, baseDelay = 100, increment = 50): string {
  const delay = baseDelay + index * increment
  return `animation-delay-${delay}`
}
