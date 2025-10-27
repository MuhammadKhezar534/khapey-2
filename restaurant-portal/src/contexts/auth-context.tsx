"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";
import { handleError, createAppError, ErrorType } from "@/lib/error-handling";
import { useRedirect } from "@/utils/navigation";
import { loginByStep } from "@/services/auth.service";

type User = {
  phoneNumber: string;
  name?: string;
  role?: string;
  status?: "active" | "suspended" | "pending";
};

export type payload = {
  phoneNumber: string;
  otpCode?: number;
  step: number;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  sendOtp: (phoneNumber: string) => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "user";
const AUTH_COOKIE_NAME = "auth-session";
const PENDING_PHONE_KEY = "pendingPhone";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { navigate } = useRedirect();
  const pathname = usePathname();
  const router = useRouter();

  const loadUserFromStorage = () => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      const authCookie = Cookies.get(AUTH_COOKIE_NAME);

      if (storedUser && authCookie) {
        setUser(JSON.parse(storedUser));
      } else if (!authCookie && storedUser) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (error) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      Cookies.remove(AUTH_COOKIE_NAME);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const isAuthRoute =
        pathname === "/login" ||
        pathname === "/verify-otp" ||
        pathname === "/account-suspended";

      if (!user && !isAuthRoute && pathname !== "/") {
        navigate("/login");
      } else if (user && isAuthRoute && pathname !== "/account-suspended") {
        navigate("/dashboard");
      }
    }
  }, [user, isLoading, pathname, navigate]);

  const handleAccountSuspended = (message: string, phoneNumber: string) => {
    if (message === "suspended_account") {
      router.push(
        `/account-suspended?phone=${encodeURIComponent(phoneNumber)}`
      );
    }
  };

  const sendOtp = async (phoneNumber: string): Promise<boolean> => {
    const formattedNumber = phoneNumber.replace(/^0/, "+92");
    setIsLoading(true);
    setError(null);
    const payload = {
      phoneNumber: formattedNumber,
      step: 1,
    };

    try {
      await loginByStep(payload);
      sessionStorage.setItem(PENDING_PHONE_KEY, formattedNumber);
      return true;
    } catch (error: any) {
      const { message } = error?.response?.data;
      handleAccountSuspended(message, phoneNumber);
      const appError = handleError(error, "Login failed");
      setError(appError.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (otpCode: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    const phoneNumber = sessionStorage.getItem(PENDING_PHONE_KEY);
    if (!phoneNumber) {
      throw createAppError(
        "No pending phone verification",
        ErrorType.VALIDATION
      );
    }

    const payload = {
      phoneNumber,
      step: 2,
      otpCode: +otpCode,
    };

    try {
      const { data } = await loginByStep(payload);
      let newUser = {
        ...data,
      };
      if (data?.user) {
        (newUser.phoneNumber = data.user.phoneNumber),
          (newUser.name = data.user.name),
          (newUser.role = data.user.role.title),
          (newUser.status = "active");
      }

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      Cookies.set(AUTH_COOKIE_NAME, "authenticated", {
        expires: 7,
        secure: true,
        sameSite: "strict",
      });
      setUser(newUser);
      sessionStorage.removeItem(PENDING_PHONE_KEY);
      return true;
    } catch (error) {
      const appError = handleError(error, "OTP verification failed");
      setError(appError.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    Cookies.remove(AUTH_COOKIE_NAME);
    setUser(null);
    navigate("/login");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        error,
        sendOtp,
        verifyOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
