"use client"

import { useState, useCallback } from "react"

interface UseSortingProps<T> {
  initialSortColumn?: keyof T
  initialSortDirection?: "asc" | "desc"
}

/**
 * Custom hook for managing sorting state and functionality
 * @param {UseSortingProps<T>} options - The options for the hook
 * @returns {object} - An object containing the sorting state and functionality
 */
export function useSorting<T extends Record<string, any>>({
  initialSortColumn,
  initialSortDirection = "asc",
}: UseSortingProps<T> = {}) {
  const [sortColumn, setSortColumn] = useState<keyof T | undefined>(initialSortColumn)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(initialSortDirection)

  const handleSort = (column: keyof T) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Set new column and default to ascending
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const sortData = useCallback(
    (data: T[]) => {
      if (!sortColumn) return [...data]

      return [...data].sort((a, b) => {
        const valueA = a[sortColumn]
        const valueB = b[sortColumn]

        // Compare the values based on sort direction
        if (sortDirection === "asc") {
          return typeof valueA === "string"
            ? valueA.localeCompare(valueB as string)
            : (valueA as number) - (valueB as number)
        } else {
          return typeof valueA === "string"
            ? valueB.localeCompare(valueA as string)
            : (valueB as number) - (valueA as number)
        }
      })
    },
    [sortColumn, sortDirection],
  )

  return {
    sortColumn,
    sortDirection,
    handleSort,
    sortData,
  }
}
