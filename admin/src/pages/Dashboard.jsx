import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Badge } from '@/components/ui/badge'

import * as React from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react'

import { Checkbox } from '@/components/ui/checkbox'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  useFrappeGetDocCount,
  useFrappeGetDocList,
  useFrappeUpdateDoc,
} from 'frappe-react-sdk'
import { Ellipsis, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import OpenMarkets from '../components/OpenMarkets'
import ClosedMarkets from '../components/ClosedMarkets'
import FavoriteMarkets from '../components/FavoriteMarkets'
import { useFrappeAuth } from 'frappe-react-sdk'
import PausedMarkets from '../components/PausedMarkets'

const data = [
  {
    id: 'm5gr84i9',
    amount: 316,
    status: 'success',
    email: 'ken99@example.com',
  },
  {
    id: '3u1reuv4',
    amount: 242,
    status: 'success',
    email: 'Abe45@example.com',
  },
  {
    id: 'derv1ws0',
    amount: 837,
    status: 'processing',
    email: 'Monserrat44@example.com',
  },
  {
    id: '5kma53ae',
    amount: 874,
    status: 'success',
    email: 'Silas22@example.com',
  },
  {
    id: 'bhqecj4p',
    amount: 721,
    status: 'failed',
    email: 'carmella@example.com',
  },
]

const Dashboard = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedMarketId, setSelectedMarketId] = useState(null)
  const [sorting, setSorting] = React.useState([])
  const [columnFilters, setColumnFilters] = React.useState([])
  const [columnVisibility, setColumnVisibility] = React.useState({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'open'
  const categories = searchParams.get('categories')?.split(',')

  const openMarketsFilters = [['status', '=', 'OPEN']]
  const closedMarketsFilters = [['status', 'in', ['CLOSED']]]
  const pausedMarketsFilters = [['status', 'in', ['PAUSED']]]
  if (categories?.length) {
    openMarketsFilters.push(['category', 'in', categories])
    pausedMarketsFilters.push(['category', 'in', categories])
    closedMarketsFilters.push(['category', 'in', categories])
  }

  const handleTabChange = (newTab) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('tab', newTab) // update tab
    setSearchParams(newParams) // apply while preserving others
  }

  const { data: marketCount, isLoading: marketCountLoading } =
    useFrappeGetDocCount('Market', [['status', '=', 'OPEN']])

  const { data: marketCategoryCount, isLoading: marketCategoryCountLoading } =
    useFrappeGetDocCount('Market Category', [['is_active', '=', true]])

  const { data: usersData, isLoading: usersDataLoading } = useFrappeGetDocList(
    'User',
    {
      fields: ['*'],
    }
  )

  const { data: pendingKycUsersData, isLoading: pendingKycUsersDataLoading } =
    useFrappeGetDocList('User', {
      fields: ['*'],
    })

  const { data: teamSizeData, isLoading: teamSizeDataLoading } =
    useFrappeGetDocCount('User', [['role_profile_name', '=', 'Trader']])

  console.log('Pending: ', pendingKycUsersData)

  const { updateDoc } = useFrappeUpdateDoc()

  const {
    data: openMarketsData,
    isLoading: openMarketsDataLoading,
    mutate: refetchOpenMarketsData,
  } = useFrappeGetDocList(
    'Market',
    {
      fields: [
        'name',
        'question',
        'category',
        'yes_price',
        'no_price',
        'total_traders',
        'closing_time',
        'status',
      ],
      filters: openMarketsFilters,
    },
    tab === 'open' ? undefined : null
  )

  const {
    data: pausedMarketsData,
    isLoading: pausedMarketsDataLoading,
    mutate: refetchPausedMarketsData,
  } = useFrappeGetDocList(
    'Market',
    {
      fields: [
        'name',
        'question',
        'category',
        'total_traders',
        'yes_price',
        'no_price',
        'total_traders',
        'closing_time',
        'status',
      ],
      filters: pausedMarketsFilters,
    },
    tab === 'paused' ? undefined : null
  )

  const {
    data: closedMarketsData,
    isLoading: closedMarketsDataLoading,
    mutate: refetchClosedMarketsData,
  } = useFrappeGetDocList(
    'Market',
    {
      fields: [
        'name',
        'question',
        'category',
        'total_traders',
        'yes_price',
        'no_price',
        'total_traders',
        'closing_time',
        'status',
      ],
      filters: closedMarketsFilters,
    },
    tab === 'closed' ? undefined : null
  )

  // const {
  //   data: favoriteMarketsData,
  //   isLoading: favoriteMarketsDataLoading,
  //   mutate: refetchFavoriteMarketsData,
  // } = useFrappeGetDocList(
  //   'Market',
  //   {
  //     fields: [
  //       'name',
  //       'question',
  //       'category',
  //       'total_traders',
  //       'yes_price',
  //       'no_price',
  //       'total_traders',
  //       'closing_time',
  //       'status',
  //     ],
  //     filters: [
  //       ['_liked_by', 'like', `%${currentUser}%`],
  //       ['status', 'in', ['OPEN', 'PAUSED', 'CLOSED']],
  //     ],
  //   },
  //   tab === 'favorites' ? undefined : null
  // )

  console.log('Open Market Data', openMarketsData)
  console.log('Paused Market Data', pausedMarketsData)
  console.log('Closed Market Data', closedMarketsData)

  return (
    <div className="py-2 flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <Card className="py-4">
          <CardHeader>
            <div className="flex flex-col gap-3 items-center">
              <CardTitle className="font-semibold text-4xl">
                {!usersDataLoading &&
                  usersData?.length > 0 &&
                  usersData?.reduce((acc, user) => {
                    if (user.role_profile_name === 'Trader') {
                      acc = acc + 1
                    }
                    return acc
                  }, 0)}
              </CardTitle>
              <CardDescription className="font-medium tracking-wide text-md">
                Total Users
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
        <Card className="py-4">
          <CardHeader>
            <div className="flex flex-col gap-3 items-center">
              <CardTitle className="font-semibold text-4xl">
                {!pendingKycUsersDataLoading &&
                  pendingKycUsersData?.length > 0 &&
                  pendingKycUsersData?.reduce((acc, user) => {
                    if (user.role_profile_name === 'Trader') {
                      acc = acc + 1
                    }
                    return acc
                  }, 0)}
              </CardTitle>
              <CardDescription className="font-medium tracking-wide text-md">
                Pending KYC Users
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
        <Card className="py-4">
          <CardHeader>
            <div className="flex flex-col gap-3 items-center">
              <CardTitle className="font-semibold text-4xl">
                {!marketCountLoading && marketCount ? marketCount : 0}
              </CardTitle>
              <CardDescription className="font-medium tracking-wide text-md">
                Active Markets
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
        <Card className="py-4">
          <CardHeader>
            <div className="flex flex-col gap-3 items-center">
              <CardTitle className="font-semibold text-4xl">
                {!marketCategoryCountLoading && marketCategoryCount
                  ? marketCategoryCount
                  : 0}
              </CardTitle>
              <CardDescription className="font-medium tracking-wide text-md">
                Total Market Categories
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
        <Card className="py-4">
          <CardHeader>
            <div className="flex flex-col gap-3 items-center">
              <CardTitle className="font-semibold text-4xl">
                {!teamSizeDataLoading && teamSizeData ? teamSizeData : 0}
              </CardTitle>
              <CardDescription className="font-medium tracking-wide text-md">
                Team Size
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-2 w-full">
        <Tabs className="w-full" value={tab} onValueChange={handleTabChange}>
          <div className="w-full">
            <TabsList className="flex gap-4 w-full justify-start">
              {/* <TabsTrigger
                value="favorites"
                className="w-[12.5%]  flex justify-start items-center p-2.5"
              >
                Favorites
              </TabsTrigger> */}
              <TabsTrigger
                value="open"
                className="w-[12.5%] flex justify-start items-center p-2.5"
              >
                Open
              </TabsTrigger>
              <TabsTrigger
                value="paused"
                className="w-[12.5%] flex justify-start items-center p-2.5"
              >
                Paused
              </TabsTrigger>
              <TabsTrigger
                value="closed"
                className="w-[12.5%]  flex justify-start items-center p-2.5"
              >
                Closed
              </TabsTrigger>
            </TabsList>
          </div>

          {/* <TabsContent value="favorites">
            <FavoriteMarkets
              favoriteMarketsData={favoriteMarketsData}
              favoriteMarketsDataLoading={favoriteMarketsDataLoading}
              refetchFavoriteMarketsData={refetchFavoriteMarketsData}
            />
          </TabsContent> */}
          <TabsContent value="open">
            <OpenMarkets
              openMarketsData={openMarketsData}
              openMarketsDataLoading={openMarketsDataLoading}
              refetchOpenMarketsData={refetchOpenMarketsData}
            />
          </TabsContent>
          <TabsContent value="paused">
            <PausedMarkets
              pausedMarketsData={pausedMarketsData}
              pausedMarketsDataLoading={pausedMarketsDataLoading}
              refetchPausedMarketsData={refetchPausedMarketsData}
            />
          </TabsContent>
          <TabsContent value="closed">
            <ClosedMarkets
              closedMarketsData={closedMarketsData}
              closedMarketsDataLoading={closedMarketsDataLoading}
              refetchClosedMarketsData={refetchClosedMarketsData}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Are You Sure You Want to Close the Market?
            </DialogTitle>
            <DialogDescription>
              Closing the market will stop all trading and finalize the outcome.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="flex gap-2 items-center">
              <Button
                type="button"
                onClick={() => {
                  setIsDialogOpen(false)
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleCloseMarket()
                }}
              >
                Confirm
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </div>
  )
}

export default Dashboard
