"use client"

import { CompetitionTable } from "@/components/dashboard/competition-table-lazy"
import { SkeletonCompetitionTable } from "@/components/ui/skeleton-card"

interface CompetitionTabProps {
  isLoading: boolean
  isRefreshing: boolean
}

export function CompetitionTab({ isLoading, isRefreshing }: CompetitionTabProps) {
  // Combined loading state to show skeletons
  const showSkeletons = isLoading || isRefreshing

  return (
    <div className="space-y-4 pt-3 md:pt-4 pb-8 px-0 w-full max-w-full overflow-x-hidden box-border">
      {showSkeletons ? <SkeletonCompetitionTable /> : <CompetitionTable />}
    </div>
  )
}
