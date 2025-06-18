import {
  useFrappeAuth,
  useFrappeEventListener,
  useFrappeGetDoc,
  useFrappeGetDocList,
  useSWR,
} from 'frappe-react-sdk'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

const PortfolioActiveValues = () => {
  const { currentUser } = useFrappeAuth()
  const { id } = useParams()
  const [market, setMarket] = useState({})
  const [holdings, setHoldings] = useState({})
  const [allHoldings, setAllHoldings] = useState({})

  const {
    data: holdingData,
    isLoading: holdingDataLoading,
    mutate: refetchHoldingData,
  } = useFrappeGetDocList(
    'Holding',
    {
      fields: [
        'name',
        'market_id',
        'order_id',
        'price',
        'returns',
        'quantity',
        'opinion_type',
        'status',
        'exit_price',
        'market_yes_price',
        'market_no_price',
        'filled_quantity',
      ],
      filters: [
        ['user_id', '=', currentUser],
        ['market_id', '=', id],
        ['status', 'in', 'ACTIVE'],
      ],
    },
    currentUser && id ? undefined : null
  )

  const {
    data: allHoldingData,
    isLoading: allHoldingDataLoading,
    mutate: refetchAllHoldingData,
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
        'filled_quantity',
      ],
      filters: [
        ['user_id', '=', currentUser],
        ['status', 'in', 'ACTIVE'],
      ],
    },
    currentUser && !id ? undefined : null
  )

  console.log('All Holdings Data :', allHoldings)

  useEffect(() => {
    if (!allHoldingDataLoading && allHoldingData?.length > 0) {
      const holdingDataMap = allHoldingData?.reduce((acc, holding) => {
        acc[holding.name] = holding
        return acc
      }, {})
      setAllHoldings(holdingDataMap)
    }
  }, [allHoldingData])

  useFrappeEventListener('market_event', (updatedData) => {
    console.log('Hello')
    setAllHoldings((prevHoldings) => {
      const updatedHoldings = Object.fromEntries(
        Object.entries(prevHoldings).map(([key, holding]) => {
          if (updatedData.name !== holding.market_id) return [key, holding]
          return [
            key,
            {
              ...holding,
              market_yes_price: updatedData.yes_price,
              market_no_price: updatedData.no_price,
            },
          ]
        })
      )

      return updatedHoldings
    })

    console.log('Enetered')
  })

  useEffect(() => {
    if (!holdingDataLoading && holdingData?.length > 0) {
      const holdingDataMap = holdingData?.reduce((acc, holding) => {
        acc[holding.name] = holding
        return acc
      }, {})
      setHoldings(holdingDataMap)
    }
  }, [holdingData])

  useFrappeEventListener('market_event', (updatedData) => {
    if (updatedData.name !== id) return

    console.log('Hello')
    setHoldings((prevHoldings) => {
      const updatedHoldings = Object.fromEntries(
        Object.entries(prevHoldings).map(([key, holding]) => {
          return [
            key,
            {
              ...holding,
              market_yes_price: updatedData.yes_price,
              market_no_price: updatedData.no_price,
            },
          ]
        })
      )

      return updatedHoldings
    })

    console.log('Enetered')
  })

  if (id)
    return (
      <div className="flex justify-between py-4">
        <div className="flex flex-col gap-2 items-start">
          <div className="flex items-center justify-between">
            <span className="text-white font-semibold">Invested</span>
          </div>
          <div className="text-3xl font-bold text-white flex items-center gap-4">
            <div>
              ₹
              {Object.keys(holdings).length > 0
                ? Object.values(holdings).reduce((acc, holding) => {
                    return (
                      acc +
                      parseFloat(holding.price) * parseFloat(holding.quantity)
                    )
                  }, 0)
                : 0}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <div className="flex items-center justify-between">
            <span className="text-white font-semibold">Current Value</span>
            {/* <div className="flex items-center bg-emerald-500 bg-opacity-25 backdrop-blur-sm px-2.5 py-1 rounded-full">
        <TrendingUp className="h-4 w-4 text-white mr-1" />
        <span className="text-sm font-semibold text-white">+12.5%</span>
      </div> */}
          </div>
          <div className="text-3xl font-bold text-white flex items-center gap-4">
            <div>
              ₹
              {Object.keys(holdings).length > 0
                ? Object.values(holdings).reduce((acc, holding) => {
                    const marketPrice =
                      holding.opinion_type === 'YES'
                        ? parseFloat(holding.market_yes_price)
                        : parseFloat(holding.market_no_price)
                    return acc + marketPrice * parseFloat(holding.quantity)
                  }, 0)
                : 0}
            </div>
          </div>
        </div>
      </div>
    )

  return (
    <div className="flex justify-between py-4">
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
            {Object.keys(allHoldings).length > 0
              ? Object.values(allHoldings).reduce((acc, holding) => {
                  return (
                    acc +
                    parseFloat(holding.price) * parseFloat(holding.quantity)
                  )
                }, 0)
              : 0}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 items-end">
        <div className="flex items-center justify-between">
          <span className="text-white font-semibold">Current Value</span>
          {/* <div className="flex items-center bg-emerald-500 bg-opacity-25 backdrop-blur-sm px-2.5 py-1 rounded-full">
        <TrendingUp className="h-4 w-4 text-white mr-1" />
        <span className="text-sm font-semibold text-white">+12.5%</span>
      </div> */}
        </div>
        <div className="text-3xl font-bold text-white flex items-center gap-4">
          <div>
            ₹
            {Object.keys(allHoldings)?.length > 0
              ? Object.values(allHoldings).reduce((acc, holding) => {
                  acc =
                    acc +
                    parseFloat(
                      holding.opinion_type === 'YES'
                        ? holding.market_yes_price
                        : holding.market_no_price
                    ) *
                      holding.quantity

                  return acc
                }, 0)
              : 0}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PortfolioActiveValues
