"use client"

import { useState, useEffect, useMemo } from "react"
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { handleError, createAppError, ErrorType } from "@/lib/error-handling"

interface ReportApplication {
  id: string
  timestamp: string
  customerName: string
  customerPhone: string
  orderId: string
  branch: string
  orderAmount: number
  discountAmount: number
  server: string
  time: string
}

interface SortConfig {
  column: string
  direction: "asc" | "desc"
}

interface UseReportDataProps {
  discountId: string
  initialStartDate?: Date
  initialEndDate?: Date
  initialBranchFilter?: string
}

/**
 * Custom hook for managing report data with pagination and sorting
 */
export function useReportData({
  discountId,
  initialStartDate,
  initialEndDate,
  initialBranchFilter = "all",
}: UseReportDataProps) {
  const [applications, setApplications] = useState<ReportApplication[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<Date | undefined>(initialStartDate)
  const [endDate, setEndDate] = useState<Date | undefined>(initialEndDate)
  const [branchFilter, setBranchFilter] = useState<string | "all">(initialBranchFilter)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: "timestamp", direction: "desc" })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  /**
   * Validate date range
   */
  const validateDateRange = (startDate?: Date, endDate?: Date): { isValid: boolean; error?: string } => {
    if (startDate && endDate && startDate > endDate) {
      return { isValid: false, error: "Start date must be before end date" }
    }

    if (endDate && endDate > new Date()) {
      return { isValid: false, error: "End date cannot be in the future" }
    }

    return { isValid: true }
  }

  /**
   * Function to get discount applications with date range
   */
  const getDiscountApplications = (discountId: string, startDate?: Date, endDate?: Date) => {
    // Generate dummy applications based on discount ID
    const applications = []
    const branches = ["Gulberg", "DHA Phase 5", "Johar Town", "MM Alam Road", "Bahria Town"]

    // Updated to use Pakistani names
    const customerNames = [
      "Ali Ahmed",
      "Fatima Khan",
      "Hassan Malik",
      "Ayesha Siddiqui",
      "Usman Qureshi",
      "Sana Javed",
      "Bilal Mahmood",
      "Zara Iqbal",
      "Omar Farooq",
      "Hira Shahid",
    ]

    // Updated to use Pakistani names
    const servers = ["Muhammad Ali", "Fatima Khan", "Ahmed Hassan", "Zainab Malik", "Imran Ahmed", "Ayesha Siddiqui"]

    // Generate between 15-30 applications
    const count = 15 + Math.floor(Math.random() * 16)

    for (let i = 0; i < count; i++) {
      // Generate a random date within the last 30 days
      const date = new Date()
      date.setDate(date.getDate() - Math.floor(Math.random() * 30))

      // Generate random order amount based on discount type
      const orderAmount = 1000 + Math.floor(Math.random() * 5000)
      const discountAmount = Math.floor(orderAmount * (Math.random() * 0.25)) // Up to 25% discount

      // Use a random branch
      const branch = branches[Math.floor(Math.random() * branches.length)]

      applications.push({
        id: `${discountId}-app-${i + 1}`,
        timestamp: date.toISOString(),
        customerName: customerNames[Math.floor(Math.random() * customerNames.length)],
        customerPhone: `+92 ${Math.floor(300 + Math.random() * 100)}-${Math.floor(1000000 + Math.random() * 900000)}`,
        orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        branch,
        orderAmount,
        discountAmount,
        server: servers[Math.floor(Math.random() * servers.length)],
        time: format(date, "h:mm a"),
      })
    }

    // Sort by date, newest first
    let filteredApplications = applications.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )

    // Apply date range filter if provided
    if (startDate && endDate) {
      filteredApplications = filteredApplications.filter((app) => {
        const appDate = new Date(app.timestamp)
        return appDate >= startDate && appDate <= endDate
      })
    }

    return filteredApplications
  }

  /**
   * Fetch applications with date range
   */
  const fetchApplicationsWithDateRange = async (startDate?: Date, endDate?: Date) => {
    setIsLoading(true)
    setError(null)

    try {
      // Validate inputs
      if (!discountId) {
        throw createAppError("Discount ID is required", ErrorType.VALIDATION)
      }

      // Validate date range if provided
      if (startDate && endDate) {
        const validation = validateDateRange(startDate, endDate)
        if (!validation.isValid) {
          throw createAppError(validation.error || "Invalid date range", ErrorType.VALIDATION)
        }
      }

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Call our function that simulates an API call
      const fetchedApplications = getDiscountApplications(discountId, startDate, endDate)
      setApplications(fetchedApplications)
      setCurrentPage(1) // Reset to first page when data changes

      toast({
        title: "Data updated",
        description:
          startDate && endDate
            ? `Showing data from ${format(startDate, "dd/MM/yyyy")} to ${format(endDate, "dd/MM/yyyy")}`
            : "Showing all data",
      })
    } catch (error) {
      // Use our standardized error handling
      const appError = handleError(error, "Failed to fetch applications")
      setError(appError.message)

      toast({
        title: "Error fetching data",
        description: appError.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    if (discountId) {
      fetchApplicationsWithDateRange(startDate, endDate)
    }
  }, [discountId])

  // Handle sort
  const handleSort = (column: string) => {
    setSortConfig((prevConfig) => {
      if (prevConfig.column === column) {
        return {
          ...prevConfig,
          direction: prevConfig.direction === "asc" ? "desc" : "asc",
        }
      }
      return { column, direction: "asc" }
    })
  }

  // Filter and sort applications
  const filteredAndSortedApplications = useMemo(() => {
    // First apply filters
    let filtered = [...applications]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (app) =>
          app.customerName.toLowerCase().includes(query) ||
          app.customerPhone.toLowerCase().includes(query) ||
          app.branch.toLowerCase().includes(query),
      )
    }

    // Branch filter
    if (branchFilter !== "all") {
      filtered = filtered.filter((app) => app.branch === branchFilter)
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      const { column, direction } = sortConfig

      // Handle different column types
      if (column === "timestamp") {
        return direction === "asc"
          ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      }

      if (column === "orderAmount" || column === "discountAmount") {
        return direction === "asc" ? a[column] - b[column] : b[column] - a[column]
      }

      // String columns
      const aValue = String(a[column as keyof ReportApplication] || "").toLowerCase()
      const bValue = String(b[column as keyof ReportApplication] || "").toLowerCase()

      return direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    })
  }, [applications, searchQuery, branchFilter, sortConfig])

  // Get paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredAndSortedApplications.slice(startIndex, startIndex + pageSize)
  }, [filteredAndSortedApplications, currentPage, pageSize])

  // Calculate total pages
  const totalPages = Math.ceil(filteredAndSortedApplications.length / pageSize)

  return {
    applications: paginatedData,
    totalApplications: filteredAndSortedApplications.length,
    isLoading,
    error,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    branchFilter,
    setBranchFilter,
    searchQuery,
    setSearchQuery,
    sortConfig,
    handleSort,
    fetchApplicationsWithDateRange,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
  }
}
