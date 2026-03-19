export type SetorUangStatus = "Pending" | "Lunas" | "Expired"

export type SetorUang = {
  id: string
  uuid: string
  depositCode: string
  tanggal: string
  dilakukanOleh: { name: string; avatar?: string }
  namaToko: string
  nominal: number
  virtualAccount: string | null
  expiresAt: string | null
  status: SetorUangStatus
  notes?: string | null
}
