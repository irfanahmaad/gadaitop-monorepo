"use client"

import React from "react"
import { Breadcrumbs } from "@/components/breadcrumbs"

export default function MasterSyaratMataPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Master Syarat Mata</h1>
        <Breadcrumbs
          items={[
            { label: "Pages", href: "/" },
            { label: "Master Syarat Mata" },
          ]}
        />
      </div>
    </div>
  )
}
