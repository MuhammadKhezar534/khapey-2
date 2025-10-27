import { EmptyStateCard } from "@/components/ui/empty-state-card"
import { Users } from "lucide-react"

export function CustomersReport() {
  return (
    <EmptyStateCard
      title="Customer Reports"
      icon={<Users className="h-12 w-12 text-muted-foreground/50" />}
      message="Customer reporting features will be available soon. Check back later for detailed customer analytics."
    />
  )
}
