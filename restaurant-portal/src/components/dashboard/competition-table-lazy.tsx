import { lazyImport } from "@/utils/lazy-import"
import { Skeleton } from "@/components/ui/skeleton"

const loadingFallback = (
  <div className="space-y-4">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-8 w-48" />
    </div>
    <Skeleton className="h-[400px] w-full rounded-lg" />
  </div>
)

export const { CompetitionTable } = lazyImport(() => import("./competition-table"), "CompetitionTable", loadingFallback)
