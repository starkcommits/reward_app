import {
  useFrappeAuth,
  useFrappeGetCall,
  useFrappeGetDocList,
} from 'frappe-react-sdk'
import { AlertCircle, CheckCircle } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import TradeSheet from './defaultTradeSheet'
import { useNavigate } from 'react-router-dom'

const CompletedTrades = ({ trade }) => {
  const navigate = useNavigate()
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  return (
    <div
      key={trade.question}
      className="p-4 flex flex-col gap-2 cursor-pointer"
      onClick={() => {
        navigate(`/portfolio/closed/${trade?.market_id}`)
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-gray-900">{trade.market_id}</h3>
        <div className="bg-green-200 text-green-600 rounded-xl px-3">
          {trade.status}
        </div>
      </div>
      <div>{trade?.question}</div>
      {/* <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
        <span>{formatDate(trade.closing_time)}</span>
      </div> */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-600 font-medium">Amount Invested</div>
          <div className="font-semibold text-gray-900">
            ₹{trade?.total_invested.toFixed(2)}
          </div>
        </div>
        <div className="grid place-content-end">
          <div className="text-gray-600 font-medium">Returns</div>
          {trade?.total_returns > 0 && (
            <div className={`font-bold text-green-700`}>
              +₹{trade.total_returns.toFixed(2)}
            </div>
          )}{' '}
          {trade?.total_returns === 0 && (
            <div className={`font-bold text-neutral-700`}>
              ₹{trade?.total_returns.toFixed(2)}
            </div>
          )}{' '}
          {trade?.total_returns < 0 && (
            <div className={`font-bold text-red-700`}>
              ₹{trade.total_returns.toFixed(2)}
            </div>
          )}{' '}
          {/* <div
            className={`font-semibold ${
              trade.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {trade.profit >= 0 ? '+' : ''}₹{Math.abs(trade.profit)}
          </div> */}
        </div>
      </div>
    </div>
  )
}

export default CompletedTrades
