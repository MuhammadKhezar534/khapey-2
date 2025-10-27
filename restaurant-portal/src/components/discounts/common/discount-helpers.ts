// Define interface for useDiscountVerification hook result
// Add the missing functions

import type { Discount } from "@/types"

type HandleStateVariable = (e: string | null) => void

interface useDiscountVerificationResult {
  isVerifying: boolean
  isDiscountDrawerOpen: boolean
  drawerPage: "list" | "details"
  availableDiscounts: Discount[]
  selectedDiscount: Discount | null
  orderAmount: string
  setOrderAmount: (amount: string) => void
  calculatedDiscount: {
    originalAmount: number
    discountAmount: number
    finalAmount: number
    discountPercentage?: number
    maxDiscount?: number
    description?: string
  } | null
  selectedDealOption: string | null
  phoneNumber: string
  setPhoneNumber: (phoneNumber: string) => void
  phoneNumberError: string | null
  billImage: string
  setBillImage: (image: string) => void
  bankCards: any[]
  selectedBankCard: string | null
  showVisitTracker: boolean
  customerVisitCount: number
  qualifiesForVisitDiscount: boolean
  isLoading: boolean
  handleSelectDiscount: (discount: Discount) => void
  handleBackToList: () => void
  calculateDiscount: () => void
  handleCloseDrawer: () => void
  handleApplyDiscount: () => void
  getDiscountTypeName: (type: string) => string
  getDiscountDetails: (discount: Discount) => {
    title: string
    value: string
    maxAmount: string
    subtitle?: string
    type: string
  }
  setShowVisitTracker: (show: boolean) => void
  setSelectedBankCard: (card: string) => void
  setIsDiscountDrawerOpen: (card: boolean) => void
  handleVerifyPhoneNumber: () => void
  setReferringUserPhoneError: (error: string | null) => void
  setIsVerifying: (isVerifying: boolean) => void
  setAvailableDiscounts: (av: Discount[]) => void
  setCustomerVisitCount: (v: number) => void
  setSelectedDiscount: (discount: Discount | null) => void
  setQualifiesForVisitDiscount: (value: boolean) => void
}

export type { useDiscountVerificationResult }

export * from "./discount-calculations"
export * from "./discount-formatting"
export * from "./discount-status"
export * from "./discount-validation"
