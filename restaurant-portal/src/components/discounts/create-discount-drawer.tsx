"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Award, X, ArrowLeft, Percent, CreditCard, Tag } from "lucide-react"
import { cn } from "@/lib/utils"
import { LoyaltyDiscountForm } from "./loyalty-discount-form"
import { PercentageDealForm } from "./percentage-deal-form"
import { BankDiscountForm } from "./bank-discount-form"
import { FixedPriceDealForm } from "./fixed-price-deal-form"
import type { LoyaltyDiscount, PercentageDealDiscount, BankDiscount, FixedPriceDealDiscount } from "@/types/discounts"

interface CreateDiscountDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hasLoyaltyDiscount: boolean
  onCreateLoyaltyDiscount: (discount: LoyaltyDiscount) => void
  onCreatePercentageDeal?: (discount: PercentageDealDiscount) => void
  onCreateBankDiscount?: (discount: BankDiscount) => void
  onCreateFixedPriceDeal?: (discount: FixedPriceDealDiscount) => void
}

interface DiscountTypeProps {
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
  disabled?: boolean
}

type View = "discountTypes" | "loyalty" | "percentageDeal" | "bankDiscount" | "fixedPriceDeal"

export function CreateDiscountDrawer({
  open,
  onOpenChange,
  hasLoyaltyDiscount,
  onCreateLoyaltyDiscount,
  onCreatePercentageDeal,
  onCreateBankDiscount,
  onCreateFixedPriceDeal,
}: CreateDiscountDrawerProps) {
  const [currentView, setCurrentView] = useState<View>("discountTypes")
  const [previousViews, setPreviousViews] = useState<View[]>([])

  useEffect(() => {
    if (!open) {
      // When drawer is closed, reset to list view, clear history, and add a small delay
      setTimeout(() => {
        setCurrentView("discountTypes")
        setPreviousViews([])
      }, 300) // Add a small delay to ensure transitions complete
    }
  }, [open])

  const handleSelectDiscountType = (type: string) => {
    setPreviousViews([...previousViews, currentView])

    if (type === "loyalty") {
      setCurrentView("loyalty")
    } else if (type === "percentageDeal") {
      setCurrentView("percentageDeal")
    } else if (type === "bankDiscount") {
      setCurrentView("bankDiscount")
    } else if (type === "fixedPriceDeal") {
      setCurrentView("fixedPriceDeal")
    }
  }

  const handleBack = () => {
    if (previousViews.length > 0) {
      // Pop the last view from history
      const newPreviousViews = [...previousViews]
      const lastView = newPreviousViews.pop()
      setPreviousViews(newPreviousViews)

      // Set current view to the previous view
      if (lastView) {
        setCurrentView(lastView)
      }
    } else {
      // If no history, go back to list
      setCurrentView("discountTypes")
    }
  }

  const handleClose = () => {
    // First close the drawer
    onOpenChange(false)

    // Reset internal state with a small delay to ensure animations complete
    setTimeout(() => {
      setCurrentView("discountTypes")
      setPreviousViews([])
    }, 300)
  }

  const discountTypes = [
    {
      id: "loyalty",
      name: "Loyalty Discount",
      description: "Reward loyal customers with special discounts",
      icon: <Award className="h-5 w-5" />,
    },
    {
      id: "percentageDeal",
      name: "Percentage Deal",
      description: "Offer a percentage discount on menu items",
      icon: <Percent className="h-5 w-5" />,
    },
    {
      id: "bankDiscount",
      name: "Bank Discount",
      description: "Special offers for specific bank card holders",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      id: "fixedPriceDeal",
      name: "Fixed Price Deal",
      description: "Offer special fixed prices for menu items",
      icon: <Tag className="h-5 w-5" />,
    },
  ]

  const getViewTitle = () => {
    switch (currentView) {
      case "discountTypes":
        return "Create New Discount"
      case "loyalty":
        return "Create Loyalty Discount"
      case "percentageDeal":
        return "Create Percentage Deal"
      case "bankDiscount":
        return "Create Bank Discount"
      case "fixedPriceDeal":
        return "Create Fixed Price Deal"
      default:
        return "Create New Discount"
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        className="w-full sm:w-[512px] p-0 flex flex-col h-full"
        onCloseAutoFocus={() => {
          document.body.focus()
        }}
        onEscapeKeyDown={handleClose}
        onPointerDownOutside={handleClose}
      >
        {/* Header with title */}
        <div className="sticky top-0 z-10 bg-white border-b p-4 pb-3 shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              {currentView !== "discountTypes" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-2 h-8 w-8 rounded-full hover:bg-muted"
                  onClick={handleBack}
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <h2 className="text-lg font-semibold">{getViewTitle()}</h2>
            </div>
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-muted"
                onClick={handleClose}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
          {currentView === "discountTypes" && (
            <p className="text-sm text-muted-foreground">Select the type of discount you want to create.</p>
          )}
        </div>

        {currentView === "discountTypes" && (
          <div className="flex-1 overflow-auto">
            <div className="grid gap-3 p-4">
              {discountTypes.map((type, index) => (
                <DiscountTypeCard
                  key={index}
                  icon={type.icon}
                  title={type.name}
                  description={type.description}
                  onClick={() => handleSelectDiscountType(type.id)}
                  disabled={type.id === "loyalty" && hasLoyaltyDiscount}
                />
              ))}

              {hasLoyaltyDiscount && (
                <div className="mt-2 rounded-md bg-amber-50 p-3 text-sm text-amber-800 border border-amber-200">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Award className="h-5 w-5 text-amber-600" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium">Loyalty Program Limit</h3>
                      <p className="mt-1 text-xs">
                        You can only have one loyalty program active at a time. Edit or delete your existing loyalty
                        program to create a new one.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === "loyalty" && (
          <div className="flex-1 overflow-hidden">
            <LoyaltyDiscountForm
              onClose={() => onOpenChange(false)}
              onCreateDiscount={onCreateLoyaltyDiscount}
              isEditing={false}
            />
          </div>
        )}

        {currentView === "percentageDeal" && (
          <div className="flex-1 overflow-hidden">
            <PercentageDealForm
              onClose={() => onOpenChange(false)}
              onCreateDiscount={onCreatePercentageDeal || (() => {})}
              isEditing={false}
            />
          </div>
        )}

        {currentView === "bankDiscount" && (
          <div className="flex-1 overflow-hidden">
            <BankDiscountForm
              onClose={handleClose}
              onCreateDiscount={onCreateBankDiscount || (() => {})}
              isEditing={false}
            />
          </div>
        )}

        {currentView === "fixedPriceDeal" && (
          <div className="flex-1 overflow-hidden">
            <FixedPriceDealForm
              onClose={() => onOpenChange(false)}
              onCreateDiscount={onCreateFixedPriceDeal || (() => {})}
              isEditing={false}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

function DiscountTypeCard({ icon, title, description, onClick, disabled }: DiscountTypeProps) {
  return (
    <button
      className={cn(
        "flex items-start gap-3 p-4 text-left w-full rounded-lg transition-colors",
        disabled
          ? "opacity-60 cursor-not-allowed bg-muted/40"
          : "hover:bg-accent/50 border border-border hover:border-accent",
      )}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-sm">{title}</h3>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {disabled && <p className="text-xs text-red-500 mt-1 font-medium">Already exists</p>}
      </div>
    </button>
  )
}
