import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart"
import { Skeleton } from "@workspace/ui/components/skeleton"
import type { SpkByStatusChart } from "@/lib/api/types"

// Color mapping for SPK statuses
const STATUS_COLORS: Record<string, string> = {
  draft: "#94a3b8",
  active: "#3b82f6",
  extended: "#8b5cf6",
  redeemed: "#10b981",
  overdue: "#ef4444",
  auctioned: "#f59e0b",
  closed: "#6b7280",
}

// Label mapping for SPK statuses
const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  active: "Aktif",
  extended: "Diperpanjang",
  redeemed: "Ditebus",
  overdue: "Jatuh Tempo",
  auctioned: "Dilelang",
  closed: "Ditutup",
}

interface SPKOverdueChartCardProps {
  data?: SpkByStatusChart[]
  isLoading?: boolean
}

export function SPKOverdueChartCard({
  data,
  isLoading,
}: SPKOverdueChartCardProps) {
  const chartData = (data ?? []).map((item) => ({
    name: STATUS_LABELS[item.status] ?? item.status,
    value: item.count,
    fill: STATUS_COLORS[item.status] ?? "#94a3b8",
  }))

  const chartConfig = chartData.reduce(
    (acc, item) => {
      acc[item.name] = {
        label: item.name,
        color: item.fill,
      }
      return acc
    },
    {} as Record<string, { label: string; color: string }>
  ) satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <CardTitle>SPK Jatuh Tempo & Overdue</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : chartData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Tidak ada data tersedia
            </p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="min-h-[300px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{ left: 0, right: 20 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                width={140}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
