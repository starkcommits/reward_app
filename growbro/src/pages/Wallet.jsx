import React, { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Wallet as WalletIcon,
  CreditCard,
  BanIcon as BankIcon,
  ArrowUpRight,
  Clock,
  ArrowDownLeft,
  Filter,
  ChevronRight,
  Plus,
  Accessibility,
  StethoscopeIcon,
  CircleX,
  Check,
  ChevronUp,
  ChevronDown,
  Trophy,
  Gift,
  ArrowRight,
} from 'lucide-react'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  useFrappeAuth,
  useFrappeGetCall,
  useFrappeGetDoc,
  useFrappeGetDocList,
  useFrappeUpdateDoc,
} from 'frappe-react-sdk'
import { AnimatePresence } from 'framer-motion'
import { motion } from 'motion/react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { BalanceCard } from '../components/BalanceCard'
import { KycAlert } from '../components/KycAlert'
import { PromotionalSection } from '../components/PromotionalSection'

// const formSchema = z.object({
//   pin: z
//     .string()
//     .length(4, 'PIN must be exactly 4 digits')
//     .regex(/^\d+$/, 'PIN must contain only digits'),
//   confirm_pin: z
//     .string()
//     .length(4, 'PIN must be exactly 4 digits')
//     .regex(/^\d+$/, 'PIN must contain only digits'),
// })

const Wallet = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [amount, setAmount] = useState('')
  const quickAmounts = [100, 500, 1000, 5000]
  const [open, setOpen] = useState(false)
  const { currentUser } = useFrappeAuth()
  const [tab, setTab] = useState('All')
  const [showBreakdown, setShowBreakdown] = useState(false)

  const handleTabChange = (newTab) => {
    setTab(newTab)
  }

  // console.log(currentUser)

  const {
    data: userWalletData,
    isLoading: userWalletLoading,
    mutate: refetchWalletData,
  } = useFrappeGetDoc(
    'User Wallet',
    currentUser,
    currentUser ? undefined : null
  )

  // const {
  //   data: total,
  //   isLoading: totalLoading,
  //   mutate: refetchTotal,
  // } = useFrappeGetCall(
  //   'rewardapp.wallet.get_deposit_and_withdrawal',
  //   currentUser ? undefined : null
  // )

  const {
    data: transactionHistory,
    isLoading: transactionHistoryLoading,
    mutate: refetchTransactionHistory,
  } = useFrappeGetDocList(
    'Transaction Logs',
    {
      fields: [
        'name',
        'transaction_amount',
        'transaction_type',
        'order_id',
        'question',
        'creation',
        'transaction_method',
        'wallet_type',
        'transaction_status',
      ],
      filters: [
        ['user', '=', currentUser],
        // ['transaction_type', 'in', ['Credit', 'Debit']],
      ],
      limit: 10,
      orderBy: {
        field: 'creation',
        order: 'desc',
      },
    },
    tab === 'All' && currentUser ? undefined : null
  )

  const {
    data: creditHistory,
    isLoading: depositsHistoryLoading,
    mutate: refetchDepositsHistory,
  } = useFrappeGetDocList(
    'Transaction Logs',
    {
      fields: [
        'name',
        'transaction_amount',
        'transaction_type',
        'order_id',
        'question',
        'creation',
        'transaction_status',
        'wallet_type',
        'transaction_method',
      ],
      filters: [
        ['user', '=', currentUser],
        ['transaction_type', '=', 'Credit'],
      ],
      limit: 10,
      orderBy: {
        field: 'creation',
        order: 'desc',
      },
    },
    tab === 'Credit' && currentUser ? undefined : null
  )

  const {
    data: debitHistory,
    isLoading: withdrawalsHistoryLoading,
    mutate: refetchWithdrawalsHistory,
  } = useFrappeGetDocList(
    'Transaction Logs',
    {
      fields: [
        'name',
        'transaction_amount',
        'transaction_type',
        'order_id',
        'question',
        'creation',
        'transaction_status',
        'wallet_type',
        'transaction_method',
      ],
      filters: [
        ['user', '=', currentUser],
        ['transaction_type', '=', 'Debit'],
      ],
      limit: 10,
      orderBy: {
        field: 'creation',
        order: 'desc',
      },
    },
    tab === 'Debit' && currentUser ? undefined : null
  )

  // useEffect(() => {
  //   setUserHistory(transactionHistory)
  // }, [transactionHistory])

  // useEffect(() => {
  //   setUserWithdrawals(withdrawalsHistory)
  // }, [withdrawalsHistory])

  // useEffect(() => {
  //   setUserDeposits(depositsHistory)
  // }, [depositsHistory])

  // useEffect(() => {
  //   setUserWallet(userWalletData)
  // }, [userWalletData])

  // async function handleAddMoney(data) {
  //   try {
  //     await updateDoc('User Wallet', currentUser, {
  //       balance: userWalletData.balance + parseFloat(amount),
  //     })
  //     await createDoc('Transaction Logs', {
  //       user: currentUser,
  //       transaction_amount: amount,
  //       transaction_type: 'Recharge',
  //       transaction_status: 'Success',
  //       transaction_method: 'UPI',
  //     })
  //     toast.success(`${amount} added to your wallet.`, {
  //       top: 0,
  //       right: 0,
  //     })

  //     setAmount(0)
  //     refetchTotal()
  //     refetchWalletData()
  //     activeTab === 'all'
  //       ? refetchTransactionHistory()
  //       : activeTab === 'deposits'
  //       ? refetchDepositsHistory()
  //       : refetchWithdrawalsHistory()
  //     setOpen(false)
  //   } catch (err) {
  //     console.log(err)
  //     toast.error('Failed to add money in the wallet.')
  //   }
  // }

  const handleQuickAmount = (value) => {
    setAmount(value.toString())
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatAmount = useCallback((amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
      notation: 'standard',
    })
      .format(amount)
      .replace('INR', '')
      .trim()
  }, [])

  if (userWalletLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="spinner w-14 h-14 rounded-full border-4 border-gray-200 border-r-blue-500 animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50">
      {/* Header Section */}
      {/* <div className="bg-indigo-600 pt-safe-top pb-8">
        <div className="px-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/')}
              className="p-2 -ml-2 text-white/90 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">Wallet</h1>
          </div>

          <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/90 font-medium">
                Available Balance
              </span>
              <WalletIcon className="h-5 w-5 text-white/90" />
            </div>
            <div className="text-4xl font-bold text-white mb-4">
              ₹{userWalletData?.balance}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-white/80 mb-1">Total Deposits</div>
                <div className="text-white font-semibold">
                  {total?.message?.reduce((acc, value) => {
                    if (value.transaction_type === 'Recharge') {
                      return acc + value.total_amount
                    }
                    return acc
                  }, 0)}
                </div>
              </div>
              <div>
                <div className="text-white/80 mb-1">Total Withdrawals</div>
                <div className="text-white font-semibold">
                  {total?.message?.reduce((acc, value) => {
                    if (value.transaction_type === 'Withdrawal') {
                      return acc + value.total_amount
                    }
                    return acc
                  }, 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      <div className="w-full">
        <div className="space-y-4">
          <div className="flex items-center gap-4 py-4 bg-indigo-600 text-white">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="p-2 rounded-full transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
            </div>
            <h2 className="text-2xl font-bold text-center">Wallet</h2>
          </div>

          <div className="px-4">
            <Card className="overflow-hidden bg-white dark:bg-gray-800 border-0 rounded-2xl">
              <CardContent className="p-0">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="rounded-xl p-3 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
                        <WalletIcon className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Wallet Balance
                        </p>
                        <h3 className="text-2xl font-bold mt-1">
                          <span className="font-normal text-xl"></span>
                          {userWalletData?.balance
                            ? formatAmount(userWalletData?.balance)
                            : formatAmount(0)}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/*<Card className="overflow-hidden bg-white dark:bg-gray-800 border-0 shadow-lg rounded-2xl">
            <CardContent className="p-0">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-xl p-3 flex items-center justify-center bg-amber-100 dark:bg-amber-900/30">
                      <Trophy className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Winnings
                      </p>
                      <h3 className="text-2xl font-bold mt-1">
                        <span className="font-normal text-xl"></span>
                        {formatAmount(21.7)}
                      </h3>
                    </div>
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      size="lg"
                      disabled={true}
                      onClick={() => console.log('Withdraw clicked')}
                      className="rounded-xl transition-all duration-300 font-medium border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                    >
                      Withdraw
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => console.log('KYC verification clicked')}
                  className="w-full flex items-center justify-between py-4 px-5 text-left bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20"
                >
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-500">
                    Complete KYC to withdraw funds
                  </span>
                  <ChevronRight className="h-5 w-5 text-amber-500" />
                </button>
              </div>
            </CardContent>
          </Card> */}

          {/* <div>
            <Card className="overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40 border-0 shadow-lg rounded-2xl hover:shadow-xl transition-shadow">
              <CardContent className="p-0">
                <button
                  onClick={() => console.log('Promotional balance clicked')}
                  className="w-full p-5 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="rounded-xl p-3 flex items-center justify-center bg-purple-100 dark:bg-purple-900/30">
                        <Gift className="h-6 w-6 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Promotional
                        </p>
                        <h3 className="text-2xl font-bold mt-1">
                          <span className="font-normal text-xl"></span>
                          {formatAmount(2.19)}
                        </h3>
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                      <ArrowRight className="h-5 w-5 text-purple-500" />
                    </div>
                  </div>
                </button>
              </CardContent>
            </Card>
          </div> */}
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4">
        <div className="mt-4 mb-4">
          <div className="bg-white rounded-3xl">
            {/* Add Money Section */}
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Add Money
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Enter Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={amount}
                    onChange={(e) => {
                      if (e.target.value >= 0) setAmount(e.target.value)
                    }}
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Quick Add
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {quickAmounts.map((value) => (
                    <button
                      key={value}
                      onClick={() => handleQuickAmount(value)}
                      className="py-2 px-3 bg-gray-50 rounded-xl text-sm font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      ₹{value}
                    </button>
                  ))}
                </div>
              </div>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger className="w-full">
                  <Button
                    className="bg-secondary w-full hover:bg-secondary/90"
                    disabled
                  >
                    Add Money
                  </Button>
                </DialogTrigger>
                {/* <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Money to Wallet</DialogTitle>
                  <DialogDescription>
                    You're about to add ₹{amount} to your wallet. This amount
                    will be available for placing orders immediately after a
                    successful transaction. <br />
                    Do you want to proceed?
                  </DialogDescription>

                  <DialogFooter>
                    <Button
                      type="submit"
                      // onClick={handleAddMoney}
                      className="bg-secondary hover:bg-secondary/90"
                    >
                      Submit
                    </Button>
                  </DialogFooter>
                </DialogHeader>
              </DialogContent> */}
              </Dialog>
            </div>
            {/* <div className="p-3 border-gray-100">
            <BalanceCard
              type="winnings"
              title="Winnings"
              amount={21.7}
              icon={<Trophy className="h-6 w-6 text-amber-500" />}
              iconBgClass="bg-amber-100 dark:bg-amber-900/30"
              actionLabel="Withdraw"
              actionDisabled={true}
              onAction={() => console.log('Withdraw clicked')}
              showDivider
            >
              <KycAlert />
            </BalanceCard>
            <div className="mt-2 border-b border-gray-100">
              <PromotionalSection
                amount={2.19}
                icon={<Gift className="h-6 w-6 text-purple-500" />}
                iconBgClass="bg-purple-100 dark:bg-purple-900/30"
              />
            </div>
          </div> */}
            {/* Transactions Section */}
            <div className="flex flex-col gap-2 p-2">
              <div className="flex p-2">
                <button
                  onClick={() => {
                    handleTabChange('All')
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${
                    tab === 'All'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => {
                    handleTabChange('Credit')
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${
                    tab === 'Credit'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Credit
                </button>
                <button
                  onClick={() => {
                    handleTabChange('Debit')
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${
                    tab === 'Debit'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Debit
                </button>
              </div>

              {/* <div className="p-4 flex items-center justify-between border-b border-gray-100">
              <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <Filter className="h-4 w-4 text-gray-600" />
              </button>
            </div> */}

              <div className="">
                <div className="space-y-4">
                  {tab === 'All' ? (
                    transactionHistory?.length > 0 ? (
                      <div className="p-2 text-sm font-medium text-gray-700">
                        Recent Transactions
                      </div>
                    ) : (
                      <div className="p-2 flex justify-center text-sm font-medium text-gray-700">
                        No transactions history.
                      </div>
                    )
                  ) : null}
                  {tab === 'Credit' ? (
                    creditHistory?.length > 0 ? (
                      <div className="p-2 text-sm font-medium text-gray-700">
                        Recent Transactions
                      </div>
                    ) : (
                      <div className="p-2 flex justify-center text-sm font-medium text-gray-700">
                        No credit history.
                      </div>
                    )
                  ) : null}
                  {tab === 'Debit' ? (
                    debitHistory?.length > 0 ? (
                      <div className="p-2 text-sm font-medium text-gray-700">
                        Recent Transactions
                      </div>
                    ) : (
                      <div className="p-2 flex justify-center text-sm font-medium text-gray-700">
                        No debit history.
                      </div>
                    )
                  ) : null}
                  {tab === 'All' &&
                    transactionHistory?.map((transaction) => {
                      console.log('Transaction:', transaction)

                      return (
                        <div
                          key={transaction.name}
                          className="divide-y divide-gray-100"
                        >
                          <div className="p-2">
                            <div className="flex items-center justify-between mb-2 gap-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-2 rounded-xl bg-emerald-50 text-emerald-600`}
                                >
                                  {transaction.transaction_status ===
                                  'Success' ? (
                                    <Check className="h-5 w-5 text-green-600" />
                                  ) : (
                                    <CircleX className="h-5 w-5 text-red-600" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 text-xs">
                                    {transaction.question}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {transaction.wallet_type} {` Wallet`}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div
                                  className={`font-medium ${
                                    transaction.transaction_type === 'Credit'
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  } text-xs`}
                                >
                                  {transaction.transaction_type === 'Credit'
                                    ? '+'
                                    : '-'}
                                  ₹{transaction.transaction_amount}
                                </div>
                                <div className="flex items-center text-xs text-gray-500">
                                  <span className={'text-neutral-600'}>
                                    {transaction.transaction_status}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 flex gap-3 justify-between">
                              <div className="font-medium">
                                {transaction.order_id}
                              </div>

                              <div className="font-semibold">
                                {formatDate(transaction.creation)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  {tab === 'Credit' &&
                    creditHistory?.map((transaction) => {
                      console.log('Transaction:', transaction)
                      return (
                        <div
                          key={transaction.name}
                          className="divide-y divide-gray-100"
                        >
                          <div className="p-2">
                            <div className="flex items-center justify-between mb-2 gap-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-2 rounded-xl bg-emerald-50 text-emerald-600`}
                                >
                                  {transaction.transaction_status ===
                                  'Success' ? (
                                    <Check className="h-5 w-5 text-green-600" />
                                  ) : (
                                    <CircleX className="h-5 w-5 text-red-600" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 text-xs">
                                    {transaction.question}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {transaction.wallet_type} {` Wallet`}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div
                                  className={`font-medium text-green-600 text-xs`}
                                >
                                  {'+'}₹{transaction.transaction_amount}
                                </div>
                                <div className="flex items-center text-xs text-neutral-600">
                                  <span className={''}>
                                    {transaction.transaction_status
                                      .charAt(0)
                                      .toUpperCase() +
                                      transaction.transaction_status.slice(1)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 flex gap-3 justify-between">
                              <div className="font-medium">
                                {transaction.order_id}
                              </div>

                              <div className="font-semibold">
                                {formatDate(transaction.creation)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  {tab === 'Debit' &&
                    debitHistory?.map((transaction) => {
                      console.log('Transaction:', transaction)
                      return (
                        <div
                          key={transaction.name}
                          className="divide-y divide-gray-100"
                        >
                          <div className="p-2">
                            <div className="flex items-center justify-between gap-3 mb-2">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-2 rounded-xl bg-emerald-50 text-emerald-600`}
                                >
                                  {transaction.transaction_status ===
                                  'Success' ? (
                                    <Check className="h-5 w-5 text-green-600" />
                                  ) : (
                                    <CircleX className="h-5 w-5 text-red-600" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 text-xs">
                                    {transaction.question}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {transaction.wallet_type} {` Wallet`}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div
                                  className={`font-medium text-red-600 text-xs`}
                                >
                                  {'-'}₹{transaction.transaction_amount}
                                </div>
                                <div className="flex items-center text-xs text-neutral-600">
                                  <span className={''}>
                                    {transaction.transaction_status
                                      .charAt(0)
                                      .toUpperCase() +
                                      transaction.transaction_status.slice(1)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 flex gap-3 justify-between">
                              <div className="font-medium">
                                {transaction.order_id}
                              </div>

                              <div className="font-semibold">
                                {formatDate(transaction.creation)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Wallet
