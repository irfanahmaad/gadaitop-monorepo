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

interface SPKJatuhTempo {
  id: string
  no: number
  foto: string
  spkNumber: string
  customerName: string
  jumlahSPK: number
  sisaSPK: number
  tanggalWaktuSPK: string
}

interface SPKJatuhTempoTableProps {
  data: SPKJatuhTempo[]
}

export function SPKJatuhTempoTable({ data }: SPKJatuhTempoTableProps) {
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">No</TableHead>
              <TableHead className="w-[80px]">Foto</TableHead>
              <TableHead>Nomor SPK</TableHead>
              <TableHead>Nama Customer</TableHead>
              <TableHead>Jumlah SPK</TableHead>
              <TableHead>Sisa SPK</TableHead>
              <TableHead>Tanggal & Waktu SPK</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((spk) => (
              <TableRow key={spk.id}>
                <TableCell>{spk.no}</TableCell>
                <TableCell>
                  <Avatar>
                    <AvatarImage src={spk.foto} alt={spk.customerName} />
                    <AvatarFallback>
                      {spk.customerName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>{spk.spkNumber}</TableCell>
                <TableCell>{spk.customerName}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(spk.jumlahSPK)}
                </TableCell>
                <TableCell>{spk.sisaSPK}</TableCell>
                <TableCell>
                  {new Date(spk.tanggalWaktuSPK).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
