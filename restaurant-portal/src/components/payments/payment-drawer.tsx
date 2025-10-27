"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { X, CreditCard, Smartphone, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PaymentDrawerProps {
  open: boolean;
  onClose: () => void;
  paymentMethodOnly?: boolean;
  onSave?: (data: any) => void;
}

export function PaymentDrawer({
  open,
  onClose,
  paymentMethodOnly = true,
  onSave,
}: PaymentDrawerProps) {
  const [activeTab, setActiveTab] = useState("method");
  const [paymentMethodType, setPaymentMethodType] = useState("card");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isMobile = useIsMobile();

  // Form state to collect data
  const [formData, setFormData] = useState<Record<string, any>>({
    type: "card",
    isDefault: false,
  });

  const title = "Add Payment Method";
  const description = "Add a new payment method to your account";

  // Reset tab and initialize form data when drawer opens
  useEffect(() => {
    if (open) {
      setActiveTab("method");
      setPaymentMethodType("card");
      setFormData({
        type: "card",
        isDefault: false,
      });
      setErrors({});
    }
  }, [open]);

  // Update form data when payment method type changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      type: paymentMethodType,
    }));
    // Clear errors when payment method type changes
    setErrors({});
  }, [paymentMethodType]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Common validation for all payment methods
    if (!paymentMethodType) {
      newErrors.paymentMethodType = "Payment method type is required";
    }

    // Card-specific validation
    if (paymentMethodType === "card") {
      if (!formData.nameOnCard?.trim()) {
        newErrors.nameOnCard = "Name on card is required";
      }

      if (!formData.cardNumber?.trim()) {
        newErrors.cardNumber = "Card number is required";
      } else if (formData.cardNumber.replace(/\s/g, "").length !== 16) {
        newErrors.cardNumber = "Card number must be 16 digits";
      }

      if (!formData.expiryDate?.trim()) {
        newErrors.expiryDate = "Expiry date is required";
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = "Expiry date must be in MM/YY format";
      }

      if (!formData.cvc?.trim()) {
        newErrors.cvc = "CVC is required";
      } else if (formData.cvc.length < 3 || formData.cvc.length > 4) {
        newErrors.cvc = "CVC must be 3 or 4 digits";
      }
    }

    // Mobile wallet validation (Easypaisa or JazzCash)
    if (paymentMethodType === "easypaisa" || paymentMethodType === "jazzcash") {
      if (!formData.mobileNumber?.trim()) {
        newErrors.mobileNumber = "Mobile number is required";
      } else if (!/^03\d{9}$/.test(formData.mobileNumber)) {
        newErrors.mobileNumber =
          "Mobile number must be 11 digits starting with 03";
      }

      if (!formData.accountName?.trim()) {
        newErrors.accountName = "Account name is required";
      }

      if (!formData.cnicLast6?.trim()) {
        newErrors.cnicLast6 = "Last 6 digits of CNIC are required";
      } else if (formData.cnicLast6.length !== 6) {
        newErrors.cnicLast6 = "CNIC must be 6 digits";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Add payment method type to form data
      const dataToSubmit = {
        ...formData,
        type: paymentMethodType,
      };

      // Call onSave if provided
      if (onSave) {
        onSave(dataToSubmit);
      }

      // Close the drawer
      onClose();
    } catch (error) {
      console.error("Error saving payment method:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={`p-0 ${
          isMobile ? "h-[90%] rounded-t-[10px]" : "w-[400px] max-w-md"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
            <div className="text-center font-medium">{title}</div>
            <div className="w-8"></div>
          </div>
          {description && (
            <div className="px-4 py-2 text-sm text-muted-foreground text-center border-b">
              {description}
            </div>
          )}

          <div className="flex-1 overflow-auto hide-scrollbar">
            <div className="p-4 space-y-4">
              {Object.keys(errors).length > 0 && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please fix the errors below to continue
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method Type</Label>
                <Select
                  value={paymentMethodType}
                  onValueChange={setPaymentMethodType}
                >
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">
                      <div className="flex items-center">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Credit/Debit Card
                      </div>
                    </SelectItem>
                    <SelectItem value="easypaisa">
                      <div className="flex items-center">
                        <Smartphone className="mr-2 h-4 w-4" />
                        Easypaisa
                      </div>
                    </SelectItem>
                    <SelectItem value="jazzcash">
                      <div className="flex items-center">
                        <Smartphone className="mr-2 h-4 w-4" />
                        JazzCash
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.paymentMethodType && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.paymentMethodType}
                  </p>
                )}
              </div>

              {paymentMethodType === "card" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="nameOnCard">
                      Name on Card <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nameOnCard"
                      name="nameOnCard"
                      placeholder="Full name as shown on card"
                      value={formData.nameOnCard || ""}
                      onChange={handleInputChange}
                      required
                      className={errors.nameOnCard ? "border-red-500" : ""}
                    />
                    {errors.nameOnCard && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.nameOnCard}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">
                      Card Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      placeholder="•••• •••• •••• ••••"
                      maxLength={19}
                      value={formData.cardNumber || ""}
                      onChange={(e) => {
                        // Format card number with spaces
                        const value = e.target.value.replace(/\s/g, "");
                        const formattedValue = value.replace(
                          /(\d{4})(?=\d)/g,
                          "$1 "
                        );

                        setFormData((prev) => ({
                          ...prev,
                          cardNumber: formattedValue,
                        }));

                        // Clear error for this field when user types
                        if (errors.cardNumber) {
                          setErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.cardNumber;
                            return newErrors;
                          });
                        }
                      }}
                      pattern="\d{4} \d{4} \d{4} \d{4}"
                      required
                      className={errors.cardNumber ? "border-red-500" : ""}
                    />
                    {errors.cardNumber && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.cardNumber}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">
                        Expiry Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="expiryDate"
                        name="expiryDate"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={formData.expiryDate || ""}
                        onChange={(e) => {
                          // Format expiry date as MM/YY
                          const value = e.target.value.replace(/\D/g, "");
                          let formattedValue = value;
                          if (value.length <= 2) {
                            formattedValue = value;
                          } else {
                            formattedValue = `${value.slice(
                              0,
                              2
                            )}/${value.slice(2, 4)}`;
                          }

                          setFormData((prev) => ({
                            ...prev,
                            expiryDate: formattedValue,
                          }));

                          // Clear error for this field when user types
                          if (errors.expiryDate) {
                            setErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors.expiryDate;
                              return newErrors;
                            });
                          }
                        }}
                        pattern="(0[1-9]|1[0-2])\/[0-9]{2}"
                        required
                        className={errors.expiryDate ? "border-red-500" : ""}
                      />
                      {errors.expiryDate && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.expiryDate}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">
                        CVC <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="cvc"
                        name="cvc"
                        placeholder="•••"
                        maxLength={4}
                        value={formData.cvc || ""}
                        onChange={(e) => {
                          // Only allow numbers
                          const value = e.target.value.replace(/\D/g, "");

                          setFormData((prev) => ({
                            ...prev,
                            cvc: value,
                          }));

                          // Clear error for this field when user types
                          if (errors.cvc) {
                            setErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors.cvc;
                              return newErrors;
                            });
                          }
                        }}
                        pattern="\d{3,4}"
                        required
                        className={errors.cvc ? "border-red-500" : ""}
                      />
                      {errors.cvc && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.cvc}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {(paymentMethodType === "easypaisa" ||
                paymentMethodType === "jazzcash") && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="mobileNumber">
                      Mobile Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="mobileNumber"
                      name="mobileNumber"
                      placeholder="03xxxxxxxxx"
                      maxLength={11}
                      value={formData.mobileNumber || ""}
                      onChange={(e) => {
                        // Only allow numbers
                        const value = e.target.value.replace(/\D/g, "");

                        setFormData((prev) => ({
                          ...prev,
                          mobileNumber: value,
                        }));

                        // Clear error for this field when user types
                        if (errors.mobileNumber) {
                          setErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.mobileNumber;
                            return newErrors;
                          });
                        }
                      }}
                      pattern="03\d{9}"
                      required
                      className={errors.mobileNumber ? "border-red-500" : ""}
                    />
                    {errors.mobileNumber && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.mobileNumber}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter 11-digit mobile number (03xxxxxxxxx)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountName">
                      Account Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="accountName"
                      name="accountName"
                      placeholder="Account Holder Name"
                      value={formData.accountName || ""}
                      onChange={handleInputChange}
                      required
                      className={errors.accountName ? "border-red-500" : ""}
                    />
                    {errors.accountName && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.accountName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnicLast6">
                      Last 6 Digits of CNIC{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="cnicLast6"
                      name="cnicLast6"
                      placeholder="XXXXXX"
                      maxLength={6}
                      value={formData.cnicLast6 || ""}
                      onChange={(e) => {
                        // Only allow numbers
                        const value = e.target.value.replace(/\D/g, "");

                        setFormData((prev) => ({
                          ...prev,
                          cnicLast6: value,
                        }));

                        // Clear error for this field when user types
                        if (errors.cnicLast6) {
                          setErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.cnicLast6;
                            return newErrors;
                          });
                        }
                      }}
                      pattern="\d{6}"
                      required
                      className={errors.cnicLast6 ? "border-red-500" : ""}
                    />
                    {errors.cnicLast6 && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.cnicLast6}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {paymentMethodType === "easypaisa"
                        ? "Required for Easypaisa verification"
                        : "Required for JazzCash verification"}
                    </p>
                  </div>
                </>
              )}

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={formData.isDefault || false}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      isDefault: e.target.checked,
                    }));
                  }}
                />
                <Label htmlFor="isDefault" className="text-sm font-normal">
                  Save as default payment method
                </Label>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 border-t bg-background p-4 mt-auto">
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="sm:order-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="sm:order-2 w-full sm:w-auto"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Method"
                )}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
