import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface SkeletonTableProps {
  rows?: number
  columns?: number
}

export function SkeletonTable({ rows = 5, columns = 8 }: SkeletonTableProps) {
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
          {Array.from({ length: rows }).map((_, rowIndex) => (
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
