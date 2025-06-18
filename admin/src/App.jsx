import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import AdminRoute from './components/AdminRoute'
import Dashboard from './pages/Dashboard'
import { Toaster } from 'react-hot-toast'
import Events from './pages/Events'
import Orders from './pages/Orders'
import Trades from './pages/Trades'
import Notification from './pages/Notification'

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route element={<AdminRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/events" element={<Events />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/trades" element={<Trades />} />
            <Route path="/notification" element={<Notification />} />
          </Route>
        </Route>
        <Route
          path="*"
          element={
            <div className="w-full h-screen flex justify-center items-center overflow-hidden">
              <div>404 NOT FOUND</div>
            </div>
          }
        />
      </Routes>
    </>
  )
}

export default App
