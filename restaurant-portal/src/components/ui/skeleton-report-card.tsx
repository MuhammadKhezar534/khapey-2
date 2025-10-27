import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export function SkeletonReportCard() {
  return (
    <Card className="h-full">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>

        <Skeleton className="h-6 w-[80%] mb-1" />

        <div className="text-sm text-muted-foreground mb-4">
          <Skeleton className="h-4 w-[60%]" />
        </div>

        <Separator className="mb-3" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-6 w-12" />
          </div>
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
