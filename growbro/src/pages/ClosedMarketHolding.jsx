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
  useFrappeGetDoc,
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

const ClosedMarketHolding = () => {
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

  const { data: marketData, isLoading: marketLoading } = useFrappeGetDoc(
    'Market',
    id
  )

  const {
    data: closedHoldingData,
    isLoading: closedHoldingDataLoading,
    mutate: refetchClosedHoldingData,
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
        'returns',
        'creation',
        'filled_quantity',
      ],
      filters: [
        ['user_id', '=', currentUser],
        ['market_id', '=', id],
        ['market_status', '=', 'RESOLVED'],
      ],
    },
    currentUser ? undefined : null
  )

  console.log('Closed Holding Data: ', closedHoldingData)

  useFrappeDocTypeEventListener('Holding', (event) => {
    console.log('Holding event entered')
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

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header Section with improved contrast */}
      <div className="bg-indigo-600 pt-safe-top pb-8">
        <div className="px-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(`/portfolio?tab=completed`)}
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
                    {closedHoldingData
                      ?.reduce(
                        (acc, value) => acc + value.quantity * value.price,
                        0
                      )
                      .toFixed(2)}
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
                  {closedHoldingData?.reduce(
                    (acc, value) => acc + value.returns,
                    0
                  ) >= 0 ? (
                    <div className="text-green-600">
                      +₹
                      {closedHoldingData
                        ?.reduce((acc, value) => acc + value.returns, 0)
                        .toFixed(2)}
                    </div>
                  ) : (
                    <div className="text-red-600">
                      ₹
                      {closedHoldingData
                        ?.reduce((acc, value) => acc + value.returns, 0)
                        .toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* <div className="flex gap-2 items-center justify-between mt-4">
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
            </div> */}
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

          <div className="divide-y divide-gray-100">
            {closedHoldingData?.map((position) => (
              <div key={position.name} className="p-4 w-full cursor-pointer">
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
                        <Separator orientation="vertical" className="w-0.5" />
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
                                permanently delete your account and remove your
                                data from our servers.
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
                    <div className="text-gray-600 font-medium">Invested</div>
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
                    <div className="text-gray-600 font-medium">Returns</div>
                    {position.returns >= 0 ? (
                      <div className="font-semibold text-green-600 text-end">
                        +&#8377;
                        {position.returns.toFixed(2)}
                      </div>
                    ) : (
                      <div className="font-semibold text-red-600 text-end">
                        &#8377;
                        {position.returns.toFixed(2)}
                      </div>
                    )}
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

export default ClosedMarketHolding
