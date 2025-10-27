"use client"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { LoyaltyDiscountForm } from "./loyalty-discount-form"
import { PercentageDealForm } from "./percentage-deal-form"
import { FixedPriceDealForm } from "./fixed-price-deal-form"
import { BankDiscountForm } from "./bank-discount-form"
import type {
  Discount,
  LoyaltyDiscount,
  PercentageDealDiscount,
  FixedPriceDealDiscount,
  BankDiscount,
} from "@/types/discounts"

interface EditDiscountDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateDiscount: (discount: Discount) => void
  discountToEdit: Discount | null
  onBackToList?: () => void
}

export function EditDiscountDrawer({
  open,
  onOpenChange,
  onUpdateDiscount,
  discountToEdit,
  onBackToList,
}: EditDiscountDrawerProps) {
  const [title, setTitle] = useState("Edit Discount")

  useEffect(() => {
    if (discountToEdit) {
      switch (discountToEdit.type) {
        case "loyalty":
          setTitle("Edit Loyalty Program")
          break
        case "percentageDeal":
          setTitle("Edit Percentage Deal")
          break
        case "fixedPriceDeal":
          setTitle("Edit Fixed Price Deal")
          break
        case "bankDiscount":
          setTitle("Edit Bank Discount")
          break
        default:
          setTitle("Edit Discount")
      }
    }
  }, [discountToEdit])

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleBackToList = () => {
    if (onBackToList) {
      onBackToList()
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:w-[512px] p-0 flex flex-col h-full">
        {/* Header with title */}
        <div className="sticky top-0 z-10 bg-white border-b p-4 pb-3 shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold">{title}</h2>
            </div>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {discountToEdit?.type === "loyalty" && (
            <LoyaltyDiscountForm
              onClose={handleClose}
              onCreateDiscount={(discount) => onUpdateDiscount(discount as LoyaltyDiscount)}
              discountToEdit={discountToEdit as LoyaltyDiscount}
              isEditing={true}
              startAtFirstStep={true}
            />
          )}
          {discountToEdit?.type === "percentageDeal" && (
            <PercentageDealForm
              onClose={handleClose}
              onCreateDiscount={(discount) => onUpdateDiscount(discount as PercentageDealDiscount)}
              discountToEdit={discountToEdit as PercentageDealDiscount}
              isEditing={true}
              startAtFirstStep={true}
            />
          )}
          {discountToEdit?.type === "fixedPriceDeal" && (
            <FixedPriceDealForm
              onClose={handleClose}
              onCreateDiscount={(discount) => onUpdateDiscount(discount as FixedPriceDealDiscount)}
              initialData={discountToEdit as FixedPriceDealDiscount}
              isEditing={true}
              startAtFirstStep={true}
            />
          )}
          {discountToEdit?.type === "bankDiscount" && (
            <BankDiscountForm
              onClose={handleClose}
              onCreateDiscount={(discount) => onUpdateDiscount(discount as BankDiscount)}
              discountToEdit={discountToEdit as BankDiscount}
              isEditing={true}
              startAtFirstStep={true}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
