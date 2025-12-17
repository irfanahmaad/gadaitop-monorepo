import Image, { type StaticImageData } from "next/image"
import { Card, CardContent } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

interface MetricCardProps {
  title: string
  value: string
  icon: string | StaticImageData
}

export function MetricCard({ title, value, icon }: MetricCardProps) {
  return (
    <Card className="py-4 shadow-sm">
      <CardContent className="flex items-center gap-4">
        <div
          className={cn(
            "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-500/50"
          )}
        >
          <Image src={icon} alt={title} fill className="object-contain" />
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-foreground leading-none font-bold">{value}</p>
          <p className="text-muted-foreground line-clamp-2 h-8 text-xs leading-tight">
            {title}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
