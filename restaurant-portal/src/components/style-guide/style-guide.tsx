"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { ChartContainer } from "@/components/ui/chart"

const data = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Apr", value: 800 },
  { name: "May", value: 500 },
  { name: "Jun", value: 900 },
]

export function StyleGuide() {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Khapey Style Guide</h1>

      <Tabs defaultValue="components">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
            <div className="flex flex-wrap gap-4">
              <Button>Default Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Badges</h2>
            <div className="flex flex-wrap gap-4">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>This is a basic card component with a header and content.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Another Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Cards are used to group related content and actions.</p>
                </CardContent>
              </Card>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Line Chart</h2>
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: {
                      label: "Value",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="var(--color-value)" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  )
}
