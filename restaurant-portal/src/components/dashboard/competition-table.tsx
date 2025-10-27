"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"
import { actualBranches } from "@/contexts/branch-context"

// Import the CompetitorRow component at the top of the file
import { CompetitorRow } from "./competitor-row"
import ErrorBoundary from "@/components/error-boundary"

// Define the competitor data structure
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

// Generate random competitor data
const generateCompetitorData = (seed?: string): CompetitorData[] => {
  // List of competitor restaurant names
  const competitorNames = [
    "Spice Garden",
    "Taste of Punjab",
    "Royal Cuisine",
    "Food Street",
    "Lahore Tikka",
    "Karachi Delights",
    "Peshawar Nights",
    "Biryani House",
    "Grill Master",
    "Tandoori Express",
    "Desi Dhaba",
    "Fusion Kitchen",
    "Cafe Islamabad",
    "Mughal Dynasty",
    "Kebab Corner",
    "Chapli House",
    "Nihari Point",
    "Haleem Palace",
    "Chaat Corner",
    "Paya House",
  ]

  // List of areas
  const areas = [
    "Gulberg",
    "DHA Phase 5",
    "Johar Town",
    "MM Alam Road",
    "Bahria Town",
    "Model Town",
    "Cantt",
    "Faisal Town",
    "Shadman",
    "Garden Town",
    "Allama Iqbal Town",
    "Wapda Town",
    "Valencia",
    "Askari",
    "Cavalry Ground",
  ]

  // Generate data for competitors
  const competitors: CompetitorData[] = []

  // First, add our branches with random data
  actualBranches.forEach((branch) => {
    const today = Math.floor(Math.random() * 20) + 5
    const thisWeek = today + Math.floor(Math.random() * 50) + 20
    const thisMonth = thisWeek + Math.floor(Math.random() * 150) + 50

    competitors.push({
      id: `our-${branch.toLowerCase().replace(/\s+/g, "-")}`,
      name: "Khapey Restaurant",
      branch,
      logo: "/images/khapey-icon.png",
      isOurBranch: true,
      fiveStarReviews: {
        today,
        thisWeek,
        thisMonth,
      },
    })
  })

  // Then add competitor restaurants
  for (let i = 0; i < 20; i++) {
    const name = competitorNames[i]
    const branch = areas[Math.floor(Math.random() * areas.length)]

    // Generate random review counts
    const today = Math.floor(Math.random() * 30) + 1
    const thisWeek = today + Math.floor(Math.random() * 70) + 10
    const thisMonth = thisWeek + Math.floor(Math.random() * 200) + 30

    competitors.push({
      id: `competitor-${i}`,
      name,
      branch,
      logo: `/placeholder.svg?height=40&width=40&text=${name.charAt(0)}`,
      isOurBranch: false,
      fiveStarReviews: {
        today,
        thisWeek,
        thisMonth,
      },
    })
  }

  return competitors
}

// Update the CompetitionTable component to use the same time filter naming convention as other tabs
export function CompetitionTable() {
  const [timeFilter, setTimeFilter] = useState<"today" | "thisWeek" | "thisMonth">("thisMonth")
  // Memoize competitor data generation with a stable reference
  const competitorData = useMemo(() => {
    // Use a fixed seed for random data to ensure consistency between renders
    const seed = "competition-data-seed"
    return generateCompetitorData(seed)
  }, [])

  // Sort competitors by the selected time filter
  const sortedCompetitors = useMemo(() => {
    return [...competitorData].sort((a, b) => b.fiveStarReviews[timeFilter] - a.fiveStarReviews[timeFilter])
  }, [competitorData, timeFilter])

  // Get top 10 competitors
  const top10Competitors = sortedCompetitors.slice(0, 10)

  // Check if any of our branches are in the top 10
  const ourBranchesInTop10 = top10Competitors.filter((c) => c.isOurBranch)

  // Get our branches that are not in the top 10
  const ourBranchesNotInTop10 = sortedCompetitors
    .filter((c) => c.isOurBranch && !top10Competitors.includes(c))
    .map((branch) => {
      const position = sortedCompetitors.indexOf(branch) + 1
      return { ...branch, position }
    })

  // Then replace the renderCompetitorRow function with:
  const renderCompetitorRow = (competitor: CompetitorData, position: number) => (
    <CompetitorRow key={competitor.id} competitor={competitor} position={position} timeFilter={timeFilter} />
  )

  return (
    <ErrorBoundary componentName="Competition Table">
      {/* Time filters outside the card */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
        <h2 className="text-lg font-semibold">Top Restaurants by 5-Star Reviews</h2>
        <div className="flex items-center space-x-1 md:space-x-2 overflow-x-auto hide-scrollbar max-w-full">
          <Button
            variant={timeFilter === "today" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeFilter("today")}
            className="text-xs h-8 md:h-9 px-3 md:px-4 whitespace-nowrap"
          >
            Today
          </Button>
          <Button
            variant={timeFilter === "thisWeek" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeFilter("thisWeek")}
            className="text-xs h-8 md:h-9 px-3 md:px-4 whitespace-nowrap"
          >
            This Week
          </Button>
          <Button
            variant={timeFilter === "thisMonth" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeFilter("thisMonth")}
            className="text-xs h-8 md:h-9 px-3 md:px-4 whitespace-nowrap"
          >
            This Month
          </Button>
        </div>
      </div>

      <Card className="w-full">
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto hide-scrollbar">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px] md:w-[80px] text-center p-2 md:p-4 text-xs md:text-sm">
                    Position
                  </TableHead>
                  <TableHead className="p-2 md:p-4 text-xs md:text-sm">Restaurant</TableHead>
                  <TableHead className="text-right p-2 md:p-4 text-xs md:text-sm">5-Star Reviews</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {top10Competitors.map((competitor, index) => renderCompetitorRow(competitor, index + 1))}
              </TableBody>
            </Table>
          </div>

          {/* Show our branches that are not in top 10 */}
          {ourBranchesNotInTop10.length > 0 && (
            <div className="border-t">
              <div className="p-3 md:p-4">
                <div className="flex items-center gap-2 mb-2 md:mb-3">
                  <Info className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                  <h3 className="text-xs md:text-sm font-medium">Your Other Branches</h3>
                </div>
              </div>
              <div className="w-full overflow-x-auto hide-scrollbar">
                <Table className="w-full">
                  <TableBody>
                    {ourBranchesNotInTop10.map((branch) => renderCompetitorRow(branch, branch.position))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </ErrorBoundary>
  )
}
