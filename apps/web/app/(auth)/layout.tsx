import React from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen w-full bg-slate-200">{children}</div>
}
