"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const { sendOtp, isLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const pakistaniPhoneRegex = /^03\d{9}$/;
    if (!pakistaniPhoneRegex.test(phoneNumber)) {
      setError(
        "Please enter a valid Pakistani phone number (e.g., 03XXXXXXXXX)"
      );
      return;
    }

    const success = await sendOtp(phoneNumber);
    if (success) {
      router.push("/verify-otp");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center">
          <Image
            src="/images/khapey-logo-new.png"
            alt="Khapey Logo"
            width={180}
            height={60}
            className="mb-8"
          />
          <Card className="w-full">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Login</CardTitle>
              <CardDescription className="text-center">
                Enter your phone number to receive an OTP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Input
                      type="tel"
                      placeholder="03XXXXXXXXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.trim())}
                      className={error ? "border-red-500" : ""}
                      maxLength={11}
                    />
                    {error && <p className="text-sm text-red-500">{error}</p>}
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col">
              <p className="text-xs text-center text-muted-foreground mt-2">
                By continuing, you agree to our Terms of Service and Privacy
                Policy.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
