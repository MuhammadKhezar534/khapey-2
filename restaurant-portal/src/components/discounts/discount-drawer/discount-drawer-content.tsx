"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Smartphone,
  Building,
  Wallet,
  Calendar,
  Clock,
  TicketX,
} from "lucide-react";
import type { Discount } from "@/types/discounts";
import { formatDate, formatTime } from "@/utils/format";
import { DiscountDrawerFooter } from "./discount-drawer-footer";
import { useToast } from "@/hooks/use-toast";

interface DiscountDrawerContentProps {
  drawerPage: "list" | "details";
  availableDiscounts: Discount[];
  selectedDiscount: Discount | null;
  onSelectDiscount: (discount: Discount) => void;
  customerVisitCount: number;
  qualifiesForVisitDiscount: boolean;
  phoneNumber: string;
  onBackToList: () => void;
  onApplyDiscount: () => void;
  isLoading?: boolean;
  otp?: string;
  setOtp?: (otp: string) => void;
  isOtpVerified?: boolean;
  verifyOtp?: () => void;
  otpError?: string | null;
  isVerifyingOtp?: boolean;
  isOtpSent?: boolean;
  customerName?: string;
  setCustomerName?: (name: string) => void;
  selectedBranch?: string | null;
  setSelectedBranchForDiscount?: (branch: string) => void;
}

export function DiscountDrawerContent({
  drawerPage,
  availableDiscounts,
  selectedDiscount,
  onSelectDiscount,
  customerVisitCount,
  qualifiesForVisitDiscount,
  phoneNumber,
  onBackToList,
  onApplyDiscount,
  isLoading = false,
  otp = "",
  setOtp = () => {},
  isOtpVerified = false,
  verifyOtp = () => {},
  otpError = null,
  isVerifyingOtp = false,
  isOtpSent = false,
  customerName = "",
  setCustomerName = () => {},
  selectedBranch = null,
  setSelectedBranchForDiscount = () => {},
}: DiscountDrawerContentProps) {
  const { toast } = useToast();
  const [orderAmount, setOrderAmount] = useState("");
  const [calculatedDiscount, setCalculatedDiscount] = useState<{
    originalAmount: number;
    discountAmount: number;
    finalAmount: number;
    discountPercentage?: number;
    maxDiscount?: number;
    description?: string;
  } | null>(null);
  const [selectedDealOption, setSelectedDealOption] = useState<string | null>(
    null
  );
  const [billImage, setBillImage] = useState<string>("");
  const [bankCards, setBankCards] = useState<any[]>([]);
  const [selectedBankCard, setSelectedBankCard] = useState<string | null>(null);
  const [referringUserPhone, setReferringUserPhone] = useState("");
  const [isReferringUserVerified, setIsReferringUserVerified] = useState(false);
  const [referringUserPhoneError, setReferringUserPhoneError] = useState<
    string | null
  >(null);
  const [isVerifyingReferringUser, setIsVerifyingReferringUser] =
    useState(false);

  // Reset states when selected discount changes
  useEffect(() => {
    if (selectedDiscount) {
      setOrderAmount("");
      setCalculatedDiscount(null);
      setSelectedDealOption(null);
      setReferringUserPhone("");
      setIsReferringUserVerified(false);
      setReferringUserPhoneError(null);

      // If it's a visit-based loyalty discount, we need to check if the customer qualifies
      if (
        selectedDiscount.type === "loyalty" &&
        selectedDiscount.loyaltyType === "fixed-reviews" &&
        selectedDiscount.visitRanges
      ) {
        // Find the highest tier the customer qualifies for
        const qualifyingTiers = selectedDiscount.visitRanges.filter(
          (tier) => customerVisitCount >= tier.visits
        );

        if (qualifyingTiers.length > 0) {
          // Sort by visit count descending to get the highest tier
          qualifyingTiers.sort((a, b) => b.visits - a.visits);
          // Pre-select this tier
          setSelectedDealOption(qualifyingTiers[0].visits.toString());
        }
      }

      // If it's a bank discount, fetch the customer's bank cards
      if (selectedDiscount.type === "bankDiscount") {
        const customerCards = fetchBankCards();
        setBankCards(customerCards);
        setSelectedBankCard(null);
      }

      // Set default branch if there's only one branch
      if (selectedDiscount.branches && selectedDiscount.branches.length === 1) {
        setSelectedBranchForDiscount(selectedDiscount.branches[0]);
      } else if (selectedDiscount.applyToAllBranches && selectedBranch) {
        // If discount applies to all branches, use the currently selected branch
        setSelectedBranchForDiscount(selectedBranch);
      }
    }
  }, [
    selectedDiscount,
    customerVisitCount,
    selectedBranch,
    setSelectedBranchForDiscount,
  ]);

  // Function to fetch bank cards for the customer
  const fetchBankCards = () => {
    // Mock data - in a real app, this would come from your backend
    return [
      {
        id: "card1",
        bankId: "hbl",
        bankName: "HBL",
        cardType: "debit",
        cardName: "HBL Debit Card",
        lastFour: "4567",
      },
      {
        id: "card2",
        bankId: "mcb",
        bankName: "MCB",
        cardType: "credit",
        cardName: "MCB Platinum Credit",
        lastFour: "8901",
      },
      {
        id: "card3",
        bankId: "ubl",
        bankName: "UBL",
        cardType: "debit",
        cardName: "UBL Debit Card",
        lastFour: "2345",
      },
    ];
  };

  // Function to verify referring user
  const verifyReferringUser = () => {
    // Reset error state
    setReferringUserPhoneError(null);

    if (!referringUserPhone.trim()) {
      setReferringUserPhoneError("Please enter a phone number");
      return;
    }

    if (referringUserPhone.length !== 11) {
      setReferringUserPhoneError("Phone number must be 11 digits");
      return;
    }

    if (!referringUserPhone.startsWith("03")) {
      setReferringUserPhoneError("Phone number must start with 03");
      return;
    }

    setIsVerifyingReferringUser(true);

    // Simulate verification
    setTimeout(() => {
      // Check if the referring user exists in our database
      // For demo purposes, we're using a hardcoded number
      if (referringUserPhone === "03211234566") {
        setIsReferringUserVerified(true);
      } else {
        setReferringUserPhoneError(
          "This phone number is not registered as a referring user"
        );
        setIsReferringUserVerified(false);
      }
      setIsVerifyingReferringUser(false);
    }, 1000);
  };

  // Function to calculate discount based on order amount
  const calculateDiscount = () => {
    if (!selectedDiscount || !orderAmount) return;

    const amount = Number.parseFloat(orderAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid order amount",
        variant: "destructive",
      });
      return;
    }

    let discountAmount = 0;
    let finalAmount = amount;
    let discountPercentage = 0;
    let maxDiscount = 0;
    let discountDescription = "";

    // Calculate based on discount type
    if (selectedDiscount.type === "percentageDeal") {
      discountPercentage = selectedDiscount.percentage;
      discountAmount = amount * (discountPercentage / 100);
      discountDescription = `${discountPercentage}% off`;

      // Apply maximum discount if applicable
      if (
        selectedDiscount.maxAmount &&
        discountAmount > selectedDiscount.maxAmount
      ) {
        discountAmount = selectedDiscount.maxAmount;
        maxDiscount = selectedDiscount.maxAmount;
        discountDescription += ` (max Rs ${maxDiscount})`;
      }

      finalAmount = amount - discountAmount;
    } else if (selectedDiscount.type === "bankDiscount") {
      discountPercentage = selectedDiscount.discountPercentage;
      discountAmount = amount * (discountPercentage / 100);
      discountDescription = `${discountPercentage}% off with bank card`;

      // Apply maximum discount if applicable
      if (
        selectedDiscount.maxAmount &&
        discountAmount > selectedDiscount.maxAmount
      ) {
        discountAmount = selectedDiscount.maxAmount;
        maxDiscount = selectedDiscount.maxAmount;
        discountDescription += ` (max Rs ${maxDiscount})`;
      }

      finalAmount = amount - discountAmount;
    } else if (selectedDiscount.type === "loyalty") {
      if (
        selectedDiscount.loyaltyType === "percentage" &&
        selectedDiscount.percentageRanges
      ) {
        // For simplicity, use the highest percentage tier
        const highestTier = [...selectedDiscount.percentageRanges].sort(
          (a, b) => b.percentage - a.percentage
        )[0];
        discountPercentage = highestTier.percentage;
        discountAmount = amount * (discountPercentage / 100);
        discountDescription = `${discountPercentage}% loyalty discount (${highestTier.minDays}-${highestTier.maxDays} days)`;

        // Apply maximum discount if applicable
        if (
          selectedDiscount.maximumAmount &&
          discountAmount > selectedDiscount.maximumAmount
        ) {
          discountAmount = selectedDiscount.maximumAmount;
          maxDiscount = selectedDiscount.maximumAmount;
          discountDescription += ` (max Rs ${maxDiscount})`;
        }

        finalAmount = amount - discountAmount;
      } else if (
        selectedDiscount.loyaltyType === "fixed" &&
        selectedDiscount.fixedRanges
      ) {
        // For fixed loyalty, use the highest tier
        const highestTier = [...selectedDiscount.fixedRanges].sort(
          (a, b) => b.price - a.price
        )[0];
        discountAmount = highestTier.price;
        discountDescription = `${highestTier.label} fixed discount (${highestTier.minDays}-${highestTier.maxDays})`;

        // Ensure discount doesn't exceed bill amount
        if (discountAmount > amount) {
          discountAmount = amount;
          discountDescription += " (limited to bill amount)";
        }

        finalAmount = amount - discountAmount;
      } else if (
        selectedDiscount.loyaltyType === "fixed-reviews" &&
        selectedDiscount.visitRanges
      ) {
        // For visit-based loyalty, simulate the customer has reached the highest milestone
        // In a real app, you would check the actual visit count from the customer's profile
        const highestTier = [...selectedDiscount.visitRanges].sort(
          (a, b) => b.visits - a.visits
        )[0];
        discountAmount = highestTier.price;
        discountDescription = `${highestTier.label} (${highestTier.visits} visits milestone)`;

        // Ensure discount doesn't exceed bill amount
        if (discountAmount > amount) {
          discountAmount = amount;
          discountDescription += " (limited to bill amount)";
        }

        finalAmount = amount - discountAmount;
      } else if (selectedDiscount.loyaltyType === "referral") {
        // For referral, use the referred user discount (this is for the person being referred)
        if (selectedDiscount.referredUser) {
          if (
            selectedDiscount.referredUser.discountType === "percentage" &&
            selectedDiscount.referredUser.percentage
          ) {
            discountPercentage = selectedDiscount.referredUser.percentage;
            discountAmount = amount * (discountPercentage / 100);
            discountDescription = `${discountPercentage}% referred user discount`;

            // Apply maximum discount if applicable
            if (
              selectedDiscount.referralMaximumAmount &&
              discountAmount > selectedDiscount.referralMaximumAmount
            ) {
              discountAmount = selectedDiscount.referralMaximumAmount;
              maxDiscount = selectedDiscount.referralMaximumAmount;
              discountDescription += ` (max Rs ${maxDiscount})`;
            }
          } else if (
            selectedDiscount.referredUser.discountType === "fixed" &&
            selectedDiscount.referredUser.amount
          ) {
            discountAmount = selectedDiscount.referredUser.amount;
            discountDescription = `Rs ${discountAmount} fixed referral discount`;

            // Ensure discount doesn't exceed bill amount
            if (discountAmount > amount) {
              discountAmount = amount;
              discountDescription += " (limited to bill amount)";
            }
          }

          finalAmount = amount - discountAmount;
        }
      }
    } else if (
      selectedDiscount.type === "fixedPriceDeal" &&
      selectedDealOption
    ) {
      // For fixed price deals, we need to use the selected option
      const selectedOption = selectedDiscount.prices.find(
        (p) => p.id === selectedDealOption
      );
      if (selectedOption) {
        // Fixed price deals replace the original price with the deal price
        discountAmount = amount - selectedOption.price;
        finalAmount = selectedOption.price;
        discountDescription = `${selectedOption.label || "Selected deal"} (Rs ${
          selectedOption.price
        } fixed price)`;

        // If the discount would be negative (deal price > original price), set to 0
        if (discountAmount < 0) {
          discountAmount = 0;
          discountDescription +=
            " (no discount applied - deal price higher than original)";
        }
      }
    }

    setCalculatedDiscount({
      originalAmount: amount,
      discountAmount,
      finalAmount,
      discountPercentage,
      maxDiscount: maxDiscount || undefined,
      description: discountDescription,
    });
  };

  // Function to apply the discount
  const handleApplyDiscount = () => {
    // For referral discounts, ensure the referring user is verified
    if (
      selectedDiscount?.type === "loyalty" &&
      selectedDiscount.loyaltyType === "referral" &&
      !isReferringUserVerified
    ) {
      toast({
        title: "Verification required",
        description:
          "Please verify the referring user before applying the discount",
        variant: "destructive",
      });
      return;
    }

    // Call the parent's onApplyDiscount function
    onApplyDiscount();
  };

  // Helper function to get discount details
  const getDiscountDetails = (discount: Discount) => {
    switch (discount.type) {
      case "percentageDeal":
        return {
          title: discount.title,
          value: `${discount.percentage}% off`,
          maxAmount: discount.maxAmount
            ? `Up to Rs ${discount.maxAmount}`
            : "No maximum limit",
          type: "Percentage Deal",
        };
      case "bankDiscount":
        return {
          title: discount.title,
          value: `${discount.discountPercentage}% off with bank cards`,
          maxAmount: discount.maxAmount ? `Up to Rs ${discount.maxAmount}` : "",
          subtitle:
            discount.bankCards?.length > 0
              ? `Valid for ${discount.bankCards.length} bank${
                  discount.bankCards.length > 1 ? "s" : ""
                }`
              : "",
          type: "Bank Discount",
        };
      case "fixedPriceDeal":
        return {
          title: discount.name || discount.title,
          value:
            discount.prices?.length > 0
              ? `Special prices from Rs ${Math.min(
                  ...discount.prices.map((p) => p.price)
                )}`
              : "Special fixed prices",
          subtitle:
            discount.prices?.length > 0
              ? `${discount.prices.length} price option${
                  discount.prices.length > 1 ? "s" : ""
                }`
              : "",
          type: "Fixed Price Deal",
        };
      case "loyalty":
        if (discount.loyaltyType === "percentage") {
          return {
            title: discount.name,
            value:
              discount.percentageRanges?.length > 0
                ? `Up to ${Math.max(
                    ...discount.percentageRanges.map((r) => r.percentage)
                  )}% off`
                : "Percentage discount for loyal customers",
            maxAmount: discount.maximumAmount
              ? `Up to Rs ${discount.maximumAmount}`
              : "",
            subtitle: "Based on customer loyalty",
            type: "Loyalty Program",
          };
        } else if (discount.loyaltyType === "fixed") {
          return {
            title: discount.name,
            value:
              discount.fixedRanges?.length > 0
                ? `Special rewards for loyal customers`
                : "Fixed rewards for loyal customers",
            subtitle: `${discount.fixedRanges?.length || 0} reward tier${
              discount.fixedRanges?.length !== 1 ? "s" : ""
            }`,
            type: "Loyalty Program",
          };
        } else if (discount.loyaltyType === "fixed-reviews") {
          return {
            title: discount.name,
            value:
              discount.visitRanges?.length > 0
                ? `Rewards based on ${discount.visitRanges.length} visit tiers`
                : "Rewards based on visits",
            subtitle: "Visit-based rewards",
            type: "Loyalty Program",
          };
        } else if (discount.loyaltyType === "referral") {
          return {
            title: discount.name,
            value: "Referral rewards program",
            maxAmount: discount.referralMaximumAmount
              ? `Up to Rs ${discount.referralMaximumAmount}`
              : "",
            subtitle: "For both referrer and new customers",
            type: "Loyalty Program",
          };
        }
        return {
          title: discount.name || "Discount",
          value: "Loyalty program",
          subtitle: "Rewards for loyal customers",
          type: "Loyalty Program",
        };
      default:
        return {
          title: discount.name || discount.title || "Discount",
          value: "Special offer",
          type: "Discount",
        };
    }
  };

  const isApplyDisabled = () => {
    if (!selectedDiscount) return true;
    if (!isOtpVerified) return true;
    if (!customerName.trim()) return true;
    if (!selectedBranch) return true;

    // For percentage deals, bank discounts, and percentage loyalty, we need an order amount
    if (
      (selectedDiscount.type === "percentageDeal" ||
        (selectedDiscount.type === "bankDiscount" && selectedBankCard) ||
        (selectedDiscount.type === "loyalty" &&
          selectedDiscount.loyaltyType === "percentage")) &&
      !calculatedDiscount
    ) {
      return true;
    }

    // For bank discounts, we need a selected bank card
    if (selectedDiscount.type === "bankDiscount" && !selectedBankCard) {
      return true;
    }

    // For fixed price deals, we need a selected option
    if (selectedDiscount.type === "fixedPriceDeal" && !selectedDealOption) {
      return true;
    }

    // For referral discounts, we need a verified referring user
    if (
      selectedDiscount.type === "loyalty" &&
      selectedDiscount.loyaltyType === "referral" &&
      !isReferringUserVerified
    ) {
      return true;
    }

    return false;
  };

  if (drawerPage === "list") {
    console.log("Rendering available discounts:", availableDiscounts.length);
    return (
      <>
        <div className="flex-1 overflow-y-auto p-4">
          {availableDiscounts.length === 0 && !qualifiesForVisitDiscount ? (
            <div className="text-center py-8">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <TicketX className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg mb-2">
                No Discounts Available
              </h3>
              <p className="text-muted-foreground text-sm">
                This customer doesn't qualify for any active discounts at this
                time.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableDiscounts.length > 0 ? (
                availableDiscounts.map((discount) => {
                  const details = getDiscountDetails(discount);
                  return (
                    <div
                      key={discount.id}
                      className="border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors"
                      onClick={() => onSelectDiscount(discount)}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <h3 className="font-medium">{details.title}</h3>

                          {/* Enhanced discount-specific information */}
                          <div className="mt-2 text-xs text-muted-foreground space-y-1">
                            {discount.type === "bankDiscount" &&
                              discount.bankCards && (
                                <div className="flex items-center gap-1">
                                  <Wallet className="h-3.5 w-3.5 shrink-0" />
                                  <span>
                                    {discount.bankCards
                                      .map((card) => card.bankName)
                                      .join(", ")}{" "}
                                    cards
                                  </span>
                                </div>
                              )}

                            {!discount.applyToAllBranches &&
                              discount.branches &&
                              discount.branches.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Building className="h-3.5 w-3.5 shrink-0" />
                                  <span>
                                    {discount.branches.length > 2
                                      ? `${discount.branches[0]}, ${
                                          discount.branches[1]
                                        } +${discount.branches.length - 2} more`
                                      : discount.branches.join(", ")}
                                  </span>
                                </div>
                              )}

                            {"forKhapeyUsersOnly" in discount &&
                              discount.forKhapeyUsersOnly && (
                                <div className="flex items-center gap-1">
                                  <Smartphone className="h-3.5 w-3.5 shrink-0" />
                                  <span>Khapey app users only</span>
                                </div>
                              )}

                            {!discount.isAlwaysActive &&
                              discount.startDate &&
                              discount.endDate && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                                  <span>
                                    Valid until {formatDate(discount.endDate)}
                                  </span>
                                </div>
                              )}

                            {!discount.isAllDay &&
                              discount.startTime &&
                              discount.endTime && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5 shrink-0" />
                                  <span>
                                    {formatTime(discount.startTime)} -{" "}
                                    {formatTime(discount.endTime)}
                                  </span>
                                </div>
                              )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant="outline" className="ml-2">
                            {details.type}
                          </Badge>
                          {(discount.imageUrl || discount.image) && (
                            <div className="w-14 h-14 rounded-md overflow-hidden bg-muted/30 flex-shrink-0">
                              <img
                                src={
                                  discount.imageUrl ||
                                  discount.image ||
                                  "/placeholder.svg"
                                }
                                alt={details.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No discounts available for this customer
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </>
    );
  }

  if (selectedDiscount) {
    // Get available branches for this discount
    const availableBranches = selectedDiscount.applyToAllBranches
      ? ["Gulberg", "DHA Phase 5", "Johar Town", "MM Alam Road", "Bahria Town"] // All branches
      : selectedDiscount.branches || [];

    return (
      <div
        className="flex-1 overflow-y-auto"
        onPaste={(e) => {
          const items = e.clipboardData.items;
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
              const blob = items[i].getAsFile();
              if (!blob) continue;

              const reader = new FileReader();
              reader.onload = () => {
                setBillImage(reader.result as string);
              };
              reader.readAsDataURL(blob);
              break;
            }
          }
        }}
      >
        <div className="p-4 space-y-6 pb-24">
          {/* Discount Header with Badge and Title */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">
                  {getDiscountDetails(selectedDiscount).type}
                </Badge>
                {selectedDiscount.type === "loyalty" &&
                  selectedDiscount.loyaltyType === "fixed-reviews" && (
                    <Badge variant="secondary">
                      {customerVisitCount} Visits
                    </Badge>
                  )}
              </div>
              <h3 className="text-xl font-semibold">
                {selectedDiscount.name || selectedDiscount.title}
              </h3>
            </div>
            {selectedDiscount.imageUrl && (
              <div className="w-16 h-16 rounded-md overflow-hidden bg-muted/30 flex-shrink-0">
                <img
                  src={selectedDiscount.imageUrl || "/placeholder.svg"}
                  alt={
                    selectedDiscount.name ||
                    selectedDiscount.title ||
                    "Discount"
                  }
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Discount Details Section - Moved to the top */}
          <div className="space-y-4 bg-muted/20 rounded-lg p-4 border">
            {/* Discount Value */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Discount Value:</span>
              <span className="font-medium text-primary">
                {selectedDiscount.type === "percentageDeal"
                  ? `${selectedDiscount.percentage}% off`
                  : selectedDiscount.type === "bankDiscount"
                  ? `${selectedDiscount.discountPercentage}% off`
                  : selectedDiscount.type === "loyalty" &&
                    selectedDiscount.loyaltyType === "percentage" &&
                    selectedDiscount.percentageRanges
                  ? `Up to ${Math.max(
                      ...selectedDiscount.percentageRanges.map(
                        (r) => r.percentage
                      )
                    )}% off`
                  : selectedDiscount.type === "loyalty" &&
                    selectedDiscount.loyaltyType === "fixed" &&
                    selectedDiscount.fixedRanges
                  ? `Fixed rewards based on loyalty`
                  : selectedDiscount.type === "loyalty" &&
                    selectedDiscount.loyaltyType === "fixed-reviews" &&
                    selectedDiscount.visitRanges
                  ? `Rewards based on visits`
                  : selectedDiscount.type === "loyalty" &&
                    selectedDiscount.loyaltyType === "referral"
                  ? `Referral rewards`
                  : selectedDiscount.type === "fixedPriceDeal" &&
                    selectedDiscount.prices
                  ? `Fixed price options`
                  : "Special offer"}
              </span>
            </div>

            {/* Max Amount if applicable */}
            {((selectedDiscount.type === "percentageDeal" &&
              selectedDiscount.maxAmount) ||
              (selectedDiscount.type === "bankDiscount" &&
                selectedDiscount.maxAmount) ||
              (selectedDiscount.type === "loyalty" &&
                selectedDiscount.loyaltyType === "percentage" &&
                selectedDiscount.maximumAmount)) && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Maximum Discount:</span>
                <span className="text-sm">
                  Rs{" "}
                  {selectedDiscount.type === "loyalty"
                    ? selectedDiscount.maximumAmount
                    : selectedDiscount.maxAmount}
                </span>
              </div>
            )}

            {/* Branch information */}
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium">Valid at:</span>
              <div className="text-right">
                {selectedDiscount.applyToAllBranches ? (
                  <span className="text-sm">All branches</span>
                ) : (
                  <span className="text-sm">
                    {selectedDiscount.branches &&
                    selectedDiscount.branches.length > 0
                      ? selectedDiscount.branches.join(", ")
                      : "No branches specified"}
                  </span>
                )}
              </div>
            </div>

            {/* Date restrictions */}
            {!selectedDiscount.isAlwaysActive &&
              selectedDiscount.startDate &&
              selectedDiscount.endDate && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Valid period:</span>
                  <span className="text-sm">
                    {formatDate(selectedDiscount.startDate)} -{" "}
                    {formatDate(selectedDiscount.endDate)}
                  </span>
                </div>
              )}

            {/* Time restrictions */}
            {!selectedDiscount.isAllDay &&
              selectedDiscount.startTime &&
              selectedDiscount.endTime && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Valid time:</span>
                  <span className="text-sm">
                    {formatTime(selectedDiscount.startTime)} -{" "}
                    {formatTime(selectedDiscount.endTime)}
                  </span>
                </div>
              )}

            {/* Day restrictions */}
            {!selectedDiscount.isAllWeek &&
              selectedDiscount.daysOfWeek &&
              selectedDiscount.daysOfWeek.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Valid days:</span>
                  <span className="text-sm">
                    {selectedDiscount.daysOfWeek
                      .map(
                        (day) =>
                          day.charAt(0).toUpperCase() +
                          day.slice(1).toLowerCase()
                      )
                      .join(", ")}
                  </span>
                </div>
              )}

            {/* App Only */}
            {"forKhapeyUsersOnly" in selectedDiscount &&
              selectedDiscount.forKhapeyUsersOnly && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Restriction:</span>
                  <Badge variant="secondary" className="text-xs">
                    Khapey App Users Only
                  </Badge>
                </div>
              )}
          </div>

          {/* Customer Verification Section */}
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <h4 className="font-medium">Customer Information</h4>
              <div className="grid gap-3">
                <div>
                  <label
                    htmlFor="customerName"
                    className="text-sm font-medium block mb-1"
                  >
                    Customer Name
                  </label>
                  <Input
                    id="customerName"
                    placeholder="Enter customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="text-sm font-medium block mb-1"
                  >
                    Phone Number
                  </label>
                  <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    disabled
                    className="w-full bg-muted/50"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="otp"
                    className="text-sm font-medium block mb-1"
                  >
                    Verification Code (OTP)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="otp"
                      placeholder="Enter OTP sent to phone"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))
                      }
                      className="w-full"
                      maxLength={4}
                      disabled={isOtpVerified}
                    />
                    <Button
                      variant="outline"
                      onClick={verifyOtp}
                      disabled={
                        isVerifyingOtp ||
                        !otp ||
                        otp.length < 4 ||
                        isOtpVerified
                      }
                      size="sm"
                    >
                      {isVerifyingOtp
                        ? "Verifying..."
                        : isOtpVerified
                        ? "Verified"
                        : "Verify"}
                    </Button>
                  </div>
                  {otpError && (
                    <p className="text-destructive text-xs">{otpError}</p>
                  )}
                  {isOtpVerified && (
                    <p className="text-green-600 text-xs">
                      OTP verified successfully
                    </p>
                  )}
                  {isOtpSent && !isOtpVerified && (
                    <p className="text-xs text-muted-foreground">
                      A 4-digit verification code was sent to {phoneNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Branch Selection Section */}
          {selectedDiscount &&
            (() => {
              // Get available branches for this discount
              const availableBranches = selectedDiscount.applyToAllBranches
                ? [
                    "Gulberg",
                    "DHA Phase 5",
                    "Johar Town",
                    "MM Alam Road",
                    "Bahria Town",
                  ] // All branches
                : selectedDiscount.branches || [];

              // Don't show branch selection if there's only one branch
              if (availableBranches.length <= 1) return null;

              return (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium">Select Branch</h4>
                  <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                    {availableBranches.map((branch) => (
                      <Button
                        key={branch}
                        variant={
                          selectedBranch === branch ? "default" : "outline"
                        }
                        size="sm"
                        className="flex-1 min-w-[120px]"
                        onClick={() => setSelectedBranchForDiscount(branch)}
                      >
                        {branch}
                      </Button>
                    ))}
                  </div>
                  {!selectedBranch && (
                    <p className="text-xs text-destructive mt-1">
                      Please select a branch to apply this discount
                    </p>
                  )}
                </div>
              );
            })()}

          {/* Referral Verification Section */}
          {selectedDiscount.type === "loyalty" &&
            selectedDiscount.loyaltyType === "referral" && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">Referral Verification</h4>
                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="referringUserPhone"
                      className="text-sm font-medium block mb-1"
                    >
                      Referring User's Phone Number
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="referringUserPhone"
                        placeholder="03XXXXXXXXX"
                        value={referringUserPhone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 11) {
                            setReferringUserPhone(value);
                            if (referringUserPhoneError)
                              setReferringUserPhoneError(null);
                          }
                        }}
                        className="w-full"
                        disabled={isReferringUserVerified}
                      />
                      <Button
                        variant="outline"
                        onClick={verifyReferringUser}
                        disabled={
                          isVerifyingReferringUser ||
                          !referringUserPhone ||
                          referringUserPhone.length < 11 ||
                          isReferringUserVerified
                        }
                        size="sm"
                      >
                        {isVerifyingReferringUser
                          ? "Verifying..."
                          : isReferringUserVerified
                          ? "Verified"
                          : "Verify"}
                      </Button>
                    </div>
                    {referringUserPhoneError && (
                      <p className="text-destructive text-xs">
                        {referringUserPhoneError}
                      </p>
                    )}
                    {isReferringUserVerified && (
                      <p className="text-green-600 text-xs">
                        Referring user verified successfully
                      </p>
                    )}
                  </div>

                  {isReferringUserVerified && (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label
                          htmlFor="orderAmount"
                          className="text-sm font-medium block mb-1"
                        >
                          Order Amount (Rs)
                        </label>
                        <div className="flex gap-2">
                          <Input
                            id="orderAmount"
                            type="number"
                            placeholder="Enter order amount"
                            value={orderAmount}
                            onChange={(e) => setOrderAmount(e.target.value)}
                            className="w-full"
                          />
                          <Button
                            variant="outline"
                            onClick={calculateDiscount}
                            size="sm"
                          >
                            Calculate
                          </Button>
                        </div>
                      </div>

                      {calculatedDiscount && (
                        <div className="bg-muted/20 p-3 rounded-md space-y-2 mt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Original Amount:</span>
                            <span className="font-medium">
                              Rs {calculatedDiscount.originalAmount.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Discount Amount:</span>
                            <span className="font-medium text-green-600">
                              Rs {calculatedDiscount.discountAmount.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              Final Amount:
                            </span>
                            <span className="font-medium">
                              Rs {calculatedDiscount.finalAmount.toFixed(2)}
                            </span>
                          </div>
                          {calculatedDiscount.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {calculatedDiscount.description}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Visit Tiers for Fixed-Reviews Loyalty Discounts */}
          {selectedDiscount.type === "loyalty" &&
            selectedDiscount.loyaltyType === "fixed-reviews" &&
            selectedDiscount.visitRanges &&
            selectedDiscount.visitRanges.length > 0 && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">Visit-Based Rewards</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Customer Visit Count:
                    </span>
                    <Badge variant="outline">{customerVisitCount} Visits</Badge>
                  </div>

                  <div className="space-y-2">
                    {selectedDiscount.visitRanges.map((range) => {
                      const isQualified = customerVisitCount >= range.visits;
                      return (
                        <div
                          key={range.visits}
                          className={`p-3 rounded-md flex justify-between items-center ${
                            isQualified
                              ? "bg-primary/10 border border-primary/20"
                              : "bg-muted/20 border border-muted"
                          }`}
                        >
                          <div>
                            <div className="font-medium text-sm">
                              {range.label}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {range.visits} visits required
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">Rs {range.price}</div>
                            {isQualified && (
                              <Badge variant="secondary" className="text-xs">
                                Qualified
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

          {/* Only show bill upload for non-visit-based discounts */}
          {!(
            selectedDiscount.type === "loyalty" &&
            selectedDiscount.loyaltyType === "fixed-reviews"
          ) &&
            !(
              selectedDiscount.type === "loyalty" &&
              selectedDiscount.loyaltyType === "referral"
            ) && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">Bill Image</h4>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  {billImage ? (
                    <div className="relative">
                      <img
                        src={billImage || "/placeholder.svg"}
                        alt="Bill"
                        className="max-h-48 mx-auto rounded-md"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setBillImage("")}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="py-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload or paste a screenshot of the bill
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document.getElementById("billUpload")?.click()
                        }
                      >
                        Upload Image
                      </Button>
                      <input
                        id="billUpload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          const reader = new FileReader();
                          reader.onload = () => {
                            setBillImage(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Bank Card Selection for Bank Discounts */}
          {selectedDiscount.type === "bankDiscount" &&
            selectedDiscount.bankCards && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">Select Bank Card</h4>
                <div className="space-y-2">
                  {selectedDiscount.bankCards.map((card) => (
                    <div
                      key={card.bankId}
                      className={`p-3 rounded-md border cursor-pointer ${
                        selectedBankCard === card.bankId
                          ? "bg-primary/10 border-primary"
                          : "bg-background hover:bg-muted/10"
                      }`}
                      onClick={() => setSelectedBankCard(card.bankId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{card.bankName}</div>
                        {selectedBankCard === card.bankId && (
                          <Badge variant="secondary" className="ml-2">
                            Selected
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {card.cardTypes
                          ? card.cardTypes.join(", ")
                          : "All cards"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Calculation Section for percentage-based discounts */}
          {(selectedDiscount.type === "percentageDeal" ||
            (selectedDiscount.type === "bankDiscount" && selectedBankCard) ||
            (selectedDiscount.type === "loyalty" &&
              selectedDiscount.loyaltyType === "percentage")) && (
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium">Discount Calculator</h4>
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="orderAmount"
                    className="text-sm font-medium block mb-1"
                  >
                    Order Amount (Rs)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="orderAmount"
                      type="number"
                      placeholder="Enter order amount"
                      value={orderAmount}
                      onChange={(e) => setOrderAmount(e.target.value)}
                      className="w-full"
                    />
                    <Button
                      variant="outline"
                      onClick={calculateDiscount}
                      size="sm"
                    >
                      Calculate
                    </Button>
                  </div>
                </div>

                {calculatedDiscount && (
                  <div className="bg-muted/20 p-3 rounded-md space-y-2 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Original Amount:</span>
                      <span className="font-medium">
                        Rs {calculatedDiscount.originalAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Discount Amount:</span>
                      <span className="font-medium text-green-600">
                        Rs {calculatedDiscount.discountAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Final Amount:</span>
                      <span className="font-medium">
                        Rs {calculatedDiscount.finalAmount.toFixed(2)}
                      </span>
                    </div>
                    {calculatedDiscount.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {calculatedDiscount.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Prompt to select a card if bank discount is selected but no card is chosen */}
          {selectedDiscount.type === "bankDiscount" && !selectedBankCard && (
            <div className="mt-4 p-4 border border-dashed rounded-lg bg-muted/10 text-center">
              <p className="text-muted-foreground">
                Please select a payment card above to calculate the discount
              </p>
            </div>
          )}

          {/* Fixed Price Deal Options */}
          {selectedDiscount.type === "fixedPriceDeal" &&
            selectedDiscount.prices &&
            selectedDiscount.prices.length > 0 && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">Select Deal Option</h4>
                <div className="space-y-2">
                  {selectedDiscount.prices.map((price) => (
                    <div
                      key={price.id}
                      className={`p-3 rounded-md border cursor-pointer ${
                        selectedDealOption === price.id
                          ? "bg-primary/10 border-primary"
                          : "bg-background hover:bg-muted/10"
                      }`}
                      onClick={() => setSelectedDealOption(price.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{price.label}</div>
                        {selectedDealOption === price.id && (
                          <Badge variant="secondary" className="ml-2">
                            Selected
                          </Badge>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-muted-foreground">
                          Fixed price:
                        </span>
                        <span className="font-medium">Rs {price.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Loyalty Tiers for Fixed Loyalty Discounts */}
          {selectedDiscount.type === "loyalty" &&
            selectedDiscount.loyaltyType === "fixed" &&
            selectedDiscount.fixedRanges &&
            selectedDiscount.fixedRanges.length > 0 && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">Loyalty Tiers</h4>
                <div className="space-y-2">
                  {selectedDiscount.fixedRanges.map((range) => (
                    <div
                      key={`${range.minDays}-${range.maxDays}`}
                      className="p-3 rounded-md bg-muted/20 border"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{range.label}</div>
                        <div className="font-medium">Rs {range.price}</div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {range.minDays} - {range.maxDays} days of loyalty
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Add the footer component */}
        <DiscountDrawerFooter
          drawerPage={drawerPage}
          onBackToList={onBackToList}
          onApplyDiscount={handleApplyDiscount}
          selectedDiscount={selectedDiscount}
          isApplyDisabled={isApplyDisabled()}
          isLoading={isLoading}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Select a discount to view details
        </p>
      </div>
    </div>
  );
}
