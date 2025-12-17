"use client"

import { useState } from "react"
import {
  imgMetricsDashboard1,
  imgMetricsDashboard2,
  imgMetricsDashboard3,
  imgMetricsDashboard4,
} from "@/assets/commons"
import { DashboardHeader } from "./_components/DashboardHeader"
import { MetricsGrid } from "./_components/MetricsGrid"
import { SPKOverdueChartCard } from "./_components/SPKOverdueChartCard"
import { TrenBarangGadaiChartCard } from "./_components/TrenBarangGadaiChartCard"
import { SPKBaruTable } from "./_components/SPKBaruTable"
import { NKBBaruTable } from "./_components/NKBBaruTable"
import { SPKJatuhTempoTable } from "./_components/SPKJatuhTempoTable"

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
      icon: imgMetricsDashboard1,
      iconColor: "text-orange-600",
    },
    {
      title: "SPK Jatuh Tempo (Di atas 1 Bulan)",
      value: "5",
      icon: imgMetricsDashboard2,
      iconColor: "text-red-600",
    },
    {
      title: "Barang Gadai Aktif",
      value: "12",
      icon: imgMetricsDashboard3,
      iconColor: "text-green-600",
    },
    {
      title: "SPK Baru Hari ini",
      value: "5",
      icon: imgMetricsDashboard4,
      iconColor: "text-green-600",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        selectedPT={selectedPT}
        selectedToko={selectedToko}
        date={date}
        onPTChange={setSelectedPT}
        onTokoChange={setSelectedToko}
        onDateChange={setDate}
      />

      <MetricsGrid metrics={metrics} />

      <div className="grid gap-4 md:grid-cols-2">
        <SPKOverdueChartCard />
        <TrenBarangGadaiChartCard />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SPKBaruTable data={spkBaruData} />
        <NKBBaruTable data={nkbBaruData} />
      </div>

      <SPKJatuhTempoTable data={spkJatuhTempoData} />
    </div>
  )
}
