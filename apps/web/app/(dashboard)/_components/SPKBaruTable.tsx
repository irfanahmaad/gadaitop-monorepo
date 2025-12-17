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

interface SPKBaru {
  id: string
  spkNumber: string
  nominalDibayar: number
  customerName: string
}

interface SPKBaruTableProps {
  data: SPKBaru[]
}

export function SPKBaruTable({ data }: SPKBaruTableProps) {
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nomor SPK</TableHead>
              <TableHead className="text-right">Nominal Dibayar</TableHead>
              <TableHead>Nama Customer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((spk) => (
              <TableRow key={spk.id}>
                <TableCell className="font-medium">{spk.spkNumber}</TableCell>
                <TableCell className="text-right">
                  <span className="font-medium">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(spk.nominalDibayar)}
                  </span>
                </TableCell>
                <TableCell>{spk.customerName}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
