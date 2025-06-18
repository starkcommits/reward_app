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
  useFrappeGetDocList,
  useFrappeUpdateDoc,
} from 'frappe-react-sdk'
import ActivePosition from '../components/ActivePositions'
import CompletedTrades from '../components/CompletedTrades'
import Portfolio from './Portfolio'
import PortfolioActiveValues from '../components/PortfolioActiveValues'
import { Slider } from '@/components/ui/slider'

import toast from 'react-hot-toast'

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

const MarketHolding = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(tab || 'all')
  const [tradePrice, setTradePrice] = useState(null)
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

  const [completedTrades, setCompletedTrades] = useState({})

  const { createDoc } = useFrappeCreateDoc()

  const [yesPrice, setYesPrice] = useState(5)
  const [noPrice, setNoPrice] = useState(5)

  const { data: totalExitData, isLoading: totalExitLoading } = useFrappeGetCall(
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
    data: exitData,
    isLoading: exitDataLoading,
    mutate: refetchExitData,
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
    currentUser ? undefined : null
  )

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
    currentUser && tab === 'all'
      ? ['HoldingList', 'all', tab, currentUser, id]
      : null
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
    currentUser && tab === 'matched'
      ? ['HoldingList', 'matched', tab, currentUser, id]
      : null
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
    currentUser && tab === 'exiting'
      ? ['HoldingList', 'exiting', tab, currentUser, id]
      : null
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

  console.log('Active Holdings:', activeHoldings)
  console.log('Matched Holdings:', activeMatchedHoldings)
  console.log('Exiting Holdings:', activeExitingHoldings)
  console.log('Exited Holdings:', activeExitedHoldings)

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
      case 'matched':
        console.log('2')
        refetchMatchedHoldingData()
      case 'exiting':
        console.log('3')
        refetchExitingHoldingData()
      case 'exited':
        console.log('4')
        refetchExitedHoldingData()
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
      if (totalExitData?.message?.YES > 0) {
        console.log('Yes')
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
      }

      if (totalExitData?.message?.NO > 0) {
        console.log('Yes')
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
      }

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

  const handleCancelOrder = async (order_id) => {
    try {
      console.log('Order ID:', order_id)
      await updateDoc('Orders', order_id, {
        status: 'CANCELED',
      })
      //  else {
      //   await updateDoc('Orders', order.name, {
      //     status: 'CANCELED',
      //   })
      // }
      // Remove this stray 'call' line
      // call  <-- This is causing the error
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
              {totalExitData?.message?.NO + totalExitData?.message?.YES > 0 ? (
                <Drawer
                  className="w-full"
                  open={isDrawerOpen}
                  onOpenChange={setIsDrawerOpen}
                >
                  <DrawerTrigger asChild>
                    <button
                      className="flex gap-1 rounded-md p-2 items-center justify-center w-[50%] bg-white"
                      onClick={(e) => e.stopPropagation()}
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
                        <div className="mb-6 px-10">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-lg font-medium">
                              Yes Price
                            </span>
                            <div className="flex items-center">
                              <span className="text-lg font-medium">
                                ₹{yesPrice}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between mt-2">
                            <Slider
                              defaultValue={[1]}
                              max={9.5}
                              min={0.5}
                              step={0.5}
                              value={[yesPrice]}
                              className={``}
                              onValueChange={(values) => {
                                setYesPrice(values[0])
                              }}
                            />
                          </div>
                        </div>
                      ) : null}
                      {totalExitData?.message?.NO > 0 ? (
                        <div className="mb-6 px-10">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-lg font-medium">
                              No Price
                            </span>
                            <div className="flex items-center">
                              <span className="text-lg font-medium">
                                ₹{noPrice}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between mt-2">
                            <Slider
                              defaultValue={[1]}
                              max={9.5}
                              min={0.5}
                              step={0.5}
                              value={[noPrice]}
                              className={``}
                              onValueChange={(values) => {
                                setNoPrice(values[0])
                              }}
                            />
                          </div>
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
              ) : null}
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
                          <span
                            className="bg-yellow-100 text-yellow-700 rounded-xl p-1 text-xs text-[0.7rem] font-medium flex gap-1 "
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
                          >
                            {position.status}
                            <Separator
                              orientation="vertical"
                              className="w-0.5"
                            />
                            <LogOut className="w-4 h-4" />
                          </span>
                        )}

                        {position.filled_quantity >= 0 &&
                          position.filled_quantity < position.quantity &&
                          position.status === 'EXITING' && (
                            <Dialog
                              open={isCancelOpen}
                              onOpenChange={setIsCancelOpen}
                            >
                              <DialogTrigger className="w-full">
                                <span className="bg-emerald-100 text-emerald-700 rounded-xl p-1 text-xs text-[0.7rem] font-medium flex gap-1">
                                  {position.status}
                                  <Separator
                                    orientation="vertical"
                                    className="w-0.5 h-full"
                                  />

                                  <CircleX className="w-4 h-4" />
                                </span>
                              </DialogTrigger>
                              <DialogContent className="">
                                <DialogHeader>
                                  <DialogTitle>
                                    Are you absolutely sure?
                                  </DialogTitle>
                                  <DialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete your account and remove
                                    your data from our servers.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button
                                    className="bg-white hover:bg-white/90"
                                    variant="outline"
                                    onClick={() => setIsCancelOpen(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    className="bg-neutral-900 text-white hover:text-neutral-800 hover:bg-neutral-800/40"
                                    onClick={() =>
                                      handleCancelOrder(position.order_id)
                                    }
                                  >
                                    Submit
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                      </div>
                    </div>
                    <div className="flex justify-between gap-4 text-sm mb-4">
                      <div>
                        <div className="text-gray-600 font-medium">
                          Invested
                        </div>
                        <div className="font-semibold text-gray-900">
                          ₹{position.price * position.quantity}
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
                            ? position.market_yes_price * position.quantity
                            : position.market_no_price * position.quantity}
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
                            <span
                              className="bg-yellow-100 text-yellow-700 rounded-xl p-1 text-xs text-[0.7rem] font-medium flex gap-1 "
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
                            >
                              {position.status}
                              <Separator
                                orientation="vertical"
                                className="w-0.5"
                              />
                              <LogOut className="w-4 h-4" />
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
                            ₹{position.price * position.quantity}
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
                              ? position.market_yes_price * position.quantity
                              : position.market_no_price * position.quantity}
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
                                <Dialog
                                  open={isCancelOpen}
                                  onOpenChange={setIsCancelOpen}
                                >
                                  <DialogTrigger className="w-full">
                                    <span className="bg-emerald-100 text-emerald-700 rounded-xl p-1 text-xs text-[0.7rem] font-medium flex gap-1">
                                      {position.status}
                                      <Separator
                                        orientation="vertical"
                                        className="w-0.5 h-full"
                                      />
                                      <CircleX className="w-4 h-4" />
                                    </span>
                                  </DialogTrigger>
                                  <DialogContent className="">
                                    <DialogHeader>
                                      <DialogTitle>
                                        Are you absolutely sure?
                                      </DialogTitle>
                                      <DialogDescription>
                                        This action cannot be undone. This will
                                        permanently delete your account and
                                        remove your data from our servers.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                      <Button
                                        className="bg-white hover:bg-white/90"
                                        variant="outline"
                                        onClick={() => setIsCancelOpen(false)}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        className="bg-neutral-900 text-white hover:text-neutral-800 hover:bg-neutral-800/40"
                                        onClick={() =>
                                          handleCancelOrder(position.order_id)
                                        }
                                      >
                                        Submit
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              )}
                          </div>
                        </div>
                        <div className="flex justify-between gap-4 text-sm mb-4">
                          <div>
                            <div className="text-gray-600 font-medium">
                              Invested
                            </div>
                            <div className="font-semibold text-gray-900">
                              ₹{position.price * position.quantity}
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
                                ? position.market_yes_price * position.quantity
                                : position.market_no_price * position.quantity}
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
                {exitingHoldingData?.length > 0
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
                              ₹{position.price * position.quantity}
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
                                ? position.market_yes_price * position.quantity
                                : position.market_no_price * position.quantity}
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
          refetchActiveHoldings={refetcHoldingData}
        />
      )}
    </div>
  )
}

export default MarketHolding
