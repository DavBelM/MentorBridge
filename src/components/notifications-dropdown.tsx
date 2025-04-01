"use client"

"use client"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { BellIcon } from "@heroicons/react/24/outline"

export function NotificationsDropdown() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  
  const toggleDropdown = () => {
    setOpen(!open)
    console.log("Toggling notifications dropdown")
  }
  
  return (
    <div className="relative">
      <button 
        onClick={toggleDropdown}
        className="p-2 rounded-full hover:bg-gray-100"
      >
        <BellIcon className="h-6 w-6" />
      </button>
      
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-md z-50">
          <div className="p-4">
            <h3 className="font-medium">Notifications</h3>
            {/* Notification items here */}
          </div>
        </div>
      )}
    </div>
  )
}

