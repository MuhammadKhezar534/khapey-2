"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, ThumbsUp, ThumbsDown, Bookmark, Share2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { sanitizeString } from "@/utils/security"

interface ReviewMedia {
  type: "image" | "video"
  url: string
}

interface ReviewCardProps {
  review: {
    id: string
    userName: string
    phoneNumber?: string
    branch: string
    caption: string
    rating: number
    billAmount: number
    likes: number
    dislikes: number
    saves: number
    shares: number
    date: Date
    media: ReviewMedia[]
  }
  onViewDetails: () => void
  onViewMedia?: (media: ReviewMedia[], initialIndex: number) => void
  className?: string
  compact?: boolean
}

export function ReviewCard({ review, onViewDetails, onViewMedia, className, compact = false }: ReviewCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className={cn("p-4", compact && "p-3")}>
        {/* Header with user info and rating */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Avatar className={cn("h-10 w-10", compact && "h-8 w-8")}>
              <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className={cn("font-medium", compact && "text-sm")}>{review.userName}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{review.branch}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(review.date, { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center bg-primary/10 text-primary rounded-md px-2 py-1">
            <Star className="h-3.5 w-3.5 mr-1 text-yellow-500 fill-yellow-500" />
            <span className="font-medium text-sm">{review.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Review content */}
        <p className={cn("text-sm mb-3 line-clamp-3", compact && "line-clamp-2")}>{sanitizeString(review.caption)}</p>

        {/* Media preview */}
        {review.media.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto hide-scrollbar">
            {review.media.slice(0, compact ? 2 : 3).map((item, index) => (
              <button
                key={index}
                className="flex-shrink-0 relative h-16 w-20 rounded overflow-hidden border border-gray-200"
                onClick={() => onViewMedia && onViewMedia(review.media, index)}
              >
                {item.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
                    <div className="h-6 w-6 rounded-full bg-white/80 flex items-center justify-center">
                      <div className="h-0 w-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-black border-b-[5px] border-b-transparent ml-0.5"></div>
                    </div>
                  </div>
                )}
                <Image
                  src={item.url || "/placeholder.svg"}
                  alt={`Review media ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
            {review.media.length > (compact ? 2 : 3) && (
              <button
                className="flex-shrink-0 relative h-16 w-20 rounded overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-50"
                onClick={() => onViewMedia && onViewMedia(review.media, compact ? 2 : 3)}
              >
                <span className="text-sm font-medium">+{review.media.length - (compact ? 2 : 3)}</span>
              </button>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-3 w-3" />
            <span>{review.likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <ThumbsDown className="h-3 w-3" />
            <span>{review.dislikes}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bookmark className="h-3 w-3" />
            <span>{review.saves}</span>
          </div>
          <div className="flex items-center gap-1">
            <Share2 className="h-3 w-3" />
            <span>{review.shares}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-4 py-3 border-t flex justify-end">
        <Button variant="outline" size="sm" onClick={onViewDetails}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}
