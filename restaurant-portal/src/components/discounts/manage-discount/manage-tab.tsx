"use client";

import { useState, useMemo, useEffect, useReducer } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useBranch } from "@/contexts/branch-context";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Discount } from "@/types/discounts";
import { DiscountStats } from "./discount-stats";
import { FilterBar } from "./filter-bar";
import { CreateDiscountDrawer } from "@/components/discounts/create-discount-drawer-lazy";
import { EditDiscountDrawer } from "@/components/discounts/edit-discount-drawer-lazy";
import { useDiscounts } from "@/contexts/discount-context";
import { filterReducer, initialFilterState } from "./filter-state";
import { ActiveFilters } from "./active-filters";
import { MobileFilterSheet } from "./mobile-filter-sheet";
import { DiscountGrid } from "./discount-grid";
import { getFilteredDiscounts, sortDiscounts } from "./discount-utils";
// Add the useFeatureFlags hook import
import { useFeatureFlags } from "@/hooks/use-feature-flags";

interface ManageTabProps {
  discounts: Discount[];
}

// Inside the ManageTab component, add the hook
export function ManageTab({ discounts }: ManageTabProps) {
  const {
    createDiscount,
    updateDiscount,
    deleteDiscount,
    hasActiveLoyaltyDiscount,
  } = useDiscounts();
  const { hasPermission } = useFeatureFlags();

  const [filterState, dispatch] = useReducer(filterReducer, initialFilterState);
  const [manageMode, setManageMode] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [createDiscountOpen, setCreateDiscountOpen] = useState(false);
  const [isEditDiscountOpen, setIsEditDiscountOpen] = useState(false);
  const [discountToEdit, setDiscountToEdit] = useState<Discount | null>(null);

  const { selectedBranch } = useBranch();
  const isMobile = useIsMobile();

  // Add this effect to reset scroll position on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Function to handle creating a new loyalty discount
  const handleCreateLoyaltyDiscount = async (newDiscount: Discount) => {
    const success = await createDiscount(newDiscount);

    if (success) {
      // Make sure to close drawer and reset state
      setCreateDiscountOpen(false);

      // Add a small delay to ensure all overlays and states are cleared
      setTimeout(() => {
        document.body.style.pointerEvents = "auto";
      }, 100);
    }
  };

  const handleCreatePercentageDeal = async (discount: Discount) => {
    const success = await createDiscount(discount);

    if (success) {
      setCreateDiscountOpen(false);

      // Add a small delay to ensure all overlays and states are cleared
      setTimeout(() => {
        document.body.style.pointerEvents = "auto";
      }, 100);
    }
  };

  // Add the handleCreateFixedPriceDeal function
  const handleCreateFixedPriceDeal = async (discount: Discount) => {
    const success = await createDiscount(discount);

    if (success) {
      setCreateDiscountOpen(false);

      // Add a small delay to ensure all overlays and states are cleared
      setTimeout(() => {
        document.body.style.pointerEvents = "auto";
      }, 100);
    }
  };

  const handleCreateBankDiscount = async (discount: Discount) => {
    const success = await createDiscount(discount);

    if (success) {
      setCreateDiscountOpen(false);

      // Add a small delay to ensure all overlays and states are cleared
      setTimeout(() => {
        document.body.style.pointerEvents = "auto";
      }, 100);
    }
  };

  // Function to handle updating an existing discount
  const handleUpdateDiscount = async (updatedDiscount: Discount) => {
    await updateDiscount(updatedDiscount.id, updatedDiscount);
  };

  // Function to toggle discount active status
  const toggleDiscountStatus = async (discountId: string) => {
    const discount = discounts.find((d) => d.id === discountId);
    if (!discount) return;

    const updatedDiscount = {
      ...discount,
      status: discount.status === "active" ? "inactive" : "active",
    };

    await updateDiscount(discountId, updatedDiscount);
  };

  const toggleManageMode = () => {
    setManageMode((prev) => !prev);
  };

  const filteredDiscounts = getFilteredDiscounts(
    discounts,
    filterState,
    selectedBranch?.branchName,
    sortDiscounts
  );
  const hasDiscounts = filteredDiscounts.length > 0;

  // Stats for the dashboard
  const stats = useMemo(() => {
    const total = filteredDiscounts.length;
    const active = filteredDiscounts.filter(
      (d) => d.status === "active"
    ).length;
    const upcoming = filteredDiscounts.filter(
      (d) => d.status === "upcoming"
    ).length;
    const expired = filteredDiscounts.filter(
      (d) => d.status === "expired"
    ).length;
    const inactive = filteredDiscounts.filter(
      (d) => d.status === "inactive"
    ).length;
    const loyalty = filteredDiscounts.filter(
      (d) => d.type === "loyalty"
    ).length;
    const percentage = filteredDiscounts.filter(
      (d) => d.type === "percentageDeal"
    ).length;
    const bank = filteredDiscounts.filter(
      (d) => d.type === "bankDiscount"
    ).length;
    const fixed = filteredDiscounts.filter(
      (d) => d.type === "fixedPriceDeal"
    ).length;

    return {
      total,
      active,
      upcoming,
      expired,
      inactive,
      loyalty,
      percentage,
      bank,
      fixed,
    };
  }, [filteredDiscounts]);

  const handleDeleteDiscount = async (id: string) => {
    await deleteDiscount(id);
  };

  const handleEditDiscount = (discount: Discount) => {
    setDiscountToEdit(discount);
    setIsEditDiscountOpen(true);
  };

  // Check if any filters are applied
  const hasFilters =
    filterState.typeFilter !== "all" ||
    filterState.statusFilter !== "all" ||
    filterState.searchQuery.trim() !== "" ||
    filterState.selectedFilters.appOnly ||
    filterState.selectedFilters.allBranches ||
    filterState.selectedFilters.alwaysActive;

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      {hasDiscounts && <DiscountStats stats={stats} />}

      {/* Search and Filter Bar */}
      <FilterBar
        searchQuery={filterState.searchQuery}
        setSearchQuery={(value) =>
          dispatch({ type: "SET_SEARCH_QUERY", payload: value })
        }
        typeFilter={filterState.typeFilter}
        setTypeFilter={(value) =>
          dispatch({ type: "SET_TYPE_FILTER", payload: value })
        }
        statusFilter={filterState.statusFilter}
        setStatusFilter={(value) =>
          dispatch({ type: "SET_STATUS_FILTER", payload: value })
        }
        selectedFilters={filterState.selectedFilters}
        setSelectedFilters={(value) =>
          dispatch({ type: "SET_SELECTED_FILTERS", payload: value })
        }
        sortOrder={filterState.sortOrder}
        setSortOrder={(value) =>
          dispatch({ type: "SET_SORT_ORDER", payload: value })
        }
        viewMode={filterState.viewMode}
        setViewMode={(value) =>
          dispatch({ type: "SET_VIEW_MODE", payload: value })
        }
        hasFilters={hasFilters}
        isMobile={isMobile}
        setIsFilterSheetOpen={setIsFilterSheetOpen}
      />

      {/* Active Filters Display */}
      <ActiveFilters
        filterState={filterState}
        dispatch={dispatch}
        hasFilters={hasFilters}
      />

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-2 mt-4">
        {hasPermission("discounts", "create") && (
          <Button
            onClick={() => {
              setCreateDiscountOpen(true);
            }}
            className="flex items-center gap-1.5"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            <span>Create Discount</span>
          </Button>
        )}
      </div>

      {/* Display all discounts */}
      <div className="pt-4">
        <DiscountGrid
          filteredDiscounts={filteredDiscounts}
          handleEditDiscount={handleEditDiscount}
          handleDeleteDiscount={handleDeleteDiscount}
          toggleDiscountStatus={toggleDiscountStatus}
          manageMode={manageMode}
          isMobile={isMobile}
          filterState={filterState}
          hasFilters={hasFilters}
          onAddDiscount={() => setCreateDiscountOpen(true)}
          dispatch={dispatch}
          permissions={{
            edit: hasPermission("discounts", "edit"),
            toggleStatus: hasPermission("discounts", "toggleStatus"),
            delete: hasPermission("discounts", "delete"),
          }}
        />
      </div>

      {/* Mobile Filter Sheet */}
      <MobileFilterSheet
        isFilterSheetOpen={isFilterSheetOpen}
        setIsFilterSheetOpen={setIsFilterSheetOpen}
        filterState={filterState}
        dispatch={dispatch}
        hasFilters={hasFilters}
      />

      {/* Create Discount Drawer - Only for creating new discounts */}
      <CreateDiscountDrawer
        open={createDiscountOpen}
        onOpenChange={setCreateDiscountOpen}
        hasLoyaltyDiscount={hasActiveLoyaltyDiscount}
        onCreateLoyaltyDiscount={handleCreateLoyaltyDiscount}
        onCreatePercentageDeal={handleCreatePercentageDeal}
        onCreateFixedPriceDeal={handleCreateFixedPriceDeal}
        onCreateBankDiscount={handleCreateBankDiscount}
      />

      {/* Edit Discount Drawer - Only for editing existing discounts */}
      <EditDiscountDrawer
        open={isEditDiscountOpen}
        onOpenChange={setIsEditDiscountOpen}
        onUpdateDiscount={handleUpdateDiscount}
        discountToEdit={discountToEdit}
        onBackToList={() => {
          setIsEditDiscountOpen(false);
          setDiscountToEdit(null);
        }}
      />
    </div>
  );
}
