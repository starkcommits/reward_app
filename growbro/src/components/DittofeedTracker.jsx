import { useEffect } from 'react'
import { DittofeedSdk } from '@dittofeed/sdk-web'
import { useFrappeAuth } from 'frappe-react-sdk'

const DittofeedTracker = ({ currentUser }) => {
  useEffect(() => {
    const initialize = async () => {
      try {
        await DittofeedSdk.init({
          writeKey:
            'Basic MjczZGFhODgtYTcwOC00NThhLWI1NjQtOTNkNDc4N2VkN2EzOjk3OWZkMWJkZDEzODFkNTQ=',
          host: 'https://onoapp.in',
        })

        if (currentUser) {
          DittofeedSdk.identify({
            userId: currentUser,
            traits: {},
          })
        }
      } catch (err) {
        console.error('Dittofeed init failed', err)
      }
    }

    initialize()
  }, [currentUser])

  return null
}

export default DittofeedTracker
