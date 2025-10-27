"use client"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, ThumbsUp, ThumbsDown, Bookmark, Share2, DollarSign, MapPin, Play } from "lucide-react"
import Image from "next/image"
import { SkeletonReviewCard } from "@/components/ui/skeleton-card"

interface FeaturedReviewsProps {
  reviews: any[]
  isLoading: boolean
  isRefreshing: boolean
  selectedBranch: string
  displayBranchName: string
  handleOpenMedia: (media: Array<{ type: "image" | "video"; url: string }>, initialIndex?: number) => void
}

export function FeaturedReviews({
  reviews,
  isLoading,
  isRefreshing,
  selectedBranch,
  displayBranchName,
  handleOpenMedia,
}: FeaturedReviewsProps) {
  return (
    <div className="mt-3">
      <h2 className="text-lg font-semibold mb-3">
        {selectedBranch ? `Featured Reviews for ${displayBranchName}` : "Featured Reviews"}
      </h2>

      {isLoading || isRefreshing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonReviewCard key={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((review, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="flex items-center text-base">
                  <review.icon className="h-4 w-4 text-primary mr-2" />
                  {review.type}
                </CardTitle>
                <div className="flex items-center mt-1">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-sm font-medium">{review.rating.toFixed(1)}</span>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <p className="text-sm mb-4">{review.caption}</p>

                {/* Review media thumbnails - with controlled z-index */}
                {review.media.length > 0 && (
                  <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar pb-1 relative z-0">
                    {review.media.map((item: any, mediaIndex: number) => (
                      <button
                        key={mediaIndex}
                        className="flex-shrink-0 relative h-20 w-32 rounded overflow-hidden border border-gray-200 group"
                        onClick={() => handleOpenMedia(review.media, mediaIndex)}
                      >
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-[1] flex items-center justify-center">
                          {item.type === "video" && (
                            <div className="bg-black/50 rounded-full p-1">
                              <Play className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                        <Image
                          src={item.url || "/placeholder.svg"}
                          alt={`Review media ${mediaIndex + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Bill amount */}
                <div className="flex items-center text-xs text-muted-foreground mb-3">
                  <DollarSign className="h-3.5 w-3.5 mr-1" />
                  <span>Total Bill: Rs {review.totalBill.toLocaleString()}</span>
                </div>

                {/* Engagement stats */}
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                    <span>{review.likes}</span>
                  </div>
                  <div className="flex items-center">
                    <ThumbsDown className="h-3.5 w-3.5 mr-1" />
                    <span>{review.dislikes}</span>
                  </div>
                  <div className="flex items-center">
                    <Bookmark className="h-3.5 w-3.5 mr-1" />
                    <span>{review.saves}</span>
                  </div>
                  <div className="flex items-center">
                    <Share2 className="h-3.5 w-3.5 mr-1" />
                    <span>{review.shares}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-3 border-t flex items-end justify-between">
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{review.userName}</span>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  <span>{review.branch}</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
