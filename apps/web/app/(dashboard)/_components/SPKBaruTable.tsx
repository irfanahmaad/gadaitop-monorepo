import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Badge } from "@workspace/ui/components/badge"
import type { Spk } from "@/lib/api/types"

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  active: "default",
  extended: "secondary",
  redeemed: "secondary",
  overdue: "destructive",
  auctioned: "destructive",
  closed: "outline",
}

interface SPKBaruTableProps {
  data?: Spk[]
  isLoading?: boolean
}

export function SPKBaruTable({ data, isLoading }: SPKBaruTableProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle>SPK Baru</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !data?.length ? (
          <div className="flex h-24 items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Tidak ada SPK baru hari ini
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomor SPK</TableHead>
                <TableHead className="text-right">Nominal</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((spk) => (
                <TableRow key={spk.id}>
                  <TableCell className="font-medium">
                    {spk.spkNumber}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(spk.principalAmount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {spk?.customer?.name ?? "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[spk.status] ?? "outline"}>
                      {spk.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
