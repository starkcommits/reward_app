import React from 'react'
const ClosingCountdown = ({ closingTimeStr, currentTime }) => {
  const getTimeUntilClosing = () => {
    const now = new Date(currentTime)
    const [hours, minutes] = closingTimeStr.split(':').map(Number)
    const closingTime = new Date(now)
    closingTime.setHours(hours, minutes, 0, 0)
    if (closingTime < now) {
      closingTime.setDate(closingTime.getDate() + 1)
    }
    const diffMs = closingTime - now
    const diffSeconds = Math.floor(diffMs / 1000)
    const h = Math.floor(diffSeconds / 3600)
    const m = Math.floor((diffSeconds % 3600) / 60)
    const s = diffSeconds % 60
    return `${h}h ${m}m ${s}s`
  }
  return <span>{getTimeUntilClosing()} left</span>
}
export default ClosingCountdown
