import React, { cache, useEffect, useMemo, useState } from 'react'
import {
  redirect,
  useAsyncError,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  ArrowUp,
  LogOut,
  CircleX,
  ArrowRight,
} from 'lucide-react'
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
  useFrappeCreateDoc,
  useFrappeDocTypeEventListener,
  useFrappeEventListener,
  useFrappeGetCall,
  useFrappeGetDoc,
  useFrappeGetDocList,
  useFrappePostCall,
  useFrappeUpdateDoc,
  useSWRConfig,
} from 'frappe-react-sdk'
import ActivePosition from '../components/ActivePositions'
import CompletedTrades from '../components/CompletedTrades'
import Portfolio from './Portfolio'
import PortfolioActiveValues from '../components/PortfolioActiveValues'
import { Slider } from '@/components/ui/slider'

import toast from 'react-hot-toast'
import CancelHoldingDialog from '../components/CancelHoldingDialog'
import SellTradeSheet from '../components/SellTradeSheet'
import { DittofeedSdk } from '@dittofeed/sdk-web'

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

const ActiveMarketHolding = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { mutate } = useSWRConfig()

  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(tab || 'all')

  const [selectedChoice, setSelectedChoice] = useState(null)
  const [selectedAction, setSelectedAction] = useState(null)
  const [marketPrice, setMarketPrice] = useState(null)
  const [marketId, setMarketId] = useState(null)
  const [sellQuantity, setSellQuantity] = useState(null)
  const [previousOrderId, setPreviousOrderId] = useState(null)
  const [showTradeSheet, setShowTradeSheet] = useState(false)
  const [activeOrders, setActiveOrders] = useState({})
  const [completedOrders, setCompletedOrders] = useState({})
  const { currentUser, isLoading } = useFrappeAuth()
  const [totalReturns, setTotalReturns] = useState(0)
  const [activeHoldings, setActiveHoldings] = useState({})
  const [activeMatchedHoldings, setActiveMatchedHoldings] = useState({})
  const [activeExitingHoldings, setActiveExitingHoldings] = useState({})
  const [activeExitedHoldings, setActiveExitedHoldings] = useState({})
  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const { updateDoc } = useFrappeUpdateDoc()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [yesEnabled, setYesEnabled] = useState(false)
  const [noEnabled, setNoEnabled] = useState(false)

  const [completedTrades, setCompletedTrades] = useState({})

  const { createDoc } = useFrappeCreateDoc()

  const { data: marketData, isLoading: marketLoading } = useFrappeGetDoc(
    'Market',
    id
  )

  const [yesPrice, setYesPrice] = useState(marketData?.yesPrice)
  const [noPrice, setNoPrice] = useState(marketData?.noPrice)

  const { call } = useFrappePostCall('frappe.client.get')

  const {
    data: totalExitData,
    isLoading: totalExitLoading,
    mutate: refetchTotalExit,
  } = useFrappeGetCall(
    'rewardapp.engine.total_exit',
    {
      market_id: id,
      user_id: currentUser,
    },
    currentUser ? undefined : null
  )

  useEffect(() => {
    if (!totalExitLoading && totalExitData === undefined) return

    if (!totalExitLoading && Object.keys(totalExitData?.message)?.length > 0) {
      if (totalExitData?.message?.yes_price) {
        setYesPrice(totalExitData?.message?.yes_price)
      }
      if (totalExitData?.message?.no_price) {
        setNoPrice(totalExitData?.message?.no_price)
      }
    }
  }, [totalExitData])

  console.log('DDDDDDDDD', totalExitData)

  const {
    data: holdingData,
    isLoading: holdingDataLoading,
    mutate: refetcHoldingData,
  } = useFrappeGetDocList(
    'Holding',
    {
      fields: [
        'name',
        'market_id',
        'order_id',
        'price',
        'quantity',
        'opinion_type',
        'status',
        'exit_price',
        'market_yes_price',
        'market_no_price',
        'creation',
        'filled_quantity',
      ],
      filters: [
        ['user_id', '=', currentUser],
        ['market_id', '=', id],
      ],
    },
    currentUser && tab === 'all' ? ['get_all_holdings'] : null
  )

  const {
    data: matchedHoldingData,
    isLoading: matchedHoldingDataLoading,
    mutate: refetchMatchedHoldingData,
  } = useFrappeGetDocList(
    'Holding',
    {
      fields: [
        'name',
        'market_id',
        'price',
        'quantity',
        'opinion_type',
        'status',
        'exit_price',
        'market_yes_price',
        'market_no_price',
        'creation',
        'filled_quantity',
      ],
      filters: [
        ['user_id', '=', currentUser],
        ['market_id', '=', id],
        ['status', '=', 'ACTIVE'],
      ],
    },
    currentUser && tab === 'matched' ? ['get_matched_holdings'] : null
  )

  const {
    data: exitingHoldingData,
    isLoading: exitingHoldingDataLoading,
    mutate: refetchExitingHoldingData,
  } = useFrappeGetDocList(
    'Holding',
    {
      fields: [
        'name',
        'market_id',
        'order_id',
        'price',
        'quantity',
        'opinion_type',
        'status',
        'exit_price',
        'market_yes_price',
        'market_no_price',
        'creation',
        'filled_quantity',
      ],
      filters: [
        ['user_id', '=', currentUser],
        ['market_id', '=', id],
        ['status', '=', 'EXITING'],
      ],
    },
    currentUser && tab === 'exiting' ? ['get_exiting_holdings'] : null
  )
  const {
    data: exitedHoldingData,
    isLoading: exitedHoldingDataLoading,
    mutate: refetchExitedHoldingData,
  } = useFrappeGetDocList(
    'Holding',
    {
      fields: [
        'name',
        'market_id',
        'price',
        'quantity',
        'opinion_type',
        'status',
        'exit_price',
        'market_yes_price',
        'market_no_price',
        'creation',
        'filled_quantity',
      ],
      filters: [
        ['user_id', '=', currentUser],
        ['market_id', '=', id],
        ['status', '=', 'EXITED'],
      ],
    },
    currentUser && tab === 'exited'
      ? ['HoldingList', 'exited', tab, currentUser, id]
      : null
  )

  console.log('Exited ::', exitedHoldingData)

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (!tab) {
      searchParams.set('tab', 'all')
      setSearchParams(searchParams)
    }
  }, [])

  //   useEffect(() => {
  //     // Reset relevant state based on which tab we're switching to
  //     if (activeTab === 'All') {
  //       refetcHoldingData()
  //       // Optionally clear other states
  //       setActiveMatchedHoldings({})
  //       setActiveExitingHoldings({})
  //       setActiveExitedHoldings({})
  //     } else if (activeTab === 'Matched') {
  //       refetchMatchedHoldingData()
  //       // Optionally clear other states
  //       setActiveHoldings({})
  //       setActiveExitingHoldings({})
  //       setActiveExitedHoldings({})
  //     } else if (activeTab === 'Exiting') {
  //       refetchExitingHoldingData()
  //       // Optionally clear other states
  //       setActiveHoldings({})
  //       setActiveMatchedHoldings({})
  //       setActiveExitedHoldings({})
  //     } else if (activeTab === 'Exited') {
  //       refetchExitedHoldingData()
  //       // Optionally clear other states
  //       setActiveHoldings({})
  //       setActiveMatchedHoldings({})
  //       setActiveExitingHoldings({})
  //     }
  //   }, [tab]) // This will run whenever activeTab changes

  //   useEffect(() => {
  //     if (!holdingDataLoading && holdingData?.length > 0) {
  //       const holdingDataMap = holdingData.reduce((acc, holding) => {
  //         acc[holding.name] = holding // ✅ Store as { "market_name": marketData }
  //         return acc
  //       }, {})
  //       setActiveHoldings(holdingDataMap)
  //     }
  //   }, [holdingData])

  //   useEffect(() => {
  //     if (!matchedHoldingDataLoading && matchedHoldingData?.length > 0) {
  //       const holdingDataMap = matchedHoldingData.reduce((acc, holding) => {
  //         acc[holding.name] = holding // ✅ Store as { "market_name": marketData }
  //         return acc
  //       }, {})
  //       setActiveMatchedHoldings(holdingDataMap)
  //     }
  //   }, [matchedHoldingData])

  //   useEffect(() => {
  //     if (!exitingHoldingDataLoading)
  //       if (exitingHoldingData?.length === 0) {
  //         setActiveExitingHoldings({})
  //       } else {
  //         const holdingDataMap = exitingHoldingData?.reduce((acc, holding) => {
  //           acc[holding.name] = holding // ✅ Store as { "market_name": marketData }
  //           return acc
  //         }, {})
  //         setActiveExitingHoldings(holdingDataMap)
  //       }
  //   }, [exitingHoldingData])

  //   useEffect(() => {
  //     if (!exitedHoldingDataLoading && exitedHoldingData?.length > 0) {
  //       const holdingDataMap = exitedHoldingData.reduce((acc, holding) => {
  //         acc[holding.name] = holding // ✅ Store as { "market_name": marketData }
  //         return acc
  //       }, {})
  //       setActiveExitedHoldings(holdingDataMap)
  //     }
  //   }, [exitedHoldingData])

  useFrappeDocTypeEventListener('Holding', (event) => {
    console.log('Hlding event entered')
    switch (tab) {
      case 'all':
        console.log('1')
        refetcHoldingData()
        refetchTotalExit()
      case 'matched':
        console.log('2')
        refetchMatchedHoldingData()
        refetchTotalExit()
      case 'exiting':
        console.log('3')
        refetchExitingHoldingData()
        refetchTotalExit()
      case 'exited':
        console.log('4')
        refetchExitedHoldingData()
        refetchTotalExit()
    }
  })

  //   useFrappeEventListener('order_event', (updatedOrder) => {
  //     console.log('Updated Order:', updatedOrder)

  //     setActiveOrders((prev) => {
  //       const updatedActiveOrders = {
  //         ...prev,
  //         [updatedOrder.name]: updatedOrder,
  //       }
  //       return updatedActiveOrders
  //     })
  //   })

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

  const handleExitPositions = async () => {
    try {
      if (totalExitData?.message?.YES > 0 && yesEnabled) {
        await createDoc('Orders', {
          market_id: id,
          quantity: totalExitData?.message?.YES,
          opinion_type: 'YES',
          status: 'UNMATCHED',
          user_id: currentUser,
          amount: yesPrice,
          filled_quantity: 0,
          order_type: 'SELL',
        })
        DittofeedSdk.track({
          event: 'Sell Order Placed',
          userId: currentUser,
          properties: {
            market_id: id,
            opinion_type: 'YES',
            quantity: totalExitData?.message?.YES,
            amount: yesPrice,
            timestamp: new Date().toISOString(),
          },
        })
      }

      if (totalExitData?.message?.NO > 0 && noEnabled) {
        await createDoc('Orders', {
          market_id: id,
          quantity: totalExitData?.message?.NO,
          opinion_type: 'NO',
          status: 'UNMATCHED',
          user_id: currentUser,
          amount: noPrice,
          filled_quantity: 0,
          order_type: 'SELL',
        })
        DittofeedSdk.track({
          event: 'Sell Order Placed',
          userId: currentUser,
          properties: {
            market_id: id,
            opinion_type: 'NO',
            quantity: totalExitData?.message?.NO,
            amount: noPrice,
            timestamp: new Date().toISOString(),
          },
        })
      }
      refetchTotalExit()
      refetcHoldingData()
      toast.success('All positions exited from this market', {
        top: 0,
      })
      setIsDrawerOpen(false)
    } catch (err) {
      console.log(err)
      toast.error('Error occured in exiting the positions frm the market.')
      setIsDrawerOpen(false)
    }
  }

  const handleCancelOrder = async (
    order_id,
    holding_id,
    holding_filled_quantity,
    holding_quantity
  ) => {
    try {
      console.log('Holding: ', holding_id)
      const sellOrder = await call({
        doctype: 'Orders',
        name: order_id,
      })
      if (sellOrder.message.holding_id) {
        await updateDoc('Orders', order_id, {
          status: 'CANCELED',
        })
      } else {
        await updateDoc('Holding', holding_id, {
          status: 'ACTIVE',
        })
      }
      DittofeedSdk.track({
        userId: currentUser,
        event: 'Order Cancelled',
        properties: {
          order_id: order_id,
          market_id: sellOrder.message.market_id,
          opinion_type: sellOrder.message.opinion_type,
          amount: sellOrder.message.amount,
          quantity: sellOrder.message.quantity,
          timestamp: new Date().toISOString(),
        },
      })

      if (activeTab === 'exiting')
        mutate((key) => Array.isArray(key) && key[0] === 'get_exiting_holdings')

      if (activeTab === 'all')
        mutate((key) => Array.isArray(key) && key[0] === 'get_all_holdings')

      toast.success('Order Canceled Successfully.')

      setIsCancelOpen(false)
    } catch (err) {
      console.log(err)
      toast.error('Error occured in canceling the order.')
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

  const invested = Object.values(activeOrders).reduce((acc, order) => {
    return acc + parseFloat(order.amount * order.quantity)
  }, 0)

  const currentValue = Object.values(activeOrders).reduce((acc, order) => {
    return (
      acc +
      parseFloat(
        (order.opinion_type === 'YES' ? order.yes_price : order.no_price) *
          order.quantity
      )
    )
  }, 0)

  const profitLoss = currentValue - invested

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header Section with improved contrast */}
      <div className="bg-indigo-600 pt-safe-top pb-8">
        <div className="px-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(`/portfolio`)}
              className="p-2 -ml-2 text-white/90 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">Portfolio</h1>
          </div>

          <div className="text-white text-2xl p-4 text-center font-medium">
            {marketData?.question}
          </div>

          {/* Portfolio Stats Card with better contrast */}
          <div className="bg-white/30 backdrop-blur-lg rounded-3xl p-6 mb-6">
            <PortfolioActiveValues />
            <div className="flex gap-2 items-center justify-between mt-4">
              <Button
                className="w-[50%] bg-white"
                variant="primary"
                onClick={() => {
                  navigate(`/event/${id}`)
                }}
              >
                Invest
              </Button>

              <Drawer
                className="w-full"
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
              >
                <DrawerTrigger asChild>
                  <button
                    className={`flex gap-1 rounded-md p-2 items-center justify-center w-[50%] ${
                      totalExitData?.message?.NO + totalExitData?.message?.YES >
                      0
                        ? 'bg-white'
                        : 'bg-white/10'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                    disabled={
                      totalExitData?.message?.NO +
                        totalExitData?.message?.YES ===
                      0
                    }
                  >
                    <span className="text-sm font-medium">Exit</span>
                    <ArrowRight strokeWidth={1.5} className="h-4 w-4" />
                  </button>
                </DrawerTrigger>

                <DrawerContent className="mx-auto w-full">
                  <DrawerHeader className="flex items-center justify-center">
                    <DrawerTitle className="w-full flex justify-center">
                      Exit all positions in this particular market
                    </DrawerTitle>
                  </DrawerHeader>
                  <div className="w-full flex flex-col gap-4">
                    {totalExitData?.message?.YES > 0 ? (
                      <div className="mb-6 px-10 flex items-center gap-1">
                        <div className="flex items-center justify-center w-[20%]">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="yes-checkbox"
                              checked={yesEnabled}
                              onCheckedChange={setYesEnabled}
                            />
                            <label
                              htmlFor="yes-checkbox"
                              className="text-md font-medium cursor-pointer"
                            >
                              Yes Price
                            </label>
                          </div>
                        </div>

                        {yesEnabled && (
                          <div className="w-[80%] flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              {/* <span className="text-lg font-medium">Yes Price</span> */}
                              <div className="flex items-center">
                                <span className="text-lg font-medium">
                                  ₹{yesPrice}
                                </span>
                              </div>
                            </div>

                            <div className="flex justify-between ">
                              <Slider
                                defaultValue={[1]}
                                max={9.5}
                                min={0.5}
                                step={0.5}
                                value={[yesPrice]}
                                className={``}
                                onValueChange={(values) => {
                                  if (yesEnabled) setYesPrice(values[0])
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}
                    {totalExitData?.message?.NO > 0 ? (
                      <div className="mb-6 px-10 flex items-center gap-1">
                        <div className="flex items-center justify-center w-[20%]">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="no-checkbox"
                              checked={noEnabled}
                              onCheckedChange={setNoEnabled}
                            />
                            <label
                              htmlFor="no-checkbox"
                              className="text-md font-medium cursor-pointer"
                            >
                              No Price
                            </label>
                          </div>
                        </div>

                        {noEnabled && (
                          <div className="w-[80%] flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              {/* <span className="text-lg font-medium">Yes Price</span> */}
                              <div className="flex items-center">
                                <span className="text-lg font-medium">
                                  ₹{noPrice}
                                </span>
                              </div>
                            </div>

                            <div className="flex justify-between">
                              <Slider
                                defaultValue={[1]}
                                max={9.5}
                                min={0.5}
                                step={0.5}
                                value={[noPrice]}
                                className={``}
                                onValueChange={(values) => {
                                  if (noEnabled) setNoPrice(values[0])
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                  <DrawerFooter className="w-full px-10 text-xs">
                    <Button onClick={handleExitPositions}>
                      Exit All Positions
                    </Button>

                    <DrawerClose className=" w-full">
                      <Button variant="outline" className="w-full">
                        Cancel
                      </Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </div>
          </div>

          {/* Chart Card */}
          {/* <div className="bg-white rounded-3xl p-4 shadow-sm">
            <div className="h-40">
              <Line data={performanceData} options={chartOptions} />
            </div>
          </div> */}
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 -mt-4 w-full">
        <div className="bg-white rounded-3xl shadow-sm w-full">
          {/* Tabs */}
          {/* <div className="flex p-2">
            <button
              onClick={() => {
                navigate(`/portfolio/${id}?tab=Yes`)
                setActiveTab('Yes')
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'Yes'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              YES
            </button>
            <button
              onClick={() => {
                navigate(`/portfolio/${id}?tab=No`)
                setActiveTab('No')
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'No'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              NO
            </button>
          </div> */}

          <Tabs
            className=""
            value={activeTab}
            onValueChange={(val) => {
              setActiveTab(val)
              searchParams.set('tab', val)
              setSearchParams(searchParams)
            }}
          >
            <TabsList className="w-full">
              <TabsTrigger value="all" className="w-[50%]">
                All
              </TabsTrigger>
              <TabsTrigger value="matched" className="w-[50%]">
                Matched
              </TabsTrigger>
              <TabsTrigger value="exiting" className="w-[50%]">
                Exiting
              </TabsTrigger>
              <TabsTrigger value="exited" className="w-[50%]">
                Exited
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <div className="divide-y divide-gray-100">
                {holdingData?.map((position) => (
                  <div
                    key={position.name}
                    className="p-4 w-full cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <span className="flex items-center justify-between w-full">
                        {position.opinion_type === 'YES' && (
                          <span className="rounded-full text-blue-600 font-semibold text-md ">
                            {position.opinion_type}
                          </span>
                        )}
                        {position.opinion_type === 'NO' && (
                          <span className="rounded-full text-red-600 font-semibold text-md">
                            {position.opinion_type}
                          </span>
                        )}
                      </span>
                      <div className="flex gap-1">
                        {position.status === 'ACTIVE' && (
                          <SellTradeSheet position={position} type="all" />
                        )}

                        {position.filled_quantity >= 0 &&
                          position.filled_quantity < position.quantity &&
                          position.status === 'EXITING' && (
                            <CancelHoldingDialog
                              handleCancelOrder={handleCancelOrder}
                              position={position}
                            />
                          )}
                        {position.filled_quantity === position.quantity &&
                          position.status === 'EXITED' && (
                            <span className="bg-emerald-100 text-emerald-700 rounded-xl p-1 text-xs text-[0.7rem] font-medium flex gap-1">
                              {position.status}
                            </span>
                          )}
                      </div>
                    </div>
                    <div className="flex justify-between gap-4 text-sm mb-4">
                      <div>
                        <div className="text-gray-600 font-medium">
                          Invested
                        </div>
                        <div className="font-semibold text-gray-900">
                          ₹{(position.price * position.quantity).toFixed(2)}
                        </div>
                      </div>
                      {/* <div>
                        <div className="text-gray-600 font-medium">
                          Quantity
                        </div>
                        <div className="font-semibold text-gray-900">
                          {`${position.filled_quantity}/${position.quantity}`}
                        </div>
                      </div> */}
                      <div>
                        <div className="text-gray-600 font-medium">Current</div>
                        <div className="font-semibold text-gray-900 text-end">
                          &#8377;
                          {position.opinion_type === 'YES'
                            ? (
                                position.market_yes_price * position.quantity
                              ).toFixed(2)
                            : (
                                position.market_no_price * position.quantity
                              ).toFixed(2)}
                        </div>
                      </div>
                      {/* <div>
                              <div className="text-gray-600 font-medium">Current</div>
                              <div className="font-semibold text-gray-900">
                                ₹
                                {position.opinion_type === 'YES'
                                  ? parseFloat(position.market_yes_price).toFixed(1)
                                  : parseFloat(position.market_no_price).toFixed(1)}
                              </div>
                            </div> */}
                    </div>
                    {/* Important functions */}
                    {/* {position.status === 'ACTIVE' && (
                      <div className="flex gap-2 w-full items-center justify-between">
                        <div className="w-full flex gap-2 items-center ">
                          <Button
                            onClick={() =>
                              handleTradeClick(
                                position.opinion_type === 'YES'
                                  ? position.market_yes_price
                                  : position.market_no_price,
                                position.opinion_type,
                                'SELL',
                                position.market_id,
                                position.quantity,
                                position.name
                              )
                            }
                            className="w-[50%] bg-rose-50 text-rose-600 rounded-xl text-sm font-medium hover:bg-rose-100 transition-colors"
                          >
                            <XCircle className="h-4 w-4" />
                            Exit Position
                          </Button>

                          <Button
                            onClick={() => {
                              navigate(`/event/${id}`)
                            }}
                            className="w-[50%] bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                            Invest More
                          </Button>
                        </div>
                      </div>
                    )}
                    {position.status === 'EXITING' && (
                      <div className="flex gap-2 w-full items-center justify-between">
                        <div className="w-[50%] flex justify-center font-medium tracking-wide">{`Qty ${position.filled_quantity}/${position.quantity} Matched`}</div>
                        <Button
                          onClick={() => {
                            navigate(`/event/${activeHoldings.market_id}`)
                          }}
                          className="w-[50%] bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          Invest More
                        </Button>
                      </div>
                    )} */}
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="matched">
              <div className="divide-y divide-gray-100">
                {matchedHoldingData?.length > 0 &&
                  matchedHoldingData?.map((position) => (
                    <div
                      key={position.name}
                      className="p-4 w-full cursor-pointer"
                    >
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <span className="flex items-center justify-between w-full">
                          {position.opinion_type === 'YES' && (
                            <span className="rounded-full text-blue-600 font-semibold text-md ">
                              {position.opinion_type}
                            </span>
                          )}
                          {position.opinion_type === 'NO' && (
                            <span className="rounded-full text-red-600 font-semibold text-md">
                              {position.opinion_type}
                            </span>
                          )}
                        </span>
                        <div className="flex gap-1">
                          {position.status === 'ACTIVE' && (
                            <SellTradeSheet
                              position={position}
                              type="matched"
                            />
                          )}

                          {position.filled_quantity >= 0 &&
                            position.filled_quantity < position.quantity &&
                            position.status === 'EXITING' && (
                              <span className="bg-emerald-100 text-emerald-700 rounded-xl p-1 text-xs text-[0.7rem] font-medium">
                                {position.status}
                              </span>
                            )}

                          {position.filled_quantity === position.quantity &&
                            position.status === 'EXITED' && (
                              <span className="bg-emerald-100 text-emerald-700 rounded-xl p-1 text-xs text-[0.7rem] font-medium">
                                {position.status}
                              </span>
                            )}
                        </div>
                      </div>
                      <div className="flex justify-between gap-4 text-sm mb-4">
                        <div>
                          <div className="text-gray-600 font-medium">
                            Invested
                          </div>
                          <div className="font-semibold text-gray-900">
                            ₹{(position.price * position.quantity).toFixed(2)}
                          </div>
                        </div>
                        {/* <div>
                     <div className="text-gray-600 font-medium">
                       Quantity
                     </div>
                     <div className="font-semibold text-gray-900">
                       {`${position.filled_quantity}/${position.quantity}`}
                     </div>
                   </div> */}
                        <div className="">
                          <div className="text-gray-600 font-medium">
                            Current
                          </div>
                          <div className="font-semibold text-gray-900 text-end">
                            &#8377;
                            {position.opinion_type === 'YES'
                              ? (
                                  position.market_yes_price * position.quantity
                                ).toFixed(2)
                              : (
                                  position.market_no_price * position.quantity
                                ).toFixed(2)}
                          </div>
                        </div>
                        {/* <div>
                           <div className="text-gray-600 font-medium">Current</div>
                           <div className="font-semibold text-gray-900">
                             ₹
                             {position.opinion_type === 'YES'
                               ? parseFloat(position.market_yes_price).toFixed(1)
                               : parseFloat(position.market_no_price).toFixed(1)}
                           </div>
                         </div> */}
                      </div>
                      {/* Important functions */}
                      {/* {position.status === 'ACTIVE' && (
                   <div className="flex gap-2 w-full items-center justify-between">
                     <div className="w-full flex gap-2 items-center ">
                       <Button
                         onClick={() =>
                           handleTradeClick(
                             position.opinion_type === 'YES'
                               ? position.market_yes_price
                               : position.market_no_price,
                             position.opinion_type,
                             'SELL',
                             position.market_id,
                             position.quantity,
                             position.name
                           )
                         }
                         className="w-[50%] bg-rose-50 text-rose-600 rounded-xl text-sm font-medium hover:bg-rose-100 transition-colors"
                       >
                         <XCircle className="h-4 w-4" />
                         Exit Position
                       </Button>

                       <Button
                         onClick={() => {
                           navigate(`/event/${id}`)
                         }}
                         className="w-[50%] bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
                       >
                         <Plus className="h-4 w-4" />
                         Invest More
                       </Button>
                     </div>
                   </div>
                 )}
                 {position.status === 'EXITING' && (
                   <div className="flex gap-2 w-full items-center justify-between">
                     <div className="w-[50%] flex justify-center font-medium tracking-wide">{`Qty ${position.filled_quantity}/${position.quantity} Matched`}</div>
                     <Button
                       onClick={() => {
                         navigate(`/event/${activeHoldings.market_id}`)
                       }}
                       className="w-[50%] bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
                     >
                       <Plus className="h-4 w-4" />
                       Invest More
                     </Button>
                   </div>
                 )} */}
                    </div>
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="exiting">
              <div className="divide-y divide-gray-100">
                {exitingHoldingData?.length > 0
                  ? exitingHoldingData?.map((position) => (
                      <div
                        key={position.name}
                        className="p-4 w-full cursor-pointer"
                      >
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <span className="flex items-center justify-between w-full">
                            {position.opinion_type === 'YES' && (
                              <span className="rounded-full text-blue-600 font-semibold text-md ">
                                {position.opinion_type}
                              </span>
                            )}
                            {position.opinion_type === 'NO' && (
                              <span className="rounded-full text-red-600 font-semibold text-md">
                                {position.opinion_type}
                              </span>
                            )}
                          </span>
                          <div>
                            {position.filled_quantity >= 0 &&
                              position.filled_quantity < position.quantity &&
                              position.status === 'EXITING' && (
                                <CancelHoldingDialog
                                  position={position}
                                  handleCancelOrder={handleCancelOrder}
                                />
                              )}
                          </div>
                        </div>
                        <div className="flex justify-between gap-4 text-sm mb-4">
                          <div>
                            <div className="text-gray-600 font-medium">
                              Invested
                            </div>
                            <div className="font-semibold text-gray-900">
                              ₹{(position.price * position.quantity).toFixed(2)}
                            </div>
                          </div>
                          {/* <div>
                      <div className="text-gray-600 font-medium">
                        Quantity
                      </div>
                      <div className="font-semibold text-gray-900">
                        {`${position.filled_quantity}/${position.quantity}`}
                      </div>
                    </div> */}
                          <div>
                            <div className="text-gray-600 font-medium">
                              Current
                            </div>
                            <div className="font-semibold text-gray-900 text-end">
                              &#8377;
                              {position.opinion_type === 'YES'
                                ? (
                                    position.market_yes_price *
                                    position.quantity
                                  ).toFixed(2)
                                : (
                                    position.market_no_price * position.quantity
                                  ).toFixed(2)}
                            </div>
                          </div>
                          {/* <div>
                            <div className="text-gray-600 font-medium">Current</div>
                            <div className="font-semibold text-gray-900">
                              ₹
                              {position.opinion_type === 'YES'
                                ? parseFloat(position.market_yes_price).toFixed(1)
                                : parseFloat(position.market_no_price).toFixed(1)}
                            </div>
                          </div> */}
                        </div>
                        {/* Important functions */}
                        {/* {position.status === 'ACTIVE' && (
                    <div className="flex gap-2 w-full items-center justify-between">
                      <div className="w-full flex gap-2 items-center ">
                        <Button
                          onClick={() =>
                            handleTradeClick(
                              position.opinion_type === 'YES'
                                ? position.market_yes_price
                                : position.market_no_price,
                              position.opinion_type,
                              'SELL',
                              position.market_id,
                              position.quantity,
                              position.name
                            )
                          }
                          className="w-[50%] bg-rose-50 text-rose-600 rounded-xl text-sm font-medium hover:bg-rose-100 transition-colors"
                        >
                          <XCircle className="h-4 w-4" />
                          Exit Position
                        </Button>

                        <Button
                          onClick={() => {
                            navigate(`/event/${id}`)
                          }}
                          className="w-[50%] bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          Invest More
                        </Button>
                      </div>
                    </div>
                  )}
                  {position.status === 'EXITING' && (
                    <div className="flex gap-2 w-full items-center justify-between">
                      <div className="w-[50%] flex justify-center font-medium tracking-wide">{`Qty ${position.filled_quantity}/${position.quantity} Matched`}</div>
                      <Button
                        onClick={() => {
                          navigate(`/event/${activeHoldings.market_id}`)
                        }}
                        className="w-[50%] bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Invest More
                      </Button>
                    </div>
                  )} */}
                      </div>
                    ))
                  : null}
              </div>
            </TabsContent>
            <TabsContent value="exited">
              <div className="divide-y divide-gray-100">
                {exitedHoldingData?.length > 0
                  ? exitedHoldingData?.map((position) => (
                      <div
                        key={position.name}
                        className="p-4 w-full cursor-pointer"
                      >
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <span className="flex items-center justify-between w-full">
                            {position.opinion_type === 'YES' && (
                              <span className="rounded-full text-blue-600 font-semibold text-md ">
                                {position.opinion_type}
                              </span>
                            )}
                            {position.opinion_type === 'NO' && (
                              <span className="rounded-full text-red-600 font-semibold text-md">
                                {position.opinion_type}
                              </span>
                            )}
                          </span>
                          <div>
                            {position.status === 'ACTIVE' && (
                              <span className="bg-yellow-100 text-yellow-700 rounded-xl p-1 text-xs text-[0.7rem] font-medium">
                                {position.status}
                              </span>
                            )}

                            {position.filled_quantity >= 0 &&
                              position.filled_quantity < position.quantity &&
                              position.status === 'EXITING' && (
                                <span className="bg-emerald-100 text-emerald-700 rounded-xl p-1 text-xs text-[0.7rem] font-medium">
                                  {position.status}
                                </span>
                              )}

                            {position.filled_quantity === position.quantity &&
                              position.status === 'EXITED' && (
                                <span className="bg-emerald-100 text-emerald-700 rounded-xl p-1 text-xs text-[0.7rem] font-medium">
                                  {position.status}
                                </span>
                              )}
                          </div>
                        </div>
                        <div className="flex justify-between gap-4 text-sm mb-4">
                          <div>
                            <div className="text-gray-600 font-medium">
                              Invested
                            </div>
                            <div className="font-semibold text-gray-900">
                              ₹{(position.price * position.quantity).toFixed(2)}
                            </div>
                          </div>
                          {/* <div>
                      <div className="text-gray-600 font-medium">
                        Quantity
                      </div>
                      <div className="font-semibold text-gray-900">
                        {`${position.filled_quantity}/${position.quantity}`}
                      </div>
                    </div> */}
                          <div>
                            <div className="text-gray-600 font-medium">
                              Current
                            </div>
                            <div className="font-semibold text-gray-900 text-end">
                              &#8377;
                              {position.opinion_type === 'YES'
                                ? (
                                    position.market_yes_price *
                                    position.quantity
                                  ).toFixed(2)
                                : (
                                    position.market_no_price * position.quantity
                                  ).toFixed(2)}
                            </div>
                          </div>
                          {/* <div>
                            <div className="text-gray-600 font-medium">Current</div>
                            <div className="font-semibold text-gray-900">
                              ₹
                              {position.opinion_type === 'YES'
                                ? parseFloat(position.market_yes_price).toFixed(1)
                                : parseFloat(position.market_no_price).toFixed(1)}
                            </div>
                          </div> */}
                        </div>
                        {/* Important functions */}
                        {/* {position.status === 'ACTIVE' && (
                    <div className="flex gap-2 w-full items-center justify-between">
                      <div className="w-full flex gap-2 items-center ">
                        <Button
                          onClick={() =>
                            handleTradeClick(
                              position.opinion_type === 'YES'
                                ? position.market_yes_price
                                : position.market_no_price,
                              position.opinion_type,
                              'SELL',
                              position.market_id,
                              position.quantity,
                              position.name
                            )
                          }
                          className="w-[50%] bg-rose-50 text-rose-600 rounded-xl text-sm font-medium hover:bg-rose-100 transition-colors"
                        >
                          <XCircle className="h-4 w-4" />
                          Exit Position
                        </Button>

                        <Button
                          onClick={() => {
                            navigate(`/event/${id}`)
                          }}
                          className="w-[50%] bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          Invest More
                        </Button>
                      </div>
                    </div>
                  )}
                  {position.status === 'EXITING' && (
                    <div className="flex gap-2 w-full items-center justify-between">
                      <div className="w-[50%] flex justify-center font-medium tracking-wide">{`Qty ${position.filled_quantity}/${position.quantity} Matched`}</div>
                      <Button
                        onClick={() => {
                          navigate(`/event/${activeHoldings.market_id}`)
                        }}
                        className="w-[50%] bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Invest More
                      </Button>
                    </div>
                  )} */}
                      </div>
                    ))
                  : null}
              </div>
            </TabsContent>
          </Tabs>
          {/* Trades List */}
        </div>
      </div>

      {showTradeSheet && selectedChoice && (
        <TradeSheet
          marketPrice={marketPrice}
          choice={selectedChoice}
          tradeAction={selectedAction}
          onClose={handleTradeComplete}
          marketId={marketId}
          sellQuantity={sellQuantity}
          previousOrderId={previousOrderId}
          refetchActiveHoldings={
            tab === 'all'
              ? refetcHoldingData
              : tab === 'matched'
              ? refetchMatchedHoldingData
              : undefined
          }
        />
      )}
    </div>
  )
}

export default ActiveMarketHolding
