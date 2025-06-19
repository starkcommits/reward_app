import {
  useFrappeAuth,
  useFrappeCreateDoc,
  useFrappeEventListener,
  useFrappeGetCall,
  useFrappeGetDoc,
  useFrappeGetDocList,
  useFrappePostCall,
  useFrappePutCall,
  useFrappeUpdateDoc,
} from 'frappe-react-sdk'

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
import { Slider } from '@/components/ui/slider'
import {
  ArrowRight,
  Clock,
  LogOut,
  LucideMousePointerSquareDashed,
  Plus,
  TabletSmartphone,
  TrendingDown,
  TrendingUp,
  XCircle,
} from 'lucide-react'
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
import toast from 'react-hot-toast'
import ExitHoldingsDialog from './ExitHoldingsDialog'
import CancelHoldingsDialog from './CancelHoldingsDialog'
import { DittofeedSdk } from '@dittofeed/sdk-web'

const ActivePositions = ({ position, refetchActiveHoldings }) => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const [yesPrice, setYesPrice] = useState(position.yes_price)
  const [noPrice, setNoPrice] = useState(position.no_price)

  const { currentUser } = useFrappeAuth()
  const { createDoc } = useFrappeCreateDoc()
  const { call } = useFrappePostCall(
    'rewardapp.engine.cancel_order',
    currentUser ? undefined : null
  )

  //   useFrappeEventListener('market_event', (updatedMarket) => {
  //     console.log('Hello')
  //     if (updatedMarket.name === position.market_id) {
  //       console.log('Current: ', position.market_id)
  //       console.log('Updated:', updatedMarket.name)
  //     }
  //     if (updatedMarket.name === position.market_id) {
  //       setActiveOrders((prev) => {
  //         const updatedActiveOrders = {
  //           ...prev,
  //           [position.name]: {
  //             name: position.name,
  //             question: position.question,
  //             creation: position.creation,
  //             amount: position.amount,
  //             status: position.status,
  //             quantity: position.quantity,
  //             opinion_type: position.opinion_type,
  //             market_id: position.market_id,
  //             yes_price:
  //               position.opinion_type === 'YES'
  //                 ? updatedMarket.yes_price
  //                 : position.yes_price,
  //             no_price:
  //               position.opinion_type === 'NO'
  //                 ? updatedMarket.no_price
  //                 : position.no_price,
  //             sell_order_id: position.sell_order_id,
  //           },
  //         }
  //         return updatedActiveOrders
  //       })
  //     }
  //   })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleCancelOrders = async (market_id, setIsCancelOpen) => {
    try {
      await call({
        market_id: market_id,
        user_id: currentUser,
      })
      toast.success('Exit Orders Canceled Successfully.')
      refetchActiveHoldings()
      setIsCancelOpen(false)
    } catch (err) {
      console.log(err)
      toast.error('Error occured in canceling the order.')
    }
  }

  const handleExitPositions = async (
    yesPrice,
    noPrice,
    yesEnabled,
    noEnabled,
    setIsDrawerOpen
  ) => {
    try {
      if (position?.ACTIVE?.YES?.total_quantity > 0 && yesEnabled) {
        await createDoc('Orders', {
          market_id: position.market_id,
          quantity:
            position?.ACTIVE?.YES?.total_quantity -
            position?.ACTIVE?.YES?.total_filled_quantity,
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
            userId: currentUser,
            market_id: position.market_id,
            opinion_type: 'YES',
            quantity:
              position?.ACTIVE?.YES?.total_quantity -
              position?.ACTIVE?.YES?.total_filled_quantity,
            amount: yesPrice,
            timestamp: new Date().toISOString(),
          },
        })
      }
      if (position?.ACTIVE?.NO?.total_quantity > 0 && noEnabled) {
        console.log('No')
        await createDoc('Orders', {
          market_id: position.market_id,
          quantity:
            position?.ACTIVE?.NO?.total_quantity -
            position?.ACTIVE?.NO?.total_filled_quantity,
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
            userId: currentUser,
            market_id: position.market_id,
            opinion_type: 'NO',
            quantity:
              position?.ACTIVE?.NO?.total_quantity -
              position?.ACTIVE?.NO?.total_filled_quantity,
            amount: noPrice,
            timestamp: new Date().toISOString(),
          },
        })
      }
      refetchActiveHoldings()
      toast.success('All positions exited from this market', {
        top: 0,
      })
      setIsDrawerOpen(false)
    } catch (err) {
      console.log(err)
      toast.error('Error in exiting positions from the market')
    }
  }

  const handleMarketClick = (position) => {
    navigate(`/event/${position.market_id}`)
  }

  return (
    <>
      <div key={position.market_id} className="p-4 w-full cursor-pointer">
        <div
          onClick={() => {
            navigate(`/portfolio/active/${position?.market_id}`)
          }}
        >
          <Badge className="text-xs font-semibold mb-2 hover:underline">
            #{position.market_id}
          </Badge>

          {/* <div className="flex items-center justify-between mb-2">
          <div className="flex gap-2 items-center w-full">
            <div
              className="font-medium text-gray-900"
              // onClick={() => {
              //   navigate(`/event/${position.market_id}`)
              // }}
            >
              {position.market_id}
            </div>
            <div>
              {position.status === 'ACTIVE' &&
                position.filled_quantity === 0 && (
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
            </div>
          </div>
        </div> */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <span className="flex items-center font-medium text-lg">
              {position.question}
            </span>
          </div>

          {'ACTIVE' in position ? (
            <div className="flex justify-between gap-4 text-sm mb-4">
              <div>
                <div className="text-gray-600 font-medium">Invested</div>
                <div className="font-semibold text-gray-900">
                  ₹{position.total_invested?.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-gray-600 font-medium">Total Quantity</div>
                <div className="font-semibold text-gray-900">
                  {position?.ACTIVE?.NO && !position?.ACTIVE?.YES
                    ? position?.ACTIVE?.NO?.total_quantity
                    : null}
                  {position?.ACTIVE?.NO && position?.ACTIVE?.YES
                    ? `${
                        position?.ACTIVE?.NO?.total_quantity +
                        position?.ACTIVE?.YES?.total_quantity
                      }`
                    : null}
                  {position?.ACTIVE?.YES && !position?.ACTIVE?.NO
                    ? position?.ACTIVE?.YES?.total_quantity
                    : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="w-full flex items-center justify-between cursor-default">
          <div>
            {'EXITING' in position ? (
              <div className="flex gap-1 items-center">
                <span className="flex gap-1 items-center">
                  <span>
                    <LogOut className="w-4 h-4" />
                  </span>
                  <span>Exited</span>
                </span>
                <span>
                  {position?.EXITING?.NO && !position?.EXITING?.YES
                    ? position?.EXITING?.NO?.total_filled_quantity
                    : null}
                  {position?.EXITING?.YES && !position?.EXITING?.NO
                    ? position?.EXITING?.YES?.total_filled_quantity
                    : null}
                  {position?.EXITING?.NO && position?.EXITING?.YES
                    ? position?.EXITING?.NO?.total_filled_quantity +
                      position?.EXITING?.YES?.total_filled_quantity
                    : null}
                  /
                  {position?.EXITING?.NO && !position?.EXITING?.YES
                    ? position?.EXITING?.NO?.total_quantity
                    : null}
                  {position?.EXITING?.YES && !position?.EXITING?.NO
                    ? position?.EXITING?.YES?.total_quantity
                    : null}
                  {position?.EXITING?.NO && position?.EXITING?.YES
                    ? position?.EXITING?.NO?.total_quantity +
                      position?.EXITING?.YES?.total_quantity
                    : null}
                </span>
              </div>
            ) : null}
          </div>
          <div>
            {'EXITING' in position ? (
              <CancelHoldingsDialog
                position={position}
                handleCancelOrders={handleCancelOrders}
              />
            ) : null}
            {!('EXITING' in position) && 'ACTIVE' in position ? (
              <ExitHoldingsDialog
                position={position}
                handleExitPositions={handleExitPositions}
              />
            ) : null}
          </div>
        </div>

        <div>
          {!('EXITING' in position) &&
            !('ACTIVE' in position) &&
            'EXITED' in position && (
              <p className="text-md font-semibold">Exited</p>
            )}
        </div>
      </div>
    </>
  )
}

export default ActivePositions
