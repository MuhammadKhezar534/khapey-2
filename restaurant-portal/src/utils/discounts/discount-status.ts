import type { Discount } from "@/types/discounts"

/**
 * Determines the current status of a discount based on its properties
 * @param {Discount} discount - The discount object.
 * @returns {"active" | "inactive" | "upcoming" | "expired"} - The status of the discount.
 */
export const getDiscountStatus = (discount: Discount): "active" | "inactive" | "upcoming" | "expired" => {
  if (discount.status === "inactive") return "inactive"

  const now = new Date()

  // Check if the discount has date restrictions
  if (!discount.isAlwaysActive && discount.startDate && discount.endDate) {
    const startDate = new Date(discount.startDate)
    const endDate = new Date(discount.endDate)
    endDate.setHours(23, 59, 59, 999) // Set to end of day

    if (now < startDate) return "upcoming"
    if (now > endDate) return "expired"
  }

  return "active"
}

/**
 * Checks if a discount is currently valid for a specific date/time
 * @param {Discount} discount - The discount object.
 * @param {Date} date - The date to check against.
 * @returns {boolean} - Whether the discount is valid.
 */
export const isDiscountValid = (discount: Discount, date: Date = new Date()): boolean => {
  // Check basic status
  if (discount.status === "inactive") return false

  // Always active discounts are valid
  if (discount.isAlwaysActive) return true

  // Check date range
  if (discount.startDate && discount.endDate) {
    const startDate = new Date(discount.startDate)
    const endDate = new Date(discount.endDate)
    endDate.setHours(23, 59, 59, 999) // Set to end of day

    if (date < startDate || date > endDate) return false
  }

  // Check day of week
  if (!discount.isAllWeek && discount.daysOfWeek && discount.daysOfWeek.length > 0) {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const currentDay = dayNames[date.getDay()]
    if (!discount.daysOfWeek.includes(currentDay)) return false
  }

  // Check time of day
  if (!discount.isAllDay && discount.startTime && discount.endTime) {
    const currentHours = date.getHours()
    const currentMinutes = date.getMinutes()
    const currentTimeMinutes = currentHours * 60 + currentMinutes

    const [startHours, startMinutes] = discount.startTime.split(":").map(Number)
    const [endHours, endMinutes] = discount.endTime.split(":").map(Number)

    const startTimeMinutes = startHours * 60 + startMinutes
    const endTimeMinutes = endHours * 60 + endMinutes

    if (currentTimeMinutes < startTimeMinutes || currentTimeMinutes > endTimeMinutes) return false
  }

  return true
}
