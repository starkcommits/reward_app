import React, { useState, useEffect } from 'react'
import { DittofeedSdk } from '@dittofeed/sdk-web'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

import {
  useFrappeAuth,
  useFrappeCreateDoc,
  useFrappeGetDoc,
  useSWRConfig,
} from 'frappe-react-sdk'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import OrderBook from './OrderBook'
import toast from 'react-hot-toast'

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Clock, Minus, Plus } from 'lucide-react'
import { DateTimePicker } from './ui/date-picker'
import { isArray, max } from 'lodash'

const BuyTradeSheet = ({
  marketId,
  market,
  choice,
  setSelectedChoice,
  isSheetOpen,
  setIsSheetOpen,
}) => {
  const [selectedDateTime, setSelectedDateTime] = useState(null)
  const { createDoc, isLoading: createDocLoading } = useFrappeCreateDoc()
  const { mutate } = useSWRConfig()

  const { currentUser } = useFrappeAuth()

  const { data: userData, isLoading: userDataLoading } = useFrappeGetDoc(
    'User Wallet',
    currentUser,
    currentUser ? undefined : null
  )

  console.log('MArket', choice, market)
  const [price, setPrice] = useState(
    choice === 'YES' ? market.yes_price : market.no_price
  )
  const [quantity, setQuantity] = useState(2)
  const [stopLossEnabled, setStopLossEnabled] = useState(false)
  const [bookProfitEnabled, setBookProfitEnabled] = useState(false)
  const [autoCancelEnabled, setAutoCancelEnabled] = useState(false)

  const [stopLossValue, setStopLossValue] = useState(price - 0.5)
  const [bookProfitValue, setBookProfitValue] = useState(price + 0.5)

  const [stopLossError, setStopLossError] = useState('')
  const [bookProfitError, setBookProfitError] = useState('')

  useEffect(() => {
    // Reset stop loss value when price changes
    setStopLossValue(price - 0.5)

    // Reset book profit value when price changes
    setBookProfitValue(price + 0.5)
  }, [price, choice])

  const formatToFrappeLDatetime = (dateObj) => {
    const yyyy = dateObj.getFullYear()
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0')
    const dd = String(dateObj.getDate()).padStart(2, '0')
    const hh = String(dateObj.getHours()).padStart(2, '0')
    const mi = String(dateObj.getMinutes()).padStart(2, '0')
    const ss = String(dateObj.getSeconds()).padStart(2, '0')

    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`
  }
  const handleConfirmBuy = async () => {
    try {
      const orderData = {
        market_id: marketId,
        order_type: 'BUY',
        quantity: quantity,
        user_id: currentUser,
        opinion_type: choice,
        amount: price,
        sell_order_id: '',
        buy_order_id: '',
      }

      if (stopLossEnabled) {
        orderData.stop_loss = true
        orderData.loss_price = stopLossValue
      }

      // Add book profit if enabled
      if (bookProfitEnabled) {
        orderData.book_profit = true
        orderData.profit_price = bookProfitValue
      }

      if (autoCancelEnabled) {
        orderData.auto_cancel = autoCancelEnabled
        orderData.cancel_time = formatToFrappeLDatetime(selectedDateTime)
      }

      await createDoc('Orders', orderData)

      DittofeedSdk.track({
        event: 'Buy Order Placed',
        userId: currentUser,
        properties: {
          market_id: marketId,
          opinion_type: choice,
          price,
          quantity,
          stop_loss_enabled: stopLossEnabled,
          book_profit_enabled: bookProfitEnabled,
          auto_cancel_enabled: autoCancelEnabled,
          timestamp: new Date().toISOString(),
        },
      })

      mutate((key) => Array.isArray(key) && key[0] === 'get_all_orders')

      toast.success(`Buy Order Placed.`)

      console.log(orderData)

      setIsSheetOpen(false)
    } catch (err) {
      toast.error(`Error in placing buy order.`)
      console.error('Order creation error:', err)
    }
  }

  const handleBadgeClick = (minutes) => {
    // Calculate future time based on current time + minutes
    const futureTime = new Date()
    futureTime.setMinutes(futureTime.getMinutes() + minutes)
    setSelectedDateTime(futureTime)
  }

  console.log(price, stopLossValue, bookProfitValue)

  console.log('Selected Date Time: ', selectedDateTime)

  return (
    <Drawer open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <DrawerContent className="max-h-full flex flex-col">
        {/* Rest of the existing code remains the same */}
        <div className="p-4 overflow-y-auto">
          <Tabs defaultValue={choice} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger
                value="YES"
                className="w-[50%] data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                onClick={() => {
                  setSelectedChoice('YES')
                }}
              >
                YES &#8377;{market.yes_price}
              </TabsTrigger>
              <TabsTrigger
                value="NO"
                className="w-[50%] data-[state=active]:bg-red-500 data-[state=active]:text-white"
                onClick={() => {
                  setSelectedChoice('NO')
                }}
              >
                NO &#8377;{market.no_price}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mb-6 mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-medium">Price</span>
              <div className="flex items-center">
                <span className="text-lg font-medium">₹{price}</span>
              </div>
            </div>

            <div className="flex justify-between mt-2">
              <Slider
                max={9.5}
                min={0.5}
                step={0.5}
                value={[price]}
                className={``}
                onValueChange={(values) => {
                  setPrice(values[0])
                }}
              />
              {/* <button
                  onClick={() => handlePriceChange(price + 0.5)}
                  className="p-2 active:bg-gray-100 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button> */}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-medium">Quantity</span>
              <span className="text-lg font-medium">{quantity}</span>
            </div>
            {/* <ReactSlider
                      className="horizontal-slider"
                      min={1}
                      max={maxQuantity}
                      value={quantity}
                      onChange={setQuantity}
                    /> */}
            <Slider
              max={market.max_allowed_quantity}
              min={1}
              step={1}
              value={[quantity]}
              className={``}
              onValueChange={(values) => {
                if (quantity <= market.max_allowed_quantity)
                  setQuantity(values[0])
                else setQuantity(market.max_allowed_quantity)
              }}
            />
          </div>
          <div className="flex justify-between px-14 font-inter leading-[100%] py-4">
            <div className="flex flex-col gap-1 items-center">
              <span className="font-semibold text-[20px] text-[#2C2D32]">
                {parseFloat(price * quantity).toFixed(1)}
              </span>
              <span className="font-normal text-xs">You put in</span>
            </div>
            <div className="flex flex-col gap-1 items-center">
              <span className="text-[#1C895E] font-semibold text-[20px] ">
                {parseFloat(quantity * 10).toFixed(1)}
              </span>
              <span className="font-normal text-xs">You get</span>
            </div>
          </div>

          <div className="flex justify-between mb-4 text-lg">
            {/* <div>
                <p className="text-gray-500">You put</p>
                <p className="font-medium">₹{totalCost.toFixed(1)}</p>
              </div> */}
            {/* <div className="text-right">
                <p className="text-gray-500">You get</p>
                <p className="font-medium text-green-600">
                  ₹{potentialWinnings.toFixed(1)}
                </p>
              </div> */}
          </div>

          <Accordion type="multiple" collapsible className="w-full">
            <AccordionItem value="order-book" className="border-none">
              <AccordionTrigger className="hover:no-underline">
                Order Book
              </AccordionTrigger>
              <AccordionContent>
                <OrderBook marketId={marketId} />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="advanced-options" className="border-none">
              <AccordionTrigger className="hover:no-underline">
                Advanced Options
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="stop-loss" className="text-lg font-medium">
                      <div className="flex items-center gap-4">
                        Stop Loss{' '}
                        {stopLossError ? (
                          <div className="flex items-center gap-2 bg-red-100 text-red-800 border border-red-300 px-2 py-0.5 rounded-md shadow-sm">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <span className="font-semibold">
                              {stopLossError}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </Label>
                    <Switch
                      id="stop-loss"
                      checked={stopLossEnabled}
                      onCheckedChange={setStopLossEnabled}
                    />
                  </div>
                  {stopLossEnabled && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-md text-muted-foreground">
                          Set stop Loss Price
                        </span>
                        <span className="text-lg font-medium flex items-center gap-4 justify-between">
                          <button
                            className="p-0 focus:outline-none w-[30%]"
                            disabled={stopLossValue <= 0.5}
                            onClick={() => {
                              if (stopLossValue > 0.5) {
                                setStopLossValue(stopLossValue - 0.5)
                              }
                            }}
                          >
                            <Minus
                              className={`h-4 w-4 ${
                                stopLossValue <= 0.5
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-current cursor-pointer'
                              }`}
                              strokeWidth={1.5}
                            />
                          </button>
                          <span className="w-[40%]">
                            {parseFloat(stopLossValue).toFixed(1)}
                          </span>
                          <button
                            className="p-0 focus:outline-none w-[30%]"
                            disabled={stopLossValue + 0.5 >= price}
                            onClick={() => {
                              if (stopLossValue + 0.5 < price) {
                                setStopLossValue(stopLossValue + 0.5)
                              }
                            }}
                          >
                            <Plus
                              className={`h-4 w-4 ${
                                stopLossValue + 0.5 >= price
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-current cursor-pointer'
                              }`}
                              strokeWidth={1.5}
                            />
                          </button>
                        </span>
                      </div>
                      {/* <Slider
                        max={9.5}
                        min={0.5}
                        step={0.5}
                        value={[stopLossValue]}
                        className={``}
                        onValueChange={(values) => {
                          if (values[0] < price) {
                            setStopLossValue(values[0])
                            setStopLossError('')
                          } else {
                            setStopLossError(
                              "Can't set it above your buy price"
                            )
                          }
                        }}
                      /> */}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 my-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="book-profit"
                      className="text-lg font-medium"
                    >
                      Book Profit
                    </Label>
                    <Switch
                      id="book-profit"
                      checked={bookProfitEnabled}
                      onCheckedChange={setBookProfitEnabled}
                    />
                  </div>
                  {bookProfitEnabled && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-md text-muted-foreground">
                          Set Book Profit Price
                        </span>
                        <span className="text-lg font-medium flex items-center gap-4 justify-between">
                          <button
                            className="p-0 focus:outline-none w-[30%]"
                            disabled={bookProfitValue <= price + 0.5}
                            onClick={() => {
                              if (bookProfitValue > price + 0.5) {
                                setBookProfitValue(bookProfitValue - 0.5)
                              }
                            }}
                          >
                            <Minus
                              className={`h-4 w-4 ${
                                bookProfitValue <= price + 0.5
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-current cursor-pointer'
                              }`}
                              strokeWidth={1.5}
                            />
                          </button>
                          <span className="w-[40%]">
                            {parseFloat(bookProfitValue).toFixed(1)}
                          </span>
                          <button
                            className="p-0 focus:outline-none w-[30%]"
                            disabled={bookProfitValue >= 9.5}
                            onClick={() => {
                              if (bookProfitValue < 9.5) {
                                setBookProfitValue(bookProfitValue + 0.5)
                              }
                            }}
                          >
                            <Plus
                              className={`h-4 w-4 ${
                                bookProfitValue >= 9.5
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-current cursor-pointer'
                              }`}
                              strokeWidth={1.5}
                            />
                          </button>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 my-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="auto-cancel"
                      className="text-lg font-medium"
                    >
                      Auto Cancel
                    </Label>
                    <Switch
                      id="auto-cancel"
                      checked={autoCancelEnabled}
                      onCheckedChange={setAutoCancelEnabled}
                    />
                  </div>

                  {autoCancelEnabled && (
                    <div className="space-y-4 flex items-center justify-between">
                      {/*  make three badges here for 1 minute 3 minutes and 5 minutes */}
                      <div className="flex gap-6 px-2">
                        <button
                          onClick={() => handleBadgeClick(1)}
                          className="px-3 py-1 text-sm rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
                        >
                          1 minute
                        </button>
                        <button
                          onClick={() => handleBadgeClick(3)}
                          className="px-3 py-1 text-sm rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
                        >
                          3 minutes
                        </button>
                        <button
                          onClick={() => handleBadgeClick(5)}
                          className="px-3 py-1 text-sm rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
                        >
                          5 minutes
                        </button>
                      </div>

                      <div className="mt-2">
                        <DateTimePicker
                          value={selectedDateTime}
                          onChange={setSelectedDateTime}
                          placeholder="Select date and time..."
                          disabled={setAutoCancelEnabled}
                        />
                      </div>
                    </div>
                  )}
                  {selectedDateTime && (
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 flex items-start gap-3">
                      <div className="rounded-full bg-blue-100 p-2 mt-0.5">
                        <Clock className="h-4 w-4 text-blue-700" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Auto-cancel at:
                        </p>
                        <p className="text-gray-700">
                          {selectedDateTime.toLocaleDateString(undefined, {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          at{' '}
                          {selectedDateTime.toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200 shadow-sm mb-4 ">
            <div className="text-gray-700 font-medium">
              Available Balance:{' '}
              <span className="text-blue-600 font-semibold">
                ₹{userData?.balance}
              </span>
            </div>
            {userData?.balance < price * quantity && (
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z"
                  />
                </svg>
                <span className="text-sm text-red-600 font-semibold">
                  Insufficient balance. Please add funds to continue.
                </span>
              </div>
            )}
          </div>

          <button
            disabled={userData?.balance < price * quantity || createDocLoading}
            onClick={handleConfirmBuy}
            className={`relative w-full ${
              choice === 'YES' ? 'bg-blue-500' : 'bg-red-500'
            } text-white py-4 rounded-xl font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60
              ${createDocLoading ? `opacity-50 cursor-not-allowed` : ``}`}
          >
            {createDocLoading
              ? 'Processing...'
              : `Confirm ${choice === 'YES' ? 'YES' : 'NO'}`}
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default BuyTradeSheet
