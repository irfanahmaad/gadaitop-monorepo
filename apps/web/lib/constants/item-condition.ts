import type { PawnTermItemCondition } from "@/lib/api/types"

/** Options for pawn term item condition (value = API code, label = display text) */
export const ITEM_CONDITION_OPTIONS: { value: PawnTermItemCondition; label: string }[] = [
  { value: "present_and_matching", label: "Ada & Kondisi Sesuai" },
  { value: "present_but_mismatch", label: "Ada Namun Mismatch" },
  { value: "none", label: "Tidak Ada" },
]

export function getItemConditionLabel(code: string | undefined | null): string {
  if (!code) return "-"
  const opt = ITEM_CONDITION_OPTIONS.find((o) => o.value === code)
  return opt?.label ?? code
}
