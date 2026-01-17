"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

import { ReactQueryProvider } from "@/lib/react-query/provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
        enableColorScheme
      >
        {children}
      </NextThemesProvider>
    </ReactQueryProvider>
  )
}
