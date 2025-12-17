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

// SPK Overdue Chart Data and Config
const spkOverdueData = [
  { name: "Overdue 3 Hari", value: 28, fill: "#fbbf24" },
  { name: "Overdue 4-7 Hari", value: 21, fill: "#3b82f6" },
  { name: "Overdue > 7 Hari", value: 15, fill: "#10b981" },
]

const spkOverdueConfig = {
  "Overdue 3 Hari": {
    label: "Overdue 3 Hari",
    color: "#fbbf24", // yellow
  },
  "Overdue 4-7 Hari": {
    label: "Overdue 4-7 Hari",
    color: "#3b82f6", // blue
  },
  "Overdue > 7 Hari": {
    label: "Overdue > 7 Hari",
    color: "#10b981", // green
  },
} satisfies ChartConfig

export function SPKOverdueChartCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>SPK Jatuh Tempo & Overdue</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={spkOverdueConfig}
          className="min-h-[300px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={spkOverdueData}
            layout="vertical"
            margin={{ left: 0, right: 20 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis
              type="number"
              domain={[0, 80]}
              tickCount={9}
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
              {spkOverdueData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
