import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function SalesReportLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="w-full">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
                <div className="flex items-center mt-2">
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>

      {/* Sales by Category and Branch */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center">
                    <Skeleton className="h-4 w-24 mr-4" />
                    <Skeleton className="h-2 w-full flex-1 mr-4" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-4">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center">
                    <Skeleton className="h-4 w-24 mr-4" />
                    <Skeleton className="h-4 w-20 mr-4" />
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
