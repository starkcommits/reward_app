import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export function PromotionalSection({ amount, icon, iconBgClass }) {
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    notation: 'standard',
  }).format(amount)

  // Display only the number part without "INR"
  const displayAmount = formattedAmount.replace('INR', '').trim()
  const navigate = useNavigate()
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
      onClick={() => navigate('/referral')}
    >
      <Card className="overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl transition-shadow">
        <CardContent className="p-0">
          <button
            onClick={() => console.log('Promotional balance clicked')}
            className="w-full p-5 text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={cn(
                    'rounded-xl p-3 flex items-center justify-center',
                    iconBgClass
                  )}
                >
                  {icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Promotional
                  </p>
                  <h3 className="text-2xl font-bold mt-1">
                    <span className="font-normal text-xl"></span>
                    {displayAmount}
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
    </motion.div>
  )
}
