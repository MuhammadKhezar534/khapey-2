"use client";

import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { generateDiscountPdfReport } from "@/utils/pdf-generator";
import { getDiscountApplications } from "@/utils/discount-data";
import { validateDateRange } from "./date-utils";

interface ExportHandlerProps {
  discountId: string;
  discount: any;
  exportStartDate?: Date;
  exportEndDate?: Date;
  exportBranchFilter: string | "all";
  onExportComplete: () => void;
  onExportStart: () => void;
}

export function useExportHandler({
  discountId,
  discount,
  exportStartDate,
  exportEndDate,
  exportBranchFilter,
  onExportComplete,
  onExportStart,
}: ExportHandlerProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async () => {
    setIsExporting(true);
    onExportStart();

    try {
      // Get fresh data for export with export-specific filters
      const exportFilteredApps = getDiscountApplications(
        discountId,
        exportStartDate,
        exportEndDate,
        exportBranchFilter === "all" ? undefined : exportBranchFilter
      );

      // Generate the PDF document
      const doc = await generateDiscountPdfReport(
        discountId,
        discount,
        exportFilteredApps,
        exportStartDate,
        exportEndDate,
        exportBranchFilter
      );

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
      onExportComplete();
    }
  };

  const validateAndPrepareExport = (
    exportStartDateInput: string,
    exportEndDateInput: string,
    selectedBranchFilter: string | "all"
  ) => {
    // Validate branch selection
    if (!selectedBranchFilter) {
      toast({
        title: "Branch selection required",
        description: "Please select a branch or 'All Branches'",
        variant: "destructive",
      });
      return { valid: false };
    }

    // Validate date range
    const result = validateDateRange(
      exportStartDateInput,
      exportEndDateInput,
      discount
    );

    if (!result.valid) {
      toast({
        title: "Invalid date range",
        description: result.error,
        variant: "destructive",
      });
      return { valid: false };
    }

    return {
      valid: true,
      startDate: result.startDate,
      endDate: result.endDate,
      branchFilter: selectedBranchFilter,
    };
  };

  return {
    isExporting,
    handleDownload,
    validateAndPrepareExport,
  };
}
