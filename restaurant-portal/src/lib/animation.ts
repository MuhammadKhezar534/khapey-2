export const ANIMATION_DURATION = {
  shortest: 150,
  shorter: 200,
  normal: 300,
  longer: 400,
  longest: 500,
}

export const ANIMATION_EASING = {
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
}

export const ANIMATION_KEYFRAMES = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
  },
  slideInFromBottom: {
    from: { transform: "translateY(100%)" },
    to: { transform: "translateY(0)" },
  },
  slideOutToBottom: {
    from: { transform: "translateY(0)" },
    to: { transform: "translateY(100%)" },
  },
}

/**
 * Creates a CSS transition string with consistent timing
 */
export function createTransition(
  properties: string | string[],
  duration: keyof typeof ANIMATION_DURATION = "normal",
  easing: keyof typeof ANIMATION_EASING = "easeInOut",
  delay = 0,
): string {
  const durationValue = ANIMATION_DURATION[duration]
  const easingValue = ANIMATION_EASING[easing]
  const props = Array.isArray(properties) ? properties : [properties]

  return props.map((prop) => `${prop} ${durationValue}ms ${easingValue} ${delay}ms`).join(", ")
}

/**
 * Hook to add haptic feedback on mobile devices
 */
export function triggerHapticFeedback(intensity: "light" | "medium" | "heavy" = "medium") {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    switch (intensity) {
      case "light":
        navigator.vibrate(10)
        break
      case "medium":
        navigator.vibrate(15)
        break
      case "heavy":
        navigator.vibrate([10, 30, 20])
        break
    }
  }
}
