const getISTDate = (dateStr) => {
  // If closing_time is already in IST from DB, just parse it directly
  return new Date(dateStr.replace(' ', 'T')) // "2025-05-03T08:08:56"
}
const getResolveCountdown = (closingTimeStr, now) => {
  const closingTime = getISTDate(closingTimeStr)
  const resolveDeadline = new Date(closingTime.getTime() + 20 * 60 * 1000) // +20 minutes
  const remainingMs = resolveDeadline.getTime() - now.getTime()

  if (remainingMs <= 0) return <span>⏳ Time&apos;s up</span>

  const totalSeconds = Math.floor(remainingMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')} left`
}

export default getResolveCountdown
