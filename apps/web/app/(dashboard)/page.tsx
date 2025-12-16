"use client"

import { useState } from "react"
import {
  Calendar as CalendarIcon,
  FileText,
  Package,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Calendar } from "@workspace/ui/components/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

export default function Page() {
  const [date, setDate] = useState<Date>(new Date(2025, 10, 20)) // November 20, 2025
  const [selectedPT, setSelectedPT] = useState("pt-gadai-top")
  const [selectedToko, setSelectedToko] = useState("gt-jakarta-satu")

  // Sample SPK Baru (New SPK) data - SPK created today
  const spkBaruData = [
    {
      id: "1",
      spkNumber: "SPK/001/20112025",
      nominalDibayar: 10000000,
      customerName: "Adi Suryana",
    },
    {
      id: "2",
      spkNumber: "SPK/002/20112025",
      nominalDibayar: 17500000,
      customerName: "Elizabeth Cahyadi",
    },
    {
      id: "3",
      spkNumber: "SPK/003/20112025",
      nominalDibayar: 10000000,
      customerName: "Rahman Abdurahman",
    },
    {
      id: "4",
      spkNumber: "SPK/004/20112025",
      nominalDibayar: 17500000,
      customerName: "Siti Rahmawati",
    },
    {
      id: "5",
      spkNumber: "SPK/005/20112025",
      nominalDibayar: 10000000,
      customerName: "Budi Santoso",
    },
  ]

  // Sample NKB Baru (New NKB) data - NKB created today
  const nkbBaruData = [
    {
      id: "1",
      nkbNumber: "NKB/001/20112025",
      nominalDibayar: 10000000,
      jenis: "Perpanjangan",
      status: "Berjalan",
    },
    {
      id: "2",
      nkbNumber: "NKB/002/20112025",
      nominalDibayar: 17500000,
      jenis: "Pelunasan",
      status: "Lunas",
    },
    {
      id: "3",
      nkbNumber: "NKB/003/20112025",
      nominalDibayar: 10000000,
      jenis: "Perpanjangan",
      status: "Berjalan",
    },
    {
      id: "4",
      nkbNumber: "NKB/004/20112025",
      nominalDibayar: 17500000,
      jenis: "Pelunasan",
      status: "Lunas",
    },
    {
      id: "5",
      nkbNumber: "NKB/005/20112025",
      nominalDibayar: 10000000,
      jenis: "Perpanjangan",
      status: "Terlambat",
    },
  ]

  // Sample SPK Jatuh Tempo Hari ini (SPK Due Today) data
  const spkJatuhTempoData = [
    {
      id: "1",
      no: 1,
      foto: "/placeholder-avatar.jpg",
      spkNumber: "SPK/001/20112025",
      customerName: "Andi Pratama Nugroho",
      jumlahSPK: 10000000,
      sisaSPK: 10,
      tanggalWaktuSPK: "2025-11-20T18:33:45",
    },
    {
      id: "2",
      no: 2,
      foto: "/placeholder-avatar.jpg",
      spkNumber: "SPK/002/20112025",
      customerName: "Siti Rahmawati Putri",
      jumlahSPK: 17500000,
      sisaSPK: 10,
      tanggalWaktuSPK: "2025-11-20T18:33:45",
    },
    {
      id: "3",
      no: 3,
      foto: "/placeholder-avatar.jpg",
      spkNumber: "SPK/003/20112025",
      customerName: "Bima Aditya Saputra",
      jumlahSPK: 10000000,
      sisaSPK: 10,
      tanggalWaktuSPK: "2025-11-20T18:33:45",
    },
    {
      id: "4",
      no: 4,
      foto: "/placeholder-avatar.jpg",
      spkNumber: "SPK/004/20112025",
      customerName: "Dewi Lestari",
      jumlahSPK: 17500000,
      sisaSPK: 10,
      tanggalWaktuSPK: "2025-11-20T18:33:45",
    },
    {
      id: "5",
      no: 5,
      foto: "/placeholder-avatar.jpg",
      spkNumber: "SPK/005/20112025",
      customerName: "Rudi Hartono",
      jumlahSPK: 10000000,
      sisaSPK: 10,
      tanggalWaktuSPK: "2025-11-20T18:33:45",
    },
    {
      id: "6",
      no: 6,
      foto: "/placeholder-avatar.jpg",
      spkNumber: "SPK/006/20112025",
      customerName: "Indah Permata",
      jumlahSPK: 17500000,
      sisaSPK: 10,
      tanggalWaktuSPK: "2025-11-20T18:33:45",
    },
    {
      id: "7",
      no: 7,
      foto: "/placeholder-avatar.jpg",
      spkNumber: "SPK/007/20112025",
      customerName: "Ahmad Fauzi",
      jumlahSPK: 10000000,
      sisaSPK: 10,
      tanggalWaktuSPK: "2025-11-20T18:33:45",
    },
    {
      id: "8",
      no: 8,
      foto: "/placeholder-avatar.jpg",
      spkNumber: "SPK/008/20112025",
      customerName: "Sari Indah",
      jumlahSPK: 17500000,
      sisaSPK: 10,
      tanggalWaktuSPK: "2025-11-20T18:33:45",
    },
    {
      id: "9",
      no: 9,
      foto: "/placeholder-avatar.jpg",
      spkNumber: "SPK/009/20112025",
      customerName: "Bambang Sutrisno",
      jumlahSPK: 10000000,
      sisaSPK: 10,
      tanggalWaktuSPK: "2025-11-20T18:33:45",
    },
    {
      id: "10",
      no: 10,
      foto: "/placeholder-avatar.jpg",
      spkNumber: "SPK/010/20112025",
      customerName: "Joko Widodo",
      jumlahSPK: 17500000,
      sisaSPK: 10,
      tanggalWaktuSPK: "2025-11-20T18:33:45",
    },
  ]

  const metrics = [
    {
      title: "SPK Jatuh Tempo (Di bawah 1 Bulan)",
      value: "10",
      icon: FileText,
      iconColor: "text-orange-600",
    },
    {
      title: "SPK Jatuh Tempo (Di atas 1 Bulan)",
      value: "5",
      icon: XCircle,
      iconColor: "text-red-600",
    },
    {
      title: "Barang Gadai Aktif",
      value: "12",
      icon: Package,
      iconColor: "text-green-600",
    },
    {
      title: "SPK Baru Hari ini",
      value: "5",
      icon: CheckCircle2,
      iconColor: "text-green-600",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-foreground text-3xl font-bold">Dashboard</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Pages</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedPT} onValueChange={setSelectedPT}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Pilih PT" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pt-gadai-top">
                PT Gadai Top Indonesia
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedToko} onValueChange={setSelectedToko}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih Toko" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gt-jakarta-satu">GT Jakarta Satu</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[220px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? (
                  date.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                ) : (
                  <span>Pilih tanggal</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(selectedDate) =>
                  selectedDate && setDate(selectedDate)
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          return (
            <Card key={metric.title} className="py-4 shadow-sm">
              <CardContent className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-500/50"
                  )}
                >
                  {/* <Icon className={cn("h-6 w-6", metric.iconColor)} /> */}
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="text-foreground leading-none font-bold">
                    {metric.value}
                  </p>
                  <p className="text-muted-foreground line-clamp-2 h-8 text-sm leading-tight">
                    {metric.title}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* SPK Baru and NKB Baru Tables - 2 Column Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* SPK Baru Table */}
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
                {spkBaruData.map((spk) => (
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

        {/* NKB Baru Table */}
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
                {nkbBaruData.map((nkb) => (
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
      </div>

      {/* SPK Jatuh Tempo Hari ini Table */}
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
                <TableHead className="text-right">Jumlah SPK</TableHead>
                <TableHead className="text-right">Sisa SPK</TableHead>
                <TableHead>Tanggal & Waktu SPK</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {spkJatuhTempoData.map((spk) => (
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
                  <TableCell className="font-medium">{spk.spkNumber}</TableCell>
                  <TableCell>{spk.customerName}</TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(spk.jumlahSPK)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium">{spk.sisaSPK}</span>
                  </TableCell>
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
    </div>
  )
}
