"use client"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { CreditCard, Check } from "lucide-react"

// Bank card types
export interface BankCard {
  id: string
  bankId: string
  bankName: string
  cardType: string
  cardName: string
  lastFour?: string
}

interface BankCardSelectorProps {
  cards: BankCard[]
  selectedCardId: string | null
  onSelectCard: (cardId: string) => void
}

export function BankCardSelector({ cards, selectedCardId, onSelectCard }: BankCardSelectorProps) {
  return (
    <>
      <h3 id="bank-card-heading" className="text-base font-medium mb-3">
        Select Bank Card
      </h3>
      <RadioGroup
        value={selectedCardId || undefined}
        onValueChange={onSelectCard}
        role="radiogroup"
        aria-labelledby="bank-card-heading"
      >
        <div className="grid gap-3">
          {cards.map((card) => (
            <div key={card.id}>
              <RadioGroupItem
                value={card.id}
                id={card.id}
                className="peer sr-only"
                aria-label={`Select ${card.bankName} ${card.cardType}`}
                aria-checked={selectedCardId === card.id}
                role="radio"
              />
              <Label
                htmlFor={card.id}
                className={cn(
                  "flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors",
                  selectedCardId === card.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50 peer-focus-visible:ring-1 peer-focus-visible:ring-primary",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{card.cardName}</p>
                    <p className="text-sm text-muted-foreground">
                      {card.bankName} {card.lastFour ? `•••• ${card.lastFour}` : ""}
                    </p>
                  </div>
                </div>
                {selectedCardId === card.id && (
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </>
  )
}
