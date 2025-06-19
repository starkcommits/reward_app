import React, { cache, useEffect, useMemo, useState } from 'react'
import {
  redirect,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
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

import {
  useFrappeAuth,
  useFrappeDocTypeEventListener,
  useFrappeEventListener,
  useFrappeGetDocList,
} from 'frappe-react-sdk'

import ActiveOrders from './ActiveOrders'

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

const OrdersTab = () => {
  const { id } = useParams()
  const [activeOrders, setActiveOrders] = useState({})
  const { currentUser, isLoading } = useFrappeAuth()

  const {
    data: activeOrdersData,
    isLoading: activeOrdersLoading,
    mutate: refetchActiveOrders,
  } = useFrappeGetDocList(
    'Orders',
    {
      fields: [
        'name',
        'question',
        'creation',
        'amount',
        'status',
        'filled_quantity',
        'owner',
        'quantity',
        'opinion_type',
        'closing_time',
        'order_type',
        'market_id',
        'market_status',
        'yes_price',
        'no_price',
      ],
      filters: [
        ['status', 'not in', ['SETTLED']],
        ['user_id', '=', currentUser],
        ['market_id', '=', id],
      ],
      orderBy: {
        field: 'creation',
        order: 'desc',
      },
    },
    currentUser ? undefined : null
  )

  useEffect(() => {
    if (!activeOrdersLoading && activeOrdersData?.length > 0) {
      const activeOrdersMap = activeOrdersData.reduce((acc, order) => {
        acc[order.name] = order // ✅ Store as { "market_name": marketData }
        return acc
      }, {})
      setActiveOrders(activeOrdersMap)
    }
  }, [activeOrdersData])

  useFrappeDocTypeEventListener('Orders', (order) => {
    if (!activeOrders[order.name]) return
    console.log('Order:', order)
    refetchActiveOrders()
    // setActiveOrders((prev) => {
    //   const updatedActiveOrders = {
    //     ...prev,
    //     [updatedOrder.name]: updatedOrder,
    //   }
    //   return updatedActiveOrders
    // })
  })

  return (
    <div className=" bg-gray-50">
      {/* Content Section */}
      <div className="">
        <div className="bg-white rounded-3xl shadow-sm p-4 space-y-4">
          {/* Filter Bar */}
          <div className="flex items-center justify-between border-gray-100">
            <div className="text-sm font-medium text-gray-700">
              {
                Object.values(activeOrders)?.filter((order) => {
                  return order.status !== 'CANCELED'
                }).length
              }
              {` `}
              Active Orders
            </div>
          </div>

          {/* Trades List */}
          <div className="divide-y divide-gray-100 flex flex-col gap-4">
            {Object.values(activeOrders).map((order) => (
              <ActiveOrders
                key={order.name}
                order={order}
                setActiveOrders={setActiveOrders}
                refetchActiveOrders={refetchActiveOrders}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrdersTab
