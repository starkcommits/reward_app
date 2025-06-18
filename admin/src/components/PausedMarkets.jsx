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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

import { useSearchParams } from 'react-router-dom'

import {
  ChevronDown,
  CirclePause,
  CircleCheck,
  CircleX,
  CirclePlay,
} from 'lucide-react'

import { useFrappeUpdateDoc } from 'frappe-react-sdk'
import { TabsTrigger } from '@radix-ui/react-tabs'
import PauseActionDialog from './PauseActionDialog'
import ResumeActionDialog from './ResumeActionDialog'
import CloseActionDialog from './CloseActionDialog'
import MultipleSelector from '@/components/ui/multiple-selector'
import getISTDateTime from './getISTDateTime'

const OPTIONS = [
  { label: 'Politics', value: 'Politics' },
  { label: 'Sports', value: 'Sports' },
  { label: 'Tech', value: 'Tech' },
]

const PausedMarkets = ({
  pausedMarketsData,
  pausedMarketsDataLoading,
  refetchPausedMarketsData,
}) => {
  const [sorting, setSorting] = React.useState([])
  const [pauseDialogOpen, setPauseDialogOpen] = React.useState(false)
  const [resumeDialogOpen, setResumeDialogOpen] = React.useState(false)
  const [closeDialogOpen, setCloseDialogOpen] = React.useState(false)
  const [columnFilters, setColumnFilters] = React.useState([])
  const [columnVisibility, setColumnVisibility] = React.useState({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [value, setValue] = React.useState([])
  const [searchParams, setSearchParams] = useSearchParams()

  React.useEffect(() => {
    const newParams = new URLSearchParams(searchParams.toString())
    if (value.length > 0) {
      const marketCategories = value.map((item) => item.value)
      newParams.set('categories', marketCategories.join(','))
    } else {
      newParams.delete('categories')
    }
    setSearchParams(newParams)
  }, [value])

  console.log('new values: ', value)

  const { updateDoc } = useFrappeUpdateDoc()

  const onResumeAction = async (market_id) => {
    try {
      await updateDoc('Market', market_id, {
        status: 'OPEN',
      })
      refetchPausedMarketsData()
      toast.success('Market resumed successfully')
      setResumeDialogOpen(false)
    } catch (err) {
      console.log(err)
      toast.error('Error in resuming market')
    }
  }

  const onCloseAction = async (market_id) => {
    try {
      const istNow = getISTDateTime()
      await updateDoc('Market', market_id, {
        status: 'CLOSED',
        closing_time: istNow,
      })
      refetchPausedMarketsData()
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
      accessorKey: 'name',
      id: 'name',
      header: ({ table }) => <div>ID</div>,
      cell: ({ row }) => (
        <div className="text-sm font-medium flex items-center gap-2">
          {row.original?.name?.split('_')[2]}
          {row.original?.category === 'Sports' ? (
            <Badge variant="outline">{row.original.category}</Badge>
          ) : null}
          {row.original?.category === 'Politics' ? (
            <Badge variant="outline">{row.original.category}</Badge>
          ) : null}
          {row.original?.category === 'Tech' ? (
            <Badge variant="outline">{row.original.category}</Badge>
          ) : null}
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
          {row.original.question.length > 250
            ? `${row.original.question.substr(0, 250)}...`
            : row.original.question}
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
      id: 'yes_no_price',
      header: ({ table }) => (
        <div className="">
          <span className="text-green-700">Yes</span>/
          <span className="text-red-700">No</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-sm font-medium">
          <span className="text-green-700">{row.original.yes_price}</span>/
          <span className="text-red-700">{row.original.no_price}</span>
        </div>
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
        return <div>Action</div>
      },
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground font-medium ">
          {console.log('market id', row.original.name)}
          <div className="flex items-center gap-2">
            {row.original.status === 'PAUSED' && (
              <ResumeActionDialog
                market_id={row.original.name}
                onResumeAction={onResumeAction}
              />
            )}
            <div>
              <CloseActionDialog
                market_id={row.original.name}
                onCloseAction={onCloseAction}
              />
            </div>
          </div>
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
    data: pausedMarketsData || [],
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
      <div className="flex items-center py-4">
        {/* <Input
          placeholder="Filter emails..."
          value={table.getColumn('email')?.getFilterValue() ?? ''}
          onChange={(event) =>
            table.getColumn('email')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        /> */}
        <div className="flex flex-col gap-1">
          <MultipleSelector
            className="w-[280px]"
            value={value}
            onChange={setValue}
            options={OPTIONS}
            hidePlaceholderWhenSelected
            placeholder="Select category you like..."
            emptyIndicator={
              <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                no results found.
              </p>
            }
          />
        </div>
        {/* <DropdownMenu>
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
        </DropdownMenu> */}
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

export default PausedMarkets
