"use client"
import { useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Star } from "lucide-react"
import { GenericTable } from "@/components/ui/generic-table"
import ErrorBoundary from "@/components/error-boundary"

interface BranchTableProps {
  branchData: any[]
}

export function BranchTable({ branchData }: BranchTableProps) {
  // Implement inline mobile detection instead of using the hook
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768) // 768px is the standard md breakpoint
    }

    // Check on mount
    checkIfMobile()

    // Add event listener for resize
    window.addEventListener("resize", checkIfMobile)

    // Clean up
    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  const columns = useMemo(
    () => [
      {
        header: "Branch",
        accessorKey: "branch",
        meta: {
          align: "left",
          width: isMobile ? "40%" : "25%",
        },
      },
      {
        header: "Reviews",
        accessorKey: "reviews",
        meta: {
          align: "right",
          width: isMobile ? "30%" : "10%",
        },
        cell: (row: any) => (
          <div className={`text-right ${!isMobile ? "flex flex-col items-end" : ""}`}>
            {row.reviews.toLocaleString()}
            {isMobile ? (
              <span className="text-muted-foreground"> ({row.reviewsPercent}%)</span>
            ) : (
              <span className="text-xs text-muted-foreground">({row.reviewsPercent}%)</span>
            )}
          </div>
        ),
      },
      {
        header: "Views",
        accessorKey: "views",
        meta: {
          align: "right",
          width: isMobile ? "30%" : "10%",
          hideColumn: isMobile,
        },
        cell: (row: any) => (
          <div className={`text-right ${!isMobile ? "flex flex-col items-end" : ""}`}>
            {row.views.toLocaleString()}
            {isMobile ? (
              <span className="text-muted-foreground"> ({row.viewsPercent}%)</span>
            ) : (
              <span className="text-xs text-muted-foreground">({row.viewsPercent}%)</span>
            )}
          </div>
        ),
      },
      {
        header: "Likes",
        accessorKey: "likes",
        meta: {
          align: "right",
          width: isMobile ? "30%" : "10%",
          hideColumn: isMobile,
        },
        cell: (row: any) => (
          <div className={`text-right ${!isMobile ? "flex flex-col items-end" : ""}`}>
            {row.likes.toLocaleString()}
            {isMobile ? (
              <span className="text-muted-foreground"> ({row.likesPercent}%)</span>
            ) : (
              <span className="text-xs text-muted-foreground">({row.likesPercent}%)</span>
            )}
          </div>
        ),
      },
      {
        header: "Rating",
        accessorKey: "rating",
        meta: {
          align: "right",
          width: isMobile ? "30%" : "10%",
        },
        cell: (row: any) => (
          <div className="text-right">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <Star className="h-3 w-3 mr-1" />
              {row.rating.toFixed(1)}
            </span>
          </div>
        ),
      },
      {
        header: "Saves",
        accessorKey: "saves",
        meta: {
          align: "right",
          width: isMobile ? "30%" : "10%",
          hideColumn: isMobile,
        },
        cell: (row: any) => (
          <div className={`text-right ${!isMobile ? "flex flex-col items-end" : ""}`}>
            {row.saves.toLocaleString()}
            {isMobile ? (
              <span className="text-muted-foreground"> ({row.savesPercent}%)</span>
            ) : (
              <span className="text-xs text-muted-foreground">({row.savesPercent}%)</span>
            )}
          </div>
        ),
      },
      {
        header: "Shares",
        accessorKey: "shares",
        meta: {
          align: "right",
          width: isMobile ? "30%" : "10%",
          hideColumn: isMobile,
        },
        cell: (row: any) => (
          <div className={`text-right ${!isMobile ? "flex flex-col items-end" : ""}`}>
            {row.shares.toLocaleString()}
            {isMobile ? (
              <span className="text-muted-foreground"> ({row.sharesPercent}%)</span>
            ) : (
              <span className="text-xs text-muted-foreground">({row.sharesPercent}%)</span>
            )}
          </div>
        ),
      },
      {
        header: "Revenue",
        accessorKey: "revenue",
        meta: {
          align: "right",
          width: isMobile ? "30%" : "15%",
        },
        cell: (row: any) => (
          <div className={`text-right ${!isMobile ? "flex flex-col items-end" : ""}`}>
            {isMobile ? (
              <>
                Rs {row.revenue.toLocaleString()}
                <span className="text-muted-foreground"> ({row.revenuePercent}%)</span>
              </>
            ) : (
              <>
                Rs {row.revenue.toLocaleString()}
                <span className="text-xs text-muted-foreground">({row.revenuePercent}%)</span>
              </>
            )}
          </div>
        ),
      },
    ],
    [isMobile],
  )

  // Filter out columns that should be hidden on mobile
  const visibleColumns = useMemo(() => {
    return columns.filter((column) => !column.meta?.hideColumn)
  }, [columns])

  return (
    <ErrorBoundary componentName="Branch Table">
      <Card>
        <CardHeader className="p-3 md:p-4">
          <CardTitle className="text-sm md:text-base">Branch Performance Details</CardTitle>
          <CardDescription className="text-xs">Detailed metrics for all branches</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <GenericTable data={branchData} columns={isMobile ? visibleColumns : columns} />
          </div>
        </CardContent>
      </Card>
    </ErrorBoundary>
  )
}
