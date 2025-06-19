import { Navigate, Outlet } from 'react-router-dom'
import { useFrappeAuth } from 'frappe-react-sdk'

const ProtectedRoute = () => {
  const { currentUser, isLoading } = useFrappeAuth()

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <div className="spinner w-14 h-14 rounded-full border-4 border-gray-200 border-r-blue-500 animate-spin select-none"></div>
      </div>
    )
  }

  // If user is logged in, redirect to home
  return currentUser ? <Outlet /> : <Navigate to="/signin" replace />
}

export default ProtectedRoute
