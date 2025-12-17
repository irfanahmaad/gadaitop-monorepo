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
  type ChartConfig,
} from "@workspace/ui/components/chart"

// Tren Barang Gadai Chart Data and Config
const trenBarangGadaiData = [
  { category: "Handphone", value: 10 },
  { category: "Drone", value: 26 },
  { category: "Laptop", value: 26 },
  { category: "Sepeda Motor", value: 11 },
  { category: "Komputer", value: 26 },
  { category: "Aksesoris", value: 26 },
  { category: "Perhiasan", value: 42 },
]

const trenBarangGadaiConfig = {
  value: {
    label: "Jumlah",
    color: "#ef4444", // red
  },
} satisfies ChartConfig

export function TrenBarangGadaiChartCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tren Barang Gadai</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={trenBarangGadaiConfig}
          className="min-h-[300px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={trenBarangGadaiData}
            margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis domain={[0, 50]} tickCount={6} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              strokeWidth={2}
              dot={{ fill: "var(--color-value)", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
