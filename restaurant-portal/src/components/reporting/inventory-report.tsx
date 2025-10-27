import { Package } from "lucide-react"
import { EmptyStateCard } from "@/components/ui/empty-state-card"

export function InventoryReport() {
  return (
    <EmptyStateCard
      title="Inventory Reports"
      icon={<Package className="h-12 w-12 text-muted-foreground/50" />}
      message="Inventory reporting features will be available soon. Check back later for detailed inventory analytics."
    />
  )
}
