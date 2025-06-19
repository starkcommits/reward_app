import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, TrendingUp, Users, Timer, Zap } from 'lucide-react'
import {
  useFrappeDocTypeEventListener,
  useFrappeEventListener,
  useFrappeGetDoc,
  useFrappeGetDocList,
  useFrappePostCall,
} from 'frappe-react-sdk'
import TradingViewWidgetBTC from '../components/TradingViewWidgetBTC'
import TradingViewWidgetETH from '../components/TradingViewWidgetETH'

const CategoryPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [categoryMarkets, setCategoryMarkets] = useState({})

  const { data: categoryData, isLoading: categoryDataLoading } =
    useFrappeGetDocList('Market', {
      fields: [
        'name',
        'icon',
        'question',

        'yes_price',
        'no_price',
        'closing_time',
        'status',
        'total_traders',
      ],
      filters: [
        ['status', '=', 'OPEN'],
        ['category', '=', id],
      ],
    })

  const { data: currentCategory, isLoading: currentCategoryLoading } =
    useFrappeGetDoc('Market Category', id)

  const { call } = useFrappePostCall()

  console.log(currentCategory)

  // useEffect(() => {
  //   console.log('Hello')
  //   call('frappe.client.insert', {
  //     doc: {
  //       doctype: 'Market',
  //       id: 'ONO_MARKET_0900',
  //       yes_price: 5,
  //     },
  //   })
  //   console.log('tttt')
  // }, [])

  useEffect(() => {
    if (categoryData?.length > 0 && !categoryDataLoading) {
      const marketMap = categoryData?.reduce((acc, market) => {
        acc[market.name] = market // ✅ Store as { "market_name": marketData }
        return acc
      }, {})
      setCategoryMarkets(marketMap)
    }
  }, [categoryDataLoading])

  useFrappeDocTypeEventListener('Market', (updatedMarket) => {
    console.log('Updated Market Doctype:', updatedMarket)
    if (updatedMarket.category !== id) {
      return // Exit if it doesn't match the category
    }
    setCategoryMarkets((prevMarkets) => {
      const updatedMarkets = {
        ...prevMarkets,
        [updatedMarket.name]: updatedMarket,
      }

      // ❌ Remove market if it's closed
      if (updatedMarket.status === 'CLOSED') {
        delete updatedMarkets[updatedMarket.name]
      }

      return updatedMarkets
    })
  })

  console.log('Category Markets:', categoryMarkets)

  useFrappeEventListener('market_event', (updatedMarket) => {
    console.log('Updated Market:', updatedMarket)
    if (updatedMarket.category !== id) {
      return // Exit if it doesn't match the category
    }
    setCategoryMarkets((prevMarkets) => {
      const updatedMarkets = {
        ...prevMarkets,
        [updatedMarket.name]: updatedMarket,
      }

      // ❌ Remove market if it's closed
      if (updatedMarket.status === 'CLOSED') {
        delete updatedMarkets[updatedMarket.name]
      }

      return updatedMarkets
    })
  })
  const getCategoryEmoji = () => {
    const emojiMap = {
      Cricket: '🏏',
      Crypto: '₿',
      Youtube: '▶️',
      Stocks: '📈',
      Politics: '🗳️',
      Entertainment: '🎬',
      Sports: '⚽',
      Tech: '💻',
    }
    return emojiMap[id.toUpperCase()] || '📊'
  }

  const getCategoryGradient = () => {
    const gradientMap = {
      Cricket: 'from-rose-400 to-rose-500',
      Crypto: 'from-amber-400 to-amber-500',
      Youtube: 'from-blue-400 to-blue-500',
      Stocks: 'from-green-400 to-green-500',
      Politics: 'from-purple-400 to-purple-500',
      Entertainment: 'from-pink-400 to-pink-500',
      Sports: 'from-orange-400 to-orange-500',
      Tech: 'from-cyan-400 to-cyan-500',
    }
    return gradientMap[id.toUpperCase()] || 'from-gray-400 to-gray-500'
  }

  const handleMarketClick = (market) => {
    navigate(`/event/${market.name}`)
  }

  if (categoryDataLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="spinner w-14 h-14 rounded-full border-4 border-gray-200 border-r-blue-500 animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="pb-6 min-h-screen bg-gray-50">
      <div className="bg-indigo-600 pt-safe-top pb-8">
        <div className="px-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/')}
              className="p-2 -ml-2 text-white/90 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">
              {id.charAt(0).toUpperCase()}
              {id.slice(1)}
            </h1>
          </div>

          <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-6 mb-6">
            <div className="flex items-center gap-4 mt-4">
              <div
                className={`w-16 h-16 bg-gradient-to-br rounded-2xl shadow-sm flex items-center justify-center bg-white/20`}
              >
                <span className="text-3xl">
                  <img
                    src={currentCategory?.category_image}
                    width={25}
                    alt=""
                  />
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-1">
                  {id.charAt(0).toUpperCase()}
                  {id.slice(1)} Markets
                </h2>
                <p className="text-white/80">
                  {Object.values(categoryMarkets || {})?.length} active{' '}
                  {Object.values(categoryMarkets || {})?.length === 1
                    ? 'event'
                    : 'events'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4">
        <div className=" rounded-3xl flex flex-col gap-4">
          {Object.values(categoryMarkets || {})?.length > 0 ? (
            Object.values(categoryMarkets || {})?.map((market) => (
              <div
                className="p-4 border-white bg-white rounded-3xl"
                onClick={() => {
                  handleMarketClick(market)
                }}
              >
                <div className="flex flex-col gap-2">
                  <div className="w-full flex gap-3 items-center">
                    <div className="w-[20%] h-full flex justify-center items-center">
                      <img src={market.icon} className="h-full w-full" alt="" />
                    </div>
                    <div className="flex flex-col gap-2 w-[80%]">
                      <h3 className="font-normal text-sm text-[#181818] leading-[20px]">
                        {market.question}
                      </h3>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center text-xs text-[#606060]">
                          <Users className="h-3.5 w-3.5 mr-1" />
                          <span>
                            {market.total_traders.toLocaleString()} traders
                          </span>
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">
                          <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse mr-1"></div>
                          LIVE
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* <p className="text-xs text-gray-600 mb-4">
                                        {market.info}
                                      </p> */}
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="py-2 px-4 text-center bg-green-50 text-green-600 rounded-xl text-xs font-light">
                      Yes ₹{market.yes_price}
                    </div>
                    <div className="py-2 px-4 text-center bg-rose-50 text-rose-600 rounded-xl text-xs font-light">
                      No ₹{market.no_price}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-2">📭</div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No Active Events
              </h3>
              <p className="text-sm text-gray-500">
                Check back later for new events in this category
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CategoryPage
