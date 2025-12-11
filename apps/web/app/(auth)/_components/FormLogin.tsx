import React from "react"
import { imgLogoGadaiTop } from "@/assets"
import Image from "next/image"

export default function FormLogin() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-center">
        <Image src={imgLogoGadaiTop} alt="logo" width={150} height={150} />
      </div>
    </div>
  )
}
