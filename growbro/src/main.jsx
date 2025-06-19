import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { FrappeProvider } from 'frappe-react-sdk'
import { BrowserRouter as Router } from 'react-router-dom'

const getSiteName = () => {
  // @ts-ignore
  if (
    window.frappe?.boot?.versions?.frappe &&
    (window.frappe.boot.versions.frappe.startsWith('15') ||
      window.frappe.boot.versions.frappe.startsWith('16'))
  ) {
    // @ts-ignore
    return window.frappe?.boot?.sitename ?? import.meta.env.VITE_SITE_NAME
  }
  return import.meta.env.VITE_SITE_NAME
}

createRoot(document.getElementById('root')).render(
  <FrappeProvider
    socketPort={import.meta.env.VITE_SOCKET_PORT}
    siteName={getSiteName()}
  >
    <Router basename={import.meta.env.VITE_BASE_PATH}>
      <App />
    </Router>
  </FrappeProvider>
)
