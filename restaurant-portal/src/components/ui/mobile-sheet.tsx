"use client"

import type * as React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface MobileSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  className?: string
  description?: string
}

export function MobileSheet({ open, onOpenChange, title, children, className, description }: MobileSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className={cn("p-0 max-h-[90vh] h-auto rounded-t-xl", className)}>
        <SheetHeader className="border-b py-4 px-4">
          <SheetTitle>{title}</SheetTitle>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </SheetHeader>
        <div className="px-4 py-4 overflow-y-auto">{children}</div>
      </SheetContent>
    </Sheet>
  )
}

export function MobileSheetItem({
  icon,
  label,
  onClick,
  destructive = false,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  destructive?: boolean
}) {
  return (
    <button
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-left border-b border-gray-100",
        destructive ? "text-destructive" : "",
      )}
      onClick={onClick}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span>{label}</span>
    </button>
  )
}

export function MobileSheetFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-t py-4 px-4 mt-auto sticky bottom-0 bg-background">
      <div className="flex justify-end gap-2">{children}</div>
    </div>
  )
}
