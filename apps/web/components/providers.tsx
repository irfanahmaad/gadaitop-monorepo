"use client"

import * as React from "react"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

import { AbilityProvider } from "@/lib/casl"
import { ReactQueryProvider } from "@/lib/react-query/provider"
import { Toaster } from "@workspace/ui/components/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AbilityProvider>
        <ReactQueryProvider>
          <NextThemesProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            {children}
            <Toaster />
          </NextThemesProvider>
        </ReactQueryProvider>
      </AbilityProvider>
    </SessionProvider>
  )
}
