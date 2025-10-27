"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Discount } from "@/types/discounts";
import { PhoneInputForm } from "./phone-input-form";
import { AvailableDiscountsList } from "./available-discounts-list";

// Mock data - in a real app, this would come from an API
const mockDiscounts: Discount[] = [
  {
    id: "loyalty-1",
    type: "loyalty",
    loyaltyType: "referral",
    name: "Referral Reward",
    status: "active",
    referralPercentage: 10,
    referrerPercentage: 5,
    referralMaximumAmount: 500,
    isAlwaysActive: true,
    applyToAllBranches: true,
    branches: [],
    createdAt: "2023-10-15T10:30:00Z",
    updatedAt: "2023-11-01T14:20:00Z",
    loyaltyType: "referral",
    referringUser: {
      discountType: "percentage",
      percentage: 15,
      amount: 200,
    },
    referredUser: {
      discountType: "percentage",
      percentage: 10,
      amount: 150,
    },
    referralMaximumAmount: 500,
    image: "/placeholder.svg?height=200&width=300",
  },
  // Add more mock discounts as needed
];

export function VerifyDiscount() {
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableDiscounts, setAvailableDiscounts] = useState<Discount[]>([]);
  const [isDiscountDrawerOpen, setIsDiscountDrawerOpen] = useState(false);
  const [drawerPage, setDrawerPage] = useState<"list" | "details">("list");
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(
    null
  );
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
  const [phoneNumber, setPhoneNumber] = useState("03");
  const [phoneNumberError, setPhoneNumberError] = useState<string | null>(null);
  const [billImage, setBillImage] = useState<string>("");
  const [bankCards, setBankCards] = useState<any[]>([]);
  const [selectedBankCard, setSelectedBankCard] = useState<string | null>(null);
  const [showVisitTracker, setShowVisitTracker] = useState(false);
  const [customerVisitCount, setCustomerVisitCount] = useState(0);
  const [qualifiesForVisitDiscount, setQualifiesForVisitDiscount] =
    useState(false);

  const handleVerify = async (phoneNumber: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock logic to fetch available discounts based on phone number
      const available = mockDiscounts.filter(
        (discount) => discount.status === "active"
      );
      setAvailableDiscounts(available);
      setVerifiedPhone(phoneNumber);
    } catch (error) {
      console.error("Error verifying phone number:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Verify Discount</CardTitle>
        <CardDescription>
          Verify a customer's discount eligibility by entering their phone
          number
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="verify" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="verify">Verify Discount</TabsTrigger>
            <TabsTrigger value="history">Verification History</TabsTrigger>
          </TabsList>

          <TabsContent value="verify">
            {!verifiedPhone ? (
              <PhoneInputForm onVerify={handleVerify} isLoading={isLoading} />
            ) : (
              <AvailableDiscountsList
                discounts={availableDiscounts}
                phoneNumber={verifiedPhone}
              />
            )}
          </TabsContent>

          <TabsContent value="history">
            <p className="text-center py-8 text-muted-foreground">
              Verification history will be displayed here
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
