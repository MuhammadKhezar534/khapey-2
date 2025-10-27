"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { Discount } from "@/types/discounts"

interface PercentageDealFormProps {
  data: Partial<Discount>
  updateData: (data: Partial<Discount>) => void
}

export function PercentageDealForm({ data, updateData }: PercentageDealFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Discount Title</Label>
        <Input
          id="title"
          value={data.title || ""}
          onChange={(e) => updateData({ title: e.target.value })}
          placeholder="e.g., Summer Sale 20% Off"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="percentage">Discount Percentage</Label>
        <div className="flex items-center">
          <Input
            id="percentage"
            type="number"
            min={1}
            max={100}
            value={data.percentage || ""}
            onChange={(e) => updateData({ percentage: Number(e.target.value) })}
            className="w-24"
          />
          <span className="ml-2">%</span>
        </div>
        <p className="text-xs text-muted-foreground">Enter a percentage between 1 and 100</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="maxAmount">Maximum Discount Amount</Label>
          <p className="text-xs text-muted-foreground">Set a maximum limit for this discount</p>
        </div>
        <div className="flex items-center">
          <span className="mr-2">Rs</span>
          <Input
            id="maxAmount"
            type="number"
            min={0}
            value={data.maxAmount || ""}
            onChange={(e) => updateData({ maxAmount: Number(e.target.value) })}
            className="w-24"
            placeholder="No limit"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={data.description || ""}
          onChange={(e) => updateData({ description: e.target.value })}
          placeholder="Enter additional details about this discount"
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="forKhapeyUsersOnly"
          checked={data.forKhapeyUsersOnly || false}
          onCheckedChange={(checked) => updateData({ forKhapeyUsersOnly: checked })}
        />
        <Label htmlFor="forKhapeyUsersOnly">Exclusive to Khapey app users</Label>
      </div>
    </div>
  )
}
