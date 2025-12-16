import { Inter } from "next/font/google"

import "@workspace/ui/globals.css"
import { Providers } from "@/components/providers"
import { Metadata } from "next"

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Gadai Top",
  description: "Gadai Top",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} bg-slate-200 font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
