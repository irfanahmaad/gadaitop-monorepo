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

interface NKBBaru {
  id: string
  nkbNumber: string
  nominalDibayar: number
  jenis: string
  status: string
}

interface NKBBaruTableProps {
  data: NKBBaru[]
}

export function NKBBaruTable({ data }: NKBBaruTableProps) {
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nomor NKB</TableHead>
              <TableHead className="text-right">Nominal Dibayar</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((nkb) => (
              <TableRow key={nkb.id}>
                <TableCell className="font-medium">{nkb.nkbNumber}</TableCell>
                <TableCell className="text-right">
                  <span className="font-medium">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(nkb.nominalDibayar)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{nkb.jenis}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      nkb.status === "Lunas"
                        ? "secondary"
                        : nkb.status === "Berjalan"
                          ? "default"
                          : "destructive"
                    }
                  >
                    {nkb.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
