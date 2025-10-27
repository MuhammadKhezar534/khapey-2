interface LoyaltyTiersProps {
  fixedRanges: Array<{
    label: string
    minDays: number
    maxDays: number
    price: number
    description?: string
  }>
}

export function LoyaltyTiers({ fixedRanges }: LoyaltyTiersProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Loyalty Tiers</h4>
      <div className="grid gap-3">
        {fixedRanges.map((range, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h5 className="font-medium">{range.label || `Tier ${index + 1}`}</h5>
                <p className="text-sm text-muted-foreground mt-1">
                  {range.minDays}-{range.maxDays} days
                </p>
                {range.description && <p className="text-xs text-muted-foreground mt-1">{range.description}</p>}
              </div>
              <span className="font-bold text-primary">Rs {range.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
