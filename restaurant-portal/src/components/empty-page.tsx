import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface EmptyPageProps {
  title: string
  description: string
}

export function EmptyPage({ title, description }: EmptyPageProps) {
  return (
    <Card>
      <CardHeader className="p-3 md:p-4">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 md:p-4">
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
