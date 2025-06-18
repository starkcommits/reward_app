import { UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button' // Or use a regular button if not using ShadCN
export default function Header() {
  return (
    <header className="bg-white shadow-md px-6 py-3 flex items-center justify-between border-b border-gray-200 fixed top-0 w-full">
      {/* Left: Logo + App Name */}
      <div className="flex items-center space-x-3">
        <span className="text-md font-semibold tracking-wide">Admin</span>
      </div>
      {/* Right: Profile + Switch Button */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          className=""
          onClick={() => {
            window.location.href = '/'
          }}
        >
          Switch to Desk
        </Button>
      </div>
    </header>
  )
}
