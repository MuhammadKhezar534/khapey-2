"use client"

import { Badge } from "@/components/ui/badge"
import { formatDate, formatTime } from "@/utils/format"
import type { Discount } from "@/types/discounts"

interface DiscountDetailsCardProps {
  discount: Discount
  className?: string
}

/**
 * Reusable component for displaying discount details
 * Extracts this logic from multiple components for better maintainability
 */
export function DiscountDetailsCard({ discount, className }: DiscountDetailsCardProps) {
  return (
    <div className={`bg-muted/20 rounded-lg overflow-hidden border ${className}`}>
      <div className="bg-muted/30 px-4 py-3 border-b">
        <h4 className="font-medium">Discount Details</h4>
      </div>
      <div className="p-4 space-y-3">
        {/* Discount Value */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Discount Value:</span>
          <span className="font-medium text-primary">
            {discount.type === "percentageDeal"
              ? `${discount.percentage}% off`
              : discount.type === "bankDiscount"
                ? `${discount.discountPercentage}% off`
                : discount.type === "loyalty" && discount.loyaltyType === "percentage" && discount.percentageRanges
                  ? `Up to ${Math.max(...discount.percentageRanges.map((r) => r.percentage))}% off`
                  : discount.type === "loyalty" && discount.loyaltyType === "fixed" && discount.fixedRanges
                    ? `Fixed rewards based on loyalty`
                    : discount.type === "loyalty" && discount.loyaltyType === "fixed-reviews" && discount.visitRanges
                      ? `Rewards based on visits`
                      : discount.type === "loyalty" && discount.loyaltyType === "referral"
                        ? `Referral rewards`
                        : discount.type === "fixedPriceDeal" && discount.prices
                          ? `Fixed price options`
                          : "Special offer"}
          </span>
        </div>

        {/* Max Amount if applicable */}
        {((discount.type === "percentageDeal" && discount.maxAmount) ||
          (discount.type === "bankDiscount" && discount.maxAmount) ||
          (discount.type === "loyalty" && discount.loyaltyType === "percentage" && discount.maximumAmount)) && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Maximum Discount:</span>
            <span className="text-sm">
              Rs {discount.type === "loyalty" ? discount.maximumAmount : discount.maxAmount}
            </span>
          </div>
        )}

        {/* Referral details if applicable */}
        {discount.type === "loyalty" && discount.loyaltyType === "referral" && (
          <>
            {discount.referringUser && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Referring User:</span>
                <span className="text-sm">
                  {discount.referringUser.discountType === "percentage"
                    ? `${discount.referringUser.percentage}% off`
                    : `Rs ${discount.referringUser.amount}`}
                </span>
              </div>
            )}
            {discount.referredUser && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Referred User:</span>
                <span className="text-sm">
                  {discount.referredUser.discountType === "percentage"
                    ? `${discount.referredUser.percentage}% off`
                    : `Rs ${discount.referredUser.amount}`}
                </span>
              </div>
            )}
            {discount.referralMaximumAmount && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Maximum Referral Amount:</span>
                <span className="text-sm">Rs {discount.referralMaximumAmount}</span>
              </div>
            )}
          </>
        )}

        {/* Bank cards if applicable */}
        {discount.type === "bankDiscount" && discount.bankCards && discount.bankCards.length > 0 && (
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium">Valid Banks:</span>
            <div className="text-right">
              {discount.bankCards.map((bank, index) => (
                <span key={bank.bankId} className="text-sm block">
                  {bank.bankName}
                  {index < discount.bankCards.length - 1 ? "," : ""}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Branch information */}
        <div className="flex justify-between items-start">
          <span className="text-sm font-medium">Valid at:</span>
          <div className="text-right">
            {discount.applyToAllBranches ? (
              <span className="text-sm">All branches</span>
            ) : (
              <span className="text-sm">
                {discount.branches && discount.branches.length > 0
                  ? discount.branches.join(", ")
                  : "No branches specified"}
              </span>
            )}
          </div>
        </div>

        {/* Date restrictions */}
        {!discount.isAlwaysActive && discount.startDate && discount.endDate && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Valid period:</span>
            <span className="text-sm">
              {formatDate(discount.startDate)} - {formatDate(discount.endDate)}
            </span>
          </div>
        )}

        {/* Time restrictions */}
        {!discount.isAllDay && discount.startTime && discount.endTime && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Valid time:</span>
            <span className="text-sm">
              {formatTime(discount.startTime)} - {formatTime(discount.endTime)}
            </span>
          </div>
        )}

        {/* Day restrictions */}
        {!discount.isAllWeek && discount.daysOfWeek && discount.daysOfWeek.length > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Valid days:</span>
            <span className="text-sm">
              {discount.daysOfWeek.map((day) => day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()).join(", ")}
            </span>
          </div>
        )}

        {/* App Only */}
        {"forKhapeyUsersOnly" in discount && discount.forKhapeyUsersOnly && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Restriction:</span>
            <Badge variant="secondary" className="text-xs">
              Khapey App Users Only
            </Badge>
          </div>
        )}
      </div>
    </div>
  )
}
