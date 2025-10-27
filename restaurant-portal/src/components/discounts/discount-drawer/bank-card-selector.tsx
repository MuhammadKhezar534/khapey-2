"use client"

import { Check, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"

interface BankCardSelectorProps {
  bankCards: Array<{
    bankId: string
    bankName: string
    cardTypeIds: string[]
  }>
  selectedBankCard: string | null
  setSelectedBankCard: (cardId: string) => void
}

export function BankCardSelector({ bankCards, selectedBankCard, setSelectedBankCard }: BankCardSelectorProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Select Payment Card</h4>
      <p className="text-sm text-muted-foreground">
        Choose the bank card you'll use for payment to apply this discount
      </p>

      {/* Display eligible cards from the discount definition as selectable options */}
      <div className="grid gap-2">
        {bankCards.flatMap((bankCard) =>
          bankCard.cardTypeIds.map((cardTypeId) => {
            const cardDisplayName = cardTypeId
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")

            const cardFullId = `${bankCard.bankId}-${cardTypeId}`

            return (
              <div
                key={cardFullId}
                className={cn(
                  "border rounded-lg p-3 cursor-pointer transition-colors flex justify-between items-center",
                  selectedBankCard === cardFullId ? "border-primary bg-primary/5" : "hover:border-muted-foreground",
                )}
                onClick={() => setSelectedBankCard(cardFullId)}
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <span className="font-medium">{bankCard.bankName}</span>
                  <span className="text-muted-foreground">{cardDisplayName}</span>
                </div>
                {selectedBankCard === cardFullId && (
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            )
          }),
        )}
      </div>
    </div>
  )
}
