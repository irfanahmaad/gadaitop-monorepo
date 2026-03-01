import type { FilterConfig } from "@/hooks/use-filter-params"

const baseFilters: FilterConfig[] = [
  {
    key: "lastUpdate",
    label: "",
    type: "daterange",
    labelFrom: "Mulai Dari",
    labelTo: "Sampai Dengan",
  },
  {
    key: "nominal",
    label: "",
    type: "currencyrange",
    currency: "",
  },
  {
    key: "toko",
    label: "Toko",
    type: "select",
    placeholder: "Semua",
    options: [
      { value: "__all__", label: "Semua" },
    ],
  },
]

export const REQUEST_FILTER_CONFIG: FilterConfig[] = [...baseFilters]

export const HISTORY_FILTER_CONFIG: FilterConfig[] = [
  ...baseFilters,
  {
    key: "status",
    label: "Status",
    type: "select",
    placeholder: "Semua",
    options: [
      { value: "__all__", label: "Semua" },
      { value: "Disetujui", label: "Disetujui" },
      { value: "Ditolak", label: "Ditolak" },
    ],
  },
]

export const TAMBAH_MODAL_FILTER_CONFIG: FilterConfig[] = [
  ...baseFilters,
  {
    key: "status",
    label: "Status",
    type: "select",
    placeholder: "Semua",
    options: [
      { value: "__all__", label: "Semua" },
      { value: "Pending", label: "Pending" },
      { value: "Disetujui", label: "Disetujui" },
      { value: "Ditolak", label: "Ditolak" },
    ],
  },
]
