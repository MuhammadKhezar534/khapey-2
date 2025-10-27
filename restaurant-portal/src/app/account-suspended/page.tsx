"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft, PhoneCall } from "lucide-react"

export default function AccountSuspendedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [phoneNumber, setPhoneNumber] = useState<string>("")

  useEffect(() => {
    const phone = searchParams.get("phone")
    if (phone) {
      setPhoneNumber(phone)
    }
  }, [searchParams])

  const handleBackToLogin = () => {
    router.push("/login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center">
          <Image src="/images/khapey-logo-new.png" alt="Khapey Logo" width={180} height={60} className="mb-8" />
          <Card className="w-full border-red-200">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-2">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center text-red-600">Account Suspended</CardTitle>
              <CardDescription className="text-center">
                Your account has been suspended due to a policy violation or payment issue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 p-4 rounded-md border border-red-100">
                <p className="text-sm text-gray-700">
                  {phoneNumber ? (
                    <>
                      The account associated with <span className="font-medium">{phoneNumber}</span> has been suspended.
                    </>
                  ) : (
                    <>Your account has been suspended.</>
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">To reactivate your account:</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2">1.</span>
                    <span>Contact Khapey support using the information below</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">2.</span>
                    <span>Provide your account details and reason for suspension</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">3.</span>
                    <span>Follow the instructions provided by our support team</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                <h3 className="text-sm font-medium flex items-center">
                  <PhoneCall className="h-4 w-4 mr-2 text-blue-500" />
                  Contact Support
                </h3>
                <p className="text-sm mt-2">
                  Email:{" "}
                  <a href="mailto:support@khapey.com" className="text-blue-600 hover:underline">
                    support@khapey.com
                  </a>
                </p>
                <p className="text-sm mt-1">
                  Phone:{" "}
                  <a href="tel:+923001234567" className="text-blue-600 hover:underline">
                    +92 300 123 4567
                  </a>
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full flex items-center justify-center" onClick={handleBackToLogin}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
