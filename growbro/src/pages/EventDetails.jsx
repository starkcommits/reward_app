import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Share2,
  Users,
  Timer,
  CalendarClock,
  Book,
  BookOpen,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import {
  useFrappeDocTypeEventListener,
  useFrappeEventListener,
  useFrappeGetDoc,
  useFrappeGetDocList,
} from 'frappe-react-sdk'
import EventDetailsOrderBook from '../components/EventDetailsOrderBook'
import OrdersTab from '../components/OrdersTab'
import BuyTradeSheet from '../components/BuyTradeSheet'
import TradingViewWidgetBTC from '../components/TradingViewWidgetBTC'
import TradingViewWidgetETH from '../components/TradingViewWidgetETH'

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

const EventDetails = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const tab = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(tab || 'activity')
  const { id } = useParams()
  const [market, setMarket] = useState({})
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedChoice, setSelectedChoice] = useState(null)

  const {
    data: tradesData,
    isLoading: tradesLoading,
    mutate: refetchTrades,
  } = useFrappeGetDocList(
    'Trades',
    {
      fields: [
        'name',
        'creation',
        'first_user_order_id',
        'first_user_name',
        'first_user_price',
        'first_user_id',
        'second_user_order_id',
        'second_user_price',
        'second_user_name',
        'second_user_id',
        'quantity',
      ],
      filters: { market_id: id },
      orderBy: {
        field: 'creation',
        order: 'desc',
      },
    },
    activeTab === 'activity' ? undefined : null
  )

  console.log('Activity: ', tradesData)

  useFrappeDocTypeEventListener('Trades', (updatedTrade) => {
    refetchTrades()
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const { data: marketData, isLoading: marketDataLoading } = useFrappeGetDoc(
    'Market',
    id
  )

  useEffect(() => {
    if (!marketDataLoading && Object.values(marketData)) {
      setMarket(marketData)
    }
  }, [marketData])

  useFrappeEventListener('market_event', (updatedData) => {
    if (updatedData.name !== id) return

    setMarket(updatedData)
  })

  // Listen for real-time updates
  // useFrappeEventListener('market_event', (updatedMarket) => {
  //   if (updatedMarket.name === market.name) {
  //     setMarket((prev) => ({ ...prev, ...updatedMarket }))
  //   }
  // })
  const handleTabChange = (value) => {
    setActiveTab(value)

    // Update URL with the new tab parameter
    const newSearchParams = new URLSearchParams(location.search)
    newSearchParams.set('tab', value)

    // Update URL without refreshing the page
    navigate(`${location.pathname}?${newSearchParams.toString()}`, {
      replace: true,
    })
  }

  if (marketDataLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="spinner w-14 h-14 rounded-full border-4 border-gray-200 border-r-blue-500 animate-spin select-none"></div>
      </div>
    )
  }

  return (
    <div className=" bg-gray-50">
      {/* Existing code remains the same */}
      <div className="sticky top-0 left-0 right-0 z-20 mx-auto max-w-lg mb-auto bg-white/80 backdrop-blur-lg border-b border-gray-100">
        {/* ... existing header content ... */}
        <div className="px-4 pt-safe-top pb-4">
          <div className="flex items-center max-w-lg gap-6 mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 active:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold">Event Details</h1>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* ... existing content ... */}

        <div className="h-20 rounded-full w-full flex items-center justify-center mb-4">
          <img width={100} height={100} src={market?.icon} alt="" />
        </div>
        <h2 className="text-xl text-center font-medium mb-4 px-6">
          {market?.question}
        </h2>

        <div className="flex flex-col items-center mb-6">
          {market?.subcategory === 'bitcoin' && (
            <div className="h-[250px] w-full">
              <TradingViewWidgetBTC />
            </div>
          )}

          {market?.subcategory === 'ethereum' && (
            <div className="h-[250px] w-full">
              <TradingViewWidgetETH />
            </div>
          )}

          {/* <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center">
              <Users className="h-4 w-4 mr-1.5" />
              {market?.total_traders} traders
            </span>
            {market?.status === 'OPEN' && (
              <span className="flex items-center">
                <Timer className="h-4 w-4 mr-1.5" />
                Ends At {formatDate(market?.closing_time)}
              </span>
            )}
            {market?.status === 'CLOSED' && (
              <span className="flex items-center">
                <Timer className="h-4 w-4 mr-1.5" />
                Market Closed At {formatDate(market?.closing_time)}
              </span>
            )}
          </div> */}
        </div>
        {/* <div className="bg-amber-50 p-4 rounded-xl mb-6">
          <div className="flex items-center">
            <span className="text-2xl mr-2">💡</span>
            <p className="text-sm text-amber-800">{market?.question}</p>
          </div>
        </div> */}
        <div className="flex gap-3 mb-6">
          <button
            className="flex-1 py-3 px-4 bg-blue-500 text-white text-sm font-medium rounded-xl active:bg-blue-600 transition-colors"
            onClick={() => {
              setSelectedChoice('YES')
              setIsSheetOpen(true)
            }}
          >
            Yes ₹{market?.yes_price}
          </button>

          <button
            className="flex-1 py-3 px-4 bg-rose-500 text-white text-sm font-medium rounded-xl active:bg-rose-600 transition-colors"
            onClick={() => {
              setSelectedChoice('NO')
              setIsSheetOpen(true)
            }}
          >
            No ₹{market?.no_price}
          </button>
        </div>

        <div className="mx-auto bg-white rounded-xl shadow-sm p-4 ">
          <h1 className="text-md font-bold text-left text-gray-900 mb-6">
            About the event
          </h1>

          {/* Event Stats Grid */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-gray-500 mb-1 text-xs">Traders</p>
              <p className="text-sm font-bold text-gray-900">
                {market?.total_traders}
              </p>
            </div>
            <div>
              <p className="text-gray-500 mb-1 text-xs">Total Volume</p>
              <p className="font-bold text-gray-900 text-sm">
                ₹{market?.total_investment}
              </p>
            </div>
            <div>
              <p className="text-gray-500 mb-1 text-xs">Started at</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDate(market?.creation)}
              </p>
            </div>
            {market?.status === 'OPEN' && (
              <div>
                <p className="text-gray-500 mb-1 text-xs">Ending at</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(market?.closing_time)}
                </p>
              </div>
            )}
            {market?.status === 'CLOSED' && (
              <div>
                <p className="text-gray-500 mb-1">Closed at</p>
                <p className="text-md font-semibold text-gray-900">
                  {formatDate(market?.closing_time)}
                </p>
              </div>
            )}
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full mt-6"
        >
          <TabsList className="w-full">
            <TabsTrigger value="activity" className="w-full">
              Activity
            </TabsTrigger>
            <TabsTrigger value="order book" className="w-full">
              Order Book
            </TabsTrigger>
            <TabsTrigger value="orders" className="w-full">
              Orders
            </TabsTrigger>
          </TabsList>
          <TabsContent value="activity">
            <div className="bg-white rounded-xl shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-center text-gray-700">
                  {tradesData?.length > 0
                    ? 'Matched Users'
                    : 'No Users matched yet.'}
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {tradesData?.map((match) => {
                  const firstUser = match?.first_user_name?.split('@')[0]
                  const secondUser = match?.second_user_name?.split('@')[0]
                  const formatName = (name) =>
                    name?.length > 10
                      ? name?.charAt(0)?.toUpperCase() +
                        name?.slice(1, 10) +
                        '…'
                      : name?.charAt(0)?.toUpperCase() + name?.slice(1)
                  return (
                    <div
                      key={match?.name}
                      className="px-6 py-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center justify-between mb-3">
                        {/* First User */}
                        <div className="flex flex-col items-center w-1/3">
                          <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-blue-200 shadow-inner flex items-center justify-center font-semibold text-blue-900">
                              {firstUser?.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <span
                            className="text-sm mt-1 font-medium text-gray-700"
                            title={match?.first_user_id}
                          >
                            {formatName(firstUser)}
                          </span>
                        </div>
                        {/* Bar */}
                        <div className="w-1/3 h-8 relative bg-gray-100 rounded-xl overflow-hidden shadow-inner">
                          <div className="flex h-full transition-all duration-500 ease-in-out">
                            {match?.first_user_price ===
                            match?.second_user_price ? (
                              <>
                                <div
                                  className="bg-blue-400 flex items-center justify-center text-xs text-white font-bold"
                                  style={{
                                    width: `50%`,
                                  }}
                                >
                                  {match?.first_user_price}
                                </div>
                                <div
                                  className="bg-rose-400 flex items-center justify-center text-xs text-white font-bold"
                                  style={{
                                    width: `50%`,
                                  }}
                                >
                                  {match?.second_user_price}
                                </div>
                              </>
                            ) : (
                              <>
                                <div
                                  className="bg-blue-400 flex items-center justify-center text-xs text-white font-bold"
                                  style={{
                                    width: `${match?.first_user_price * 10}%`,
                                  }}
                                >
                                  {match?.first_user_price}
                                </div>
                                <div
                                  className="bg-rose-400 flex items-center justify-center text-xs text-white font-bold"
                                  style={{
                                    width: `${match?.second_user_price * 10}%`,
                                  }}
                                >
                                  {match?.second_user_price}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        {/* Second User */}
                        <div className="flex flex-col items-center w-1/3">
                          <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-red-200 shadow-inner flex items-center justify-center font-semibold text-red-900">
                              {secondUser?.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <span
                            className="text-sm mt-1 font-medium text-gray-700"
                            title={match?.second_user_id}
                          >
                            {formatName(secondUser)}
                          </span>
                        </div>
                      </div>
                      {/* Timestamp */}
                      <div className="flex justify-center text-sm text-gray-500">
                        <CalendarClock className="h-4 w-4 mr-1" />
                        <span>{formatDate(match?.creation)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="order book">
            <div className="flex items-center gap-2 px-4 py-4 bg-gray-50">
              <BookOpen className="h-5 w-5" />
              <span className="font-medium">Order Book</span>
            </div>
            {market?.status === 'OPEN' && (
              <EventDetailsOrderBook marketId={id} />
            )}
          </TabsContent>
          <TabsContent value="orders">
            <OrdersTab />
          </TabsContent>
        </Tabs>

        {/* ... other existing content ... */}
        {market?.status === 'OPEN' && isSheetOpen && (
          <BuyTradeSheet
            market={market}
            choice={selectedChoice}
            setSelectedChoice={setSelectedChoice}
            marketId={id}
            isSheetOpen={isSheetOpen}
            setIsSheetOpen={setIsSheetOpen}
          />
        )}
      </div>
    </div>
  )
}

export default EventDetails
