import {
  useFrappeAuth,
  useFrappeEventListener,
  useFrappeUpdateDoc,
} from 'frappe-react-sdk'
import { Clock, Plus, TrendingDown, TrendingUp, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'
import { useFrappeDeleteDoc } from 'frappe-react-sdk'
import { DittofeedSdk } from '@dittofeed/sdk-web'

const ActiveOrders = ({
  order,
  setActiveOrders,
  handleTradeClick,
  refetchActiveOrders,
}) => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const { updateDoc } = useFrappeUpdateDoc()
  const { currentUser } = useFrappeAuth()

  // useFrappeEventListener('market_event', (updatedMarket) => {
  //   console.log('Hello')
  //   if (updatedMarket.name === order.market_id) {
  //     console.log('Current: ', order.market_id)
  //     console.log('Updated:', updatedMarket.name)
  //   }
  //   if (updatedMarket.name === order.market_id) {
  //     setActiveOrders((prev) => {
  //       const updatedActiveOrders = {
  //         ...prev,
  //         [order.name]: {
  //           name: order.name,
  //           question: order.question,
  //           creation: order.creation,
  //           amount: order.amount,
  //           status: order.status,
  //           quantity: order.quantity,
  //           opinion_type: order.opinion_type,
  //           market_id: order.market_id,
  //           yes_price:
  //             order.opinion_type === 'YES'
  //               ? updatedMarket.yes_price
  //               : order.yes_price,
  //           no_price:
  //             order.opinion_type === 'NO'
  //               ? updatedMarket.no_price
  //               : order.no_price,
  //           sell_order_id: order.sell_order_id,
  //         },
  //       }
  //       return updatedActiveOrders
  //     })
  //   }
  // })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleCancelOrder = async () => {
    try {
      await updateDoc('Orders', order.name, {
        status: 'CANCELED',
      })

      console.log('Orderererer', order)
      DittofeedSdk.track({
        event: 'Order Cancelled',
        userId: currentUser, // optional but useful for identifying who canceled it
        properties: {
          order_id: order.name,
          market_id: order.market_id,
          opinion_type: order.opinion_type,
          order_type: order.order_type,
          amount: order.amount,
          quantity: order.quantity,
          timestamp: new Date().toISOString(),
        },
      })
      //  else {
      //   await updateDoc('Orders', order.name, {
      //     status: 'CANCELED',
      //   })
      // }
      // Remove this stray 'call' line
      // call  <-- This is causing the error
      refetchActiveOrders()
      setIsOpen(false)
    } catch (err) {
      console.log(err)
    }
  }

  const handleMarketClick = (order) => {
    navigate(`/event/${order.market_id}`)
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }

  return (
    <>
      <div
        key={order.name}
        className="p-4 w-full rounded-xl shadow-md bg-white transition hover:shadow-lg cursor-pointer space-y-3"
      >
        {order.order_type === 'BUY' ? (
          <Badge className="text-xs font-semibold hover:underline bg-green-200 text-green-600">
            {order.order_type}
          </Badge>
        ) : (
          <Badge className="text-xs font-semibold hover:underline bg-red-200 text-red-600">
            {order.order_type}
          </Badge>
        )}
        <div className="flex items-center justify-between">
          <p className="font-medium text-gray-900 max-w-[80%] truncate">
            {order.question}
          </p>
          <span
            className={`px-2 py-0.5 rounded-xl text-xs font-medium
        ${
          order.status === 'MATCHED'
            ? 'bg-green-100 text-green-700'
            : order.status === 'PARTIAL'
            ? 'bg-yellow-100 text-yellow-700'
            : order.status === 'UNMATCHED'
            ? 'bg-gray-200 text-gray-700'
            : 'bg-red-200 text-red-600'
        }`}
          >
            {order.status}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              order.opinion_type === 'YES'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-rose-100 text-rose-700'
            }`}
          >
            {order.opinion_type}
          </span>
          <span>•</span>
          <span className="flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1" />
            End at {formatDate(order.closing_time)}
          </span>
        </div>
        <div className="flex justify-between text-sm text-gray-700">
          <div>
            <div className="text-xs text-gray-500">Amount</div>
            <div className="font-semibold text-gray-900">
              ₹{order.quantity * order.amount}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">Quantity</div>
            <div className="font-semibold text-gray-900">{order.quantity}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Per Unit Price</div>
            <div className="font-semibold text-gray-900">₹{order.amount}</div>
          </div>
        </div>
        {(order.status === 'UNMATCHED' || order.status === 'PARTIAL') && (
          <div className="flex gap-3 pt-3">
            <div className="w-1/2">
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger className="w-full">
                  <Button className="w-full bg-rose-50 text-rose-600 rounded-xl text-sm font-medium hover:bg-rose-100 transition">
                    <XCircle className="h-4 w-4 mr-1" />
                    Cancel Order
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account and remove your data from our servers.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      className="bg-white hover:bg-white/90"
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-neutral-900 text-white hover:bg-neutral-800/90"
                      onClick={() => handleCancelOrder()}
                    >
                      Submit
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <Button
              onClick={() => handleMarketClick(order)}
              className="w-1/2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition"
            >
              <Plus className="h-4 w-4 mr-1" />
              Invest More
            </Button>
          </div>
        )}
      </div>
    </>
  )
}

export default ActiveOrders
