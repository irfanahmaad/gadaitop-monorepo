import { type StaticImageData } from "next/image"
import { MetricCard } from "./MetricCard"

interface Metric {
  title: string
  value: string
  icon: string | StaticImageData
}

interface MetricsGridProps {
  metrics: Metric[]
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.title}
          title={metric.title}
          value={metric.value}
          icon={metric.icon}
        />
      ))}
    </div>
  )
}
