"use client"

import type React from "react"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileFilterSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  branchFilter: string | "all"
  onBranchSelect: (branch: string | "all") => void
  branchNames: string[]
  trigger?: React.ReactNode
}

export function MobileFilterSheet({
  isOpen,
  onOpenChange,
  branchFilter,
  onBranchSelect,
  branchNames,
  trigger,
}: MobileFilterSheetProps) {
  const isMobile = useIsMobile()

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn("p-0 flex flex-col", isMobile ? "w-full h-auto max-h-[85vh]" : "w-[320px] sm:max-w-md")}
      >
        {/* Header - Fixed at top */}
        <div className="sticky top-0 z-20 bg-white border-b p-4 pb-3 shadow-sm">
          <SheetTitle className="text-lg font-semibold">Select Branch</SheetTitle>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="py-1">
            <button
              className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 ${
                branchFilter === "all" ? "bg-muted" : ""
              }`}
              onClick={() => {
                onBranchSelect("all")
                onOpenChange(false)
              }}
            >
              <span>All Branches</span>
              {branchFilter === "all" && <Check className="h-4 w-4" />}
            </button>
            {branchNames.map((branch) => (
              <button
                key={branch}
                className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 ${
                  branchFilter === branch ? "bg-muted" : ""
                }`}
                onClick={() => {
                  onBranchSelect(branch)
                  onOpenChange(false)
                }}
              >
                <span>{branch}</span>
                {branchFilter === branch && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
