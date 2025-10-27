"use client"

import { cn } from "@/lib/utils"

interface FixedPriceOptionsProps {
  prices: Array<{
    id: string
    label: string
    price: number
  }>
  selectedDealOption: string | null
  setSelectedDealOption: (optionId: string) => void
}

export function FixedPriceOptions({ prices, selectedDealOption, setSelectedDealOption }: FixedPriceOptionsProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Available Options</h4>
      <div className="grid gap-3">
        {prices.map((price) => (
          <div
            key={price.id}
            className={cn(
              "border rounded-lg p-4 cursor-pointer transition-colors",
              selectedDealOption === price.id ? "border-primary bg-primary/5" : "hover:border-muted-foreground",
            )}
            onClick={() => setSelectedDealOption(price.id)}
          >
            <div className="flex justify-between items-center">
              <h5 className="font-medium">{price.label || `Option ${price.id.slice(-4)}`}</h5>
              <span className="font-bold text-primary">Rs {price.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
