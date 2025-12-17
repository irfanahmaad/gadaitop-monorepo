"use client"

import * as React from "react"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"

export interface BreadcrumbItemData {
  label: string
  href?: string
  className?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItemData[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (!items || items.length === 0) {
    return null
  }

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {items.flatMap((item, index) => {
          const isLast = index === items.length - 1
          const elements: React.ReactNode[] = []

          if (index > 0) {
            elements.push(<BreadcrumbSeparator key={`separator-${index}`} />)
          }

          elements.push(
            <BreadcrumbItem key={index}>
              {item.href && !isLast ? (
                <BreadcrumbLink asChild>
                  <Link href={item.href} className={item.className}>
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className={item.className}>
                  {item.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          )

          return elements
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
