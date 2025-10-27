"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Check, Phone } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReferralVerificationProps {
  referringUserPhone: string
  setReferringUserPhone: (phone: string) => void
  referringUserPhoneError: string | null
  isVerifyingReferringUser: boolean
  isReferringUserVerified: boolean
  verifyReferringUser: () => void
  setIsReferringUserVerified: (verified: boolean) => void
  calculatedDiscount: {
    originalAmount: number
    discountAmount: number
    finalAmount: number
    discountPercentage?: number
    maxDiscount?: number
    description?: string
  } | null
  setCalculatedDiscount: (discount: any) => void
  orderAmount: string
  setOrderAmount: (amount: string) => void
  calculateDiscount: () => void
  setReferringUserPhoneError: (error: string | null) => void
}

export function ReferralVerification({
  referringUserPhone,
  setReferringUserPhone,
  referringUserPhoneError,
  isVerifyingReferringUser,
  isReferringUserVerified,
  verifyReferringUser,
  setIsReferringUserVerified,
  calculatedDiscount,
  setCalculatedDiscount,
  orderAmount,
  setOrderAmount,
  calculateDiscount,
  setReferringUserPhoneError,
}: ReferralVerificationProps) {
  return (
    <div className="space-y-4">
      <div className="bg-muted/20 rounded-lg overflow-hidden border">
        <div className="bg-muted/30 px-4 py-3 border-b">
          <h4 className="font-medium">Verify Referring User</h4>
        </div>
        <div className="p-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            This customer was referred by another user. Please verify the referring user's phone number.
          </p>

          {!isReferringUserVerified ? (
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type="tel"
                    placeholder="03XXXXXXXXX"
                    value={referringUserPhone}
                    onChange={(e) => {
                      // Only allow numbers and limit to 11 digits
                      const value = e.target.value.replace(/\D/g, "")
                      if (value.length <= 11) {
                        setReferringUserPhone(value)
                        // Clear error when user types
                        if (setReferringUserPhoneError) setReferringUserPhoneError(null)
                      }
                    }}
                    className={cn("pl-10", referringUserPhoneError && "border-destructive")}
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                  </div>
                </div>
                <Button onClick={verifyReferringUser} disabled={isVerifyingReferringUser}>
                  {isVerifyingReferringUser ? "Verifying..." : "Verify"}
                </Button>
              </div>
              {referringUserPhoneError && <div className="text-sm text-destructive">{referringUserPhoneError}</div>}
              <p className="text-xs text-muted-foreground">
                Enter the phone number of the person who referred this customer
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-md">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="font-medium">Referring user verified</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReferringUserVerified(false)}
                className="h-8 px-2 text-xs"
              >
                Change
              </Button>
            </div>
          )}

          <div className="pt-2">
            <p className="text-xs text-primary font-medium">Note: For testing, use 03211234566 as the referring user</p>
          </div>
        </div>
      </div>

      {/* Bill Amount and Calculation for Referral Discounts */}
      {isReferringUserVerified && (
        <div className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Calculate Discount</h4>
            {calculatedDiscount && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOrderAmount("")
                  setCalculatedDiscount(null)
                }}
                className="h-8 px-2 text-xs"
              >
                Reset
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="number"
                placeholder="Enter bill amount"
                value={orderAmount}
                onChange={(e) => setOrderAmount(e.target.value)}
                className="pl-8"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rs</div>
            </div>
            <Button onClick={calculateDiscount}>Calculate</Button>
          </div>

          {calculatedDiscount && (
            <div className="rounded-lg overflow-hidden border">
              <div className="bg-muted/30 px-4 py-3 border-b">
                <h4 className="font-medium">Discount Summary</h4>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Original Amount:</span>
                  <span className="font-medium">Rs {calculatedDiscount.originalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-green-600">
                  <span className="text-sm">Discount:</span>
                  <span className="font-medium">- Rs {calculatedDiscount.discountAmount.toFixed(2)}</span>
                </div>

                {calculatedDiscount.maxDiscount &&
                  calculatedDiscount.discountAmount === calculatedDiscount.maxDiscount && (
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Maximum discount applied</span>
                      <span>Rs {calculatedDiscount.maxDiscount}</span>
                    </div>
                  )}
                <Separator />
                <div className="flex justify-between items-center pt-1">
                  <span className="font-medium">Final Amount:</span>
                  <span className="text-lg font-bold text-primary">Rs {calculatedDiscount.finalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
