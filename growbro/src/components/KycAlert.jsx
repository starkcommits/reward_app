import { ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
export function KycAlert() {
  const navigate = useNavigate()
  return (
    <motion.button
      whileHover={{ x: 5 }}
      // onClick={() => navigate('/kyc')}
      className="w-full flex items-center justify-between py-4 px-5 text-left bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20"
    >
      <span className="text-sm font-medium text-amber-700 dark:text-amber-500">
        Complete KYC to withdraw funds
      </span>
      <ChevronRight className="h-5 w-5 text-amber-500" />
    </motion.button>
  )
}
