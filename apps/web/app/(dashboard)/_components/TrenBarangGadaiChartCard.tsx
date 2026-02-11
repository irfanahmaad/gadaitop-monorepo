import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@workspace/ui/components/chart"
import { Skeleton } from "@workspace/ui/components/skeleton"
import type { MutationTrend } from "@/lib/api/types"

const trenChartConfig = {
  creditTotal: {
    label: "Kredit",
    color: "#10b981", // green
  },
  debitTotal: {
    label: "Debit",
    color: "#ef4444", // red
  },
  net: {
    label: "Netto",
    color: "#3b82f6", // blue
  },
} satisfies ChartConfig

interface TrenBarangGadaiChartCardProps {
  data?: MutationTrend[]
  isLoading?: boolean
}

export function TrenBarangGadaiChartCard({
  data,
  isLoading,
}: TrenBarangGadaiChartCardProps) {
  const chartData = (data ?? []).map((item) => ({
    ...item,
    // Format date for display (e.g. "12 Jan")
    label: new Date(item.date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    }),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tren Mutasi Kas</CardTitle>
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
            config={trenChartConfig}
            className="min-h-[300px] w-full"
          >
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                type="monotone"
                dataKey="creditTotal"
                stroke="var(--color-creditTotal)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="debitTotal"
                stroke="var(--color-debitTotal)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="net"
                stroke="var(--color-net)"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
