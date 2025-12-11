import React from "react"
import { bgLogin } from "@/assets/bgs"
import Image from "next/image"
import FormLogin from "../_components/FormLogin"

export default function Login() {
  return (
    <div className="p-6">
      <div className="container">
        <div className="grid grid-cols-2 overflow-hidden rounded-lg bg-white">
          <div className="dark text-foreground relative flex h-full w-full items-end">
            <div className="absolute inset-0 top-0 left-0 -z-0">
              <Image
                src={bgLogin}
                alt="bg-login"
                fill
                className="object-cover object-center"
              />
            </div>
            <div className="relative z-10 p-16">
              <h1 className="mb-2 text-4xl font-semibold">Selamat Datang</h1>
              <p>
                Lorem ipsum dolor sit amet consectetur. Tincidunt sem lorem
                porta vel elit nisl.
              </p>
            </div>
          </div>
          <div>
            <FormLogin />
          </div>
        </div>
      </div>
    </div>
  )
}
