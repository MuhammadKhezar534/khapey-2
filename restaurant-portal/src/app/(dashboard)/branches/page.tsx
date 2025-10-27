import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BranchesPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Branch Locations</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Branch Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">No branches to display</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
