"use client"

import type React from "react"
import { useMemo } from "react"
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { useSorting } from "@/hooks/use-sorting"

interface ColumnDef<T> {
  header: string
  accessorKey: string
  cell?: (row: T) => React.ReactNode
  meta?: {
    className?: string
    headerClassName?: string
    cellClassName?: string
    width?: string
    hideColumn?: boolean
    align?: "left" | "right" | "center"
  }
}

interface GenericTableProps<T extends Record<string, any>> {
  data: T[]
  columns: ColumnDef<T>[]
}

export function GenericTable<T extends Record<string, any>>({ data, columns }: GenericTableProps<T>) {
  const { sortColumn, sortDirection, handleSort, sortData } = useSorting<T>({
    initialSortColumn: columns[0].accessorKey,
    initialSortDirection: "asc",
  })

  const sortedData = useMemo(() => sortData(data), [data, sortColumn, sortDirection, sortData])

  return (
    <div className="relative overflow-x-auto">
      <Table className="min-w-[600px] table-fixed">
        <TableHeader>
          <TableRow>
            {columns.map((column) => {
              const align = column.meta?.align || (column.accessorKey === "branch" ? "left" : "right")
              const alignClass = `text-${align}`

              return (
                <TableHead
                  key={column.accessorKey}
                  className={`cursor-pointer ${alignClass} ${column.meta?.headerClassName || column.meta?.className || ""}`}
                  style={{ width: column.meta?.width }}
                  onClick={() => handleSort(column.accessorKey)}
                >
                  <div
                    className={`flex items-center ${align === "right" ? "justify-end" : align === "center" ? "justify-center" : ""}`}
                  >
                    {column.header}
                    {sortColumn === column.accessorKey &&
                      (sortDirection === "asc" ? (
                        <ArrowUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ArrowDown className="ml-1 h-4 w-4" />
                      ))}
                    {sortColumn !== column.accessorKey && (
                      <ArrowUpDown className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-100" />
                    )}
                  </div>
                </TableHead>
              )
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row, index) => (
            <TableRow key={index}>
              {columns.map((column) => {
                const align = column.meta?.align || (column.accessorKey === "branch" ? "left" : "right")
                const alignClass = `text-${align}`

                return (
                  <TableCell
                    key={column.accessorKey}
                    className={`${alignClass} ${column.meta?.cellClassName || column.meta?.className || ""}`}
                    style={{ width: column.meta?.width }}
                  >
                    {column.cell ? column.cell(row) : row[column.accessorKey]}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
