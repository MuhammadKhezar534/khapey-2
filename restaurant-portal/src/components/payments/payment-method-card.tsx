"use client"

import { CreditCard, MoreVertical, Smartphone, Check, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface PaymentMethod {
  id: string
  type: string
  last4: string
  expiryDate: string
  brand: string
  isDefault: boolean
}

interface PaymentMethodCardProps {
  method: PaymentMethod
  onSetDefault?: (id: string) => void
  onDelete?: (id: string) => void
  compact?: boolean
}

export function PaymentMethodCard({ method, onSetDefault, onDelete, compact = false }: PaymentMethodCardProps) {
  const { id, type, last4, expiryDate, brand, isDefault } = method

  const handleSetDefault = () => {
    if (onSetDefault) {
      onSetDefault(id)
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id)
    }
  }

  return (
    <div className="flex items-center justify-between border rounded-md p-3">
      <div className="flex items-center space-x-3">
        {type === "card" ? (
          <CreditCard className="h-5 w-5 text-muted-foreground" />
        ) : (
          <Smartphone className="h-5 w-5 text-muted-foreground" />
        )}
        <div>
          <div className="flex items-center">
            <p className="font-medium text-sm">
              {brand} •••• {last4}
            </p>
            {isDefault && (
              <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 text-xs">
                Default
              </Badge>
            )}
          </div>
          {!compact && (
            <p className="text-xs text-muted-foreground">
              {type === "card" ? `Expires ${expiryDate}` : type === "easypaisa" ? "Easypaisa" : "JazzCash"}
            </p>
          )}
        </div>
      </div>

      {/* Only show dropdown if there are actions available */}
      {!isDefault && (onSetDefault || onDelete) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onSetDefault && (
              <DropdownMenuItem onClick={handleSetDefault}>
                <Check className="mr-2 h-4 w-4" /> Set as default
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
