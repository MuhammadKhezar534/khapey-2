"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import type { Discount } from "@/types/discounts"
import { validateDiscount } from "@/utils/discounts/discount-validation"
import { PercentageDealForm } from "./percentage-deal-form"
import { FixedPriceDealForm } from "./fixed-price-deal-form"
import { LoyaltyProgramForm } from "./loyalty-program-form"
import { BankDiscountForm } from "./bank-discount-form"
import { DateTimeSection } from "./form-sections/date-time-section"
import { BranchSelectionSection } from "./form-sections/branch-selection-section"

interface DiscountFormBaseProps {
  initialData?: Partial<Discount>
  onSubmit: (data: Discount) => void
  onCancel: () => void
  isLoading?: boolean
  mode?: "create" | "edit"
}

export function DiscountFormBase({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = "create",
}: DiscountFormBaseProps) {
  const [discountType, setDiscountType] = useState<string>(initialData?.type || "percentageDeal")
  const [formData, setFormData] = useState<Partial<Discount>>(
    initialData || {
      type: "percentageDeal",
      status: "active",
      isAlwaysActive: false,
      isAllDay: true,
      isAllWeek: true,
      applyToAllBranches: true,
    },
  )
  const { toast } = useToast()

  const handleTypeChange = (value: string) => {
    setDiscountType(value)
    setFormData((prev) => ({ ...prev, type: value }))
  }

  const updateFormData = (data: Partial<Discount>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate the form data
    const validation = validateDiscount(formData)
    if (!validation.isValid) {
      // Show error toast with first error
      const firstError = Object.values(validation.errors)[0]
      toast({
        title: "Validation Error",
        description: firstError,
        variant: "destructive",
      })
      return
    }

    // Submit the form data
    onSubmit(formData as Discount)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{mode === "create" ? "Create New Discount" : "Edit Discount"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Discount Type Selection */}
          <div className="space-y-2">
            <Label>Discount Type</Label>
            <RadioGroup value={discountType} onValueChange={handleTypeChange} className="grid grid-cols-2 gap-4">
              <div>
                <RadioGroupItem value="percentageDeal" id="percentageDeal" className="peer sr-only" />
                <Label
                  htmlFor="percentageDeal"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span>Percentage Deal</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="fixedPriceDeal" id="fixedPriceDeal" className="peer sr-only" />
                <Label
                  htmlFor="fixedPriceDeal"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span>Fixed Price Deal</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="loyalty" id="loyalty" className="peer sr-only" />
                <Label
                  htmlFor="loyalty"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span>Loyalty Program</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="bankDiscount" id="bankDiscount" className="peer sr-only" />
                <Label
                  htmlFor="bankDiscount"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span>Bank Discount</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Type-specific form */}
          <div className="pt-4">
            {discountType === "percentageDeal" && <PercentageDealForm data={formData} updateData={updateFormData} />}
            {discountType === "fixedPriceDeal" && <FixedPriceDealForm data={formData} updateData={updateFormData} />}
            {discountType === "loyalty" && <LoyaltyProgramForm data={formData} updateData={updateFormData} />}
            {discountType === "bankDiscount" && <BankDiscountForm data={formData} updateData={updateFormData} />}
          </div>

          {/* Common sections */}
          <DateTimeSection data={formData} updateData={updateFormData} />

          <BranchSelectionSection data={formData} updateData={updateFormData} />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : mode === "create" ? "Create Discount" : "Update Discount"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
