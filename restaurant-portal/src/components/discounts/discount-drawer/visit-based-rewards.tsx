"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, X, ImageIcon } from "lucide-react"

interface VisitBasedRewardsProps {
  visitRanges: Array<{
    visits: number
    label: string
    price: number
  }>
  customerVisitCount: number
  qualifiesForVisitDiscount: boolean
  billImage: string
  setBillImage: (image: string) => void
}

export function VisitBasedRewards({
  visitRanges,
  customerVisitCount,
  qualifiesForVisitDiscount,
  billImage,
  setBillImage,
}: VisitBasedRewardsProps) {
  return (
    <div className="space-y-4">
      {qualifiesForVisitDiscount ? (
        <>
          <p className="text-sm text-muted-foreground mb-3">The customer qualifies for the following reward:</p>
          <div className="grid gap-3">
            {visitRanges
              .filter((range) => customerVisitCount >= range.visits) // Only show tiers the customer qualifies for
              .sort((a, b) => b.visits - a.visits) // Sort by highest visit count first
              .slice(0, 1) // Only show the highest tier they qualify for
              .map((range, index) => (
                <div key={index} className="border border-primary rounded-lg p-4 bg-primary/5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-medium">{range.label || `Milestone ${index + 1}`}</h5>
                      <p className="text-sm text-muted-foreground mt-1">{range.visits} visits</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-bold text-primary">Rs {range.price}</span>
                      <Badge variant="secondary" className="text-xs">
                        <Check className="h-3 w-3 mr-1" /> Qualifies
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Bill Image Upload Section for qualified customers */}
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Upload Bill Image (Optional)</h4>
              {billImage && (
                <Button variant="ghost" size="sm" onClick={() => setBillImage("")} className="h-8 px-2 text-xs">
                  Clear
                </Button>
              )}
            </div>

            <div className="relative">
              <div className="w-full">
                <input
                  type="file"
                  id="camera-input"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return

                    const reader = new FileReader()
                    reader.onload = () => {
                      setBillImage(reader.result as string)
                    }
                    reader.readAsDataURL(file)
                  }}
                />

                {billImage ? (
                  <div className="relative rounded-md overflow-hidden border">
                    <img src={billImage || "/placeholder.svg"} alt="Bill" className="w-full h-48 object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full"
                      onClick={() => setBillImage("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => document.getElementById("camera-input")?.click()}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.stopPropagation()

                      const file = e.dataTransfer.files?.[0]
                      if (!file || !file.type.startsWith("image/")) return

                      const reader = new FileReader()
                      reader.onload = () => {
                        setBillImage(reader.result as string)
                      }
                      reader.readAsDataURL(file)
                    }}
                  >
                    <div className="rounded-full bg-primary/10 p-3 mb-3">
                      <ImageIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-medium">Upload bill image</p>
                      <p className="text-xs text-muted-foreground">Drag & drop, paste, or take a photo</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-3">
            The customer needs more visits to qualify for rewards. Here's the next milestone:
          </p>
          <div className="grid gap-3">
            {visitRanges
              .sort((a, b) => a.visits - b.visits) // Sort by lowest visit count first
              .filter((range) => range.visits > customerVisitCount) // Only show tiers they don't qualify for yet
              .slice(0, 1) // Only show the next tier they need to reach
              .map((range, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-medium">{range.label || `Milestone ${index + 1}`}</h5>
                      <p className="text-sm text-muted-foreground mt-1">{range.visits} visits needed</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-bold text-primary">Rs {range.price}</span>
                      <Badge variant="outline" className="text-xs">
                        {range.visits - customerVisitCount} more visits needed
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  )
}
