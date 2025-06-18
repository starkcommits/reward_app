import { useState } from 'react'
import { useEffect } from 'react'

function UseNow(interval = 1000) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), interval)
    return () => clearInterval(timer)
  }, [interval])

  return now
}

export default UseNow
