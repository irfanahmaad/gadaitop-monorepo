"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  VisibilityState,
  PaginationState,
} from "@tanstack/react-table"
import {
  MoreHorizontal,
  SearchIcon,
  Eye,
  Pencil,
  Trash2,
  SlidersHorizontal,
} from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@workspace/ui/components/pagination"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { FilterDialog } from "./filter-dialog"
import { FilterConfig } from "@/hooks/use-filter-params"

interface CustomAction<TData> {
  label: string
  icon?: React.ReactNode
  onClick: (row: TData) => void
  variant?: "default" | "destructive"
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  title?: string
  searchPlaceholder?: string
  headerLeft?: React.ReactNode
  headerRight?: React.ReactNode
  filterConfig?: FilterConfig[]
  filterValues?: Record<string, unknown>
  onFilterChange?: (filters: Record<string, unknown>) => void
  /** When using custom headerRight with a Filter button, pass these to control the dialog open state */
  filterDialogOpen?: boolean
  onFilterDialogOpenChange?: (open: boolean) => void
  onDetail?: (row: TData) => void
  onEdit?: (row: TData) => void
  onDelete?: (row: TData) => void
  customActions?: CustomAction<TData>[]
  initialPageSize?: number
  onPageSizeChange?: (pageSize: number) => void
  searchValue?: string
  onSearchChange?: (value: string) => void
  getRowClassName?: (row: TData) => string
  /** Called when row selection changes; receives selected row data */
  onSelectionChange?: (selectedRows: TData[]) => void
  /** When set, pagination is server-driven: parent controls page and total count */
  serverSidePagination?: {
    totalRowCount: number
    pageIndex: number
    onPageIndexChange: (pageIndex: number) => void
  }
}

export function DataTable<TData, TValue>({
  columns,
  data,
  title,
  searchPlaceholder = "Search...",
  headerLeft,
  headerRight,
  filterConfig,
  filterValues = {},
  onFilterChange,
  filterDialogOpen: controlledFilterDialogOpen,
  onFilterDialogOpenChange,
  onDetail,
  onEdit,
  onDelete,
  customActions,
  initialPageSize = 10,
  onPageSizeChange,
  searchValue: controlledSearchValue,
  onSearchChange,
  getRowClassName,
  onSelectionChange,
  serverSidePagination,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [internalGlobalFilter, setInternalGlobalFilter] = React.useState("")
  const [internalFilterDialogOpen, setInternalFilterDialogOpen] =
    React.useState(false)
  const filterDialogOpen =
    controlledFilterDialogOpen !== undefined
      ? controlledFilterDialogOpen
      : internalFilterDialogOpen
  const setFilterDialogOpen =
    onFilterDialogOpenChange ?? setInternalFilterDialogOpen

  // Use controlled search value if provided, otherwise use internal state
  const globalFilter =
    controlledSearchValue !== undefined
      ? controlledSearchValue
      : internalGlobalFilter
  const setGlobalFilter = React.useCallback(
    (value: string | ((prev: string) => string)) => {
      const newValue = typeof value === "function" ? value(globalFilter) : value
      if (onSearchChange) {
        onSearchChange(newValue)
      } else {
        setInternalGlobalFilter(newValue)
      }
    },
    [globalFilter, onSearchChange]
  )
  const [internalPagination, setInternalPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: initialPageSize,
    })

  const pagination = serverSidePagination
    ? {
        pageIndex: serverSidePagination.pageIndex,
        pageSize: internalPagination.pageSize,
      }
    : internalPagination

  // Add actions column if any action handlers are provided
  const hasCustomActions = customActions && customActions.length > 0
  const columnsWithActions = React.useMemo(() => {
    if (!onDetail && !onEdit && !onDelete && !hasCustomActions) {
      return columns
    }

    const actionsColumn: ColumnDef<TData, TValue> = {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onDetail && (
                <DropdownMenuItem onClick={() => onDetail(row.original)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Detail
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(row.original)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(row.original)}
                  variant="destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </DropdownMenuItem>
              )}
              {customActions?.map((action, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => action.onClick(row.original)}
                  variant={action.variant}
                >
                  {action.icon}
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    }

    return [...columns, actionsColumn]
  }, [columns, onDetail, onEdit, onDelete, customActions, hasCustomActions])

  const table = useReactTable({
    data,
    columns: columnsWithActions,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    ...(serverSidePagination
      ? {
          manualPagination: true,
          pageCount: Math.ceil(
            serverSidePagination.totalRowCount / internalPagination.pageSize
          ) || 1,
        }
      : {
          getPaginationRowModel: getPaginationRowModel(),
          getFilteredRowModel: getFilteredRowModel(),
        }),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
      if (serverSidePagination) {
        const next = typeof updater === "function" ? updater(pagination) : updater
        if (next.pageSize !== pagination.pageSize && onPageSizeChange) {
          onPageSizeChange(next.pageSize)
        }
        setInternalPagination((prev) => ({
          ...prev,
          pageSize: next.pageSize,
        }))
        if (next.pageIndex !== serverSidePagination.pageIndex) {
          serverSidePagination.onPageIndexChange(next.pageIndex)
        }
      } else {
        setInternalPagination((prev) => {
          const newPagination =
            typeof updater === "function" ? updater(prev) : updater
          if (onPageSizeChange && newPagination.pageSize !== prev.pageSize) {
            onPageSizeChange(newPagination.pageSize)
          }
          return newPagination
        })
      }
    },
    state: {
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
  })

  const onSelectionChangeRef = React.useRef(onSelectionChange)
  onSelectionChangeRef.current = onSelectionChange
  React.useEffect(() => {
    const selected = table.getSelectedRowModel().rows.map((r) => r.original)
    onSelectionChangeRef.current?.(selected)
  }, [rowSelection, data])

  const currentPage = table.getState().pagination.pageIndex + 1
  const pageSize = table.getState().pagination.pageSize
  const totalRows = serverSidePagination
    ? serverSidePagination.totalRowCount
    : table.getFilteredRowModel().rows.length
  const startRow =
    totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endRow = serverSidePagination
    ? Math.min(currentPage * pageSize, totalRows)
    : Math.min(currentPage * pageSize, totalRows)
  const totalPages = table.getPageCount()

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = []
    const current = currentPage
    const total = totalPages

    if (total <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (current <= 4) {
        // Near the start
        for (let i = 2; i <= 5; i++) {
          pages.push(i)
        }
        pages.push("ellipsis")
        pages.push(total)
      } else if (current >= total - 3) {
        // Near the end
        pages.push("ellipsis")
        for (let i = total - 4; i <= total; i++) {
          pages.push(i)
        }
      } else {
        // In the middle
        pages.push("ellipsis")
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i)
        }
        pages.push("ellipsis")
        pages.push(total)
      }
    }

    return pages
  }

  return (
    <Card>
      <CardHeader className="border-transparent">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: headerLeft slot or title fallback */}
          <div className="flex items-center gap-4">
            {headerLeft ||
              (title && <CardTitle className="text-xl">{title}</CardTitle>)}
          </div>

          {/* Right: headerRight slot or default (Search + Filter) */}
          <div className="flex w-full items-center gap-2 sm:w-auto">
            {headerRight || (
              <>
                <div className="w-full sm:w-auto sm:max-w-sm">
                  <Input
                    placeholder={searchPlaceholder}
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    icon={<SearchIcon className="size-4" />}
                    className="w-full"
                  />
                </div>
                {filterConfig && (
                  <Button
                    variant="outline"
                    onClick={() => setFilterDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filter
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={getRowClassName?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columnsWithActions.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-muted-foreground text-sm whitespace-nowrap">
            Showing {startRow}–{endRow} of {totalRows} results
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={(e) => {
                    e.preventDefault()
                    table.previousPage()
                  }}
                  href="#"
                  className={
                    !table.getCanPreviousPage()
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              {getPageNumbers().map((page, index) => (
                <PaginationItem key={index}>
                  {page === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      onClick={(e) => {
                        e.preventDefault()
                        table.setPageIndex(page - 1)
                      }}
                      href="#"
                      isActive={page === currentPage}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={(e) => {
                    e.preventDefault()
                    table.nextPage()
                  }}
                  href="#"
                  className={
                    !table.getCanNextPage()
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>

      {/* Filter Dialog */}
      {filterConfig && (
        <FilterDialog
          open={filterDialogOpen}
          onOpenChange={setFilterDialogOpen}
          filterConfig={filterConfig}
          filterValues={filterValues}
          onFilterChange={onFilterChange || (() => {})}
        />
      )}
    </Card>
  )
}
