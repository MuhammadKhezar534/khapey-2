"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

interface DiscountCalculatorProps {
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
  setCalculatedDiscount: (discount: any) => void
  calculateDiscount: () => void
}

export function DiscountCalculator({
  orderAmount,
  setOrderAmount,
  calculatedDiscount,
  setCalculatedDiscount,
  calculateDiscount,
}: DiscountCalculatorProps) {
  return (
    <div className="space-y-4">
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
            placeholder="Enter order amount"
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

            {calculatedDiscount.maxDiscount && calculatedDiscount.discountAmount === calculatedDiscount.maxDiscount && (
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
  )
}
