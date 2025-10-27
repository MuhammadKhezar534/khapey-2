"use client";

import { useEffect } from "react";
import type { Discount } from "@/types/discounts";

interface DebugImageProps {
  discount: Discount;
}

export function DebugImage({ discount }: DebugImageProps) {
  useEffect(() => {
    console.log("Discount image data:", {
      directImage: discount.image,
      type: discount.type,
      hasFixedPriceImages:
        discount.type === "fixedPriceDeal" &&
        discount.prices?.some((p) => Boolean(p.image)),
      hasBankCardImages:
        discount.type === "bankDiscount" &&
        discount.bankCards?.some((b) => Boolean(b.image)),
      prices: discount.type === "fixedPriceDeal" ? discount.prices : undefined,
      bankCards:
        discount.type === "bankDiscount" ? discount.bankCards : undefined,
    });
  }, [discount]);

  return null;
}
