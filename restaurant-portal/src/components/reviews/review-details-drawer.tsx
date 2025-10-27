"use client"

import { Sheet, SheetContent, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { X, Star, ThumbsUp, ThumbsDown, Bookmark, Share2, DollarSign, Calendar } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"

interface ReviewDetailsDrawerProps {
  isOpen: boolean
  onClose: () => void
  review: any | null
}

export function ReviewDetailsDrawer({ isOpen, onClose, review }: ReviewDetailsDrawerProps) {
  if (!review) return null

  // Mock questions and answers for the review
  const questionsAndAnswers = [
    {
      question: "How was the food quality?",
      answer: "Excellent",
      rating: 4.8,
    },
    {
      question: "How was the service?",
      answer: "Very attentive",
      rating: 4.5,
    },
    {
      question: "How was the ambiance?",
      answer: "Cozy and elegant",
      rating: 4.7,
    },
    {
      question: "Was the price reasonable?",
      answer: "Yes, worth it",
      rating: 4.2,
    },
    {
      question: "Would you recommend to others?",
      answer: "Definitely",
      rating: 4.9,
    },
  ]

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto p-0">
        {/* Header with customer info */}
        <div className="sticky top-0 z-10 bg-white border-b p-4 pb-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <SheetTitle className="text-lg">Review Details</SheetTitle>
            <SheetClose asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full hover:bg-muted" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>

          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm">{review.userName}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate">{review.phoneNumber}</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center bg-primary/10 text-primary rounded-md px-2 py-1">
                <Star className="h-3.5 w-3.5 mr-1 text-yellow-500 fill-yellow-500" />
                <span className="font-medium text-sm">{review.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center mt-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{formatDistanceToNow(review.date, { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-5">
          {/* Review content */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border/40">
            <p className="text-sm leading-relaxed">{review.caption}</p>
          </div>

          {/* Media */}
          {review.media && review.media.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Media</h4>
              <div className="grid grid-cols-3 gap-2">
                {review.media.map((item: any, index: number) => (
                  <div key={index} className="relative aspect-video rounded-md overflow-hidden border border-border/70">
                    <Image
                      src={item.url || "/placeholder.svg"}
                      alt={`Review media ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bill amount and engagement stats */}
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium">Bill Amount</span>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="font-medium">Rs {review.billAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-2 bg-muted/50 rounded-md">
                <ThumbsUp className="h-4 w-4 mb-1 text-primary/70" />
                <span className="text-sm font-medium">{review.likes}</span>
                <span className="text-xs text-muted-foreground">Likes</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-muted/50 rounded-md">
                <ThumbsDown className="h-4 w-4 mb-1 text-primary/70" />
                <span className="text-sm font-medium">{review.dislikes}</span>
                <span className="text-xs text-muted-foreground">Dislikes</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-muted/50 rounded-md">
                <Bookmark className="h-4 w-4 mb-1 text-primary/70" />
                <span className="text-sm font-medium">{review.saves}</span>
                <span className="text-xs text-muted-foreground">Saves</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-muted/50 rounded-md">
                <Share2 className="h-4 w-4 mb-1 text-primary/70" />
                <span className="text-sm font-medium">{review.shares}</span>
                <span className="text-xs text-muted-foreground">Shares</span>
              </div>
            </div>
          </div>

          {/* Questions and answers */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Questions Answered</h4>
            <div className="space-y-3">
              {questionsAndAnswers.map((qa, index) => (
                <div key={index} className={`p-3 bg-muted/50 rounded-md ${index > 0 ? "mt-3" : ""}`}>
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium">{qa.question}</span>
                    <div className="flex items-center bg-white border border-gray-200 px-2.5 py-0.5 rounded-full shadow-sm">
                      <Star className="h-3.5 w-3.5 mr-1 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">{qa.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="mt-2 font-normal bg-white">
                    {qa.answer}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
