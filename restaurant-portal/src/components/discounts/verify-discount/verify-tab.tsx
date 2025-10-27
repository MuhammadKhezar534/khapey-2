"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { DiscountDrawerContent } from "../discount-drawer/discount-drawer-content";
import { CustomerVisitTracker } from "@/components/customer/customer-visit-tracker";
import { useToast } from "@/hooks/use-toast";
import type { Discount } from "@/types/discounts";
import { useDiscounts } from "@/contexts/discount-context";

interface VerifyTabProps {
  selectedBranch: string | null;
}

export function VerifyTab({ selectedBranch }: VerifyTabProps) {
  const { discounts, applyDiscount } = useDiscounts();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("03");
  const [isVerifying, setIsVerifying] = useState(false);
  const [phoneNumberError, setPhoneNumberError] = useState<string | null>(null);
  const [isDiscountDrawerOpen, setIsDiscountDrawerOpen] = useState(false);
  const [drawerPage, setDrawerPage] = useState<"list" | "details">("list");
  const [availableDiscounts, setAvailableDiscounts] = useState<Discount[]>([]);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(
    null
  );
  const [showVisitTracker, setShowVisitTracker] = useState(false);
  const [customerVisitCount, setCustomerVisitCount] = useState(0);
  const [qualifiesForVisitDiscount, setQualifiesForVisitDiscount] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [selectedBranchForDiscount, setSelectedBranchForDiscount] = useState<
    string | null
  >(null);

  // Function to check if customer qualifies for visit-based discounts
  const checkVisitBasedDiscounts = (visitCount: number) => {
    // Find loyalty discounts with visit-based rewards
    const visitBasedDiscounts = discounts.filter(
      (d) =>
        d.type === "loyalty" &&
        d.loyaltyType === "fixed-reviews" &&
        d.status === "active" &&
        d.visitRanges
    );

    if (visitBasedDiscounts.length === 0) return false;

    // Check if the customer's visit count qualifies for any tier
    for (const discount of visitBasedDiscounts) {
      if (discount.visitRanges) {
        for (const range of discount.visitRanges) {
          if (visitCount >= range.visits) {
            return true;
          }
        }
      }
    }

    return false;
  };

  const handleVerifyPhoneNumber = () => {
    // Reset error state
    setPhoneNumberError(null);

    // Validate phone number format
    if (!phoneNumber.trim()) {
      setPhoneNumberError("Please enter a phone number");
      return;
    }

    if (phoneNumber.length !== 11) {
      setPhoneNumberError("Phone number must be 11 digits");
      return;
    }

    if (!phoneNumber.startsWith("03")) {
      setPhoneNumberError("Phone number must start with 03");
      return;
    }

    setIsVerifying(true);

    // Simulate verification process
    setTimeout(() => {
      // Check if the phone number is valid for Khapey users only discounts
      const isKhapeyUser = phoneNumber === "03211234567";

      // Simulate customer visit count (in a real app, this would come from your backend)
      // For demo purposes, we'll use the last digit of the phone number as the visit count
      const mockVisitCount = Number.parseInt(phoneNumber.slice(-1)) || 0;
      setCustomerVisitCount(mockVisitCount);

      // Generate a customer name based on the phone number
      // In a real app, this would come from your customer database
      const names = [
        "Ali",
        "Fatima",
        "Hassan",
        "Ayesha",
        "Usman",
        "Sana",
        "Bilal",
        "Zara",
        "Omar",
        "Hira",
      ];
      const surnames = [
        "Ahmed",
        "Khan",
        "Malik",
        "Siddiqui",
        "Qureshi",
        "Javed",
        "Mahmood",
        "Iqbal",
        "Farooq",
        "Shahid",
      ];
      const nameIndex =
        Number.parseInt(phoneNumber.slice(-2, -1)) % names.length;
      const surnameIndex =
        Number.parseInt(phoneNumber.slice(-1)) % surnames.length;
      const generatedName = `${names[nameIndex]} ${surnames[surnameIndex]}`;
      setCustomerName(generatedName);

      // Check if the customer qualifies for visit-based discounts
      const qualifiesForVisit = checkVisitBasedDiscounts(mockVisitCount);
      setQualifiesForVisitDiscount(qualifiesForVisit);

      // Get active discounts that are applicable
      const validDiscounts = discounts.filter((discount) => {
        // Check if discount is active
        if (discount.status !== "active") return false;

        // For date-restricted discounts, check if current date is within range
        if (
          !discount.isAlwaysActive &&
          discount.startDate &&
          discount.endDate
        ) {
          const now = new Date();
          const startDate = new Date(discount.startDate);
          const endDate = new Date(discount.endDate);
          endDate.setHours(23, 59, 59, 999); // Set to end of day

          if (now < startDate || now > endDate) return false;
        }

        // Check if discount is for Khapey users only and if the user is a Khapey user
        if (
          "forKhapeyUsersOnly" in discount &&
          discount.forKhapeyUsersOnly &&
          !isKhapeyUser
        ) {
          return false;
        }

        // Check if discount applies to the selected branch
        if (
          selectedBranch &&
          !discount.applyToAllBranches &&
          !discount.branches.includes(selectedBranch)
        ) {
          return false;
        }

        // Check day of week restrictions
        if (
          "isAllWeek" in discount &&
          !discount.isAllWeek &&
          discount.daysOfWeek
        ) {
          const today = new Date().toLocaleDateString("en-US", {
            weekday: "long",
          });
          if (
            !discount.daysOfWeek.some(
              (day) => day.toLowerCase() === today.toLowerCase()
            )
          ) {
            return false;
          }
        }

        // Check time restrictions
        if (
          "isAllDay" in discount &&
          !discount.isAllDay &&
          discount.startTime &&
          discount.endTime
        ) {
          const now = new Date();
          const currentHour = now.getHours();
          const currentMinute = now.getMinutes();
          const currentTime = `${currentHour
            .toString()
            .padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;

          if (
            currentTime < discount.startTime ||
            currentTime > discount.endTime
          ) {
            return false;
          }
        }

        return true;
      });

      console.log("Available discounts:", validDiscounts.length);
      setAvailableDiscounts(validDiscounts);

      setIsVerifying(false);

      if (validDiscounts.length > 0) {
        setDrawerPage("list");
        setIsDiscountDrawerOpen(true);
      } else if (qualifiesForVisit) {
        // If no other discounts but qualifies for visit-based discount
        setDrawerPage("list");
        setIsDiscountDrawerOpen(true);
      } else {
        // If no discounts available, show visit tracker
        setShowVisitTracker(true);
      }
    }, 1000);
  };

  // Function to send OTP when discount details are opened
  const sendOtp = () => {
    // Simulate sending OTP
    toast({
      title: "OTP Sent",
      description: `A verification code has been sent to ${phoneNumber}`,
      variant: "default",
    });

    setIsOtpSent(true);
    // For demo purposes, we'll use "1234" as the OTP
  };

  // Function to verify OTP
  const verifyOtp = () => {
    setOtpError(null);
    setIsVerifyingOtp(true);

    // Simulate OTP verification (in a real app, you would check with your backend)
    setTimeout(() => {
      if (otp === "1234") {
        setIsOtpVerified(true);
        setOtpError(null);
      } else {
        setOtpError("Invalid OTP. Please try again.");
        setIsOtpVerified(false);
      }
      setIsVerifyingOtp(false);
    }, 1000);
  };

  // Helper function to get discount status
  const getDiscountStatus = (discount: Discount) => {
    if (discount.status === "inactive") return "inactive";

    const now = new Date();

    // Check if the discount has date restrictions
    if (!discount.isAlwaysActive && discount.startDate && discount.endDate) {
      const startDate = new Date(discount.startDate);
      const endDate = new Date(discount.endDate);
      endDate.setHours(23, 59, 59, 999); // Set to end of day

      if (now < startDate) return "upcoming";
      if (now > endDate) return "expired";
    }

    return "active";
  };

  // Function to handle discount selection
  const handleSelectDiscount = (discount: Discount) => {
    setSelectedDiscount(discount);

    // Set default branch if there's only one branch
    if (
      !discount.applyToAllBranches &&
      discount.branches &&
      discount.branches.length === 1
    ) {
      setSelectedBranchForDiscount(discount.branches[0]);
    } else if (selectedBranch) {
      // If discount applies to all branches or multiple branches, use the currently selected branch if valid
      if (
        discount.applyToAllBranches ||
        (discount.branches && discount.branches.includes(selectedBranch))
      ) {
        setSelectedBranchForDiscount(selectedBranch);
      } else {
        setSelectedBranchForDiscount(null);
      }
    } else {
      setSelectedBranchForDiscount(null);
    }

    setDrawerPage("details");
    // Send OTP when discount details are opened
    sendOtp();
  };

  // Function to close the drawer and reset states
  const handleCloseDrawer = () => {
    setIsDiscountDrawerOpen(false);
    setDrawerPage("list");
    setSelectedDiscount(null);
    setSelectedBranchForDiscount(null);
  };

  // Function to go back to list view
  const handleBackToList = () => {
    setDrawerPage("list");
    setSelectedDiscount(null);
  };

  // Function to handle applying a discount
  const handleApplyDiscount = async () => {
    if (!selectedDiscount) return;
    if (!isOtpVerified) {
      toast({
        title: "OTP Verification Required",
        description:
          "Please verify the OTP sent to your phone before applying a discount.",
        variant: "destructive",
      });
      return;
    }
    if (!customerName.trim()) {
      toast({
        title: "Customer Name Required",
        description:
          "Please enter the customer's name before applying a discount.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedBranchForDiscount) {
      toast({
        title: "Branch Selection Required",
        description:
          "Please select a branch where this discount is being applied.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Calculate discount amount based on discount type
      const orderAmount = 1000 + Math.floor(Math.random() * 4000); // Random order amount between 1000-5000
      let discountAmount = 0;

      if (selectedDiscount.type === "percentageDeal") {
        discountAmount = Math.floor(
          orderAmount * (selectedDiscount.percentage / 100)
        );
        if (selectedDiscount.maxAmount) {
          discountAmount = Math.min(discountAmount, selectedDiscount.maxAmount);
        }
      } else if (selectedDiscount.type === "fixedPriceDeal") {
        // For fixed price deals, we'll use a random discount amount
        discountAmount = 300 + Math.floor(Math.random() * 700);
      } else if (selectedDiscount.type === "bankDiscount") {
        discountAmount = Math.floor(
          orderAmount * (selectedDiscount.discountPercentage / 100)
        );
        if (selectedDiscount.maxAmount) {
          discountAmount = Math.min(discountAmount, selectedDiscount.maxAmount);
        }
      } else if (selectedDiscount.type === "loyalty") {
        if (selectedDiscount.loyaltyType === "percentage") {
          // Find the applicable percentage based on customer loyalty
          const percentageRange = selectedDiscount.percentageRanges?.find(
            (range) =>
              customerVisitCount >= range.minDays &&
              customerVisitCount <= range.maxDays
          );

          if (percentageRange) {
            discountAmount = Math.floor(
              orderAmount * (percentageRange.percentage / 100)
            );
            if (selectedDiscount.maximumAmount) {
              discountAmount = Math.min(
                discountAmount,
                selectedDiscount.maximumAmount
              );
            }
          } else {
            discountAmount = Math.floor(orderAmount * 0.05); // Default 5% if no range matches
          }
        } else if (selectedDiscount.loyaltyType === "fixed") {
          // Find the applicable fixed discount based on customer loyalty
          const fixedRange = selectedDiscount.fixedRanges?.find(
            (range) =>
              customerVisitCount >= range.minDays &&
              customerVisitCount <= range.maxDays
          );

          if (fixedRange) {
            discountAmount = fixedRange.price;
          } else {
            discountAmount = 200; // Default fixed discount
          }
        } else if (selectedDiscount.loyaltyType === "fixed-reviews") {
          // Find the applicable visit-based reward
          const visitRange = selectedDiscount.visitRanges?.find(
            (range) => customerVisitCount >= range.visits
          );

          if (visitRange) {
            discountAmount = visitRange.price;
          } else {
            discountAmount = 200; // Default fixed discount
          }
        } else if (selectedDiscount.loyaltyType === "referral") {
          // For referrals, use the referred user discount
          if (selectedDiscount.referredUser?.discountType === "percentage") {
            discountAmount = Math.floor(
              orderAmount *
                ((selectedDiscount.referredUser.percentage || 10) / 100)
            );
          } else {
            discountAmount = selectedDiscount.referredUser?.amount || 200;
          }

          if (selectedDiscount.referralMaximumAmount) {
            discountAmount = Math.min(
              discountAmount,
              selectedDiscount.referralMaximumAmount
            );
          }
        }
      }

      // Apply the discount using the context function
      const success = await applyDiscount(selectedDiscount.id, {
        customerName: customerName,
        customerPhone: phoneNumber,
        branch: selectedBranchForDiscount,
        orderAmount,
        discountAmount,
        server: "Staff Member",
        bankCard:
          selectedDiscount.type === "bankDiscount"
            ? selectedDiscount.bankCards?.[0]?.bankName + " Card"
            : undefined,
      });

      if (success) {
        // Show success toast only at the final step
        toast({
          title: "Discount Applied Successfully",
          description: `${
            selectedDiscount.name || selectedDiscount.title
          } discount of Rs ${discountAmount} has been applied for ${customerName}.`,
          variant: "default",
        });

        // Close the drawer after applying
        handleCloseDrawer();
      }
    } catch (error) {
      console.error("Error applying discount:", error);
      toast({
        title: "Error",
        description: "Failed to apply discount. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-6">
            <div className="rounded-full bg-primary/10 p-3">
              <Phone className="h-8 w-8 text-primary" />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">
                Verify Customer Discounts
              </h2>
              <p className="text-sm text-muted-foreground">
                Enter a customer's phone number to check available discounts
              </p>
            </div>

            <div className="w-full space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Input
                    type="tel"
                    placeholder="03XXXXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => {
                      // Only allow numbers and limit to 11 digits for Pakistan numbers
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 11) {
                        setPhoneNumber(value);
                        // Clear error when user types
                        if (phoneNumberError) setPhoneNumberError(null);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleVerifyPhoneNumber();
                      }
                    }}
                    className={cn(
                      "pl-10",
                      phoneNumberError && "border-destructive"
                    )}
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                  </div>
                </div>
                <Button
                  onClick={handleVerifyPhoneNumber}
                  disabled={isVerifying}
                >
                  {isVerifying ? "Verifying..." : "Verify"}
                </Button>
              </div>

              {phoneNumberError && (
                <div className="text-sm text-destructive">
                  {phoneNumberError}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Discount Drawer */}
      <Sheet open={isDiscountDrawerOpen} onOpenChange={handleCloseDrawer}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md p-0 flex flex-col h-full"
        >
          {/* Fixed Header */}
          <div className="border-b p-4 bg-white">
            {drawerPage === "list" ? (
              <>
                <SheetTitle className="text-xl font-semibold">
                  Available Discounts
                </SheetTitle>
                <SheetDescription className="mt-1">
                  {phoneNumber === "03211234567" ? (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>Khapey App User</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{phoneNumber}</span>
                    </div>
                  )}
                </SheetDescription>
              </>
            ) : (
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 mr-2"
                  onClick={handleBackToList}
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <div>
                  <SheetTitle className="text-xl font-semibold">
                    Discount Details
                  </SheetTitle>
                  <SheetDescription className="mt-0.5">
                    Verify and apply customer discount
                  </SheetDescription>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Content */}
          <DiscountDrawerContent
            drawerPage={drawerPage}
            availableDiscounts={availableDiscounts}
            selectedDiscount={selectedDiscount}
            onSelectDiscount={handleSelectDiscount}
            customerVisitCount={customerVisitCount}
            qualifiesForVisitDiscount={qualifiesForVisitDiscount}
            phoneNumber={phoneNumber}
            onBackToList={handleBackToList}
            onApplyDiscount={handleApplyDiscount}
            isLoading={isLoading}
            otp={otp}
            setOtp={setOtp}
            isOtpVerified={isOtpVerified}
            verifyOtp={verifyOtp}
            otpError={otpError}
            isVerifyingOtp={isVerifyingOtp}
            isOtpSent={isOtpSent}
            customerName={customerName}
            setCustomerName={setCustomerName}
            selectedBranch={selectedBranchForDiscount}
            setSelectedBranchForDiscount={setSelectedBranchForDiscount}
          />
        </SheetContent>
      </Sheet>

      {/* Visit Tracker Sheet */}
      <Sheet open={showVisitTracker} onOpenChange={setShowVisitTracker}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md p-0 flex flex-col h-full"
        >
          {/* Fixed Header */}
          <div className="border-b p-4 bg-white">
            <div className="flex items-center">
              <div>
                <SheetTitle className="text-xl font-semibold">
                  Customer Visit
                </SheetTitle>
                <SheetDescription className="mt-0.5">
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{phoneNumber}</span>
                  </div>
                </SheetDescription>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <CustomerVisitTracker
              phoneNumber={phoneNumber}
              onVisitAdded={() => {
                setShowVisitTracker(false);
                toast({
                  title: "Visit Recorded",
                  description:
                    "The customer's visit has been successfully recorded",
                  variant: "default",
                });
              }}
              selectedBranch={selectedBranch}
            />
          </div>

          {/* Fixed Footer */}
          <div className="border-t p-4 bg-white">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowVisitTracker(false)}
            >
              Close
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
