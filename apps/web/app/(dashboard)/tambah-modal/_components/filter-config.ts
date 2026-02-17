import type { FilterConfig } from "@/hooks/use-filter-params"

export const TAMBAH_MODAL_FILTER_CONFIG: FilterConfig[] = [
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
      { value: "gt-jakarta-satu", label: "GT Jakarta Satu" },
      { value: "gt-jakarta-dua", label: "GT Jakarta Dua" },
      { value: "gt-bandung", label: "GT Bandung" },
      { value: "gt-surabaya", label: "GT Surabaya" },
    ],
  },
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
