import { lazyImport } from "@/utils/lazy-import"
import { Skeleton } from "@/components/ui/skeleton"

export const { MetricsChart } = lazyImport(
  () => import("./metrics-chart"),
  "MetricsChart",
  <Skeleton className="h-[450px] w-full" />,
)
