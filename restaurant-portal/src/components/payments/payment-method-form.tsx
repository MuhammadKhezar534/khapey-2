"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FormFieldWrapper } from "@/components/ui/form-field-wrapper";
import { CreditCard, Smartphone } from "lucide-react";

const paymentMethodSchema = z.object({
  type: z.enum(["card", "easypaisa", "jazzcash"]),
  // Card fields
  cardNumber: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        /^(\d{4}\s){3}\d{4}$|^(\d{4}\s){2}\d{4}$|^(\d{4}\s)\d{4,7}$|^\d{4,16}$/.test(
          val
        ),
      {
        message: "Please enter a valid card number",
      }
    ),
  cardholderName: z
    .string()
    .optional()
    .refine((val) => !val || val.trim().length > 0, {
      message: "Cardholder name is required",
    }),
  expiryMonth: z
    .string()
    .optional()
    .refine((val) => !val || /^(0[1-9]|1[0-2])$/.test(val), {
      message: "Please enter a valid month (01-12)",
    }),
  expiryYear: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{2}$/.test(val), {
      message: "Please enter a valid year",
    }),
  cvv: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{3,4}$/.test(val), {
      message: "CVV must be 3 or 4 digits",
    }),
  // Mobile money fields
  accountNumber: z
    .string()
    .optional()
    .refine((val) => !val || /^03\d{9}$/.test(val), {
      message: "Please enter a valid 11-digit mobile number starting with 03",
    }),
  accountName: z
    .string()
    .optional()
    .refine((val) => !val || val.trim().length > 0, {
      message: "Account name is required",
    }),
  cnicLast6: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{6}$/.test(val), {
      message: "Please enter the last 6 digits of your CNIC",
    }),
  isDefault: z.boolean().default(false),
});

type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>;

interface PaymentMethod {
  type: "card" | "easypaisa" | "jazzcash";
  cardNumber?: string;
  cardholderName?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  accountNumber?: string;
  accountName?: string;
  cnicLast6?: string;
  isDefault?: boolean;
}

interface PaymentMethodFormProps {
  onSubmit: () => void;
  existingMethod?: PaymentMethod;
}

export function PaymentMethodForm({
  onSubmit,
  existingMethod,
}: PaymentMethodFormProps) {
  const [paymentType, setPaymentType] = useState(
    existingMethod?.type || "card"
  );

  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      type: existingMethod?.type || "card",
      cardNumber: "",
      cardholderName: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      accountNumber: "",
      accountName: "",
      cnicLast6: "",
      isDefault: existingMethod?.isDefault || false,
    },
  });

  function handleSubmit(data: PaymentMethodFormValues) {
    console.log("Payment method form submitted:", data);
    // Here you would typically save the payment method to your backend
    onSubmit();
  }

  // Add conditional validation based on payment type
  useEffect(() => {
    if (paymentType === "card") {
      form.clearErrors(["accountNumber", "accountName", "cnicLast6"]);
    } else {
      form.clearErrors([
        "cardNumber",
        "cardholderName",
        "expiryMonth",
        "expiryYear",
        "cvv",
      ]);
    }
  }, [paymentType, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method Type</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  setPaymentType(value as "card" | "easypaisa" | "jazzcash");
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                </FormControl>
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
              <FormMessage />
            </FormItem>
          )}
        />

        {paymentType === "card" && (
          <>
            <FormFieldWrapper
              form={form}
              name="cardholderName"
              label="Cardholder Name"
            >
              <Input
                placeholder="John Doe"
                {...form.register("cardholderName")}
              />
            </FormFieldWrapper>

            <FormFieldWrapper form={form} name="cardNumber" label="Card Number">
              <Input
                placeholder="•••• •••• •••• ••••"
                maxLength={19}
                {...form.register("cardNumber", {
                  onChange: (e) => {
                    // Format card number with spaces
                    const value = e.target.value.replace(/\s/g, "");
                    const formattedValue = value.replace(
                      /(\d{4})(?=\d)/g,
                      "$1 "
                    );
                    e.target.value = formattedValue;
                  },
                  pattern: {
                    value:
                      /^(\d{4}\s){3}\d{4}$|^(\d{4}\s){2}\d{4}$|^(\d{4}\s)\d{4,7}$|^\d{4,16}$/,
                    message: "Please enter a valid card number",
                  },
                })}
              />
            </FormFieldWrapper>

            <div className="grid grid-cols-3 gap-4">
              <FormFieldWrapper
                form={form}
                name="expiryMonth"
                label="Expiry Month"
              >
                <Select
                  onValueChange={(value) => form.setValue("expiryMonth", value)}
                  defaultValue={form.watch("expiryMonth")}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = (i + 1).toString().padStart(2, "0");
                      return (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </FormFieldWrapper>

              <FormFieldWrapper
                form={form}
                name="expiryYear"
                label="Expiry Year"
              >
                <Select
                  onValueChange={(value) => form.setValue("expiryYear", value)}
                  defaultValue={form.watch("expiryYear")}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="YY" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = (new Date().getFullYear() + i)
                        .toString()
                        .slice(-2);
                      return (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </FormFieldWrapper>

              <FormFieldWrapper form={form} name="cvv" label="CVV">
                <Input
                  placeholder="•••"
                  maxLength={4}
                  {...form.register("cvv", {
                    onChange: (e) => {
                      // Only allow numbers
                      e.target.value = e.target.value.replace(/\D/g, "");
                    },
                    pattern: {
                      value: /^\d{3,4}$/,
                      message: "CVV must be 3 or 4 digits",
                    },
                    minLength: {
                      value: 3,
                      message: "CVV must be at least 3 digits",
                    },
                  })}
                />
              </FormFieldWrapper>
            </div>
          </>
        )}

        {(paymentType === "easypaisa" || paymentType === "jazzcash") && (
          <>
            <FormFieldWrapper
              form={form}
              name="accountNumber"
              label="Mobile Number"
            >
              <Input
                placeholder="03xxxxxxxxx"
                maxLength={11}
                {...form.register("accountNumber", {
                  onChange: (e) => {
                    // Only allow numbers
                    e.target.value = e.target.value.replace(/\D/g, "");
                  },
                  pattern: {
                    value: /^03\d{9}$/,
                    message:
                      "Please enter a valid 11-digit mobile number starting with 03",
                  },
                })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter 11-digit mobile number (03xxxxxxxxx)
              </p>
            </FormFieldWrapper>

            <FormFieldWrapper
              form={form}
              name="accountName"
              label="Account Name"
            >
              <Input
                placeholder="Account Holder Name"
                {...form.register("accountName")}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              form={form}
              name="cnicLast6"
              label="Last 6 Digits of CNIC"
            >
              <Input
                placeholder="XXXXXX"
                maxLength={6}
                {...form.register("cnicLast6", {
                  onChange: (e) => {
                    // Only allow numbers
                    e.target.value = e.target.value.replace(/\D/g, "");
                  },
                  pattern: {
                    value: /^\d{6}$/,
                    message: "Please enter the last 6 digits of your CNIC",
                  },
                  minLength: {
                    value: 6,
                    message: "CNIC must be 6 digits",
                  },
                  maxLength: {
                    value: 6,
                    message: "CNIC must be 6 digits",
                  },
                })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {paymentType === "easypaisa"
                  ? "Required for Easypaisa verification"
                  : "Required for JazzCash verification"}
              </p>
            </FormFieldWrapper>
          </>
        )}

        <FormField
          control={form.control}
          name="isDefault"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Set as default payment method</FormLabel>
                <FormDescription>
                  This will be used as your default payment method for all
                  transactions
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onSubmit} type="button">
            Cancel
          </Button>
          <Button type="submit">Save Payment Method</Button>
        </div>
      </form>
    </Form>
  );
}
