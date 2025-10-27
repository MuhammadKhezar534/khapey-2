"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRef, useMemo } from "react";
import { getDiscountApplications } from "@/utils/discount-data";

interface ExportPdfSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  exportStartDate?: Date;
  exportEndDate?: Date;
  exportBranchFilter: string;
  previewCurrentPage: number;
  setPreviewCurrentPage: (page: number) => void;
  applications: any[];
  discount: any;
  isExporting: boolean;
  handleDownload: () => void;
}

export function ExportPdfSheet({
  isOpen,
  onOpenChange,
  exportStartDate,
  exportEndDate,
  exportBranchFilter,
  previewCurrentPage,
  setPreviewCurrentPage,
  applications,
  discount,
  isExporting,
  handleDownload,
}: ExportPdfSheetProps) {
  const isMobile = useIsMobile();
  const contentRef = useRef<HTMLDivElement>(null);

  // Format date with short year - with safety checks
  const formatDateWithShortYear = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return "N/A";
      return format(date, "dd/MM/yy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  // Get filtered applications based on export filters - fetch directly from the source
  const filteredApps = useMemo(() => {
    if (!discount?.id) return [];

    // Fetch applications directly from the source using export filters
    // This ensures complete independence from the main page filters
    return getDiscountApplications(
      discount.id,
      exportStartDate,
      exportEndDate,
      exportBranchFilter === "all" ? undefined : exportBranchFilter
    );
  }, [discount?.id, exportStartDate, exportEndDate, exportBranchFilter]);

  // Calculate how many items fit on a page (approximately 20 rows per page in PDF)
  const itemsPerPage = 20;
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);

  // Safely get discount properties with fallbacks
  const discountName = discount?.name || discount?.title || "Unnamed Discount";
  const discountType = discount?.type || "Unknown";
  const discountLoyaltyType = discount?.loyaltyType
    ? `(${discount.loyaltyType})`
    : "";
  const discountStatus = discount?.status || "Unknown";
  const discountCreatedAt = discount?.createdAt
    ? formatDateWithShortYear(discount.createdAt)
    : "N/A";
  const discountCreatedBy = discount?.createdBy || "Unknown";
  const discountLastUsed = discount?.lastUsed
    ? formatDateWithShortYear(discount.lastUsed)
    : "N/A";
  const discountTotalUsage = discount?.totalUsage || 0;
  const discountTotalAmount = discount?.totalAmount || 0;
  const discountAverageDiscount = discount?.averageDiscount || 0;
  const discountBranch = discount?.branch || "All Branches";

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "p-0 flex flex-col",
          isMobile ? "w-full h-auto max-h-[85vh]" : "w-[700px] max-w-full"
        )}
      >
        {/* Header - Fixed at top */}
        <div className="sticky top-0 z-20 bg-white border-b p-4 pb-3 shadow-sm">
          <SheetTitle className="text-lg font-semibold">
            Export PDF Report
          </SheetTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {exportStartDate && exportEndDate
              ? `Data from ${format(exportStartDate, "dd/MM/yyyy")} to ${format(
                  exportEndDate,
                  "dd/MM/yyyy"
                )}`
              : "All data will be exported"}
            {exportBranchFilter !== "all" && ` - Branch: ${exportBranchFilter}`}
          </p>
        </div>

        {/* Scrollable Content Area */}
        <div ref={contentRef} className="flex-1 overflow-auto pb-[76px]">
          <div className="p-4 space-y-4">
            <div className="bg-white border rounded-md overflow-hidden shadow-sm">
              {/* PDF Header */}
              <div className="p-4 border-b">
                <h3 className="text-lg font-bold">Discount Report</h3>
                <p className="text-sm text-muted-foreground">
                  {exportStartDate && exportEndDate
                    ? `${format(exportStartDate, "dd/MM/yyyy")} - ${format(
                        exportEndDate,
                        "dd/MM/yyyy"
                      )}`
                    : "All time"}
                </p>

                <div className="mt-3">
                  <h4 className="text-base font-semibold">{discountName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {discountType} {discountLoyaltyType}
                  </p>
                </div>
              </div>

              {/* Two columns for discount details - exactly as in PDF */}
              <div className="grid grid-cols-2 gap-4 p-4 border-b">
                <div>
                  <h4 className="text-sm font-semibold mb-2">
                    Discount Details
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex">
                      <span className="text-muted-foreground w-24">
                        Status:
                      </span>
                      <span className="font-medium capitalize">
                        {discountStatus}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-muted-foreground w-24">
                        Created On:
                      </span>
                      <span>{discountCreatedAt}</span>
                    </div>
                    <div className="flex">
                      <span className="text-muted-foreground w-24">
                        Created By:
                      </span>
                      <span>{discountCreatedBy}</span>
                    </div>
                    <div className="flex">
                      <span className="text-muted-foreground w-24">
                        Last Used:
                      </span>
                      <span>{discountLastUsed}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">
                    Usage Statistics
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex">
                      <span className="text-muted-foreground w-28">
                        Total Usage:
                      </span>
                      <span className="font-medium">{discountTotalUsage}</span>
                    </div>
                    <div className="flex">
                      <span className="text-muted-foreground w-28">
                        Total Amount:
                      </span>
                      <span>Rs {discountTotalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex">
                      <span className="text-muted-foreground w-28">
                        Average Discount:
                      </span>
                      <span>Rs {discountAverageDiscount.toLocaleString()}</span>
                    </div>
                    <div className="flex">
                      <span className="text-muted-foreground w-28">
                        Branches:
                      </span>
                      <span>{discountBranch}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Application Details Table - exactly as in PDF with pagination */}
              <div className="p-4">
                <h4 className="text-sm font-semibold mb-3">
                  Application Details
                </h4>

                <div className="border rounded-md overflow-hidden">
                  {/* Table Header */}
                  <div
                    className="bg-gray-100 p-2 grid gap-2 sticky top-0"
                    style={{
                      gridTemplateColumns:
                        discountType === "bankDiscount"
                          ? "35fr 50fr 30fr 30fr 35fr"
                          : "35fr 50fr 30fr 35fr",
                    }}
                  >
                    <div className="text-xs font-medium">Date & Time</div>
                    <div className="text-xs font-medium">Customer / Phone</div>
                    <div className="text-xs font-medium">Branch</div>
                    {discountType === "bankDiscount" && (
                      <div className="text-xs font-medium">Bank Card</div>
                    )}
                    <div className="text-xs font-medium text-right">
                      Amount / Discount
                    </div>
                  </div>

                  {/* Table Body - All rows for current page */}
                  <div className="">
                    {filteredApps.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No data available for the selected date range
                      </div>
                    ) : (
                      filteredApps
                        .slice(
                          (previewCurrentPage - 1) * itemsPerPage,
                          previewCurrentPage * itemsPerPage
                        )
                        .map((app, index) => (
                          <div
                            key={app.id || index}
                            className={cn(
                              "p-2 border-t grid gap-2",
                              index % 2 === 0 ? "bg-gray-50" : "bg-white"
                            )}
                            style={{
                              gridTemplateColumns:
                                discountType === "bankDiscount"
                                  ? "35fr 50fr 30fr 30fr 35fr"
                                  : "35fr 50fr 30fr 35fr",
                            }}
                          >
                            <div className="text-xs">
                              <div>
                                {formatDateWithShortYear(app.timestamp)}
                              </div>
                              <div className="text-muted-foreground">
                                {app.time || "N/A"}
                              </div>
                            </div>
                            <div className="text-xs">
                              <div>{app.customerName || "Unknown"}</div>
                              <div className="text-muted-foreground">
                                {app.customerPhone || "N/A"}
                              </div>
                            </div>
                            <div className="text-xs">{app.branch || "N/A"}</div>
                            {discountType === "bankDiscount" && (
                              <div className="text-xs">
                                {app.bankCard || "N/A"}
                              </div>
                            )}
                            <div className="text-xs text-right">
                              <div>
                                Rs {(app.orderAmount || 0).toLocaleString()}
                              </div>
                              <div className="text-muted-foreground">
                                Disc: Rs{" "}
                                {(app.discountAmount || 0).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t mt-4 pt-4">
                    <div className="text-xs text-muted-foreground">
                      Page {previewCurrentPage} of {totalPages}
                      <span className="ml-2">
                        ({(previewCurrentPage - 1) * itemsPerPage + 1}-
                        {Math.min(
                          previewCurrentPage * itemsPerPage,
                          filteredApps.length
                        )}{" "}
                        of {filteredApps.length} rows)
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setPreviewCurrentPage(1)}
                        disabled={previewCurrentPage === 1}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="11 17 6 12 11 7"></polyline>
                          <polyline points="18 17 13 12 18 7"></polyline>
                        </svg>
                        <span className="sr-only">First page</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          setPreviewCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={previewCurrentPage === 1}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                        <span className="sr-only">Previous page</span>
                      </Button>
                      <span className="text-xs mx-2">
                        {previewCurrentPage} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          setPreviewCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={previewCurrentPage === totalPages}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                        <span className="sr-only">Next page</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setPreviewCurrentPage(totalPages)}
                        disabled={previewCurrentPage === totalPages}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="13 17 18 12 13 7"></polyline>
                          <polyline points="6 17 11 12 6 7"></polyline>
                        </svg>
                        <span className="sr-only">Last page</span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* PDF Page Indicator */}
                <div className="p-2 border-t mt-4 text-center text-xs text-muted-foreground">
                  Page {previewCurrentPage} of {Math.max(totalPages, 1)} -
                  Generated on {format(new Date(), "PPP")} - Khapey Restaurant
                  Management System
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-white border-t p-4 shadow-md">
          <div className="flex flex-row gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDownload}
              disabled={isExporting}
              className="flex-1"
            >
              {isExporting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating PDF...
                </>
              ) : (
                <>Download PDF</>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
