import {
  useFrappeAuth,
  useFrappeGetDocList,
  useFrappeGetDoc,
  useFrappeDocTypeEventListener,
  useFrappeGetDocCount,
} from 'frappe-react-sdk'

import React, { useEffect, useMemo, useState } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  Search,
  ArrowUpDown,
  Clock,
  Activity,
  BookOpen,
  DollarSign,
  Calendar,
  Users,
  Tag,
} from 'lucide-react'
import OrderBook from '../components/OrderBook'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import AdminViewOrderBook from '../components/AdminViewOrderBook'

// Generate mock history data for a market
const generateMarketHistory = (marketId, hours = 24) => {
  let data = []
  const startYesPrice = 0.4 + Math.random() * 0.2

  for (let i = 0; i < hours; i++) {
    // Make price movements smoother by having smaller random changes
    const hourChange = Math.random() * 0.04 - 0.02
    const yes_price = Math.max(
      0.01,
      Math.min(0.99, startYesPrice + i * hourChange)
    )
    const no_price = parseFloat((1 - yes_price).toFixed(2))

    data.push({
      time: `${hours - i}h ago`,
      yes_price: parseFloat(yes_price.toFixed(2)),
      no_price: no_price,
    })
  }

  return data.reverse()
}

// Generate mock orders for a market
const generateMarketOrders = (marketId, count = 20) => {
  return Array.from({ length: count }, (_, i) => ({
    name: `ORD${String(i + 1).padStart(3, '0')}`,
    market: marketId,
    position: Math.random() > 0.5 ? 'yes' : 'no',
    price: parseFloat((Math.random() * 0.9 + 0.05).toFixed(2)),
    quantity: parseFloat((Math.random() * 100).toFixed(0)),
    status: Math.random() > 0.3 ? 'open' : 'pending',
    creation: new Date(Date.now() - Math.random() * 86400000).toISOString(),
  }))
}

const Overview = () => {
  const { currentUser } = useFrappeAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const categoryParam = searchParams.get('category')
  const marketParam = searchParams.get('market')
  const navigate = useNavigate()
  const hasMarket = searchParams.has('market')

  const [categoryFilter, setCategoryFilter] = useState(categoryParam || 'all')
  // const [sortBy, setSortBy] = useState('traders')
  // const [selectedMarketData, setSelectedMarketData] = useState(null)
  const [marketOrders, setMarketOrders] = useState([])
  const [chartData, setChartData] = useState([])

  const { data: marketCategories, isLoading: marketCategoriesLoading } =
    useFrappeGetDocList('Market Category')

  const {
    data: totalOrders,
    isLoading: totalOrdersLoading,
    mutate: refetchTotalOrders,
  } = useFrappeGetDocCount(
    'Orders',
    [[]],
    false,
    false,
    !marketParam ? undefined : null
  )
  const {
    data: totalTrades,
    isLoading: totalTradesLoading,
    mutate: refetchTotalTrades,
  } = useFrappeGetDocCount(
    'Trades',
    [],
    false,
    false,
    !marketParam ? undefined : null
  )

  const { data: marketData, isLoading: marketLoading } = useFrappeGetDoc(
    'Market',
    marketParam,
    marketParam ? undefined : null
  )

  // useEffect(() => {
  //   if (marketData !== undefined && Object.values(marketData).length > 0) {
  //     setSelectedMarketData(marketData)
  //   }
  // }, [marketData])

  const {
    data: marketsData,
    isLoading: marketsLoading,
    mutate: refetchMarketData,
  } = useFrappeGetDocList('Market', {
    fields: [
      'name',
      'question',
      'yes_price',
      'no_price',
      'total_traders',
      'closing_time',
      'category',
    ],
    filters:
      categoryFilter === 'all'
        ? [['status', '=', 'OPEN']]
        : [
            ['category', '=', categoryFilter],
            ['status', '=', 'OPEN'],
          ],
    orderBy: {
      field: 'total_traders',
      order: 'desc',
    },
  })

  const {
    data: trendingMarketsData,
    isLoading: trendingMarketsDataLoading,
    mutate: refetchTrendingMarkets,
  } = useFrappeGetDocList(
    'Market',
    {
      fields: [
        'name',
        'question',
        'yes_price',
        'no_price',
        'total_traders',
        'closing_time',
        'category',
      ],
      filters: [['status', '=', 'OPEN']],
      orderBy: {
        field: 'total_traders',
        order: 'desc',
      },
    },
    !marketParam ? undefined : null
  )

  // console.log('Marketsssss:', marketsData)

  const {
    data: recentTradesData,
    isLoading: recentTradesLoading,
    mutate: refetchRecentTrades,
  } = useFrappeGetDocList(
    'Trades',
    {
      fields: [
        'name',
        'creation',
        'market_id',
        'quantity',
        'first_user_id',
        'second_user_id',
        'first_user_order_id',
        'second_user_order_id',
        'first_user_price',
        'second_user_price',
      ],
      orderBy: {
        field: 'creation',
        order: 'desc',
      },
    },
    !marketParam ? undefined : null
  )

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
        'market_id',
        'quantity',
        'first_user_id',
        'second_user_id',
        'first_user_order_id',
        'second_user_order_id',
        'first_user_price',
        'second_user_price',
      ],
      filters: [['market_id', '=', marketParam]],
      orderBy: {
        field: 'creation',
        order: 'desc',
      },
    },
    marketParam ? undefined : null
  )

  useFrappeDocTypeEventListener('Trades', (event) => {
    refetchMarketData() // Current market view (prices changed)
    refetchTrades() // Market-specific trades
    refetchTrendingMarkets() // Global trending markets (activity changed)
    refetchRecentTrades() // Global recent trades
    refetchTotalTrades() // Total trade count
  })

  useFrappeDocTypeEventListener('Orders', (event) => {
    refetchMarketData()
    refetchTrades()
    refetchTrendingMarkets()
  })

  useFrappeDocTypeEventListener('Market', (event) => {
    refetchMarketData() // Current market (order book changed)
    refetchTotalOrders() // Total order count
  })

  const formatDate = (frappeDate) => {
    const date = new Date(frappeDate)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0') // months are 0-indexed
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const { data: userData, isLoading: userDataLoading } = useFrappeGetDoc(
    'User',
    currentUser,
    currentUser ? undefined : null
  )

  // const filteredMarkets = useMemo(() => {
  //   if (!marketsData) return []

  //   return marketsData
  //     .filter((market) => {
  //       const matchesSearch = market.question
  //         .toLowerCase()
  //         .includes(searchTerm.toLowerCase())
  //       const matchesCategory =
  //         categoryFilter === 'all' || market.category === categoryFilter
  //       return matchesSearch && matchesCategory
  //     })
  //     .sort((a, b) => {
  //       switch (sortBy) {
  //         case 'traders':
  //           return b.total_traders - a.total_traders
  //         case 'yes_price':
  //           return b.yes_price - a.yes_price
  //         case 'closing':
  //           return new Date(a.closing_time) - new Date(b.closing_time)
  //         default:
  //           return 0
  //       }
  //     })
  // }, [marketsData, searchTerm, categoryFilter, sortBy])

  // useEffect(() => {
  //   // Set initial selected market when data loads
  //   if (filteredMarkets?.length > 0 && !selectedMarketData) {
  //     setSelectedMarketData(filteredMarkets[0])
  //     setChartData(generateMarketHistory(filteredMarkets[0].name))
  //     setMarketOrders(generateMarketOrders(filteredMarkets[0].name))
  //   }
  // }, [filteredMarkets, selectedMarketData])

  const handleMarketSelect = (market) => {
    setSelectedMarketData(market)
    setChartData(generateMarketHistory(market.name))
    setMarketOrders(generateMarketOrders(market.name))
  }

  const updateQueryParam = (key, value) => {
    const params = new URLSearchParams(location.search)
    params.set(key, value) // only change the one param
    navigate({
      pathname: '/overview',
      search: `?${params.toString()}`,
    })
  }

  const handleCategoryChange = (newCategory) => {
    updateQueryParam('category', newCategory)
  }

  const handleMarketChange = (newMarket) => {
    updateQueryParam('market', newMarket)
  }

  if (userDataLoading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <div className="spinner w-14 h-14 rounded-full border-4 border-gray-200 border-r-blue-500 animate-spin"></div>
      </div>
    )
  }

  if (userData?.user_type === 'System User' && currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex flex-col gap-2 lg:flex-row h-screen">
          {/* Left Sidebar - Markets List */}
          <div className="w-full lg:w-1/3 xl:w-1/4 border-r p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-xl font-bold cursor-pointer"
                onClick={() => {
                  navigate('/overview')
                }}
              >
                Prediction Markets
              </h2>
              <Badge variant="outline" className="px-3 py-1">
                <Activity className="w-4 h-4 mr-2" />
                Live
              </Badge>
            </div>

            <div className="space-y-4 mb-4 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search markets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 w-[50%] justify-end">
                <Select
                  value={categoryFilter}
                  onValueChange={(value) => {
                    handleCategoryChange(value)
                    setCategoryFilter(value)
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {!marketCategoriesLoading &&
                      marketCategories?.map((category) => (
                        <SelectItem value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {/* <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="traders">Most Popular</SelectItem>
                    <SelectItem value="yes_price">Yes Price</SelectItem>
                    <SelectItem value="closing">Closing Soon</SelectItem>
                  </SelectContent>
                </Select> */}
              </div>
            </div>

            <ScrollArea className="flex-1 -mx-4 px-4">
              <div className="space-y-2">
                {marketsData?.map((market) => (
                  <Card
                    key={market.name}
                    className={`cursor-pointer transition-colors ${
                      marketData?.name === market.name ? 'border-primary' : ''
                    }`}
                    onClick={() => {
                      // handleMarketSelect(market)
                      handleMarketChange(market.name)
                      handleMarketSelect(market.name)
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="font-semibold line-clamp-2 mb-2">
                        {market.question}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="font-medium text-blue-500">
                          YES: ${market.yes_price.toFixed(2)}
                        </div>
                        <div className="font-medium text-red-500">
                          NO: ${market.no_price.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <div className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {market.total_traders}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(market.closing_time)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Right Content - Market Details */}

          <div className="w-full lg:w-2/3 xl:w-3/4 p-6 overflow-auto">
            {!hasMarket && (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-4 gap-2">
                  <Card>
                    <CardHeader className="w-full">
                      <CardTitle className="text-center text-2xl">
                        {!trendingMarketsDataLoading &&
                          trendingMarketsData?.length > 0 &&
                          trendingMarketsData?.reduce((acc, market) => {
                            return acc + 1
                          }, 0)}
                      </CardTitle>
                      <CardDescription className="text-center text-lg font-bold">
                        Total Markets
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="w-full">
                      <CardTitle className="text-center text-2xl">
                        {totalOrders}
                      </CardTitle>
                      <CardDescription className="text-center text-lg font-bold">
                        Total Orders
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="w-full">
                      <CardTitle className="text-center text-2xl">
                        {totalTrades}
                      </CardTitle>
                      <CardDescription className="text-center text-lg font-bold">
                        Total Trades
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="w-full">
                      <CardTitle className="text-center text-2xl">
                        {!trendingMarketsDataLoading &&
                          trendingMarketsData?.reduce((acc, market) => {
                            return acc + market.total_traders
                          }, 0)}
                      </CardTitle>
                      <CardDescription className="text-center text-lg font-bold">
                        Total Traders
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Trending Markets</CardTitle>
                      <CardDescription>
                        The most active markets based on recent trades and user
                        engagement.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {trendingMarketsData.length > 0 &&
                        trendingMarketsData?.map((market) => {
                          return (
                            <div
                              key={market.name}
                              className="market-card cursor-pointer"
                              onClick={() => {
                                handleMarketChange(market.name)
                              }}
                            >
                              <>
                                <div className="p-4">
                                  <h3 className="text-base font-medium mb-2">
                                    {market?.question}
                                  </h3>
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="flex items-center text-xs text-gray-600">
                                      <Users className="h-3.5 w-3.5 mr-1" />
                                      {/* <span>{market.traders.toLocaleString()} traders</span> */}
                                      <span>
                                        {market?.total_traders} traders
                                      </span>
                                    </div>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">
                                      <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse mr-1"></div>
                                      LIVE
                                    </span>
                                  </div>
                                  {/* <p className="text-xs text-gray-600 mb-4">{market.info}</p> */}
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="py-2 px-4 bg-green-50 text-green-600 rounded-xl text-sm font-medium">
                                      Yes ₹{market?.yes_price}
                                    </div>
                                    <div className="py-2 px-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium">
                                      No ₹{market?.no_price}
                                    </div>
                                  </div>
                                </div>
                              </>
                            </div>
                          )
                        })}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>
                        A live feed of the latest trades, orders, and user
                        actions across all markets.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Trade ID</TableHead>
                              <TableHead>Yes Price</TableHead>
                              <TableHead>No Price</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          {!recentTradesLoading &&
                            recentTradesData?.length === 0 && (
                              <TableRow>
                                <TableCell
                                  colSpan={5}
                                  className="text-center py-8 font-medium"
                                >
                                  No trades done yet.
                                </TableCell>
                              </TableRow>
                            )}
                          <TableBody>
                            {!recentTradesLoading &&
                              recentTradesData?.length > 0 &&
                              recentTradesData?.slice(0, 10)?.map((trade) => (
                                <TableRow key={trade.name}>
                                  <TableCell>{`#${
                                    trade?.name?.split('_')[2]
                                  }`}</TableCell>
                                  <TableCell className="text-blue-500">
                                    {trade?.first_user_price}
                                  </TableCell>
                                  <TableCell className="text-red-500">
                                    {trade?.second_user_price}
                                  </TableCell>
                                  <TableCell>{trade?.quantity}</TableCell>
                                  <TableCell>
                                    {trade?.creation
                                      ?.split(' ')[0]
                                      ?.split('-')
                                      ?.reverse()
                                      ?.join('-')}
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            {hasMarket && marketData && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold">
                      {marketData?.question}
                    </h1>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="flex items-center">
                        <Tag className="w-3 h-3 mr-1" />
                        {marketData?.category}
                      </Badge>
                      <Badge variant="outline" className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {marketData?.total_traders} traders
                      </Badge>
                      <Badge variant="outline" className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Closes: {formatDate(marketData?.closing_time)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-4 md:text-right">
                    <div className="flex flex-col gap-2">
                      <div className="text-lg font-bold text-blue-500">
                        YES: ${marketData?.yes_price.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round(marketData?.yes_price * 10)}% probability
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="text-lg font-bold text-red-500">
                        NO: ${marketData?.no_price.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round(marketData?.no_price * 10)}% probability
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex w-full">
                  <div className="flex w-[40%]">
                    <Card>
                      <CardHeader>
                        <CardTitle>Order Book</CardTitle>
                        <CardDescription>
                          Open buy and sell orders placed in the market.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="-mt-2">
                        <AdminViewOrderBook marketId={marketData?.name} />
                      </CardContent>
                    </Card>
                  </div>
                  <div className="flex flex-col gap-6 w-[60%]">
                    <Card>
                      <CardHeader>
                        <CardTitle>Market History</CardTitle>
                        <CardDescription>
                          Price movement over the last 24 hours.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6">
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={chartData}>
                            <XAxis dataKey="time" />
                            <YAxis
                              domain={[0, 1]}
                              tickFormatter={(tick) => `$${tick.toFixed(2)}`}
                            />
                            <Tooltip
                              formatter={(value) => [`$${value}`, null]}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="yes_price"
                              name="YES"
                              stroke="#10b981"
                              strokeWidth={2}
                              dot={false}
                            />
                            <Line
                              type="monotone"
                              dataKey="no_price"
                              name="NO"
                              stroke="#ef4444"
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                    <Card className="">
                      <CardHeader>
                        <CardTitle>Recent Trades</CardTitle>
                        <CardDescription>
                          List of completed trades with price and volume.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Trade ID</TableHead>
                                <TableHead>Yes Price</TableHead>
                                <TableHead>No Price</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Date</TableHead>
                              </TableRow>
                            </TableHeader>
                            {!tradesLoading && tradesData?.length === 0 && (
                              <TableRow>
                                <TableCell
                                  colSpan={5}
                                  className="text-center py-8 font-medium"
                                >
                                  Looks like this market is waiting for its
                                  first trade.
                                </TableCell>
                              </TableRow>
                            )}
                            <TableBody>
                              {!tradesLoading &&
                                tradesData?.length > 0 &&
                                tradesData
                                  ?.slice(0, 10)
                                  ?.map((trade, index) => (
                                    <TableRow key={trade.name}>
                                      <TableCell>{`#${
                                        trade?.name?.split('_')[2]
                                      }`}</TableCell>
                                      <TableCell className="text-blue-500">
                                        {trade?.first_user_price}
                                      </TableCell>
                                      <TableCell className="text-red-500">
                                        {trade?.second_user_price}
                                      </TableCell>
                                      <TableCell>{trade?.quantity}</TableCell>
                                      <TableCell>
                                        {trade?.creation
                                          ?.split(' ')[0]
                                          ?.split('-')
                                          ?.reverse()
                                          ?.join('-')}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* <Tabs defaultValue="orderbook" className="w-full">
                    <TabsList className="w-full">
                      <TabsTrigger value="orderbook" className="flex-1">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Order Book
                      </TabsTrigger>
                      <TabsTrigger value="orders" className="flex-1">
                        <ArrowUpDown className="w-4 h-4 mr-2" />
                        Active Orders
                      </TabsTrigger>
                      <TabsTrigger value="trades" className="flex-1">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Recent Trades
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="orderbook">
                      <OrderBook marketId={selectedMarketData.name} />
                    </TabsContent>

                    <TabsContent value="orders">
                      <Card>
                        <CardContent className="p-6">
                          <ScrollArea className="h-[500px]">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>ID</TableHead>
                                  <TableHead>Position</TableHead>
                                  <TableHead>Price</TableHead>
                                  <TableHead>Amount</TableHead>
                                  <TableHead>Total</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Time</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {marketOrders.map((order) => (
                                  <TableRow key={order.name}>
                                    <TableCell>{order.name}</TableCell>
                                    <TableCell>
                                      <Badge
                                        variant={
                                          order.position === 'yes'
                                            ? 'default'
                                            : 'destructive'
                                        }
                                      >
                                        {order.position.toUpperCase()}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      ${order.price.toFixed(2)}
                                    </TableCell>
                                    <TableCell>{order.quantity}</TableCell>
                                    <TableCell>
                                      ${(order.price * order.quantity).toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline">
                                        {order.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      {new Date(order.creation).toLocaleString()}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="trades">
                      <Card>
                        <CardContent className="p-6">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Position</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Time</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {marketOrders.slice(0, 10).map((order, index) => (
                                <TableRow key={`trade-${index}`}>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        order.position === 'yes'
                                          ? 'default'
                                          : 'destructive'
                                      }
                                    >
                                      {order.position.toUpperCase()}
                                    </Badge>
                                  </TableCell>
                                  <TableCell
                                    className={
                                      order.position === 'yes'
                                        ? 'text-green-500'
                                        : 'text-red-500'
                                    }
                                  >
                                    ${order.price.toFixed(2)}
                                  </TableCell>
                                  <TableCell>{order.quantity}</TableCell>
                                  <TableCell>
                                    {new Date(order.creation).toLocaleString()}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs> */}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (currentUser && userData?.user_type !== 'System User')
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <div className="flex flex-col gap-2 justify-center text-center">
          <p className="font-bold text-4xl">403 Forbidden</p>
          <p className="font-medium text-lg">
            You don't have permission to access this resource.
          </p>
        </div>
      </div>
    )

  return null
}

export default Overview
