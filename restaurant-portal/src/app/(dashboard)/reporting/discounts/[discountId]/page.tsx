"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { format, parse, isValid } from "date-fns";
import { jsPDF } from "jspdf";
import { useSorting } from "@/hooks/use-sorting";
import { actualBranches } from "@/contexts/branch-context";
import { DiscountSummaryCard } from "@/components/reporting/discount-summary-card";
import { ReportFilterControls } from "@/components/reporting/report-filter-controls";
import { ApplicationsTable } from "@/components/reporting/applications-table";
import { DateRangeSheet } from "@/components/reporting/date-range-sheet";
import { MobileFilterSheet } from "@/components/reporting/mobile-filter-sheet";
import { ExportPdfSheet } from "@/components/reporting/export-pdf-sheet";
import { ExportDateRangeSheet } from "@/components/reporting/export-date-range-sheet";
import {
  getDiscountById,
  getDiscountApplications,
} from "@/utils/discount-data";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { PullToRefreshIndicator } from "@/components/ui/pull-to-refresh";

// Add this near the top of the file, after imports
const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    if (timeout) {
      clearTimeout(timeout);
    }

    return new Promise((resolve) => {
      timeout = setTimeout(() => {
        resolve(func(...args));
      }, waitFor);
    });
  };
};

export default function DiscountReportDetailsPage({
  params,
}: {
  params: { discountId: string };
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDateRangeSheetOpen, setIsDateRangeSheetOpen] = useState(false);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [startDateInput, setStartDateInput] = useState("DD/MM/YYYY");
  const [endDateInput, setEndDateInput] = useState("DD/MM/YYYY");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [branchFilter, setBranchFilter] = useState<string | "all">("all");
  const [isExporting, setIsExporting] = useState(false);
  const { discountId } = params;
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isExportDateRangeSheetOpen, setIsExportDateRangeSheetOpen] =
    useState(false);

  const [exportStartDateInput, setExportStartDateInput] =
    useState("DD/MM/YYYY");
  const [exportEndDateInput, setExportEndDateInput] = useState("DD/MM/YYYY");
  const [exportStartDate, setExportStartDate] = useState<Date | undefined>(
    undefined
  );
  const [exportEndDate, setExportEndDate] = useState<Date | undefined>(
    undefined
  );
  const [startDateError, setStartDateError] = useState<string | null>(null);
  const [endDateError, setEndDateError] = useState<string | null>(null);
  const [exportStartDateError, setExportStartDateError] = useState<
    string | null
  >(null);
  const [exportEndDateError, setExportEndDateError] = useState<string | null>(
    null
  );

  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [applications, setApplications] = useState<any[]>([]);
  const [isDiscountFound, setIsDiscountFound] = useState(false);
  const discount = getDiscountById(discountId);
  const [previewCurrentPage, setPreviewCurrentPage] = useState(1);
  const [exportBranchFilter, setExportBranchFilter] = useState<string | "all">(
    "all"
  );

  // Set up pull-to-refresh
  const { pullDistance, isRefreshing } = usePullToRefresh({
    onRefresh: () =>
      fetchApplicationsWithDateRange(startDate, endDate, branchFilter),
  });

  // Add this useEffect
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(debouncedSearchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [debouncedSearchQuery]);

  // Add this effect to reset scroll position on page load
  useEffect(() => {
    window.scrollTo(0, 0);

    // Add a small delay to ensure proper scrolling with fixed header
    setTimeout(() => {
      const tabsHeight = 48; // Height of the tabs
      const scrollPosition = window.scrollY;
      if (scrollPosition < tabsHeight) {
        window.scrollTo(0, 0);
      }
    }, 100);
  }, []);

  // Use the sorting hook
  const { sortColumn, sortDirection, handleSort, sortData } = useSorting<any>({
    initialSortColumn: "timestamp",
    initialSortDirection: "desc",
  });

  // Function to format date input with separators and maintain placeholder
  const formatDateInput = (value: string): string => {
    // Remove any non-digit characters from the input
    const digits = value.replace(/\D/g, "");

    // If no digits, return the placeholder
    if (digits.length === 0) return "DD/MM/YYYY";

    // Format with separators
    if (digits.length <= 2) {
      return digits
        .padEnd(10, " ")
        .replace(/\s/g, "D")
        .replace(/(\d{2})/, "$1")
        .replace(/D/g, " ")
        .trim();
    } else if (digits.length <= 4) {
      return (
        digits.slice(0, 2) +
        "/" +
        digits
          .slice(2)
          .padEnd(7, " ")
          .replace(/\s/g, "D")
          .replace(/(\d{2})/, "$1")
          .replace(/D/g, " ")
          .trim()
      );
    } else {
      return (
        digits.slice(0, 2) +
        "/" +
        digits.slice(2, 4) +
        "/" +
        digits
          .slice(4, 8)
          .padEnd(4, " ")
          .replace(/\s/g, "D")
          .replace(/(\d{4})/, "$1")
          .replace(/D/g, " ")
          .trim()
      );
    }
  };

  // Function to validate if date is within the all-time range
  const isDateWithinAllTimeRange = (
    date: Date,
    isStartDate: boolean
  ): boolean => {
    if (!discount) return true;

    const creationDate = new Date(discount.createdAt);
    const currentDate = new Date();

    if (isStartDate) {
      return date >= creationDate;
    } else {
      return date <= currentDate;
    }
  };

  // Add a function to fetch applications with date range
  const fetchApplicationsWithDateRange = async (
    startDate?: Date,
    endDate?: Date,
    branchFilter?: string
  ) => {
    // Show loading state
    setIsLoading(true);

    try {
      // Log the parameters for debugging
      console.log("Fetching with params:", {
        startDate: startDate ? format(startDate, "yyyy-MM-dd") : "undefined",
        endDate: endDate ? format(endDate, "yyyy-MM-dd") : "undefined",
        branchFilter,
      });

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Make a copy of the parameters to ensure we're not affected by state changes
      const fetchStartDate = startDate ? new Date(startDate) : undefined;
      const fetchEndDate = endDate ? new Date(endDate) : undefined;
      const fetchBranchFilter =
        branchFilter === "all" ? undefined : branchFilter;

      // Call our function that simulates an API call with the copied parameters
      const fetchedApplications = getDiscountApplications(
        discountId,
        fetchStartDate,
        fetchEndDate,
        fetchBranchFilter
      );

      setApplications(fetchedApplications);

      // Only show toast if we have valid dates
      if (fetchStartDate && fetchEndDate) {
        toast({
          title: "Data updated",
          description: `Showing data from ${format(
            fetchStartDate,
            "dd/MM/yyyy"
          )} to ${format(fetchEndDate, "dd/MM/yyyy")}`,
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
      fetchApplicationsWithDateRange(undefined, undefined, branchFilter);
    }
  }, [discountId, branchFilter]);

  // Update the state setters for the export
  const handleApplyExportDateRange = () => {
    // If we already have valid dates set, use them directly
    if (
      exportStartDate &&
      exportEndDate &&
      !exportStartDateError &&
      !exportEndDateError
    ) {
      setIsExportDateRangeSheetOpen(false);
      setIsPdfPreviewOpen(true);
      return;
    }

    // Otherwise parse and validate the inputs
    const parsedStartDate = parse(
      exportStartDateInput,
      "dd/MM/yyyy",
      new Date()
    );
    const parsedEndDate = parse(exportEndDateInput, "dd/MM/yyyy", new Date());

    if (!isValid(parsedStartDate) || !isValid(parsedEndDate)) {
      toast({
        title: "Invalid date format",
        description: "Please enter valid dates in DD/MM/YYYY format",
        variant: "destructive",
      });
      return;
    }

    if (parsedStartDate > parsedEndDate) {
      toast({
        title: "Invalid date range",
        description: "Start date must be before end date",
        variant: "destructive",
      });
      return;
    }

    // Check if dates are within the all-time range
    if (!isDateWithinAllTimeRange(parsedStartDate, true)) {
      toast({
        title: "Invalid start date",
        description: `Start date cannot be before discount creation (${format(
          new Date(discount.createdAt),
          "dd/MM/yy"
        )})`,
        variant: "destructive",
      });
      return;
    }

    if (!isDateWithinAllTimeRange(parsedEndDate, false)) {
      toast({
        title: "Invalid end date",
        description: "End date cannot be in the future",
      });
      return;
    }

    setExportStartDate(parsedStartDate);
    setExportEndDate(parsedEndDate);
    setIsExportDateRangeSheetOpen(false);

    // Reset the preview page to 1 whenever we open the preview
    setPreviewCurrentPage(1);

    // Directly open the PDF preview
    setIsPdfPreviewOpen(true);
  };

  // Function to handle export button click
  const handleExportClick = () => {
    // Initialize with current date range if available
    if (startDate && endDate) {
      setExportStartDate(startDate);
      setExportEndDate(endDate);
      setExportStartDateInput(format(startDate, "dd/MM/yyyy"));
      setExportEndDateInput(format(endDate, "dd/MM/yyyy"));
    } else if (discount) {
      // Default to all-time range
      const start = new Date(discount.createdAt);
      const end = new Date();
      setExportStartDate(start);
      setExportEndDate(end);
      setExportStartDateInput(format(start, "dd/MM/yyyy"));
      setExportEndDateInput(format(end, "dd/MM/yyyy"));
    }

    // Initialize with current branch filter
    setExportBranchFilter(branchFilter);

    // Reset the preview page to 1
    setPreviewCurrentPage(1);

    setIsExportDateRangeSheetOpen(true);
  };

  // Function to apply the selected date range
  const applyDateRange = () => {
    // Check if both start and end dates are not 'DD/MM/YYYY'
    if (startDateInput === "DD/MM/YYYY" || endDateInput === "DD/MM/YYYY") {
      toast({
        title: "Incomplete date range",
        description: "Please enter both start and end dates",
        variant: "destructive",
      });
      return; // Don't proceed if dates are not valid
    }

    try {
      // Parse the start and end dates, expecting DD/MM/YYYY format
      const parsedStartDate = parse(startDateInput, "dd/MM/yyyy", new Date());
      const parsedEndDate = parse(endDateInput, "dd/MM/yyyy", new Date());

      // Check for valid parsed dates
      if (!isValid(parsedStartDate) || !isValid(parsedEndDate)) {
        toast({
          title: "Invalid date format",
          description: "Please use DD/MM/YYYY format with valid date values",
          variant: "destructive",
        });
        return; // Don't proceed if dates are invalid
      }

      // Check if start date is after end date
      if (parsedStartDate > parsedEndDate) {
        toast({
          title: "Invalid date range",
          description: "Start date must be before end date",
          variant: "destructive",
        });
        return; // Don't proceed if date range is invalid
      }

      // Check if dates are within the all-time range
      if (discount && !isDateWithinAllTimeRange(parsedStartDate, true)) {
        toast({
          title: "Invalid start date",
          description: `Start date cannot be before discount creation (${format(
            new Date(discount.createdAt),
            "dd/MM/yy"
          )})`,
          variant: "destructive",
        });
        return;
      }

      if (!isDateWithinAllTimeRange(parsedEndDate, false)) {
        toast({
          title: "Invalid end date",
          description: "End date cannot be in the future",
        });
        return;
      }

      // Close the sheet first
      setIsDateRangeSheetOpen(false);

      // Use a callback approach to ensure we're using the latest state
      const doFetch = () => {
        // Set the state variables
        setStartDate(parsedStartDate);
        setEndDate(parsedEndDate);

        // Directly call the fetch with the parsed dates to avoid state dependency
        fetchApplicationsWithDateRange(
          parsedStartDate,
          parsedEndDate,
          branchFilter
        );
      };

      // Execute after a small delay to ensure UI updates first
      setTimeout(doFetch, 100);
    } catch (error) {
      // Catch any unexpected errors
      console.error("Date processing error:", error);
      toast({
        title: "Error processing dates",
        description:
          "An error occurred processing the dates. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Add this function to handle branch selection in the mobile filter sheet
  const handleMobileBranchSelect = (branch: string) => {
    setBranchFilter(branch);
    setIsFilterSheetOpen(false);
  };

  const branchNames = actualBranches;

  const filteredApplications = useMemo(() => {
    let result = [...applications];

    if (searchQuery) {
      result = result.filter((app) => {
        const searchStr =
          `${app.customerName} ${app.customerPhone} ${app.branch} ${app.orderAmount} ${app.discountAmount} ${app.server}`.toLowerCase();
        return searchStr.includes(searchQuery.toLowerCase());
      });
    }

    result = sortData(result, sortColumn, sortDirection);
    return result;
  }, [applications, searchQuery, sortColumn, sortDirection, sortData]);

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Define header
      const headerText = "Discount Report";
      const headerDateRange =
        exportStartDate && exportEndDate
          ? `${format(exportStartDate, "dd/MM/yyyy")} - ${format(
              exportEndDate,
              "dd/MM/yyyy"
            )}`
          : "All time";
      const headerBranchFilter =
        exportBranchFilter !== "all" ? ` - Branch: ${exportBranchFilter}` : "";
      const headerDiscountName = discount?.name || discount?.title;
      const headerDiscountType =
        discount?.type +
        (discount?.loyaltyType ? ` (${discount.loyaltyType})` : "");

      // Add header content
      doc.setFontSize(16);
      doc.text(headerText, 14, 15);
      doc.setFontSize(12);
      doc.text(headerDateRange + headerBranchFilter, 14, 22);
      doc.setFontSize(14);
      doc.text(headerDiscountName, 14, 30);
      doc.setFontSize(12);
      doc.text(headerDiscountType, 14, 37);

      // Define discount details
      const discountDetails = [
        { label: "Status:", value: discount?.status },
        {
          label: "Created On:",
          value: format(new Date(discount?.createdAt), "dd/MM/yyyy"),
        },
        { label: "Created By:", value: discount?.createdBy },
        {
          label: "Last Used:",
          value: discount?.lastUsed
            ? format(new Date(discount?.lastUsed), "dd/MM/yyyy")
            : "Never",
        },
      ];

      // Define usage statistics
      const usageStatistics = [
        { label: "Total Usage:", value: discount?.totalUsage },
        {
          label: "Total Amount:",
          value: `Rs ${
            discount?.totalAmount ? discount.totalAmount.toLocaleString() : "0"
          }`,
        },
        {
          label: "Average Discount:",
          value: `Rs ${
            discount?.averageDiscount
              ? discount.averageDiscount.toLocaleString()
              : "0"
          }`,
        },
        { label: "Branches:", value: discount?.branch || "All Branches" },
      ];

      // Add discount details and usage statistics
      let startY = 50;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Discount Details", 14, startY);
      startY += 7;
      doc.setFont("helvetica", "normal");
      discountDetails.forEach((detail) => {
        doc.setFontSize(10);
        doc.text(`${detail.label}`, 14, startY);
        doc.text(`${detail.value}`, 50, startY);
        startY += 6;
      });

      const startX = 120;
      startY = 50;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Usage Statistics", startX, startY);
      doc.setFont("helvetica", "normal");
      startY += 7;
      usageStatistics.forEach((stat) => {
        doc.setFontSize(10);
        doc.text(`${stat.label}`, startX, startY);
        doc.text(`${stat.value}`, startX + 40, startY);
        startY += 6;
      });

      // Define table headers
      const tableHeaders =
        discount?.type === "bankDiscount"
          ? [
              "Date & Time",
              "Customer / Phone",
              "Branch",
              "Bank Card",
              "Amount / Discount",
            ]
          : ["Date & Time", "Customer / Phone", "Branch", "Amount / Discount"];

      // Define column widths - match the preview table
      const columnWidths =
        discount?.type === "bankDiscount"
          ? [35, 50, 30, 30, 35]
          : [35, 50, 30, 35];

      // Calculate total width
      const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);

      // Calculate startX for table
      const tableStartX = 14;

      // Function to add table header - updated to match preview style
      const addTableHeader = (y: number) => {
        // Draw header background - match the light gray from preview
        doc.setFillColor(245, 245, 245);
        doc.rect(tableStartX, y, totalWidth, 8, "F");

        // Add header text
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(50, 50, 50);

        let x = tableStartX;
        tableHeaders.forEach((header, index) => {
          if (
            index === tableHeaders.length - 1 &&
            header === "Amount / Discount"
          ) {
            // Right align the last column
            doc.text(header, x + columnWidths[index] - 2, y + 5, {
              align: "right",
            });
          } else {
            doc.text(header, x + 2, y + 5);
          }
          x += columnWidths[index];
        });

        // Draw border around header - lighter gray for borders
        doc.setDrawColor(220, 220, 220);
        doc.rect(tableStartX, y, totalWidth, 8);

        // Draw vertical lines between columns
        x = tableStartX;
        tableHeaders.forEach((header, index) => {
          x += columnWidths[index];
          if (x < tableStartX + totalWidth) {
            doc.line(x, y, x, y + 8);
          }
        });

        return y + 8;
      };

      // Add the initial table header
      let yPos = 80; // Declare yPos and initialize it

      yPos = addTableHeader(yPos);

      // Add table rows
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8); // Smaller font to match preview
      doc.setTextColor(50, 50, 50);

      const rowHeight = 12;

      // Process filtered applications
      const filteredApps = applications.filter((app) => {
        if (!exportStartDate || !exportEndDate) return true;
        const appDate = new Date(app.timestamp);
        return (
          appDate >= exportStartDate &&
          appDate <= exportEndDate &&
          (exportBranchFilter === "all" || app.branch === exportBranchFilter)
        );
      });

      filteredApps.forEach((app, index) => {
        // Check if we need a new page
        if (yPos > 260) {
          doc.addPage({ orientation: "portrait", unit: "mm", format: "a4" });
          yPos = 20;

          // Add page title on each new page
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(0, 0, 0);
          doc.text("Discount Report - Continued", 14, yPos);
          yPos += 10;

          // Add table title on each new page
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text("Application Details (Continued)", 14, yPos);
          yPos += 10;

          // Re-add the table header with the same styling as the first page
          yPos = addTableHeader(yPos);

          // Explicitly reset font to normal for table data
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(50, 50, 50);
        }

        // Reset font for each row to ensure consistency
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(50, 50, 50);

        // Draw row background (alternate colors for better readability) - match preview
        if (index % 2 === 0) {
          doc.setFillColor(248, 248, 248); // Lighter gray for even rows
          doc.rect(tableStartX, yPos, totalWidth, rowHeight, "F");
        }

        // Add row data
        let x = tableStartX;

        // Helper function to truncate text if it's too long for the cell
        const truncateText = (text: string, maxWidth: number) => {
          if (
            (doc.getStringUnitWidth(text) * doc.getFontSize()) /
              doc.internal.scaleFactor >
            maxWidth - 4
          ) {
            // Truncate and add ellipsis
            let truncated = text;
            while (
              (doc.getStringUnitWidth(truncated + "...") * doc.getFontSize()) /
                doc.internal.scaleFactor >
                maxWidth - 4 &&
              truncated.length > 0
            ) {
              truncated = truncated.slice(0, -1);
            }
            return truncated + "...";
          }
          return text;
        };

        // Format date with short year
        const formatDateWithShortYear = (dateString: string) => {
          const date = new Date(dateString);
          return format(date, "dd/MM/yy");
        };

        // Date & Time
        const dateTimeText = `${formatDateWithShortYear(app.timestamp)}`;
        doc.text(truncateText(dateTimeText, columnWidths[0]), x + 2, yPos + 4);
        doc.setTextColor(120, 120, 120); // Gray color for time
        doc.text(app.time, x + 2, yPos + 8);
        doc.setTextColor(50, 50, 50); // Reset text color
        x += columnWidths[0];

        // Customer / Phone
        doc.text(
          truncateText(app.customerName, columnWidths[1]),
          x + 2,
          yPos + 4
        );
        doc.setTextColor(120, 120, 120); // Gray color for phone
        doc.text(
          truncateText(app.customerPhone, columnWidths[1]),
          x + 2,
          yPos + 8
        );
        doc.setTextColor(50, 50, 50); // Reset text color
        x += columnWidths[1];

        // Branch
        doc.text(truncateText(app.branch, columnWidths[2]), x + 2, yPos + 6);
        x += columnWidths[2];

        // Bank Card (only for bank discounts)
        if (discount.type === "bankDiscount") {
          doc.text(
            truncateText(app.bankCard || "N/A", columnWidths[3]),
            x + 2,
            yPos + 6
          );
          x += columnWidths[3];
        }

        // Amount / Discount (right aligned)
        const amountDiscountColIndex = discount.type === "bankDiscount" ? 4 : 3;

        doc.text(
          truncateText(
            `Rs ${app.orderAmount.toLocaleString()}`,
            columnWidths[amountDiscountColIndex]
          ),
          x + columnWidths[amountDiscountColIndex] - 2,
          yPos + 4,
          { align: "right" }
        );
        doc.setTextColor(120, 120, 120); // Gray color for discount
        doc.text(
          truncateText(
            `Disc: Rs ${app.discountAmount.toLocaleString()}`,
            columnWidths[amountDiscountColIndex]
          ),
          x + columnWidths[amountDiscountColIndex] - 2,
          yPos + 8,
          { align: "right" }
        );
        doc.setTextColor(50, 50, 50); // Reset text color

        // Draw horizontal line after each row - match preview
        doc.setDrawColor(230, 230, 230); // Lighter gray for borders
        doc.line(
          tableStartX,
          yPos + rowHeight,
          tableStartX + totalWidth,
          yPos + rowHeight
        );

        // Draw vertical lines for columns - match preview
        doc.setDrawColor(230, 230, 230); // Lighter gray for borders
        let colX = tableStartX;
        tableHeaders.forEach((header, index) => {
          doc.line(colX, yPos, colX, yPos + rowHeight);
          colX += columnWidths[index];
        });
        // Draw the last vertical line
        doc.line(
          tableStartX + totalWidth,
          yPos,
          tableStartX + totalWidth,
          yPos + rowHeight
        );

        yPos += rowHeight;
      });

      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${i} of ${pageCount} - Generated on ${format(
            new Date(),
            "PPP"
          )} - Khapey Restaurant Management System`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      // Save the PDF
      doc.save("discount_report.pdf");
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

  return (
    <>
      <PullToRefreshIndicator
        pullDistance={pullDistance}
        isRefreshing={isRefreshing}
        threshold={80}
      />
      <div className="space-y-4">
        {/* Discount Summary Card */}
        <DiscountSummaryCard discount={discount} />

        {/* Filter Controls */}
        <ReportFilterControls
          searchQuery={searchQuery}
          onSearchChange={setDebouncedSearchQuery}
          branchFilter={branchFilter}
          onBranchFilterChange={setBranchFilter}
          startDate={startDate}
          endDate={endDate}
          onDateRangeClick={() => setIsDateRangeSheetOpen(true)}
          onExportClick={handleExportClick}
          onFilterClick={() => setIsFilterSheetOpen(true)}
          isLoading={isLoading}
          branchNames={branchNames}
          discount={discount}
        />

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

        {/* Date Range Sheet */}
        <DateRangeSheet
          isOpen={isDateRangeSheetOpen}
          onOpenChange={setIsDateRangeSheetOpen}
          startDateInput={startDateInput}
          endDateInput={endDateInput}
          setStartDateInput={setStartDateInput}
          setEndDateInput={setEndDateInput}
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          startDateError={startDateError}
          endDateError={endDateError}
          setStartDateError={setStartDateError}
          setEndDateError={setEndDateError}
          applyDateRange={applyDateRange}
          formatDateInput={formatDateInput}
          discount={discount}
        />

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
          formatDateInput={formatDateInput}
          discount={discount}
          branchNames={branchNames}
        />
      </div>
    </>
  );
}
