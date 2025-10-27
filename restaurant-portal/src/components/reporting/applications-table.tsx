"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"

interface ApplicationsTableProps {
  applications: any[]
  isLoading: boolean
  discount: any
  sortColumn: string
  sortDirection: "asc" | "desc"
  handleSort: (column: string) => void
}

export function ApplicationsTable({
  applications,
  isLoading,
  discount,
  sortColumn,
  sortDirection,
  handleSort,
}: ApplicationsTableProps) {
  // Helper function to render sort icon
  const renderSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-1 h-3 w-3 inline opacity-50" />
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3 inline text-primary" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3 inline text-primary" />
    )
  }

  // Custom date formatter to show date with 2-digit year
  const formatDateWithShortYear = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" }).format(date)
  }

  return (
    <Table>
      <TableHeader className="sticky top-0 z-10 bg-white">
        <TableRow>
          <TableHead onClick={() => handleSort("timestamp")} className="cursor-pointer">
            <div className="flex items-center">Date & Time {renderSortIcon("timestamp")}</div>
          </TableHead>
          <TableHead onClick={() => handleSort("customerName")} className="cursor-pointer">
            <div className="flex items-center">Customer {renderSortIcon("customerName")}</div>
          </TableHead>
          <TableHead onClick={() => handleSort("customerPhone")} className="cursor-pointer">
            <div className="flex items-center">Phone Number {renderSortIcon("customerPhone")}</div>
          </TableHead>
          <TableHead onClick={() => handleSort("branch")} className="cursor-pointer">
            <div className="flex items-center">Branch {renderSortIcon("branch")}</div>
          </TableHead>
          {discount?.type === "bankDiscount" && (
            <TableHead onClick={() => handleSort("bankCard")} className="cursor-pointer">
              <div className="flex items-center">Bank Card {renderSortIcon("bankCard")}</div>
            </TableHead>
          )}
          <TableHead onClick={() => handleSort("orderAmount")} className="cursor-pointer">
            <div className="flex items-center">Amount {renderSortIcon("orderAmount")}</div>
          </TableHead>
          <TableHead onClick={() => handleSort("discountAmount")} className="cursor-pointer">
            <div className="flex items-center">Discount {renderSortIcon("discountAmount")}</div>
          </TableHead>
          <TableHead>Server</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center">
              <div className="flex justify-center items-center">
                <svg
                  className="animate-spin h-5 w-5 mr-3 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading data...
              </div>
            </TableCell>
          </TableRow>
        ) : (
          applications.map((app) => (
            <TableRow key={app.id}>
              <TableCell>
                <div className="font-medium">{formatDateWithShortYear(app.timestamp)}</div>
                <div className="text-xs text-muted-foreground">{app.time}</div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{app.customerName}</div>
              </TableCell>
              <TableCell>{app.customerPhone}</TableCell>
              <TableCell>{app.branch}</TableCell>
              {discount?.type === "bankDiscount" && <TableCell>{app.bankCard || "N/A"}</TableCell>}
              <TableCell>Rs {app.orderAmount.toLocaleString()}</TableCell>
              <TableCell>Rs {app.discountAmount.toLocaleString()}</TableCell>
              <TableCell>{app.server}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
