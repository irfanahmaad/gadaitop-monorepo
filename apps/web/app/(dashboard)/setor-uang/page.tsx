"use client"

import React from "react"
import { Breadcrumbs } from "@/components/breadcrumbs"

export default function SetorUangPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Setor Uang</h1>
        <Breadcrumbs
          items={[{ label: "Pages", href: "/" }, { label: "Setor Uang" }]}
        />
      </div>
    </div>
  )
}
