"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { calculateDiscount } from "@/utils/discount-calculator"
import type { Discount } from "@/types/discounts"
import { toast } from "@/hooks/use-toast"

interface DiscountCalculatorProps {
  discount: Discount
  selectedDealOption?: string | null
  customerVisitCount?: number
  onCalculated?: (result: {
    originalAmount: number
    discountAmount: number
    finalAmount: number
    discountPercentage?: number
    maxDiscount?: number
    description: string
  }) => void
}

/**
 * Reusable component for calculating discounts
 * Extracts this logic from multiple components for better maintainability
 */
export function DiscountCalculator({
  discount,
  selectedDealOption,
  customerVisitCount,
  onCalculated,
}: DiscountCalculatorProps) {
  const [orderAmount, setOrderAmount] = useState("")
  const [calculationResult, setCalculationResult] = useState<ReturnType<typeof calculateDiscount>>(null)

  const handleCalculate = () => {
    const amount = Number.parseFloat(orderAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid order amount",
        variant: "destructive",
      })
      return
    }

    const result = calculateDiscount(discount, amount, selectedDealOption, customerVisitCount)
    if (result) {
      setCalculationResult(result)
      if (onCalculated) {
        onCalculated(result)
      }
    }
  }

  const resetCalculation = () => {
    setOrderAmount("")
    setCalculationResult(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Calculate Discount</h4>
        {calculationResult && (
          <Button variant="ghost" size="sm" onClick={resetCalculation} className="h-8 px-2 text-xs">
            Reset
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="number"
            placeholder="Enter order amount"
            value={orderAmount}
            onChange={(e) => setOrderAmount(e.target.value)}
            className="pl-8"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rs</div>
        </div>
        <Button onClick={handleCalculate}>Calculate</Button>
      </div>

      {calculationResult && (
        <div className="rounded-lg overflow-hidden border">
          <div className="bg-muted/30 px-4 py-3 border-b">
            <h4 className="font-medium">Discount Summary</h4>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Original Amount:</span>
              <span className="font-medium">Rs {calculationResult.originalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-green-600">
              <span className="text-sm">Discount:</span>
              <span className="font-medium">- Rs {calculationResult.discountAmount.toFixed(2)}</span>
            </div>

            {calculationResult.maxDiscount && calculationResult.discountAmount === calculationResult.maxDiscount && (
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Maximum discount applied</span>
                <span>Rs {calculationResult.maxDiscount}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between items-center pt-1">
              <span className="font-medium">Final Amount:</span>
              <span className="text-lg font-bold text-primary">Rs {calculationResult.finalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
