"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"

/**
 * Redirect to the single batch detail page at /lelangan/[slug].
 * Validasi Lelangan and Lelangan share the same batch detail view.
 */
export default function ValidasiLelanganSlugRedirect() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  useEffect(() => {
    if (slug) {
      router.replace(`/lelangan/${slug}`)
    }
  }, [slug, router])

  return null
}
