import { lazyImport } from "@/utils/lazy-import"
import { SkeletonBranchBreakdown } from "@/components/ui/skeleton-card"

export const { BranchBreakdown } = lazyImport(
  () => import("./branch-breakdown"),
  "BranchBreakdown",
  <SkeletonBranchBreakdown branchCount={5} />,
)
