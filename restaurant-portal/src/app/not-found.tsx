// If this file doesn't exist, we'll create it
// Create a custom 404 page

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">404</h2>
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Page Not Found</h3>
        <p className="text-gray-600 mb-6">The page you're looking for doesn't exist or has been moved.</p>
        <Button asChild>
          <Link href="/">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
