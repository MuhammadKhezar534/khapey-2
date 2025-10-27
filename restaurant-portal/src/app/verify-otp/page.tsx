"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
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
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const { verifyOtp, isLoading, sendOtp } = useAuth();
  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get phone number from session storage
  const phoneNumber =
    typeof window !== "undefined"
      ? sessionStorage.getItem("pendingPhone")
      : null;

  useEffect(() => {
    // Redirect if no pending phone verification
    if (!phoneNumber) {
      router.push("/login");
    }

    // Focus on first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phoneNumber, router]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    // Take only the last character if multiple characters are pasted
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 3 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Move focus to previous input on backspace
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0 &&
      inputRefs.current[index - 1]
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const otpValue = otp.join("");
    if (otpValue.length !== 4) {
      setError("Please enter a valid 4-digit OTP");
      return;
    }

    const success = await verifyOtp(otpValue);
    if (success) {
      router.push("/dashboard");
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || !phoneNumber) return;

    const success = await sendOtp(phoneNumber);
    if (success) {
      toast({
        title: "Otp Resend",
        description: "Otp has been successfully send",
        variant: "success",
      });
      setCountdown(30);
      setCanResend(false);
      setOtp(["", "", "", ""]);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }
  };

  const handleGoBack = () => {
    router.push("/login");
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
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-4"
                  onClick={handleGoBack}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Go back</span>
                </Button>
                <CardTitle className="w-full text-center text-2xl">
                  Verify OTP
                </CardTitle>
              </div>
              <CardDescription className="text-center">
                Enter the 4-digit code sent to {phoneNumber}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex justify-center space-x-3 mb-5">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el: HTMLInputElement | null) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className={`w-12 h-12 text-center text-xl ${
                        error ? "border-red-500" : ""
                      }`}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      autoComplete="one-time-code"
                    />
                  ))}
                </div>
                {error && (
                  <p className="text-sm text-red-500 text-center">{error}</p>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Login"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col">
              <div className="text-sm text-center">
                {canResend ? (
                  <Button
                    variant="link"
                    className="p-0 text-sm"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                  >
                    Resend OTP
                  </Button>
                ) : (
                  <p className="text-muted-foreground">
                    Resend OTP in {countdown} seconds
                  </p>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
