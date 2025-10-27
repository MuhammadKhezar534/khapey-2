"use client";

import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import {
  getDiscountById,
  getDiscountApplications,
} from "@/utils/discount-data";
import { format } from "date-fns";

export function useDiscountData(discountId: string) {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDiscountFound, setIsDiscountFound] = useState(false);
  const discount = getDiscountById(discountId);

  // Function to fetch applications with date range
  const fetchApplicationsWithDateRange = async (
    startDate?: Date,
    endDate?: Date,
    branchFilter?: string
  ) => {
    // Show loading state
    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Call our function that simulates an API call
      const fetchedApplications = getDiscountApplications(
        discountId,
        startDate,
        endDate,
        branchFilter === "all" ? undefined : branchFilter
      );
      setApplications(fetchedApplications);

      // Only show toast if we have valid dates
      if (startDate && endDate) {
        toast({
          title: "Data updated",
          description: `Showing data from ${format(
            startDate,
            "dd/MM/yyyy"
          )} to ${format(endDate, "dd/MM/yyyy")}`,
        });
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error fetching data",
        description: "There was an error updating the data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (discountId) {
      const fetchedDiscount = getDiscountById(discountId);
      setIsDiscountFound(!!fetchedDiscount);

      // Initial data fetch without date filters
      fetchApplicationsWithDateRange();
    }
  }, [discountId]);

  return {
    applications,
    setApplications,
    isLoading,
    setIsLoading,
    isDiscountFound,
    discount,
    fetchApplicationsWithDateRange,
  };
}
