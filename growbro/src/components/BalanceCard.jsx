import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'

export function BalanceCard({
  type,
  title,
  amount,
  icon,
  iconBgClass,
  actionLabel,
  actionDisabled = false,
  onAction,
  showDivider = false,
  children,
}) {
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    notation: 'standard',
  }).format(amount)

  // Display only the number part without "INR"
  const displayAmount = formattedAmount.replace('INR', '').trim()

  return (
    <Card className="overflow-hidden bg-white dark:bg-gray-800 border-0 shadow-lg rounded-2xl">
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={cn(
                  'rounded-xl p-3 flex items-center justify-center',
                  iconBgClass
                )}
              >
                {icon}
              </motion.div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {title}
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  <span className="font-normal text-xl"></span>
                  {displayAmount}
                </h3>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant={type === 'deposit' ? 'default' : 'outline'}
                size="lg"
                disabled={actionDisabled}
                // onClick={onAction}
                className={cn(
                  'rounded-xl transition-all duration-300 font-medium',
                  type === 'deposit'
                    ? 'bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white'
                    : 'border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                )}
              >
                {actionLabel}
              </Button>
            </motion.div>
          </div>
        </div>

        {showDivider && children && (
          <div className="border-t border-gray-100 dark:border-gray-700">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
