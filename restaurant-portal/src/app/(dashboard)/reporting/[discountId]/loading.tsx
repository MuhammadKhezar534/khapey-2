import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ReportingDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="p-4 pb-2">
              <Skeleton className="h-4 w-24 mb-1" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle>
            <Skeleton className="h-6 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Tabs defaultValue="table">
            <TabsList className="mb-4">
              <TabsTrigger value="table">
                <Skeleton className="h-4 w-16" />
              </TabsTrigger>
              <TabsTrigger value="chart">
                <Skeleton className="h-4 w-16" />
              </TabsTrigger>
            </TabsList>
            <div className="grid gap-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-48" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
              <div className="rounded-md border">
                <div className="p-4 border-b">
                  <div className="grid grid-cols-6 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4 border-b">
                    <div className="grid grid-cols-6 gap-4">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <Skeleton key={j} className="h-4 w-full" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
