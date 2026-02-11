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
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import type { Nkb } from "@/lib/api/types"

const TYPE_LABELS: Record<string, string> = {
  extension: "Perpanjangan",
  redemption: "Pelunasan",
  partial_payment: "Cicilan",
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  confirmed: "secondary",
  rejected: "destructive",
  cancelled: "outline",
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu",
  confirmed: "Dikonfirmasi",
  rejected: "Ditolak",
  cancelled: "Dibatalkan",
}

interface NKBBaruTableProps {
  data?: Nkb[]
  isLoading?: boolean
}

export function NKBBaruTable({ data, isLoading }: NKBBaruTableProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle>NKB Baru</CardTitle>
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
              Tidak ada NKB baru hari ini
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomor NKB</TableHead>
                <TableHead className="text-right">Nominal</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((nkb) => (
                <TableRow key={nkb.id}>
                  <TableCell className="font-medium">
                    {nkb.nkbNumber}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(nkb.amount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {TYPE_LABELS[nkb.type] ?? nkb.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={STATUS_VARIANT[nkb.status] ?? "outline"}
                    >
                      {STATUS_LABELS[nkb.status] ?? nkb.status}
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
