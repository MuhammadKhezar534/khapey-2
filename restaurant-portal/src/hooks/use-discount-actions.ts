"use client"

import { useState } from "react"
import { useDiscounts } from "@/contexts/discount-context"
import type { Discount } from "@/types/discounts"
import { handleError, createAppError, ErrorType } from "@/lib/error-handling"
import { toast } from "@/hooks/use-toast"

/**
 * Hook for performing discount actions (create, update, delete)
 * @returns {{ createDiscount: (discount: Discount) => Promise<boolean>; updateDiscount: (id: string, updatedDiscount: Discount) => Promise<boolean>; deleteDiscount: (id: string) => Promise<boolean>; isPending: boolean; error: string | null }} - An object containing the discount actions and loading state
 */
export function useDiscountActions() {
  const { createDiscount, updateDiscount, deleteDiscount } = useDiscounts()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Validate discount data before submission
   */
  const validateDiscount = (discount: Discount): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (!discount.type) {
      errors.push("Discount type is required")
    }

    if (!discount.name && !discount.title) {
      errors.push("Discount name or title is required")
    }

    // Add more validation rules as needed

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  const handleCreateDiscount = async (discount: Discount) => {
    setIsPending(true)
    setError(null)

    try {
      // Validate discount object before sending to API
      const validation = validateDiscount(discount)

      if (!validation.isValid) {
        throw createAppError("Invalid discount data", ErrorType.VALIDATION, validation.errors)
      }

      const result = await createDiscount(discount)

      if (result) {
        toast({
          title: "Success",
          description: `${discount.type} discount created successfully`,
        })
      }

      return result
    } catch (error) {
      // Use our standardized error handling
      const appError = handleError(error, "Failed to create discount")
      setError(appError.message)
      return false
    } finally {
      setIsPending(false)
    }
  }

  const handleUpdateDiscount = async (id: string, discount: Discount) => {
    setIsPending(true)
    setError(null)

    try {
      // Validate discount object before sending to API
      const validation = validateDiscount(discount)

      if (!validation.isValid) {
        throw createAppError("Invalid discount data", ErrorType.VALIDATION, validation.errors)
      }

      const result = await updateDiscount(id, discount)

      if (result) {
        toast({
          title: "Success",
          description: `${discount.type} discount updated successfully`,
        })
      }

      return result
    } catch (error) {
      // Use our standardized error handling
      const appError = handleError(error, "Failed to update discount")
      setError(appError.message)
      return false
    } finally {
      setIsPending(false)
    }
  }

  const handleDeleteDiscount = async (id: string) => {
    setIsPending(true)
    setError(null)

    try {
      const result = await deleteDiscount(id)

      if (result) {
        toast({
          title: "Success",
          description: "Discount deleted successfully",
        })
      }

      return result
    } catch (error) {
      // Use our standardized error handling
      const appError = handleError(error, "Failed to delete discount")
      setError(appError.message)
      return false
    } finally {
      setIsPending(false)
    }
  }

  return {
    createDiscount: handleCreateDiscount,
    updateDiscount: handleUpdateDiscount,
    deleteDiscount: handleDeleteDiscount,
    isPending,
    error,
  }
}
