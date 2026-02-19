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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Skeleton } from "@workspace/ui/components/skeleton"
import type { Spk } from "@/lib/api/types"

interface SPKJatuhTempoTableProps {
  data?: Spk[]
  isLoading?: boolean
}

export function SPKJatuhTempoTable({
  data,
  isLoading,
}: SPKJatuhTempoTableProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle>Daftar SPK Jatuh Tempo Hari ini</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !data?.length ? (
          <div className="flex h-24 items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Tidak ada SPK jatuh tempo hari ini
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">No</TableHead>
                <TableHead className="w-[80px]">Foto</TableHead>
                <TableHead>Nomor SPK</TableHead>
                <TableHead>Nama Customer</TableHead>
                <TableHead>Jumlah SPK</TableHead>
                <TableHead>Tenor (Hari)</TableHead>
                <TableHead>Jatuh Tempo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((spk, index) => {
                const customerName = spk.customer?.name ?? "-"
                return (
                  <TableRow key={spk.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Avatar>
                        <AvatarImage
                          src={spk.customer?.ktpPhotoUrl ?? undefined}
                          alt={customerName}
                        />
                        <AvatarFallback>
                          {customerName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>{spk.spkNumber}</TableCell>
                    <TableCell>{customerName}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(spk.totalAmount)}
                    </TableCell>
                    <TableCell>{spk.tenor}</TableCell>
                    <TableCell>
                      {new Date(spk.dueDate).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
