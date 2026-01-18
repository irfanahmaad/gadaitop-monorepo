import React, { Suspense } from "react"
import { bgLogin } from "@/assets/bgs"
import Image from "next/image"
import FormLogin from "../_components/FormLogin"

export default function Login() {
  return (
    <div className="p-6 lg:h-screen">
      <div className="container lg:h-full">
        <div className="grid overflow-hidden rounded-2xl bg-white lg:h-full lg:grid-cols-2">
          <div className="dark text-foreground relative hidden h-full w-full items-end lg:flex">
            <div className="absolute inset-0 top-0 left-0 -z-0">
              <Image
                src={bgLogin}
                alt="bg-login"
                fill
                className="scale-110 object-cover object-center"
              />
            </div>
            <div className="relative z-10 p-16">
              <h1 className="mb-2 text-4xl font-semibold">Selamat Datang</h1>
              <p className="text-balance">
                Lorem ipsum dolor sit amet consectetur. Tincidunt sem lorem
                porta vel elit nisl.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Suspense fallback={<div>Loading...</div>}>
              <FormLogin />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
