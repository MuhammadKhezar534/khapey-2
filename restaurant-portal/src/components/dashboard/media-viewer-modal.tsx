"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import Image from "next/image"

interface MediaItem {
  type: "image" | "video"
  url: string
}

interface MediaViewerModalProps {
  isOpen: boolean
  onClose: () => void
  media: MediaItem[]
  initialIndex: number
}

export function MediaViewerModal({ isOpen, onClose, media, initialIndex = 0 }: MediaViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  // Reset current index when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
    }
  }, [isOpen, initialIndex])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === "ArrowLeft") {
        navigatePrev()
      } else if (e.key === "ArrowRight") {
        navigateNext()
      } else if (e.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, currentIndex, media.length])

  const navigateNext = () => {
    if (currentIndex < media.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setCurrentIndex(0) // Loop back to the first item
    }
  }

  const navigatePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    } else {
      setCurrentIndex(media.length - 1) // Loop to the last item
    }
  }

  const currentMedia = media.length > 0 ? media[currentIndex] : null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] p-0 bg-black/90 border-none hide-scrollbar">
        <div className="relative flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px] lg:min-h-[500px] ">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-2 right-2 z-50 text-white hover:bg-white/20 rounded-full"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Navigation buttons */}
          {media.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={navigatePrev}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 z-50 text-white hover:bg-white/20 rounded-full"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={navigateNext}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 z-50 text-white hover:bg-white/20 rounded-full"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Media content */}
          <div className="w-full h-full flex items-center justify-center p-4">
            {currentMedia && (
              <>
                {currentMedia.type === "image" ? (
                  <div className="relative w-full h-full max-h-[70vh] flex items-center justify-center">
                    <Image
                      src={currentMedia.url || "/placeholder.svg"}
                      alt={`Media ${currentIndex + 1}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <video src={currentMedia.url} controls autoPlay className="max-w-full max-h-[70vh]" />
                )}
              </>
            )}
          </div>

          {/* Pagination indicator */}
          {media.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
              {media.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${index === currentIndex ? "bg-white" : "bg-white/40"}`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
