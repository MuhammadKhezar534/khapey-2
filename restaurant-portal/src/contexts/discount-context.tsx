"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type {
  LoyaltyDiscount,
  PercentageDealDiscount,
  FixedPriceDealDiscount,
  BankDiscount,
} from "@/types/discounts";
import { toast } from "@/hooks/use-toast";
import DiscountService from "@/services/discount-service";

// Define a union type for all discount types
type AnyDiscount =
  | LoyaltyDiscount
  | PercentageDealDiscount
  | FixedPriceDealDiscount
  | BankDiscount;

// Define pagination options
interface PaginationOptions {
  page: number;
  limit: number;
}

interface DiscountContextType {
  discounts: AnyDiscount[];
  loading: boolean;
  error: string | null;
  pagination: PaginationOptions;
  setPagination: (options: Partial<PaginationOptions>) => void;
  totalPages: number;
  getFilteredDiscounts: (
    branch?: string,
    status?: "all" | "active" | "inactive"
  ) => AnyDiscount[];
  getPaginatedDiscounts: (
    branch?: string,
    status?: "all" | "active" | "inactive"
  ) => AnyDiscount[];
  createDiscount: (discount: AnyDiscount) => Promise<boolean>;
  updateDiscount: (
    id: string,
    updatedDiscount: AnyDiscount
  ) => Promise<boolean>;
  deleteDiscount: (id: string) => Promise<boolean>;
  applyDiscount: (
    discountId: string,
    applicationData: {
      customerName: string;
      customerPhone: string;
      branch: string;
      orderAmount: number;
      discountAmount: number;
      server?: string;
      bankCard?: string;
    }
  ) => Promise<boolean>;
  hasActiveLoyaltyDiscount: boolean;
  refreshDiscounts: (showToast?: boolean) => Promise<boolean>;
}

const DiscountContext = createContext<DiscountContextType | undefined>(
  undefined
);

/**
 * Provider component for discount-related state and operations
 * Improved with pagination and better type safety
 */
export function DiscountProvider({ children }: { children: ReactNode }) {
  const discountService = DiscountService.getInstance();
  const [discounts, setDiscounts] = useState<AnyDiscount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationOptions>({
    page: 1,
    limit: 10,
  });

  // Load discounts from service
  const loadDiscounts = useCallback(() => {
    try {
      const allDiscounts = discountService.getDiscounts();
      setDiscounts(allDiscounts as AnyDiscount[]);
    } catch (err) {
      setError("Failed to load discounts");
      console.error("Error loading discounts:", err);
    }
  }, [discountService]);

  // Initial load and subscribe to changes
  useEffect(() => {
    loadDiscounts();

    // Subscribe to discount service changes
    const unsubscribe = discountService.subscribe(() => {
      loadDiscounts();
    });

    return () => {
      unsubscribe();
    };
  }, [discountService, loadDiscounts]);

  // Calculate if there's an active loyalty discount
  const hasActiveLoyaltyDiscount = discounts.some(
    (d) => d.type === "loyalty" && d.status === "active"
  );

  // Get filtered discounts based on branch and status
  const getFilteredDiscounts = useCallback(
    (branch?: string, status: "all" | "active" | "inactive" = "all") => {
      let filtered = [...discounts];

      // Filter by branch if specified
      if (branch && branch !== "All branches") {
        filtered = filtered.filter(
          (discount) =>
            ("applyToAllBranches" in discount && discount.applyToAllBranches) ||
            ("branches" in discount && discount.branches.includes(branch))
        );
      }

      // Filter by status if not "all"
      if (status !== "all") {
        filtered = filtered.filter((discount) => discount.status === status);
      }

      return filtered;
    },
    [discounts]
  );

  // Get paginated discounts
  const getPaginatedDiscounts = useCallback(
    (branch?: string, status: "all" | "active" | "inactive" = "all") => {
      const filtered = getFilteredDiscounts(branch, status);
      const { page, limit } = pagination;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      return filtered.slice(startIndex, endIndex);
    },
    [getFilteredDiscounts, pagination]
  );

  // Calculate total pages
  const totalPages = Math.ceil(discounts.length / pagination.limit);

  // Create a new discount
  const createDiscount = useCallback(
    async (discount: AnyDiscount) => {
      try {
        setLoading(true);
        setError(null);

        discountService.createDiscount(discount);

        toast({
          title: "Discount created",
          description: "The discount has been created successfully.",
        });
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create discount";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      } finally {
        setLoading(false);
        // Ensure the document is clickable
        setTimeout(() => {
          document.body.style.pointerEvents = "auto";
        }, 100);
      }
    },
    [discountService]
  );

  // Update an existing discount
  const updateDiscount = useCallback(
    async (id: string, updatedDiscount: AnyDiscount) => {
      try {
        setLoading(true);
        setError(null);

        const result = discountService.updateDiscount(id, updatedDiscount);

        if (!result) {
          throw new Error("Failed to update discount");
        }

        toast({
          title: "Discount updated",
          description: "The discount has been updated successfully.",
        });
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update discount";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      } finally {
        setLoading(false);
        // Ensure the document is clickable
        setTimeout(() => {
          document.body.style.pointerEvents = "auto";
        }, 100);
      }
    },
    [discountService]
  );

  // Delete a discount
  const deleteDiscount = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);

        const success = discountService.deleteDiscount(id);

        if (!success) {
          throw new Error("Failed to delete discount");
        }

        toast({
          title: "Discount deleted",
          description: "The discount has been deleted successfully.",
        });
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete discount";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      } finally {
        setLoading(false);
        // Ensure the document is clickable
        setTimeout(() => {
          document.body.style.pointerEvents = "auto";
        }, 100);
      }
    },
    [discountService]
  );

  // Apply a discount (record a new application)
  const applyDiscount = useCallback(
    async (
      discountId: string,
      applicationData: {
        customerName: string;
        customerPhone: string;
        branch: string;
        orderAmount: number;
        discountAmount: number;
        server?: string;
        bankCard?: string;
      }
    ) => {
      try {
        setLoading(true);
        setError(null);

        const result = discountService.applyDiscount(
          discountId,
          applicationData
        );

        if (!result) {
          throw new Error("Failed to apply discount");
        }

        toast({
          title: "Discount applied",
          description: "The discount has been applied successfully.",
        });
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to apply discount";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [discountService]
  );

  // Refresh discounts - updated to accept a showToast parameter
  const refreshDiscounts = useCallback(
    async (showToast = false) => {
      try {
        setLoading(true);
        setError(null);

        // Reload discounts from service
        loadDiscounts();

        // Only show toast if explicitly requested
        if (showToast) {
          toast({
            title: "Discounts refreshed",
            description: "Your discounts data has been updated.",
          });
        }

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to refresh discounts";
        setError(errorMessage);

        // Only show error toast if explicitly requested
        if (showToast) {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }

        return false;
      } finally {
        setLoading(false);
      }
    },
    [loadDiscounts]
  );

  return (
    <DiscountContext.Provider
      value={{
        discounts,
        loading,
        error,
        pagination,
        setPagination,
        totalPages,
        getFilteredDiscounts,
        getPaginatedDiscounts,
        createDiscount,
        updateDiscount,
        deleteDiscount,
        applyDiscount,
        hasActiveLoyaltyDiscount,
        refreshDiscounts,
      }}
    >
      {children}
    </DiscountContext.Provider>
  );
}

/**
 * Custom hook to access the discount context
 */
export function useDiscounts() {
  const context = useContext(DiscountContext);
  if (context === undefined) {
    throw new Error("useDiscounts must be used within a DiscountProvider");
  }
  return context;
}
