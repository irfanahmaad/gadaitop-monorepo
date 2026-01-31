export type RequestTambahModal = {
  id: string
  tanggalRequest: string
  dilakukanOleh: {
    name: string
    avatar?: string
  }
  namaToko: string
  alias: string
  nominal: number
  status: "Pending" | "Disetujui" | "Ditolak"
}
