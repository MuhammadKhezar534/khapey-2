import DiscountService from "@/services/discount-service";

// Helper functions for discount data
export function getDiscountById(id: string) {
  const discountService = DiscountService.getInstance();
  return discountService.getDiscountById(id);
}

// Function to get discount applications
export function getDiscountApplications(
  discountId: string,
  startDate?: Date,
  endDate?: Date,
  branchFilter?: string
) {
  // Add console logging to debug date filtering
  // console.log("getDiscountApplications called with:", {
  //   discountId,
  //   startDate: startDate ? startDate.toISOString() : "undefined",
  //   endDate: endDate ? endDate.toISOString() : "undefined",
  //   branchFilter,
  // })
  const discountService = DiscountService.getInstance();
  return discountService.getDiscountApplications(discountId, {
    startDate,
    endDate,
    branch: branchFilter,
  });
}
