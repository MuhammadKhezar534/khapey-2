import { lazyImport } from "@/utils/lazy-import"
import { SkeletonTable } from "@/components/ui/skeleton-table"

export const { BranchTable } = lazyImport(
  () => import("./branch-table"),
  "BranchTable",
  <SkeletonTable rows={5} columns={8} />,
)
