"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useSorting } from "@/hooks/use-sorting";
import { actualBranches } from "@/contexts/branch-context";
import { DiscountSummaryCard } from "@/components/reporting/discount-summary-card";
import { ApplicationsTable } from "@/components/reporting/applications-table";
import { MobileFilterSheet } from "@/components/reporting/mobile-filter-sheet";
import { ExportPdfSheet } from "@/components/reporting/export-pdf-sheet";
import { ExportDateRangeSheet } from "@/components/reporting/export-date-range-sheet";
import { DirectDateFilter } from "@/components/reporting/direct-date-filter"; // Import our new component
import {
  getDiscountById,
  getDiscountApplications,
} from "@/utils/discount-data";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DiscountReportDetailsPage({
  params,
}: {
  params: { discountId: string };
}) {
  // Basic state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const { discountId } = params;
  const discount = getDiscountById(discountId);

  // UI state
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [isExportDateRangeSheetOpen, setIsExportDateRangeSheetOpen] =
    useState(false);
  const [previewCurrentPage, setPreviewCurrentPage] = useState(1);

  // Filter state
  const [branchFilter, setBranchFilter] = useState<string | "all">("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportStartDate, setExportStartDate] = useState<Date | undefined>(
    undefined
  );
  const [exportEndDate, setExportEndDate] = useState<Date | undefined>(
    undefined
  );
  const [exportBranchFilter, setExportBranchFilter] = useState<string | "all">(
    "all"
  );
  const [exportStartDateInput, setExportStartDateInput] =
    useState("DD/MM/YYYY");
  const [exportEndDateInput, setExportEndDateInput] = useState("DD/MM/YYYY");
  const [exportStartDateError, setExportStartDateError] = useState<
    string | null
  >(null);
  const [exportEndDateError, setExportEndDateError] = useState<string | null>(
    null
  );

  // Use the sorting hook
  const { sortColumn, sortDirection, handleSort, sortData } = useSorting<any>({
    initialSortColumn: "timestamp",
    initialSortDirection: "desc",
  });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset scroll position on load
  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => {
      const tabsHeight = 48;
      const scrollPosition = window.scrollY;
      if (scrollPosition < tabsHeight) {
        window.scrollTo(0, 0);
      }
    }, 100);
  }, []);

  // Fetch applications whenever branch filter changes
  useEffect(() => {
    fetchApplicationsWithDateRange(startDate, endDate, branchFilter);
  }, [branchFilter, discountId]);

  // Function to fetch applications with date range
  const fetchApplicationsWithDateRange = async (
    startDate?: Date,
    endDate?: Date,
    branch: string | "all" = "all"
  ) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Get applications with filters
      const fetchedApplications = getDiscountApplications(
        discountId,
        startDate,
        endDate,
        branch === "all" ? undefined : branch
      );
      setApplications(fetchedApplications);

      // Show toast if date range is applied
      if (startDate && endDate) {
        toast({
          title: "Data updated",
          description: `Showing data from ${format(
            startDate,
            "dd/MM/yyyy"
          )} to ${format(endDate, "dd/MM/yyyy")}`,
        });
      }

      // Update state
      setStartDate(startDate);
      setEndDate(endDate);
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

  // This is the direct handler for our date filter
  const handleDateFilterApplied = (newStartDate: Date, newEndDate: Date) => {
    // Directly fetch data with the new dates
    fetchApplicationsWithDateRange(newStartDate, newEndDate, branchFilter);
  };

  // Handle mobile branch selection
  const handleMobileBranchSelect = (branch: string) => {
    setBranchFilter(branch);
    setIsFilterSheetOpen(false);
  };

  // Handle export button click
  const handleExportClick = () => {
    if (discount) {
      // Default to all-time range
      const start = new Date(discount.createdAt);
      const end = new Date();
      setExportStartDate(start);
      setExportEndDate(end);
      setExportStartDateInput(format(start, "dd/MM/yyyy"));
      setExportEndDateInput(format(end, "dd/MM/yyyy"));
    }

    setExportBranchFilter("all");
    setPreviewCurrentPage(1);
    setIsExportDateRangeSheetOpen(true);
  };

  // Apply export date range
  const handleApplyExportDateRange = () => {
    // Validation code omitted for brevity

    // For now, close the sheet and open the preview
    setIsExportDateRangeSheetOpen(false);
    setPreviewCurrentPage(1);
    setIsPdfPreviewOpen(true);
  };

  // Download handler
  const handleDownload = async () => {
    setIsExporting(true);
    try {
      // Simulate PDF generation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "PDF generated",
        description:
          "The PDF report has been successfully generated and downloaded.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error generating PDF",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setIsPdfPreviewOpen(false);
    }
  };

  // Filter applications based on search query
  const filteredApplications = useMemo(() => {
    let result = [...applications];

    if (debouncedSearchQuery) {
      result = result.filter((app) => {
        const searchStr =
          `${app.customerName} ${app.customerPhone} ${app.branch} ${app.orderAmount} ${app.discountAmount} ${app.server}`.toLowerCase();
        return searchStr.includes(debouncedSearchQuery.toLowerCase());
      });
    }

    return sortData(result, sortColumn, sortDirection);
  }, [applications, debouncedSearchQuery, sortColumn, sortDirection, sortData]);

  const branchNames = actualBranches;

  return (
    <div className="space-y-4">
      {/* Discount Summary Card */}
      <DiscountSummaryCard discount={discount} />

      {/* Custom Filter Controls - Simplified version */}
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Search */}
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Branch Filter */}
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branchNames.map((branch) => (
                  <SelectItem key={branch} value={branch}>
                    {branch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Filter - Using our direct component */}
            <DirectDateFilter
              onFilterApplied={handleDateFilterApplied}
              discountCreatedAt={discount?.createdAt}
            />

            {/* Export Button */}
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={handleExportClick}
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>

            {/* Mobile Filter Button */}
            <Button
              variant="outline"
              size="sm"
              className="flex sm:hidden items-center gap-1"
              onClick={() => setIsFilterSheetOpen(true)}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card className="w-full overflow-hidden">
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <ApplicationsTable
              applications={filteredApplications}
              isLoading={isLoading}
              discount={discount}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              handleSort={handleSort}
            />
          </div>
        </CardContent>
      </Card>

      {/* Mobile Filter Sheet */}
      <MobileFilterSheet
        isOpen={isFilterSheetOpen}
        onOpenChange={setIsFilterSheetOpen}
        branchFilter={branchFilter}
        onBranchSelect={handleMobileBranchSelect}
        branchNames={branchNames}
      />

      {/* Export PDF Preview Sheet */}
      <ExportPdfSheet
        isOpen={isPdfPreviewOpen}
        onOpenChange={setIsPdfPreviewOpen}
        exportStartDate={exportStartDate}
        exportEndDate={exportEndDate}
        exportBranchFilter={exportBranchFilter}
        previewCurrentPage={previewCurrentPage}
        setPreviewCurrentPage={setPreviewCurrentPage}
        applications={applications}
        discount={discount}
        isExporting={isExporting}
        handleDownload={handleDownload}
      />

      {/* Export Date Range Sheet */}
      <ExportDateRangeSheet
        isOpen={isExportDateRangeSheetOpen}
        onOpenChange={setIsExportDateRangeSheetOpen}
        exportStartDateInput={exportStartDateInput}
        exportEndDateInput={exportEndDateInput}
        setExportStartDateInput={setExportStartDateInput}
        setExportEndDateInput={setExportEndDateInput}
        exportStartDate={exportStartDate}
        exportEndDate={exportEndDate}
        setExportStartDate={setExportStartDate}
        setExportEndDate={setExportEndDate}
        exportStartDateError={exportStartDateError}
        exportEndDateError={exportEndDateError}
        setExportStartDateError={setExportStartDateError}
        setExportEndDateError={setExportEndDateError}
        exportBranchFilter={exportBranchFilter}
        setExportBranchFilter={setExportBranchFilter}
        handleApplyExportDateRange={handleApplyExportDateRange}
        formatDateInput={(value) => value} // Simplified for now
        discount={discount}
        branchNames={branchNames}
      />
    </div>
  );
}
