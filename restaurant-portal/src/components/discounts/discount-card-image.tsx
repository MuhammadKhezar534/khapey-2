"use client"

import { useState } from "react"
import { MoreVertical, Edit, XCircle, CheckCircle2, Trash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MobileSheet, MobileSheetItem } from "@/components/ui/mobile-sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useIsMobile } from "@/hooks/use-mobile"
import { StatusBadge } from "@/components/ui/status-badge"

interface DiscountCardImageProps {
  imageUrl: string | null
  title: string
  status: string
  discountType: string
  onEdit: () => void
  onDelete: () => void
  onToggleStatus: () => void
  isActive: boolean
}

export function DiscountCardImage({
  imageUrl,
  title,
  status,
  discountType,
  onEdit,
  onDelete,
  onToggleStatus,
  isActive,
}: DiscountCardImageProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const isMobile = useIsMobile()

  // Functions to handle actions and close the sheet
  const handleEdit = () => {
    onEdit()
    setSheetOpen(false)
  }

  const handleToggleStatus = () => {
    onToggleStatus()
    setSheetOpen(false)
  }

  const handleDelete = () => {
    onDelete()
    setSheetOpen(false)
  }

  return (
    <div className="relative w-full h-48 overflow-hidden bg-gray-100">
      {/* Use img tag instead of Next.js Image for more reliable rendering */}
      <img
        src={imageUrl || "/placeholder.svg"}
        alt={title || "Discount image"}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
      <div className="absolute top-2 right-2">
        {/* Desktop Dropdown */}
        {!isMobile && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-white/80 backdrop-blur-sm hover:bg-white/90"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleStatus}>
                {isActive ? (
                  <>
                    <XCircle className="mr-2 h-4 w-4 text-amber-500" />
                    Mark as Inactive
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    Mark as Active
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Mobile Button and Sheet */}
        {isMobile && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-white/80 backdrop-blur-sm hover:bg-white/90"
              onClick={(e) => {
                e.stopPropagation()
                setSheetOpen(true)
              }}
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>

            <MobileSheet open={sheetOpen} onOpenChange={setSheetOpen} title="Discount Options">
              <MobileSheetItem icon={<Edit className="h-4 w-4" />} label="Edit" onClick={handleEdit} />
              <MobileSheetItem
                icon={
                  isActive ? (
                    <XCircle className="h-4 w-4 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )
                }
                label={isActive ? "Mark as Inactive" : "Mark as Active"}
                onClick={handleToggleStatus}
              />
              <MobileSheetItem icon={<Trash className="h-4 w-4" />} label="Delete" onClick={handleDelete} destructive />
            </MobileSheet>
          </>
        )}
      </div>
      <div className="absolute top-2 left-2 flex gap-2">
        <StatusBadge status={status as any} className="backdrop-blur-sm" />
        <Badge variant="secondary" className="text-xs font-normal bg-white/80 backdrop-blur-sm">
          {discountType}
        </Badge>
      </div>
    </div>
  )
}
