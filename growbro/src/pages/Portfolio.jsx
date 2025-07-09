import React, { cache, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  XCircle,
  Plus,
  CloudLightning,
  ShieldEllipsis,
  ArrowDown,
  FileText,
  CalendarIcon,
  ArrowUp,
  Download,
} from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js'
import TradeSheet from '../components/defaultTradeSheet'
import {
  useFrappeAuth,
  useFrappeGetCall,
  useFrappeGetDocList,
  useFrappePostCall,
} from 'frappe-react-sdk'
import ActivePosition from '../components/ActivePositions'
import NoActiveTradesIcon from '@/assets/NoActiveTradesIcon.svg'

import PortfolioActiveValues from '../components/PortfolioActiveValues'
import CompletedTrades from '../components/CompletedTrades'

const FormSchema = z
  .object({
    from: z.date({
      required_error: 'From date is required.',
    }),
    to: z.date({
      required_error: 'To date is required.',
    }),
  })
  .refine((data) => data.from.getTime() !== data.to.getTime(), {
    message: 'From and To date cannot be the same.',
    path: ['to'], // shows the error under the 'to' field
  })

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
)

const Portfolio = () => {
  const { call } = useFrappePostCall('frappe.client.get_list')
  const { currentUser } = useFrappeAuth()
  const form = useForm({
    resolver: zodResolver(FormSchema),
  })

  const [isReportDrawerOpen, setIsReportDrawerOpen] = useState(false)

  const downloadCSV = (data, filename) => {
    if (!data || data.length === 0) {
      alert('No data to download')
      return
    }

    // Helper to convert `user_name` → `User Name`
    const formatHeader = (key) =>
      key
        .replace(/_/g, ' ')
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

    // Format headers
    const headers = Object.keys(data[0]).map(formatHeader).join(',')

    // Keep values as-is
    const rows = data.map((row) => Object.values(row).join(','))

    // Combine headers and rows
    const csvContent = [headers, ...rows].join('\n')

    // Trigger file download
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const onSubmit = async (data) => {
    console.log(data)
    const getCorrectDateString = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    const from = getCorrectDateString(data.from)
    const to = getCorrectDateString(data.to)
    console.log('Data: ', from, to, currentUser)
    try {
      const response = await call({
        doctype: 'Holding', // replace with actual Doctype\
        fields: [
          'market_id',
          'question',
          'quantity',
          'price',
          'exit_price',
          'returns',
        ],
        filters: [
          ['creation', '>=', from + ' 00:00:00'],
          ['creation', '<=', to + ' 23:59:59'],
          ['user_id', '=', currentUser],
        ],
      })

      console.log('Res : ', response)

      const holdings = response.message || []

      if (holdings.length > 0) {
        const filename = `holdings_${from}_to_${to}_user_${currentUser}.csv`
        downloadCSV(holdings, filename)
        toast.success('Report Downloaded')
        setIsReportDrawerOpen(false)
      } else {
        toast.error('No active holdings found')
      }
    } catch (error) {
      console.error('Failed to fetch report', error)
      toast.error('Failed to fetch data')
    }
  }

  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(tab || 'active')
  const [selectedChoice, setSelectedChoice] = useState(null)
  const [selectedAction, setSelectedAction] = useState(null)
  const [marketPrice, setMarketPrice] = useState(null)
  const [marketId, setMarketId] = useState(null)
  const [sellQuantity, setSellQuantity] = useState(null)
  const [previousOrderId, setPreviousOrderId] = useState(null)
  const [showTradeSheet, setShowTradeSheet] = useState(false)

  const [activeHoldings, setActiveHoldings] = useState({})

  const {
    data: holdingData,
    isLoading: holdingDataLoading,
    mutate: refetchActiveHoldings,
  } = useFrappeGetCall(
    'rewardapp.engine.get_marketwise_holding',
    activeTab === 'active' ? undefined : null
  )

  const { data } = useFrappeGetDocList('Holding', {
    fields: ['*'],
  })

  console.log(data)

  const { data: completedTradesData, isLoading: completedTradesDataLoading } =
    useFrappeGetCall(
      'rewardapp.engine.total_returns',
      {
        user_id: currentUser,
      },
      currentUser && activeTab === 'completed' ? undefined : null
    )

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (!tab) {
      searchParams.set('tab', 'active')
      setSearchParams(searchParams)
    }
  }, [])

  // useEffect(() => {
  //   if (!holdingDataLoading && holdingData === undefined) {
  //     return
  //   }
  //   if (!holdingDataLoading && Object.values(holdingData).length > 0) {
  //     const holdingDataMap = Object.values(holdingData).reduce(
  //       (acc, holding) => {
  //         acc[holding.name] = holding // ✅ Store as { "market_name": marketData }
  //         return acc
  //       },
  //       {}
  //     )
  //     setActiveHoldings(holdingDataMap)
  //   }
  // }, [holdingData])

  // console.log('Holdings: ', activeHoldings)

  // useEffect(() => {
  //   if (!completedTradesDataLoading && completedTradesData === undefined) return
  //   if (!completedTradesDataLoading && completedTradesData?.length > 0) {
  //     const completedTradesMap = completedTradesData.reduce((acc, trade) => {
  //       acc[trade.name] = trade // ✅ Store as { "market_name": marketData }
  //       return acc
  //     }, {})
  //     setCompletedTrades(completedTradesMap)
  //   }
  // }, [completedTradesData])

  // const { data: userOrders, isLoading: userOrdersLoading } =
  //   useFrappeGetDocList(
  //     'Orders',
  //     {
  //       filters: [['owner', '=', currentUser]], // Replace with logged-in user
  //       fields: [
  //         'name',
  //         'question',
  //         'creation',
  //         'amount',
  //         'status',
  //         'filled_quantity',
  //         'owner',
  //         'quantity',
  //         'opinion_type',
  //         'closing_time',
  //         'order_type',
  //         'market_id',
  //         'yes_price',
  //         'no_price',
  //         'buy_order_id',
  //         'sell_order_id',
  //       ],
  //     },
  //     currentUser ? undefined : null
  //   )

  // useFrappeEventListener('order_event', (updatedOrder) => {
  //   console.log('Updated Order:', updatedOrder)

  //   setActiveOrders((prev) => {
  //     const updatedActiveOrders = {
  //       ...prev,
  //       [updatedOrder.name]: updatedOrder,
  //     }
  //     return updatedActiveOrders
  //   })
  // })

  const performanceData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        fill: true,
        label: 'Portfolio Value',
        data: [1000, 1200, 1150, 1400, 1300, 1500, 1450],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1F2937',
        bodyColor: '#1F2937',
        borderColor: '#E5E7EB',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6B7280', font: { size: 10 } },
      },
      y: {
        grid: { color: '#F3F4F6' },
        ticks: {
          color: '#6B7280',
          font: { size: 10 },
          callback: (value) => `₹${value}`,
        },
      },
    },
  }

  const handleTradeClick = (
    marketPrice,
    choice,
    tradeAction,
    marketId,
    sellQuantity,
    previousOrderId
  ) => {
    setSelectedChoice(choice)
    setSelectedAction(tradeAction)
    setMarketPrice(marketPrice)
    setMarketId(marketId)
    setSellQuantity(sellQuantity)
    setPreviousOrderId(previousOrderId)
    setShowTradeSheet(true)
  }

  const handleTradeComplete = () => {
    setShowTradeSheet(false)
    setSelectedChoice(null)
    setSelectedAction(null)
  }

  if (
    (holdingDataLoading && tab === 'active') ||
    (completedTradesDataLoading && tab === 'completed')
  ) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="spinner w-14 h-14 rounded-full border-4 border-gray-200 border-r-blue-500 animate-spin"></div>
      </div>
    )
  }

  return (
    <div className=" bg-gray-50 ">
      {/* Header Section with improved contrast */}
      <div className="bg-indigo-600 pb-8 pt-4">
        <div className="px-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/')}
              className="p-0 text-white/90 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">Portfolio</h1>
          </div>

          {/* Portfolio Stats Card with better contrast */}
          {activeTab === 'active' ? <PortfolioActiveValues /> : null}
          {activeTab === 'completed' && !completedTradesDataLoading ? (
            <div className="flex justify-between">
              <div className="flex flex-col gap-2 items-start">
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">Invested</span>
                  {/* <div className="flex items-center bg-emerald-500 bg-opacity-25 backdrop-blur-sm px-2.5 py-1 rounded-full">
        <TrendingUp className="h-4 w-4 text-white mr-1" />
        <span className="text-sm font-semibold text-white">+12.5%</span>
      </div> */}
                </div>
                <div className="text-3xl font-bold text-white flex items-center gap-4">
                  <div>
                    ₹
                    {completedTradesData?.message?.length > 0
                      ? completedTradesData?.message?.reduce((acc, value) => {
                          return acc + value.total_invested
                        }, 0)
                      : 0}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">Returns</span>
                  {/* <div className="flex items-center bg-emerald-500 bg-opacity-25 backdrop-blur-sm px-2.5 py-1 rounded-full">
        <TrendingUp className="h-4 w-4 text-white mr-1" />
        <span className="text-sm font-semibold text-white">+12.5%</span>
      </div> */}
                </div>
                <div className="text-3xl font-bold text-white flex items-center gap-4">
                  <div>
                    ₹
                    {completedTradesData?.message?.length > 0
                      ? completedTradesData?.message?.reduce((acc, value) => {
                          return acc + value.total_returns
                        }, 0)
                      : 0}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {/* Chart Card */}
          {/* <div className="bg-white rounded-3xl p-4 shadow-sm">
            <div className="h-40">
              <Line data={performanceData} options={chartOptions} />
            </div>
          </div> */}
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 -mt-4">
        <div className="bg-white rounded-3xl shadow-sm">
          {/* Tabs */}
          <div className="flex p-2">
            <button
              onClick={() => {
                navigate('/portfolio?tab=active')
                setActiveTab('active')
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'active'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Active Positions
            </button>
            <button
              onClick={() => {
                navigate('/portfolio?tab=completed')
                setActiveTab('completed')
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'completed'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Completed Trades
            </button>
          </div>

          {/* Filter Bar */}
          {/* <div className="p-4 flex items-center justify-between border-b border-gray-100">
            <div className="text-sm font-medium text-gray-700">
              {activeTab === 'active'
                ? `${Object.values(activeHoldings).length} Active Position`
                : `${Object.values(completedTrades).length} Trades this month`}
            </div>
            <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <Filter className="h-4 w-4 text-gray-600" />
            </button>
          </div> */}

          {!holdingDataLoading &&
            activeTab === 'active' &&
            holdingData &&
            Object.values(holdingData.message).length === 0 && (
              <div className="w-full flex flex-col gap-2 items-center justify-center py-4">
                <div>
                  <img className="h-8 w-8" src={NoActiveTradesIcon} alt="" />
                </div>
                <div className="text-sm text-[#5F5F5F]">
                  No active trades right now
                </div>
              </div>
            )}

          {!completedTradesDataLoading &&
            activeTab === 'completed' &&
            holdingData &&
            completedTradesData?.message?.length === 0 && (
              <div className="w-full flex flex-col gap-2 items-center justify-center py-4">
                <div>
                  <img className="h-8 w-8" src={NoActiveTradesIcon} alt="" />
                </div>
                <div className="text-sm text-[#5F5F5F]">
                  No completed trades
                </div>
              </div>
            )}
          {/* Trades List */}
          <div className="divide-y divide-gray-100">
            {activeTab === 'active' && holdingData
              ? Object.values(holdingData.message)?.map((position) => (
                  <div key={position?.market_id}>
                    <ActivePosition
                      position={position}
                      refetchActiveHoldings={refetchActiveHoldings}
                    />
                  </div>
                ))
              : null}
            {activeTab === 'completed'
              ? completedTradesData?.message?.map((trade) => (
                  <CompletedTrades key={trade.market_id} trade={trade} />
                ))
              : null}
          </div>
        </div>
      </div>

      {activeTab === 'completed' && (
        <div className="max-w-md mx-auto p-4">
          <Drawer
            className="max-w-md"
            open={isReportDrawerOpen}
            onOpenChange={setIsReportDrawerOpen}
          >
            <DrawerTrigger className="w-full">
              <div className="w-full flex flex-col gap-2 justify-center items-center mt-4 border-2 border-dashed p-4 rounded-3xl">
                <div>
                  <Download className="h-10 w-20" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col gap-1 items-center">
                  <p className="text-sm font-semibold">
                    Looking for older events
                  </p>
                  <p className="text-xs text-[#5F5F5F]">
                    Click here to download
                  </p>
                </div>
              </div>
            </DrawerTrigger>
            <DrawerContent className="p-0 max-w-lg mx-auto w-full">
              <DrawerHeader className="w-full p-0 ">
                <div className="flex flex-col gap-2 px-4 items-start">
                  <DrawerTitle className="p-0 mx-left">
                    <FileText strokeWidth={1} className="h-8 w-8" />
                  </DrawerTitle>
                  <DrawerDescription>Download PDF Report</DrawerDescription>
                </div>
              </DrawerHeader>
              <DrawerFooter>
                <div>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="">
                      <div className="w-full flex flex-col gap-6">
                        <FormField
                          control={form.control}
                          name="from"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>From Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={'outline'}
                                      className={cn(
                                        'w-[240px] pl-3 text-left font-normal',
                                        !field.value && 'text-muted-foreground'
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, 'PPP')
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date > new Date() ||
                                      date < new Date('1900-01-01')
                                    }
                                    captionLayout="dropdown"
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormDescription>
                                Select the start date for the report range.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="to"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>To Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={'outline'}
                                      className={cn(
                                        'w-[240px] pl-3 text-left font-normal',
                                        !field.value && 'text-muted-foreground'
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, 'PPP')
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date > new Date() ||
                                      date < new Date('1900-01-01')
                                    }
                                    captionLayout="dropdown"
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormDescription>
                                Select the end date for the report range.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit">Generate Report</Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      )}

      {showTradeSheet && selectedChoice && (
        <TradeSheet
          marketPrice={marketPrice}
          choice={selectedChoice}
          tradeAction={selectedAction}
          onClose={handleTradeComplete}
          marketId={marketId}
          sellQuantity={sellQuantity}
          previousOrderId={previousOrderId}
          refetchActiveHoldings={refetchActiveHoldings}
        />
      )}
    </div>
  )
}

export default Portfolio

{
  /* <div
                className={`text-sm font-semibold flex items-center ${
                  profitLoss > 0 && 'text-green-600'
                } ${profitLoss < 0 && 'text-red-600'}`}
              >
                {profitLoss}
                {profitLoss > 0 && <ArrowUp className="h-5 w-5" />}
                {profitLoss < 0 && <ArrowDown className="h-5 w-5" />}
              </div> */
}
