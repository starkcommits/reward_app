import { useFrappeEventListener, useFrappeGetCall } from 'frappe-react-sdk'
import { Book, LucideMousePointerBan } from 'lucide-react'
import React, { useEffect, useState } from 'react'

const AdminViewOrderBook = ({ marketId }) => {
  const [orderBook, setOrderBook] = useState({})
  console.log(marketId)

  const {
    data: orderBookData,
    isLoading: orderBookLoading,
    mutate: refetchOrderBook,
  } = useFrappeGetCall('rewardapp.engine.get_available_quantity', {
    market_id: marketId,
  })

  console.log(orderBookData)

  useEffect(() => {
    // First, handle the case when we have data from API
    if (
      !orderBookLoading &&
      Object.values(orderBookData?.message)?.length > 0
    ) {
      // Normalize the data from API
      const normalizedData = Object.fromEntries(
        Object.entries(orderBookData?.message).map(([key, value]) => [
          parseFloat(key).toFixed(1), // Ensure key format
          { ...value, price: parseFloat(key).toFixed(1) },
        ])
      )

      // Create a complete range of prices from 0.5 to 9.5 with 0.5 increments
      const completeOrderBook = {}
      for (let price = 0.5; price <= 9.5; price += 0.5) {
        const priceKey = price.toFixed(1)
        // If the price exists in normalized data, use it; otherwise, set quantities to 0
        completeOrderBook[priceKey] = normalizedData[priceKey] || {
          price: priceKey,
          yesQty: 0,
          noQty: 0,
        }
      }

      setOrderBook(completeOrderBook)
    }
    // Handle the case when we have no data or empty data
    else {
      // Create default price points for all prices from 0.5 to 9.5
      const defaultData = {}
      for (let price = 0.5; price <= 9.5; price += 0.5) {
        const priceKey = price.toFixed(1)
        defaultData[priceKey] = {
          price: priceKey,
          yesQty: 0,
          noQty: 0,
        }
      }

      setOrderBook(defaultData)
    }
  }, [orderBookData, orderBookLoading])

  console.log('Message: ', orderBookData?.message)

  useFrappeEventListener('order_book_event', (order) => {
    console.log('Received Order:', order)
    if (order.market_id !== marketId) return

    console.log('entered')
    console.log('Type Order Price: ', typeof order.price)

    console.log('Type of order:', typeof order.quantity, typeof order.price)

    refetchOrderBook()  

    // setOrderBook((prevOrderBook) => {
    //   const priceKey = parseFloat(order.price).toFixed(1) // Ensure consistent price format

    //   console.log('Previous OrderBook:', prevOrderBook)

    //   // Clone the order book
    //   const updatedOrderBook = { ...prevOrderBook }

    //   // Ensure the price entry exists
    //   if (!updatedOrderBook[priceKey]) {
    //     updatedOrderBook[priceKey] = { price: priceKey, yesQty: 0, noQty: 0 }
    //   }
    //   const currentYesQty = Number(updatedOrderBook[priceKey].yesQty) || 0
    //   const currentNoQty = Number(updatedOrderBook[priceKey].noQty) || 0
    //   const orderQuantity = Number(order.quantity) || 0

    //   console.log(currentYesQty, currentNoQty, orderQuantity)

    //   updatedOrderBook[priceKey] = {
    //     price: priceKey,
    //     yesQty:
    //       order.opinion_type === 'YES'
    //         ? currentYesQty + orderQuantity
    //         : currentYesQty,
    //     noQty:
    //       order.opinion_type === 'NO'
    //         ? currentNoQty + orderQuantity
    //         : currentNoQty,
    //   }

    //   console.log('Updated OrderBook:', updatedOrderBook)

    //   return updatedOrderBook
    // })
  })

  useEffect(() => {
    console.log('Order book state changed:', orderBook)
  }, [orderBook])

  // console.log('Sorted Entries:', sortedYesEntries, sortedNoEntries)

  return (
    <div className="">
      <div className="bg-white rounded-xl border-gray-100 overflow-hidden">
        {/* <div className="flex items-center px-4 py-1 bg-gray-50">
          <Book className="h-5 w-5 mr-2" />
          <span className="font-medium">Order Book</span>
        </div> */}
        <div className="grid grid-cols-2">
          <div className="divide-y divide-gray-100">
            <div className="grid grid-cols-2 gap-4 px-4 py-4 bg-gray-50 text-[0.800rem] sm:text-sm font-medium">
              <span>Price</span>
              <span className="text-blue-600">Qty at YES</span>
            </div>
            {Object.values(orderBook)
              .sort(
                (a, b) =>
                  b.yesQty - a.yesQty ||
                  parseFloat(a.price) - parseFloat(b.price)
              )
              .slice(0, 10)
              .map((entry) => (
                <div
                  key={entry.price}
                  className="grid grid-cols-2 gap-4 px-4 py-4 text-sm"
                >
                  {console.log('Entry:', entry)}
                  <span>₹{entry.price}</span>
                  <span className="text-blue-600">{entry.yesQty}</span>
                </div>
              ))}
          </div>
          <div className="divide-y divide-gray-100">
            <div className="grid grid-cols-2 gap-4 px-4 py-4 bg-gray-50 text-[0.800rem] sm:text-sm font-medium">
              <span>Price</span>
              <span className="text-rose-600">Qty at NO</span>
            </div>
            {Object.values(orderBook)
              .sort(
                (a, b) =>
                  b.noQty - a.noQty || parseFloat(a.price) - parseFloat(b.price)
              )
              .slice(0, 10)
              .map((entry) => (
                <div
                  key={entry.price}
                  className="grid grid-cols-2 gap-4 px-4 py-4 text-sm"
                >
                  <span>₹{entry.price}</span>
                  <span className="text-rose-600">{entry.noQty}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminViewOrderBook
