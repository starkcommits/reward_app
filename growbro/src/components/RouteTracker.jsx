// RouteTracker.jsx
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { DittofeedSdk } from '@dittofeed/sdk-web'

const RouteTracker = ({ currentUser }) => {
  const location = useLocation()

  useEffect(() => {
    console.log('asdasd', currentUser, location.pathname)
    if (currentUser) {
      DittofeedSdk.track({
        event: 'Page Viewed',
        userId: currentUser,
        properties: {
          path: location.pathname,
          // timestamp: new Date().toISOString(),
        },
      })
    }
  }, [location, currentUser])

  return null
}

export default RouteTracker
