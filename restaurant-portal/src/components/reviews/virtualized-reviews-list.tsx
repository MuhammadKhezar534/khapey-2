"use client"

import { useVirtualizer } from "@tanstack/react-virtual"
import { useRef, useState, useEffect } from "react"
import { ReviewCard } from "./review-card"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface VirtualizedReviewsListProps {
  reviews: any[]
  onReviewClick: (review: any) => void
  className?: string
}

export function VirtualizedReviewsList({ reviews, onReviewClick, className }: VirtualizedReviewsListProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [showAll, setShowAll] = useState(false)
  const initialCount = 3

  // Show only first few reviews initially
  const displayedReviews = showAll ? reviews : reviews.slice(0, initialCount)

  const rowVirtualizer = useVirtualizer({
    count: displayedReviews.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180, // Estimated height of each review card
    overscan: 5,
  })

  // Reset virtualizer when displayedReviews changes
  useEffect(() => {
    rowVirtualizer.measure()
  }, [displayedReviews.length, rowVirtualizer])

  return (
    <div className={cn("flex flex-col", className)}>
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{
          height: showAll ? "600px" : `${Math.min(displayedReviews.length * 180, 600)}px`,
          maxHeight: "600px",
        }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const review = displayedReviews[virtualRow.index]
            return (
              <div
                key={virtualRow.index}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div className="p-2">
                  <ReviewCard review={review} onClick={() => onReviewClick(review)} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {reviews.length > initialCount && (
        <Button
          variant="ghost"
          className="mt-2 w-full flex items-center justify-center"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show less" : "Show all reviews"}
          <ChevronDown className={cn("ml-2 h-4 w-4 transition-transform", showAll && "rotate-180")} />
        </Button>
      )}
    </div>
  )
}
