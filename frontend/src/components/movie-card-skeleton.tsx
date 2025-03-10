import { Card, CardContent } from "@/components/ui/card"

export default function MovieCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[2/3] bg-gray-200 animate-pulse" />
      <CardContent className="p-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
      </CardContent>
    </Card>
  )
}

