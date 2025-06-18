// src/components/AdminRoute.tsx
import { useFrappeAuth, useFrappeGetDoc } from 'frappe-react-sdk'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'

const AdminRoute = () => {
  const { currentUser, isLoading: authLoading } = useFrappeAuth()

  const navigate = useNavigate()

  const { data: userDoc, isLoading: userLoading } = useFrappeGetDoc(
    'User',
    currentUser,
    currentUser ? undefined : null
  )

  console.log(userDoc)

  if (!authLoading && !currentUser) {
    // If not logged in, redirect to main app login
    window.location.href = `/?redirect-to=${import.meta.env.VITE_BASE_PATH}` // adjust if needed
  }

  if (authLoading || userLoading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <div className="spinner w-14 h-14 rounded-full border-4 border-gray-200 border-r-blue-500 animate-spin"></div>
      </div>
    )
  }

  if (!userDoc) {
    return (
      <div className="w-full h-screen flex justify-center items-center overflow-hidden">
        <div>Unauthorized: Could not fetch user details.</div>
      </div>
    )
  }

  const isSystemUser = userDoc.user_type === 'System User'

  if (!isSystemUser) {
    return (
      <div className="w-full h-screen flex justify-center items-center overflow-hidden">
        <div>Error 403 Forbidden.</div>
      </div>
    )
  }
  console.log('Passed')
  // Authorized admin user
  return <Outlet />
}

export default AdminRoute
