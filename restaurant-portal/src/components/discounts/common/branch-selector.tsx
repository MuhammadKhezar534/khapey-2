"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface BranchSelectorProps {
  branches: string[] | { id: string; name: string }[]
  selectedBranches: string[]
  onChange: (value: string[]) => void
}

export function BranchSelector({ branches, selectedBranches, onChange }: BranchSelectorProps) {
  const [open, setOpen] = useState(false)

  // Convert branch data to a consistent format
  const normalizedBranches = branches.map((branch) => {
    if (typeof branch === "string") {
      return { id: branch, name: branch }
    }
    return branch
  })

  const toggleBranch = (branchId: string) => {
    if (selectedBranches.includes(branchId)) {
      onChange(selectedBranches.filter((id) => id !== branchId))
    } else {
      onChange([...selectedBranches, branchId])
    }
  }

  const removeBranch = (branchId: string) => {
    onChange(selectedBranches.filter((id) => id !== branchId))
  }

  const selectAll = () => {
    onChange(normalizedBranches.map((branch) => branch.id))
  }

  const clearAll = () => {
    onChange([])
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            {selectedBranches.length > 0
              ? `${selectedBranches.length} branch${selectedBranches.length !== 1 ? "es" : ""} selected`
              : "Select branches"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search branches..." />
            <CommandList>
              <CommandEmpty>No branch found.</CommandEmpty>
              <div className="flex items-center justify-between border-b px-3 py-2">
                <div className="text-xs text-muted-foreground">
                  {selectedBranches.length} of {normalizedBranches.length} selected
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={selectAll}>
                    Select All
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearAll}>
                    Clear
                  </Button>
                </div>
              </div>
              <CommandGroup className="max-h-60 overflow-auto">
                {normalizedBranches.map((branch) => (
                  <CommandItem key={branch.id} value={branch.id} onSelect={() => toggleBranch(branch.id)}>
                    <Check
                      className={cn("mr-2 h-4 w-4", selectedBranches.includes(branch.id) ? "opacity-100" : "opacity-0")}
                    />
                    {branch.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedBranches.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedBranches.map((branchId) => {
            const branch = normalizedBranches.find((b) => b.id === branchId)
            return (
              <Badge key={branchId} variant="secondary" className="flex items-center gap-1">
                {branch?.name || branchId}
                <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => removeBranch(branchId)}>
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}
