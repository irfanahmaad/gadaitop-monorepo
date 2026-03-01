export type SetorUangStatus = "Pending" | "Lunas" | "Failed" | "Expired"

export type SetorUang = {
  id: string
  uuid: string
  tanggal: string
  dilakukanOleh: { name: string; avatar?: string }
  namaToko: string
  nominal: number
  vaNumber: string
  batasWaktu: string
  status: SetorUangStatus
  proofUrl?: string
  rejectionReason?: string
}
