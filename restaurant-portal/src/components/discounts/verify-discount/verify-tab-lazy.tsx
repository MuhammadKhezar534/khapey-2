import { lazyImport } from "@/utils/lazy-import"
import { Skeleton } from "@/components/ui/skeleton"

const loadingFallback = (
  <div className="space-y-4">
    <Skeleton className="h-12 w-full max-w-md" />
    <Skeleton className="h-[400px] w-full rounded-lg" />
  </div>
)

export const { VerifyTab } = lazyImport(() => import("./verify-tab"), "VerifyTab", loadingFallback)
