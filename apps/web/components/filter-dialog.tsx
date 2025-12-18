"use client"

import * as React from "react"
import { X, RotateCcw, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { FilterConfig } from "@/hooks/use-filter-params"
import { formatCurrencyInput, parseCurrencyInput } from "@/lib/format-currency"

interface FilterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filterConfig: FilterConfig[]
  filterValues: Record<string, unknown>
  onFilterChange: (filters: Record<string, unknown>) => void
}

export function FilterDialog({
  open,
  onOpenChange,
  filterConfig,
  filterValues,
  onFilterChange,
}: FilterDialogProps) {
  const [localFilters, setLocalFilters] = React.useState<
    Record<string, unknown>
  >({})

  // Initialize local filters when dialog opens or filterValues change
  React.useEffect(() => {
    if (open) {
      setLocalFilters(filterValues)
    }
  }, [open, filterValues])

  const handleFilterChange = (key: string, value: unknown) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleReset = () => {
    const resetFilters: Record<string, unknown> = {}
    filterConfig.forEach((config) => {
      if (
        config.type === "currencyrange" ||
        config.type === "numberrange" ||
        config.type === "daterange"
      ) {
        resetFilters[config.key] = { from: null, to: null }
      } else {
        resetFilters[config.key] = null
      }
    })
    setLocalFilters(resetFilters)
  }

  const handleApply = () => {
    onFilterChange(localFilters)
    onOpenChange(false)
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  const renderFilterField = (config: FilterConfig) => {
    const value = localFilters[config.key] ?? null

    switch (config.type) {
      case "select":
        return (
          <div key={config.key} className="space-y-2">
            <Label htmlFor={config.key}>{config.label}</Label>
            <Select
              value={(value as string) ?? ""}
              onValueChange={(newValue) =>
                handleFilterChange(config.key, newValue || null)
              }
            >
              <SelectTrigger id={config.key}>
                <SelectValue placeholder={config.placeholder || "Pilih..."} />
              </SelectTrigger>
              <SelectContent>
                {config.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case "currencyrange": {
        const rangeValue = (value as {
          from: number | null
          to: number | null
        }) || {
          from: null,
          to: null,
        }
        const currency = config.currency || "Rp"

        return (
          <div key={config.key} className="space-y-4">
            <Label>{config.label}</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`${config.key}-from`} className="text-sm">
                  {config.label} Dari
                </Label>
                <div className="relative">
                  <span className="text-muted-foreground absolute top-1/2 left-3 z-10 -translate-y-1/2 text-sm">
                    {currency}
                  </span>
                  <Input
                    id={`${config.key}-from`}
                    type="text"
                    placeholder="0"
                    value={
                      rangeValue.from !== null
                        ? formatCurrencyInput(rangeValue.from)
                        : ""
                    }
                    onChange={(e) => {
                      const parsed = parseCurrencyInput(e.target.value)
                      handleFilterChange(config.key, {
                        ...rangeValue,
                        from: parsed,
                      })
                    }}
                    className="pl-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${config.key}-to`} className="text-sm">
                  Sampai Dengan
                </Label>
                <div className="relative">
                  <span className="text-muted-foreground absolute top-1/2 left-3 z-10 -translate-y-1/2 text-sm">
                    {currency}
                  </span>
                  <Input
                    id={`${config.key}-to`}
                    type="text"
                    placeholder="0"
                    value={
                      rangeValue.to !== null
                        ? formatCurrencyInput(rangeValue.to)
                        : ""
                    }
                    onChange={(e) => {
                      const parsed = parseCurrencyInput(e.target.value)
                      handleFilterChange(config.key, {
                        ...rangeValue,
                        to: parsed,
                      })
                    }}
                    className="pl-12"
                  />
                </div>
              </div>
            </div>
          </div>
        )
      }

      case "numberrange": {
        const numRangeValue = (value as {
          from: number | null
          to: number | null
        }) || {
          from: null,
          to: null,
        }

        return (
          <div key={config.key} className="space-y-4">
            <Label>{config.label}</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`${config.key}-from`} className="text-sm">
                  {config.label} Dari
                </Label>
                <Input
                  id={`${config.key}-from`}
                  type="number"
                  placeholder={config.placeholder || "0"}
                  value={numRangeValue.from ?? ""}
                  onChange={(e) => {
                    const num = e.target.value ? Number(e.target.value) : null
                    handleFilterChange(config.key, {
                      ...numRangeValue,
                      from: num,
                    })
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${config.key}-to`} className="text-sm">
                  Sampai Dengan
                </Label>
                <Input
                  id={`${config.key}-to`}
                  type="number"
                  placeholder={config.placeholder || "0"}
                  value={numRangeValue.to ?? ""}
                  onChange={(e) => {
                    const num = e.target.value ? Number(e.target.value) : null
                    handleFilterChange(config.key, {
                      ...numRangeValue,
                      to: num,
                    })
                  }}
                />
              </div>
            </div>
          </div>
        )
      }

      case "text":
        return (
          <div key={config.key} className="space-y-2">
            <Label htmlFor={config.key}>{config.label}</Label>
            <Input
              id={config.key}
              type="text"
              placeholder={config.placeholder}
              value={(value as string) ?? ""}
              onChange={(e) => handleFilterChange(config.key, e.target.value)}
            />
          </div>
        )

      case "number":
        return (
          <div key={config.key} className="space-y-2">
            <Label htmlFor={config.key}>{config.label}</Label>
            <Input
              id={config.key}
              type="number"
              placeholder={config.placeholder}
              value={(value as number) ?? ""}
              onChange={(e) => {
                const num = e.target.value ? Number(e.target.value) : null
                handleFilterChange(config.key, num)
              }}
            />
          </div>
        )

      case "date":
        return (
          <div key={config.key} className="space-y-2">
            <Label htmlFor={config.key}>{config.label}</Label>
            <Input
              id={config.key}
              type="date"
              value={(value as string) ?? ""}
              onChange={(e) => handleFilterChange(config.key, e.target.value)}
            />
          </div>
        )

      case "daterange": {
        const dateRangeValue = (value as {
          from: string | null
          to: string | null
        }) || {
          from: null,
          to: null,
        }

        return (
          <div key={config.key} className="space-y-4">
            <Label>{config.label}</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`${config.key}-from`} className="text-sm">
                  Dari
                </Label>
                <Input
                  id={`${config.key}-from`}
                  type="date"
                  value={dateRangeValue.from ?? ""}
                  onChange={(e) =>
                    handleFilterChange(config.key, {
                      ...dateRangeValue,
                      from: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${config.key}-to`} className="text-sm">
                  Sampai Dengan
                </Label>
                <Input
                  id={`${config.key}-to`}
                  type="date"
                  value={dateRangeValue.to ?? ""}
                  onChange={(e) =>
                    handleFilterChange(config.key, {
                      ...dateRangeValue,
                      to: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
        )
      }

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filter</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {filterConfig.map((config) => renderFilterField(config))}
        </div>

        <DialogFooter className="flex-row justify-between gap-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Tutup
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700"
            >
              <Check className="h-4 w-4" />
              Terapkan
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
