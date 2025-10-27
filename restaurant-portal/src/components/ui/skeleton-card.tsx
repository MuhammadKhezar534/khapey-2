import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"

interface SkeletonCardProps {
  headerHeight?: number
  contentHeight?: number
  className?: string
}

export function SkeletonCard({ headerHeight = 100, contentHeight = 200, className }: SkeletonCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="p-3 md:p-4">
        <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2"></div>
      </CardHeader>
      <CardContent className="p-2 md:p-3">
        <div className="w-full bg-gray-100 rounded animate-pulse" style={{ height: contentHeight }}></div>
      </CardContent>
    </Card>
  )
}

// Update to better match the enhanced discount card layout
export function SkeletonDiscountCard() {
  return (
    <Card className="overflow-hidden h-full flex flex-col border border-gray-200">
      {/* Image placeholder (50% chance) */}
      {Math.random() > 0.5 && (
        <div className="h-40 bg-gray-200 animate-pulse relative">
          <div className="absolute top-2 left-2">
            <div className="h-5 w-16 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>
      )}

      <div className="p-5 flex-1 space-y-3">
        {/* Header section */}
        <div className="flex justify-between items-start">
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Title and subtitle */}
        <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>

        {/* Detailed discount info */}
        <div className="space-y-2 pt-1">
          <div className="h-5 w-1/3 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex justify-between">
            <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-1/5 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex justify-between">
            <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        <Separator className="my-3" />

        {/* Card details section */}
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse mt-0.5 shrink-0"></div>
            <div className="space-y-1 w-full">
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse mt-0.5 shrink-0"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </Card>
  )
}

// Update the SkeletonStatCard to match the new design without subtexts
export function SkeletonStatCard() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2 w-full">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// The rest of the file remains unchanged
export function SkeletonBranchBreakdown({ branchCount = 5 }: { branchCount?: number }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-3 md:p-4">
        <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2"></div>
      </CardHeader>
      <CardContent className="p-3 md:p-4 pt-0 md:pt-0 space-y-4 md:space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center mb-1 md:mb-2">
            <div className="h-4 w-36 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-3 w-full bg-gray-200 rounded-full animate-pulse"></div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {Array.from({ length: Math.min(branchCount, 5) }).map((_, index) => (
              <div key={index} className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface SkeletonTableProps {
  rows?: number
  columns?: number
  branchCount?: number
}

export function SkeletonTable({ rows = 5, columns = 8, branchCount }: SkeletonTableProps) {
  const actualRows = branchCount !== undefined ? branchCount : rows

  return (
    <Card>
      <CardHeader className="p-3 md:p-4">
        <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2"></div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4">
          <div className="grid grid-cols-8 gap-4">
            {Array.from({ length: columns }).map((_, index) => (
              <div key={index} className="h-8 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
          {Array.from({ length: actualRows }).map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-8 gap-4 mt-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="h-8 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function SkeletonReviewCard() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mt-2"></div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mt-2"></div>

        {/* Media placeholder */}
        <div className="flex gap-2 mt-4 mb-4">
          <div className="h-20 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-20 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Stats placeholder */}
        <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mb-3"></div>
        <div className="flex flex-wrap gap-3">
          <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-3 border-t">
        <div className="flex justify-between w-full">
          <div className="flex items-center">
            <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse mr-2"></div>
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </CardFooter>
    </Card>
  )
}

export function SkeletonReviewQuestionsTable() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex justify-between">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex justify-between pt-4">
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function SkeletonCompetitionTable() {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px] md:w-[80px]">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                </TableHead>
                <TableHead>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse ml-auto"></div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="text-center">
                    <div className="h-5 w-5 bg-gray-200 rounded animate-pulse mx-auto"></div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="h-5 w-16 bg-gray-200 rounded animate-pulse ml-auto"></div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
