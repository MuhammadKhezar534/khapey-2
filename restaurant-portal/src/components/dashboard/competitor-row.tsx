import { TableRow, TableCell } from "@/components/ui/table"
import { Star } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface CompetitorData {
  id: string
  name: string
  branch: string
  logo: string
  isOurBranch: boolean
  fiveStarReviews: {
    today: number
    thisWeek: number
    thisMonth: number
  }
}

interface CompetitorRowProps {
  competitor: CompetitorData
  position: number
  timeFilter: "today" | "thisWeek" | "thisMonth"
}

export function CompetitorRow({ competitor, position, timeFilter }: CompetitorRowProps) {
  return (
    <TableRow key={competitor.id} className={cn("border-l", competitor.isOurBranch && "bg-primary/5")}>
      <TableCell className="text-center font-bold p-2 md:p-4">{position}</TableCell>
      <TableCell className="p-2 md:p-4">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative h-8 w-8 md:h-10 md:w-10 flex-shrink-0 overflow-hidden rounded-full">
            <Image
              src={competitor.logo || "/placeholder.svg"}
              alt={competitor.name}
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className={cn("font-medium truncate text-sm md:text-base", competitor.isOurBranch && "text-primary")}>
              {competitor.name}
            </div>
            <div className="text-xs text-muted-foreground truncate">{competitor.branch}</div>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right whitespace-nowrap p-2 md:p-4">
        <div className="flex items-center justify-end gap-1">
          <Star className="h-3 w-3 md:h-4 md:w-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
          <span className="font-medium text-sm md:text-base">{competitor.fiveStarReviews[timeFilter]}</span>
        </div>
      </TableCell>
    </TableRow>
  )
}
