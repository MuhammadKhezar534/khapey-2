import { jsPDF } from "jspdf";
import { format } from "date-fns";

// Helper function to truncate text if it's too long for the cell
export const truncateText = (doc: jsPDF, text: string, maxWidth: number) => {
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
export const formatDateWithShortYear = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, "dd/MM/yy");
};

// Function to add table header to PDF
export const addTableHeader = (
  doc: jsPDF,
  tableHeaders: string[],
  columnWidths: number[],
  tableStartX: number,
  y: number
) => {
  // Calculate total width
  const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);

  // Draw header background - match the light gray from preview
  doc.setFillColor(245, 245, 245);
  doc.rect(tableStartX, y, totalWidth, 8, "F");

  // Add header text
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(50, 50, 50);

  let x = tableStartX;
  tableHeaders.forEach((header, index) => {
    if (index === tableHeaders.length - 1 && header === "Amount / Discount") {
      // Right align the last column
      doc.text(header, x + columnWidths[index] - 2, y + 5, { align: "right" });
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

// Generate PDF report
export const generateDiscountPdfReport = async (
  discountId: string,
  discount: any,
  exportFilteredApps: any[],
  exportStartDate?: Date,
  exportEndDate?: Date,
  exportBranchFilter?: string
) => {
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
        value: format(new Date(discount?.lastUsed), "dd/MM/yyyy"),
      },
    ];

    // Define usage statistics
    const usageStatistics = [
      { label: "Total Usage:", value: discount?.totalUsage },
      {
        label: "Total Amount:",
        value: `Rs ${discount?.totalAmount.toLocaleString()}`,
      },
      {
        label: "Average Discount:",
        value: `Rs ${discount?.averageDiscount.toLocaleString()}`,
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

    // Calculate startX for table
    const tableStartX = 14;

    // Add the initial table header
    let yPos = 80; // Declare yPos and initialize it

    yPos = addTableHeader(doc, tableHeaders, columnWidths, tableStartX, yPos);

    // Add table rows
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8); // Smaller font to match preview
    doc.setTextColor(50, 50, 50);

    const rowHeight = 12;

    // Process filtered applications
    exportFilteredApps.forEach((app, index) => {
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
        yPos = addTableHeader(
          doc,
          tableHeaders,
          columnWidths,
          tableStartX,
          yPos
        );

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
        doc.rect(
          tableStartX,
          yPos,
          columnWidths.reduce((sum, width) => sum + width, 0),
          rowHeight,
          "F"
        );
      }

      // Add row data
      let x = tableStartX;

      // Date & Time
      const dateTimeText = `${formatDateWithShortYear(app.timestamp)}`;
      doc.text(
        truncateText(doc, dateTimeText, columnWidths[0]),
        x + 2,
        yPos + 4
      );
      doc.setTextColor(120, 120, 120); // Gray color for time
      doc.text(app.time, x + 2, yPos + 8);
      doc.setTextColor(50, 50, 50); // Reset text color
      x += columnWidths[0];

      // Customer / Phone
      doc.text(
        truncateText(doc, app.customerName, columnWidths[1]),
        x + 2,
        yPos + 4
      );
      doc.setTextColor(120, 120, 120); // Gray color for phone
      doc.text(
        truncateText(doc, app.customerPhone, columnWidths[1]),
        x + 2,
        yPos + 8
      );
      doc.setTextColor(50, 50, 50); // Reset text color
      x += columnWidths[1];

      // Branch
      doc.text(truncateText(doc, app.branch, columnWidths[2]), x + 2, yPos + 6);
      x += columnWidths[2];

      // Bank Card (only for bank discounts)
      if (discount.type === "bankDiscount") {
        doc.text(
          truncateText(doc, app.bankCard || "N/A", columnWidths[3]),
          x + 2,
          yPos + 6
        );
        x += columnWidths[3];
      }

      // Amount / Discount (right aligned)
      const amountDiscountColIndex = discount.type === "bankDiscount" ? 4 : 3;

      doc.text(
        truncateText(
          doc,
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
          doc,
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
        tableStartX + columnWidths.reduce((sum, width) => sum + width, 0),
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
        tableStartX + columnWidths.reduce((sum, width) => sum + width, 0),
        yPos,
        tableStartX + columnWidths.reduce((sum, width) => sum + width, 0),
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

    return doc;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};
