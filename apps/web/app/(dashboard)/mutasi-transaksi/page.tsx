"use client"

import React from "react"
import { Breadcrumbs } from "@/components/breadcrumbs"

export default function MutasiTransaksiPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Mutasi Transaksi</h1>
        <Breadcrumbs
          items={[{ label: "Pages", href: "/" }, { label: "Mutasi Transaksi" }]}
        />
      </div>
    </div>
  )
}
