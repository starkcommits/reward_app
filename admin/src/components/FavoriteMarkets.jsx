import React from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'react-hot-toast'
import { useFrappeUpdateDoc } from 'frappe-react-sdk'

import {
  ChevronDown,
  CirclePause,
  CircleCheck,
  CircleX,
  CirclePlay,
} from 'lucide-react'
import CloseActionDialog from './CloseActionDialog'
import PauseActionDialog from './PauseActionDialog'
import ResumeActionDialog from './ResumeActionDialog'
import ResolveSheet from './ResolveSheet'

const FavoriteMarkets = ({
  favoriteMarketsData,
  favoriteMarketsDataLoading,
  refetchFavoriteMarketsData,
}) => {
  console.log('Favorite :', favoriteMarketsData)
  const [sorting, setSorting] = React.useState([])
  const [columnFilters, setColumnFilters] = React.useState([])
  const [columnVisibility, setColumnVisibility] = React.useState({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [pauseDialogOpen, setPauseDialogOpen] = React.useState(false)
  const [resumeDialogOpen, setResumeDialogOpen] = React.useState(false)
  const [closeDialogOpen, setCloseDialogOpen] = React.useState(false)

  const { updateDoc } = useFrappeUpdateDoc()

  const onResolveAction = async (data, market_id) => {
    try {
      await updateDoc('Market', market_id, {
        end_result: data.outcome,
        status: 'RESOLVED',
      })
      refetchFavoriteMarketsData()
      toast.success('Market successfully resolved')
    } catch (error) {
      console.log(error)
      toast.error('Error in resolving market')
    }
  }

  const onPauseAction = async (market_id) => {
    try {
      await updateDoc('Market', market_id, {
        status: 'PAUSED',
      })
      toast.success('Market paused successfully')
      refetchFavoriteMarketsData()
    } catch (err) {
      console.log(err)
      toast.error('Error in pausing market')
    }
  }

  const onResumeAction = async (market_id) => {
    try {
      await updateDoc('Market', market_id, {
        status: 'OPEN',
      })
      refetchFavoriteMarketsData()
      toast.success('Market resumed successfully')
      setResumeDialogOpen(false)
    } catch (err) {
      console.log(err)
      toast.error('Error in resuming market')
    }
  }

  const onCloseAction = async (market_id) => {
    try {
      await updateDoc('Market', market_id, {
        status: 'CLOSED',
      })
      refetchFavoriteMarketsData()
      toast.success('Market closed successfully')
      setCloseDialogOpen(false)
    } catch (err) {
      console.log(err)
      toast.error('Error in closing market')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const columns = [
    {
      accessorKey: 'market_id',
      id: 'market_id',
      header: ({ table }) => <div>ID</div>,
      cell: ({ row }) => (
        <div className="text-sm font-medium flex items-center gap-2">
          {row.original?.name?.split('_')[2]}
          <Badge variant="outline">{row.original.category}</Badge>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'question',
      id: 'question',
      header: ({ table }) => <div>Question</div>,
      cell: ({ row }) => (
        <div className="text-sm font-medium flex gap-2 items-center">
          {row.original.question.length > 20
            ? `${row.original.question.substr(0, 20)}...`
            : row.original.question}
          {row.original.status === 'OPEN' ? (
            <Badge variant="outline" className="bg-green-200 text-green-600">
              ACTIVE
            </Badge>
          ) : null}
          {row.original.status === 'PAUSED' ? (
            <Badge variant="outline" className="bg-yellow-200 text-yellow-600">
              {row.original.status}
            </Badge>
          ) : null}
          {row.original.status === 'CLOSED' ? (
            <Badge variant="outline" className="bg-orange-200 text-orange-600">
              {row.original.status}
            </Badge>
          ) : null}
          {row.original.status === 'RESOLVED' ? (
            <Badge variant="outline" className="bg-green-300 text-green-700">
              {row.original.status}
            </Badge>
          ) : null}
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'total_traders',
      id: 'total_traders',
      header: ({ table }) => <div>Total Traders</div>,
      cell: ({ row }) => (
        <div className="text-sm font-medium flex gap-2 items-center">
          {row.original.total_traders}
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'yes_price',
      header: ({ table }) => <div>Yes Price</div>,
      cell: ({ row }) => (
        <div className="text-sm font-medium">{row.original.yes_price}</div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'no_price',
      header: ({ table }) => <div>No Price</div>,
      cell: ({ row }) => (
        <div className="text-sm font-medium">{row.original.no_price}</div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    // {
    //   accessorKey: 'status',
    //   header: 'Status',
    //   cell: ({ row }) => (
    //     <div className="capitalize">
    //       {row.original.status === 'OPEN' && (
    //         <Badge variant="outline" className="bg-green-200 text-green-600">
    //           {row.original.status}
    //         </Badge>
    //       )}
    //       {row.original.status === 'PAUSED' && (
    //         <Badge variant="outline" className="bg-yellow-200">
    //           {row.original.status}
    //         </Badge>
    //       )}
    //       {row.original.status === 'CLOSED' && (
    //         <Badge variant="outline" className="bg-red-200">
    //           {row.original.status}
    //         </Badge>
    //       )}
    //     </div>
    //   ),
    // },
    {
      accessorKey: 'closing_time',
      header: ({ column }) => {
        return <div>Closing Time</div>
      },
      cell: ({ row }) => (
        <div className="text-sm font-medium">
          {formatDate(row.original.closing_time)}
        </div>
      ),
    },

    {
      accessorKey: 'actions',
      header: ({ column }) => {
        return <div></div>
      },
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
          {row.original.status === 'OPEN' && (
            <PauseActionDialog
              market_id={row.original.name}
              onPauseAction={onPauseAction}
            />
          )}
          {row.original.status === 'PAUSED' && (
            <ResumeActionDialog
              market_id={row.original.name}
              onResumeAction={onResumeAction}
            />
          )}
          {(row.original.status === 'OPEN' ||
            row.original.status === 'PAUSED') && (
            <CloseActionDialog
              market_id={row.original.name}
              onCloseAction={onCloseAction}
            />
          )}
          {row.original.status === 'CLOSED' && (
            <ResolveSheet
              market_id={row.original.name}
              onResolveAction={onResolveAction}
            />
          )}
        </div>
      ),
    },
    // {
    //   accessorKey: 'amount',
    //   header: () => <div className="text-right">Amount</div>,
    //   cell: ({ row }) => {
    //     const amount = parseFloat(row.getValue('amount'))

    //     // Format the amount as a dollar amount
    //     const formatted = new Intl.NumberFormat('en-US', {
    //       style: 'currency',
    //       currency: 'USD',
    //     }).format(amount)

    //     return <div className="text-right font-medium">{formatted}</div>
    //   },
    // },
    // {
    //   id: 'actions',
    //   enableHiding: false,
    //   cell: ({ row }) => {
    //     const payment = row.original

    //     return (
    //       <DropdownMenu>
    //         <DropdownMenuTrigger asChild>
    //           <Button variant="ghost" className="h-8 w-8 p-0">
    //             <span className="sr-only">Open menu</span>
    //             <MoreHorizontal />
    //           </Button>
    //         </DropdownMenuTrigger>
    //         <DropdownMenuContent align="end">
    //           <DropdownMenuLabel>Actions</DropdownMenuLabel>
    //           <DropdownMenuItem
    //             onClick={() => navigator.clipboard.writeText(payment.id)}
    //           >
    //             Copy payment ID
    //           </DropdownMenuItem>
    //           <DropdownMenuSeparator />
    //           <DropdownMenuItem>View customer</DropdownMenuItem>
    //           <DropdownMenuItem>View payment details</DropdownMenuItem>
    //         </DropdownMenuContent>
    //       </DropdownMenu>
    //     )
    //   },
    // },
  ]

  const table = useReactTable({
    data: favoriteMarketsData || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full">
      <div className="flex items-center pb-4">
        {/* <Input
          placeholder="Filter emails..."
          value={table.getColumn('email')?.getFilterValue() ?? ''}
          onChange={(event) =>
            table.getColumn('email')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        /> */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
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
                  data-state={row.getIsSelected() && 'selected'}
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
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

export default FavoriteMarkets
