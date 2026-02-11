"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Progress } from "@workspace/ui/components/progress"
import { Separator } from "@workspace/ui/components/separator"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { DataTable } from "@/components/data-table"
import { ColumnDef } from "@tanstack/react-table"
import {
  ArrowLeft,
  Box,
  ChevronRight,
  Filter,
  MoreVertical,
  Package,
  ScanLine,
  Search,
  Target,
  QrCode,
} from "lucide-react"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@workspace/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { QRCodeDialog } from "../../_components/QRCodeDialog"

// Types
interface ValidasiItem {
  id: string
  no: number
  foto?: string // url
  noSpk: string
  namaBarang: string
  tipeBarang: string
  toko: string
  tanggalValidasi: string
  status: "Belum Tervalidasi" | "Tervalidasi"
  isUrgent?: boolean
}

// Dummy Data
const batchDetail = {
  tanggal: "22 November 2025 16:15:20",
  tanggalValidasi: "22 November 2025 16:15:20",
  idBatch: "BTC001",
  namaBatch: "Batch Handphone",
  namaPT: "PT Gadai Top Satu",
  namaToko: "GT Jakarta Satu, GT Jakarta Dua, GT Jakarta Tiga",
  petugas: "Marshall D Teach, Marco, Rayleigh, Pedro",
  jumlahItem: 10,
}

const itemsData: ValidasiItem[] = [
  {
    id: "1",
    no: 1,
    noSpk: "SPK/002/20112025",
    namaBarang: "iPhone 15 Pro",
    tipeBarang: "Handphone",
    toko: "GT Jakarta Satu",
    tanggalValidasi: "-",
    status: "Belum Tervalidasi",
    isUrgent: true,
  },
  {
    id: "2",
    no: 2,
    noSpk: "SPK/003/20112025",
    namaBarang: "Google Smarthome",
    tipeBarang: "IoT",
    toko: "GT Jakarta Dua",
    tanggalValidasi: "-",
    status: "Belum Tervalidasi",
    isUrgent: true,
  },
  {
    id: "3",
    no: 3,
    noSpk: "SPK/005/20112025",
    namaBarang: "MacBook Pro M1",
    tipeBarang: "Laptop",
    toko: "GT Jakarta Dua",
    tanggalValidasi: "-",
    status: "Tervalidasi",
  },
  {
    id: "4",
    no: 4,
    noSpk: "SPK/006/20112025",
    namaBarang: "MacBook Pro M2",
    tipeBarang: "Laptop",
    toko: "GT Jakarta Tiga",
    tanggalValidasi: "-",
    status: "Tervalidasi",
  },
]

export default function DetailValidasiLelanganPage() {
  const params = useParams()
  const slug = params.slug as string
  const [activeTab, setActiveTab] = React.useState<"belum" | "terscan">("belum")
  const [items, setItems] = React.useState<ValidasiItem[]>(itemsData)
  const [search, setSearch] = React.useState("")

  const [qrDialog, setQrDialog] = React.useState<{ open: boolean; value: string }>({
    open: false,
    value: "",
  })

  // Filter logic
  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      // Tab filter
      if (activeTab === "belum" && item.status === "Tervalidasi") return false
      if (activeTab === "terscan" && item.status === "Belum Tervalidasi") return false
      
      // Search filter
      if (search) {
        const lowerSearch = search.toLowerCase()
        return (
          item.noSpk.toLowerCase().includes(lowerSearch) ||
          item.namaBarang.toLowerCase().includes(lowerSearch) ||
          item.toko.toLowerCase().includes(lowerSearch)
        )
      }
      
      return true
    })
  }, [items, activeTab, search])

  const belumTerscanCount = items.filter((i) => i.status === "Belum Tervalidasi").length
  const terscanCount = items.filter((i) => i.status === "Tervalidasi").length
  const totalItems = items.length
  const progressPercentage = totalItems > 0 ? (terscanCount / totalItems) * 100 : 0

  const handleScanClick = (noSpk: string) => {
    setQrDialog({ open: true, value: noSpk })
  }

  const columns: ColumnDef<ValidasiItem>[] = [
    {
      accessorKey: "no",
      header: "No",
      cell: ({ row }) => <div className="text-center">{row.getValue("no")}</div>,
    },
    {
      accessorKey: "foto",
      header: "Foto",
      cell: ({ row }) => {
        const item = row.original
        return (
          <Avatar className="size-12 rounded-none">
            <AvatarImage src={item.foto} alt={item.namaBarang} />
            <AvatarFallback className="rounded-none bg-slate-200">
              <Package className="size-5 text-slate-400" />
            </AvatarFallback>
          </Avatar>
        )
      },
    },
    {
      accessorKey: "noSpk",
      header: "No.SPK",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.getValue("noSpk")}</span>
           <Button
             variant="outline"
             size="icon"
             className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 h-8 w-8 ml-2"
             onClick={() => handleScanClick(row.original.noSpk)}
           >
             <QrCode className="h-4 w-4" />
           </Button>
        </div>
      ),
    },
    {
      accessorKey: "namaBarang",
      header: "Nama Barang",
    },
    {
      accessorKey: "tipeBarang",
      header: "Tipe Barang",
    },
    {
      accessorKey: "toko",
      header: "Toko",
    },
    {
      accessorKey: "tanggalValidasi",
      header: "Tanggal Validasi",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const isBelum = status === "Belum Tervalidasi"
        
        return (
          <Badge 
            variant="outline" 
            className={
              isBelum 
                ? "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20" 
                : "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
            }
          >
            {status}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: "Action",
      cell: () => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="gap-2">
                Detail
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                QR SPK
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
           {batchDetail.idBatch}
        </h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/validasi-lelangan">Validasi Lelang</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
               <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-red-500 font-medium">Detail</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Detail Batch Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-semibold">Detail Batch</CardTitle>
          <Badge variant="outline" className="text-sm font-normal py-1 px-3">
            Menunggu
          </Badge>
        </CardHeader>
        <Separator className="mb-4" /> 
        <CardContent>
           <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2">
                 <Package className="h-5 w-5 text-red-500" />
                 <h3 className="font-semibold text-red-500">Detail Batch</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                 <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">Tanggal</p>
                    <p className="text-sm text-slate-500">{batchDetail.tanggal}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">Tanggal Validasi</p>
                    <p className="text-sm text-slate-500">{batchDetail.tanggalValidasi}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">ID Batch</p>
                    <p className="text-sm text-slate-500">{batchDetail.idBatch}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">Nama Batch</p>
                    <p className="text-sm text-slate-500">{batchDetail.namaBatch}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">Nama PT</p>
                    <p className="text-sm text-slate-500">{batchDetail.namaPT}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">Nama Toko</p>
                    <p className="text-sm text-slate-500">{batchDetail.namaToko}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">Petugas</p>
                    <p className="text-sm text-slate-500">{batchDetail.petugas}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">Jumlah Item</p>
                    <p className="text-sm text-slate-500">{batchDetail.jumlahItem}</p>
                 </div>
              </div>
           </div>
        </CardContent>
      </Card>

      {/* Progress Card */}
      <Card>
        <CardContent>
           <div className="flex items-center gap-4">
              <div className="bg-red-50 p-3 rounded-full">
                 <Box className="h-6 w-6 text-red-500" />
              </div>
              <div className="flex-1 space-y-2">
                 <div className="flex justify-between">
                    <h3 className="font-semibold text-lg">{Math.round(progressPercentage)}% Item Terscan</h3>
                 </div>
                 <Progress value={progressPercentage} className="h-3 bg-gray-100 [&>div]:bg-red-500" />
              </div>
           </div>
        </CardContent>
      </Card>

      {/* Tabs & Table Section */}
      <div className="space-y-4">
        {/* Custom Tabs */}
        <div className="flex border-b w-fit">
           <button
             onClick={() => setActiveTab("belum")}
             className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
               activeTab === "belum"
                 ? "border-red-500 text-red-500"
                 : "border-transparent text-gray-500 hover:text-gray-700"
             }`}
           >
             Belum Terscan
             <Badge variant="secondary" className="bg-red-500 text-white hover:bg-red-600 rounded-full h-5 w-5 p-0 flex items-center justify-center text-xs">
                {belumTerscanCount}
             </Badge>
           </button>
           <button
             onClick={() => setActiveTab("terscan")}
             className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
               activeTab === "terscan"
                 ? "border-red-500 text-red-500"
                 : "border-transparent text-gray-500 hover:text-gray-700"
             }`}
           >
             Terscan
             <Badge variant="secondary" className="bg-red-100 text-red-500 hover:bg-red-200 rounded-full h-5 w-5 p-0 flex items-center justify-center text-xs">
                {terscanCount}
             </Badge>
           </button>
        </div>

        {/* Data Table */}
        <DataTable
           title="Item Lelang"
           data={filteredItems}
           columns={columns}
           searchPlaceholder="Cari..."
           searchValue={search}
           onSearchChange={setSearch}
           getRowClassName={(row) => 
               row.status === "Belum Tervalidasi" ? "!bg-red-50 dark:!bg-red-950/50" : ""
           }
           headerRight={
             <div className="flex items-center gap-2">
                <Select defaultValue="100">
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="100" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="w-full sm:w-auto sm:max-w-sm">
                   <Input
                     placeholder="Cari..."
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     icon={<Search className="size-4" />}
                     className="w-full"
                   />
                </div>

                <Button variant="outline" className="gap-2">
                   <Filter className="h-4 w-4" />
                   Filter
                </Button>

                <Button className="bg-red-600 hover:bg-red-700 gap-2 text-white">
                   <ScanLine className="h-4 w-4" />
                   Scan QR
                </Button>
             </div>
           }
        />
      </div>

      <QRCodeDialog
        open={qrDialog.open}
        onOpenChange={(open: boolean) => setQrDialog((prev) => ({ ...prev, open }))}
        value={qrDialog.value}
      />
    </div>
  )
}
