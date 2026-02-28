import type { PawnTerm, SpkItem } from "@/lib/api/types"

export interface MataMatchResult {
  isMata: boolean
  mataRuleName?: string
}

/**
 * Check if an SPK item matches any active PawnTerm ("Mata" rule).
 * Matching logic: item type + appraised/estimated value within loanLimitMin/loanLimitMax.
 */
export function matchSpkItemToMataRules(
  item: SpkItem,
  pawnTerms: PawnTerm[],
  ptId?: string
): MataMatchResult {
  if (!pawnTerms?.length) return { isMata: false }

  const itemTypeId = item.itemTypeId ?? item.itemType?.uuid
  const itemTypeName = item.itemType?.typeName
  const value =
    item.estimatedValue ??
    (typeof item.appraisedValue === "string"
      ? parseFloat(item.appraisedValue) || 0
      : Number(item.appraisedValue) || 0)

  for (const term of pawnTerms) {
    if (ptId && term.ptId !== ptId) continue

    const termItemTypeId = term.itemTypeId ?? term.itemType?.uuid
    const termItemTypeName = term.itemType?.typeName

    const typeMatches =
      (itemTypeId && termItemTypeId && itemTypeId === termItemTypeId) ||
      (itemTypeName && termItemTypeName &&
        itemTypeName.toLowerCase() === termItemTypeName.toLowerCase())

    if (!typeMatches) continue

    const min = Number(term.loanLimitMin) || 0
    const max = Number(term.loanLimitMax) || Infinity
    const valueInRange = value >= min && value <= max

    if (valueInRange) {
      return {
        isMata: true,
        mataRuleName: term.ruleName?.trim() || term.itemType?.typeName || "Mata",
      }
    }
  }

  return { isMata: false }
}
