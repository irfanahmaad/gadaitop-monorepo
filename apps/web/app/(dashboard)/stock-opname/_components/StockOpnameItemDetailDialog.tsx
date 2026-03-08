"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Package, QrCode, X } from "lucide-react"
import { QRCodeDialog } from "../../_components/QRCodeDialog"
import { usePublicUrl } from "@/lib/react-query/hooks/use-upload"
import type { StockOpnameItem as ApiStockOpnameItem } from "@/lib/api/types"

function DamagePhotoImage({ storageKey }: { storageKey: string }) {
  const { data } = usePublicUrl(storageKey)
  if (!data?.url) return <Avatar className="size-16 rounded-md animate-pulse bg-muted" />
  return (
    <Avatar className="size-16 rounded-md">
      {/* eslint-disable-next-line @next/next/no-img-element -- resolved upload URL */}
      <img src={data.url} alt="" className="size-full object-cover rounded-md" />
    </Avatar>
  )
}

type StockOpnameItemDetailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** API item from session.items (with spkItem relation) */
  apiItem: ApiStockOpnameItem | null
}

export function StockOpnameItemDetailDialog({
  open,
  onOpenChange,
  apiItem,
}: StockOpnameItemDetailDialogProps) {
  const [qrOpen, setQrOpen] = useState(false)

  if (!apiItem) return null

  const si = apiItem.spkItem
  const spkNumber = si?.spk?.spkNumber ?? "—"
  const description = si?.description ?? "—"
  const typeName = si?.itemType?.typeName ?? "—"
  const condition = apiItem.condition ?? (si as { condition?: string })?.condition ?? "—"
  const evidencePhotos = si?.evidencePhotos ?? apiItem.photos ?? []
  const photoUrl = evidencePhotos[0]

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="border-b pb-2 text-lg font-semibold">
              Detail Item Stock Opname
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-4">
              <Avatar className="size-20 shrink-0 rounded-lg">
                <AvatarImage src={photoUrl} alt={description} />
                <AvatarFallback className="rounded-lg">
                  <Package className="text-muted-foreground size-10" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-2">
                <div>
                  <label className="text-muted-foreground text-xs font-medium">
                    No. SPK
                  </label>
                  <p className="font-medium">{spkNumber}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-xs font-medium">
                    Nama Barang
                  </label>
                  <p className="text-sm">{description}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-xs font-medium">
                    Tipe Barang
                  </label>
                  <p className="text-sm">{typeName}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-xs font-medium">
                    Kondisi
                  </label>
                  <p className="text-sm capitalize">{String(condition)}</p>
                </div>
              </div>
            </div>

            {evidencePhotos.length > 0 && (
              <div className="space-y-2">
                <label className="text-muted-foreground text-xs font-medium">
                  Foto Barang
                </label>
                <div className="flex flex-wrap gap-2">
                  {evidencePhotos.map((url, i) => (
                    <Avatar key={i} className="size-16 rounded-md">
                      <AvatarImage src={url} alt={`Foto ${i + 1}`} />
                      <AvatarFallback className="rounded-md">
                        {i + 1}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
            )}

            {apiItem.damagePhotos && apiItem.damagePhotos.length > 0 && (
              <div className="space-y-2">
                <label className="text-muted-foreground text-xs font-medium">
                  Gambar Barang (penilaian)
                </label>
                <div className="flex flex-wrap gap-2">
                  {apiItem.damagePhotos.map((key, i) => (
                    <DamagePhotoImage key={key || i} storageKey={key} />
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="gap-2"
              >
                <X className="size-4" />
                Tutup
              </Button>
              <Button
                type="button"
                className="gap-2"
                onClick={() => setQrOpen(true)}
              >
                <QrCode className="size-4" />
                QR Code SPK
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <QRCodeDialog
        open={qrOpen}
        onOpenChange={setQrOpen}
        value={spkNumber}
        title="QR Code SPK"
      />
    </>
  )
}
