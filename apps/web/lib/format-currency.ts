/**
 * Format number to Indonesian Rupiah format with trailing comma-dash
 * Example: 1000000 -> "1.000.000,-"
 */
export function formatCurrencyInput(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return ""
  }

  return (
    new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(value)
      .replace(/,/g, ".")
      .replace(/\s/g, "") + ",-"
  )
}

/**
 * Parse formatted currency string back to number
 * Example: "1.000.000,-" -> 1000000
 */
export function parseCurrencyInput(value: string): number | null {
  if (!value || value.trim() === "") {
    return null
  }

  // Remove currency prefix, spaces, dots, comma-dash, and any non-numeric characters except minus
  const cleaned = value
    .replace(/Rp\s*/gi, "")
    .replace(/\./g, "")
    .replace(/,-/g, "")
    .replace(/\s/g, "")
    .trim()

  if (cleaned === "" || cleaned === "-") {
    return null
  }

  const parsed = Number(cleaned)
  return isNaN(parsed) ? null : parsed
}

/**
 * Format number for display in table cells (without trailing comma-dash)
 * Example: 1000000 -> "1.000.000"
 */
export function formatCurrencyDisplay(
  value: number | null | undefined
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return ""
  }

  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}
