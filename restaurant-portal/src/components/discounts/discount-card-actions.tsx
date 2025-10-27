"use client"

import { useState } from "react"
import { MoreVertical, Edit, XCircle, CheckCircle2, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MobileSheet, MobileSheetItem } from "@/components/ui/mobile-sheet"
import { useIsMobile } from "@/hooks/use-mobile"

// Update the props interface to include permissions
interface DiscountCardActionsProps {
  onEdit: () => void
  onDelete: () => void
  onToggleStatus: () => void
  isActive: boolean
  permissions?: {
    edit: boolean
    toggleStatus: boolean
    delete: boolean
  }
}

// Update the component to check permissions
export function DiscountCardActions({
  onEdit,
  onDelete,
  onToggleStatus,
  isActive,
  permissions = { edit: true, toggleStatus: true, delete: true },
}: DiscountCardActionsProps) {
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

  // If no permissions are granted, don't render the menu at all
  if (!permissions.edit && !permissions.toggleStatus && !permissions.delete) {
    return null
  }

  // Mobile view with sheet
  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation()
            setSheetOpen(true)
          }}
        >
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>

        <MobileSheet open={sheetOpen} onOpenChange={setSheetOpen} title="Discount Options">
          {permissions.edit && (
            <MobileSheetItem icon={<Edit className="h-4 w-4" />} label="Edit" onClick={handleEdit} />
          )}

          {permissions.toggleStatus && (
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
          )}

          {permissions.delete && (
            <MobileSheetItem icon={<Trash className="h-4 w-4" />} label="Delete" onClick={handleDelete} destructive />
          )}
        </MobileSheet>
      </>
    )
  }

  // Desktop dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {permissions.edit && (
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}

        {permissions.toggleStatus && (
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
        )}

        {(permissions.edit || permissions.toggleStatus) && permissions.delete && <DropdownMenuSeparator />}

        {permissions.delete && (
          <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
