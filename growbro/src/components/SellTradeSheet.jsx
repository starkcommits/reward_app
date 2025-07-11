import React, { useState } from 'react'
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

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import { Slider } from '@/components/ui/slider'
import { LogOut } from 'lucide-react'
import OrderBook from './OrderBook'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useFrappeUpdateDoc } from 'frappe-react-sdk'
import { useSWRConfig } from 'frappe-react-sdk'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const SellTradeSheet = ({ position, refetcHoldingData, type }) => {
  const { updateDoc } = useFrappeUpdateDoc()

  const { mutate } = useSWRConfig()

  const [price, setPrice] = useState(
    position.opinion_type === 'YES'
      ? position.market_yes_price
      : position.market_no_price
  )
  console.log('Positoasdasda', position)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { id } = useParams()

  const handleConfirmSell = async () => {
    try {
      await updateDoc('Holding', position.name, {
        exit_price: price,
        status: 'EXITING',
      })

      if (type === 'all')
        mutate((key) => Array.isArray(key) && key[0] === 'get_all_holdings')

      if (type === 'matched')
        mutate((key) => Array.isArray(key) && key[0] === 'get_matched_holdings')

      toast.success(`Sell Order Placed.`)

      setIsDrawerOpen(false)
    } catch (err) {
      console.error('Order creation error:', err)
      toast.error(`Error in placing the order.`)
    }
  }

  return (
    <Drawer
      className="w-full"
      open={isDrawerOpen}
      onOpenChange={setIsDrawerOpen}
    >
      <DrawerTrigger>
        <button className="bg-yellow-100 text-yellow-700 rounded-xl p-1 text-xs text-[0.7rem] font-medium flex gap-1 ">
          {position.status}
          <Separator orientation="vertical" className="w-0.5" />
          <LogOut className="w-4 h-4" />
        </button>
      </DrawerTrigger>
      <DrawerContent className="mx-auto w-full">
        <DrawerHeader>
          <DrawerTitle></DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <div className="px-10">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-medium">Price</span>
              <div className="flex items-center">
                <span className="text-lg font-medium">₹{price}</span>
              </div>
            </div>

            <div className="flex justify-between mt-2">
              <Slider
                defaultValue={[1]}
                max={9.5}
                min={0.5}
                step={0.5}
                value={[price]}
                className={``}
                onValueChange={(values) => {
                  setPrice(values[0])
                }}
              />
            </div>
          </div>
          <Accordion type="single" collapsible>
            <AccordionItem value="order_book" className="border-none">
              <AccordionTrigger className="hover:no-underline">
                Order Book
              </AccordionTrigger>
              <AccordionContent>
                <OrderBook marketId={id} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <DrawerFooter className="px-10">
          {position.opinion_type === 'YES' ? (
            <Button onClick={handleConfirmSell}>Confirm Yes</Button>
          ) : (
            <Button onClick={handleConfirmSell}>Confirm No</Button>
          )}
          <DrawerClose>
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default SellTradeSheet
