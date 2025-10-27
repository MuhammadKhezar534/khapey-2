import { cn } from "./utils"

/**
 * getContainerStyles - Returns a set of container styles with appropriate padding for different screen sizes
 * @param additionalClasses - Additional Tailwind classes to merge with the container styles
 * @returns - A className string with the container styles and any additional classes
 */
export const getContainerStyles = (additionalClasses?: string) => {
  return cn("w-full min-w-0 max-w-full content-padding", additionalClasses)
}

/**
 * getContentPadding - Returns just the padding classes for content areas
 * @returns - A className string with just the padding styles
 */
export const getContentPadding = () => {
  return "content-padding"
}
