"use client"

import { Button } from "@/components/ui/button"
import { ImageIcon, X } from "lucide-react"

interface BillImageUploaderProps {
  billImage: string
  setBillImage: (image: string) => void
}

export function BillImageUploader({ billImage, setBillImage }: BillImageUploaderProps) {
  return (
    <div className="space-y-4">
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

          {/* Use the existing ImageUploader component */}
          <div className="space-y-2">
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
                onPaste={(e) => {
                  const items = e.clipboardData.items
                  for (let i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf("image") !== -1) {
                      const blob = items[i].getAsFile()
                      if (!blob) continue

                      const reader = new FileReader()
                      reader.onload = () => {
                        setBillImage(reader.result as string)
                      }
                      reader.readAsDataURL(blob)
                      break
                    }
                  }
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
    </div>
  )
}
