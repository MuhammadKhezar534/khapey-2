"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useBranch, branches } from "@/contexts/branch-context";
import {
  Award,
  CalendarDays,
  Users,
  Plus,
  Trash2,
  Percent,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import type { LoyaltyDiscount } from "@/types/discounts";
import { toast } from "@/hooks/use-toast";

// Add import for error handling
import { handleError } from "@/lib/error-handling";
import { LoadingButton } from "@/components/ui/loading-button";
import { FormErrors } from "@/components/ui/form-errors";

// Create a debounce function to limit validation frequency
const debounce = (func: Function, delay: number) => {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

// Base schema for all loyalty discount types
const baseLoyaltyDiscountSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  description: z.string().optional(),
  loyaltyType: z.enum(["percentage", "fixed", "fixed-reviews", "referral"]),
  applyToAllBranches: z.boolean().default(true),
  branches: z.array(z.string()).optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

// Update the percentageLoyaltySchema with enhanced validation
const percentageLoyaltySchema = baseLoyaltyDiscountSchema.extend({
  loyaltyType: z.literal("percentage"),
  percentageRanges: z
    .array(
      z.object({
        minDays: z
          .number()
          .min(1, { message: "Minimum days must be at least 1" }),
        maxDays: z
          .number()
          .min(1, { message: "Maximum days must be at least 1" }),
        percentage: z
          .number()
          .min(0, { message: "Percentage must be at least 0%" })
          .max(100, { message: "Percentage cannot exceed 100%" }),
      })
    )
    .min(1, { message: "Add at least one discount range" })
    .refine(
      (ranges) => {
        // Sort ranges by minDays for validation
        const sortedRanges = [...ranges].sort((a, b) => a.minDays - b.minDays);

        // Check each range relationship
        for (let i = 0; i < sortedRanges.length - 1; i++) {
          // Check if ranges connect (max of one equals min of next)
          if (sortedRanges[i].maxDays + 1 !== sortedRanges[i + 1].minDays) {
            return false;
          }

          // Check that percentage decreases or stays the same as loyalty duration increases
          if (sortedRanges[i].percentage < sortedRanges[i + 1].percentage) {
            return false;
          }
        }
        return true;
      },
      {
        message:
          "Ranges must be connected and percentages should decrease as loyalty duration increases",
      }
    )
    .refine(
      (ranges) => {
        // Check that maxDays is greater than minDays for each range
        return ranges.every((range) => range.maxDays > range.minDays);
      },
      { message: "Maximum days must be greater than minimum days" }
    ),
  maximumAmount: z
    .number()
    .min(1, { message: "Maximum amount must be at least 1" })
    .optional(),
});

// Update the fixedLoyaltySchema with enhanced validation
const fixedLoyaltySchema = baseLoyaltyDiscountSchema.extend({
  loyaltyType: z.literal("fixed"),
  fixedRanges: z
    .array(
      z.object({
        minDays: z
          .number()
          .min(1, { message: "Minimum days must be at least 1" }),
        maxDays: z
          .number()
          .min(1, { message: "Maximum days must be at least 1" }),
        label: z.string().min(1, { message: "Label is required" }),
        price: z.number().min(1, { message: "Price must be at least 1" }),
        description: z.string().optional(),
      })
    )
    .min(1, { message: "Add at least one discount range" })
    .refine(
      (ranges) => {
        // Sort ranges by minDays for validation
        const sortedRanges = [...ranges].sort((a, b) => a.minDays - b.minDays);

        // Check each range relationship
        for (let i = 0; i < sortedRanges.length - 1; i++) {
          // Check if ranges connect (max of one equals min of next)
          if (sortedRanges[i].maxDays + 1 !== sortedRanges[i + 1].minDays) {
            return false;
          }
        }
        return true;
      },
      {
        message:
          "Ranges must be connected (max days of one range should equal min days of next range minus 1)",
      }
    )
    .refine(
      (ranges) => {
        // Check that maxDays is greater than minDays for each range
        return ranges.every((range) => range.maxDays > range.minDays);
      },
      { message: "Maximum days must be greater than minimum days" }
    ),
});

// Update the visitLoyaltySchema with enhanced validation
const visitLoyaltySchema = baseLoyaltyDiscountSchema.extend({
  loyaltyType: z.literal("fixed-reviews"),
  visitRanges: z
    .array(
      z.object({
        visits: z
          .number()
          .min(1, { message: "Number of visits must be at least 1" }),
        label: z.string().min(1, { message: "Label is required" }),
        price: z
          .number()
          .min(1, { message: "Discount amount must be at least 1" }),
        description: z.string().optional(),
      })
    )
    .min(1, { message: "Add at least one visit milestone" })
    .refine(
      (ranges) => {
        // Check for duplicate visit counts
        const visitCounts = ranges.map((range) => range.visits);
        return new Set(visitCounts).size === visitCounts.length;
      },
      { message: "Each milestone must have a unique visit count" }
    )
    .refine(
      (ranges) => {
        // Sort ranges by visit count for validation
        const sortedRanges = [...ranges].sort((a, b) => a.visits - b.visits);

        // Ensure visit counts are sequential
        for (let i = 0; i < sortedRanges.length - 1; i++) {
          if (sortedRanges[i + 1].visits <= sortedRanges[i].visits) {
            return false;
          }
        }
        return true;
      },
      { message: "Visit milestones should increase in order" }
    ),
});

// Update the referralLoyaltySchema with enhanced validation
const referralLoyaltySchema = baseLoyaltyDiscountSchema.extend({
  loyaltyType: z.literal("referral"),
  referringUser: z
    .object({
      discountType: z.enum(["percentage", "fixed"]),
      percentage: z
        .number()
        .min(1, { message: "Percentage must be at least 1%" })
        .max(100, { message: "Percentage cannot exceed 100%" })
        .optional(),
      amount: z
        .number()
        .min(1, { message: "Amount must be at least 1" })
        .optional(),
    })
    .refine(
      (data) => {
        if (data.discountType === "percentage") {
          return data.percentage !== undefined && data.percentage >= 1;
        } else {
          return data.amount !== undefined && data.amount >= 1;
        }
      },
      { message: "Please provide a valid discount value" }
    ),
  referredUser: z
    .object({
      discountType: z.enum(["percentage", "fixed"]),
      percentage: z
        .number()
        .min(1, { message: "Percentage must be at least 1%" })
        .max(100, { message: "Percentage cannot exceed 100%" })
        .optional(),
      amount: z
        .number()
        .min(1, { message: "Amount must be at least 1" })
        .optional(),
    })
    .refine(
      (data) => {
        if (data.discountType === "percentage") {
          return data.percentage !== undefined && data.percentage >= 1;
        } else {
          return data.amount !== undefined && data.amount >= 1;
        }
      },
      { message: "Please provide a valid discount value" }
    ),
  referralMaximumAmount: z
    .number()
    .min(1, { message: "Maximum amount must be at least 1" })
    .optional(),
});

// Combined schema with discriminated union
const loyaltyDiscountSchema = z.discriminatedUnion("loyaltyType", [
  percentageLoyaltySchema,
  fixedLoyaltySchema,
  visitLoyaltySchema,
  referralLoyaltySchema,
]);

type LoyaltyDiscountFormValues = z.infer<typeof loyaltyDiscountSchema>;

// Update the LoyaltyDiscountFormProps interface to include startAtFirstStep
interface LoyaltyDiscountFormProps {
  onClose: () => void;
  onCreateDiscount: (discount: LoyaltyDiscount) => void;
  discountToEdit?: LoyaltyDiscount | null;
  isEditing: boolean;
  startAtFirstStep?: boolean;
}

// Add CSS animation for Alert in the form component's style (at the beginning of the component):
// Update the LoyaltyDiscountForm component to use startAtFirstStep
export const LoyaltyDiscountForm = ({
  onClose,
  onCreateDiscount,
  discountToEdit,
  isEditing,
  startAtFirstStep = false,
}: LoyaltyDiscountFormProps) => {
  const { selectedBranch } = useBranch();
  const actualBranches = branches.filter((branch) => branch !== "All branches");
  const [loyaltyType, setLoyaltyType] = useState<
    "percentage" | "fixed" | "fixed-reviews" | "referral"
  >(() => {
    // Initialize with the type from discountToEdit if available
    return discountToEdit?.loyaltyType || "percentage";
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Update the step initialization to respect startAtFirstStep
  const [step, setStep] = useState(isEditing && !startAtFirstStep ? 3 : 1);
  const [previousSteps, setPreviousSteps] = useState<number[]>([]);

  // Initialize form with either the discount to edit or default values
  const form = useForm<LoyaltyDiscountFormValues>({
    resolver: zodResolver(loyaltyDiscountSchema),
    defaultValues: {
      name: "",
      description: "",
      loyaltyType: "percentage",
      applyToAllBranches: true,
      branches: selectedBranch?.branchName ? [selectedBranch?.branchName] : [],
      status: "active",

      // Percentage-based defaults with valid initial values
      percentageRanges: [{ minDays: 1, maxDays: 30, percentage: 10 }],
      maximumAmount: 500,

      // Fixed amount defaults with valid initial values
      fixedRanges: [
        {
          minDays: 1,
          maxDays: 30,
          label: "Bronze Tier",
          price: 100,
          description: "",
        },
      ],

      // Visit-based defaults with valid initial values
      visitRanges: [
        { visits: 5, label: "First Milestone", price: 100, description: "" },
      ],

      // Referral defaults with valid initial values
      referringUser: {
        discountType: "percentage",
        percentage: 10,
        amount: 100, // Add default amount even when using percentage
      },
      referredUser: {
        discountType: "percentage",
        percentage: 15,
        amount: 150, // Add default amount even when using percentage
      },
      referralMaximumAmount: 500,
    },
    mode: "onChange",
  });

  // Add useEffect to run validation when form values change
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      // Only validate if we're on step 3 and only when relevant fields change
      if (step === 3 && type === "change") {
        const debouncedValidate = debounce(() => {
          validateStep3();
        }, 300); // 300ms debounce
        debouncedValidate();
      }
    });
    return () => subscription.unsubscribe();
  }, [form, step]);

  // Add a useEffect hook to automatically revalidate when values change
  // Place this after the existing useEffect for form.watch
  useEffect(() => {
    // Re-run validation when form values change if there are validation errors
    if (validationErrors.length > 0) {
      // Use debounce to avoid too frequent validation
      const revalidateTimeout = setTimeout(() => {
        if (step === 3) {
          validateStep3();
        } else if (step === 2) {
          validateStep2();
        } else if (step === 1) {
          validateStep1();
        }
      }, 500);

      return () => clearTimeout(revalidateTimeout);
    }
  }, [form.watch(), validationErrors.length, step]);

  // Add useEffect to update form when discountToEdit changes
  useEffect(() => {
    if (discountToEdit) {
      // Reset the form with the discount data
      form.reset({
        ...discountToEdit,
        // Ensure all required fields are present
        name: discountToEdit.name || "",
        description: discountToEdit.description || "",
        loyaltyType: discountToEdit.loyaltyType,
        applyToAllBranches: discountToEdit.applyToAllBranches || false,
        branches: discountToEdit.branches || [],
        status: discountToEdit.status || "active",
      });

      // Set the loyalty type state
      setLoyaltyType(discountToEdit.loyaltyType);
    }
  }, [discountToEdit, form]);

  // Update form values when loyalty type changes
  const handleLoyaltyTypeChange = (
    type: "percentage" | "fixed" | "fixed-reviews" | "referral"
  ) => {
    setLoyaltyType(type);
    form.setValue("loyaltyType", type);
  };

  // Update the addPercentageRange function to ensure proper range connections:
  // Replace the existing addPercentageRange function with this one:

  const addPercentageRange = () => {
    const currentRanges = form.getValues("percentageRanges") || [];

    // Sort the ranges by minDays
    const sortedRanges = [...currentRanges].sort(
      (a, b) => a.minDays - b.minDays
    );

    if (sortedRanges.length === 0) {
      // Add the first range starting from day 1
      form.setValue("percentageRanges", [
        { minDays: 1, maxDays: 30, percentage: 10 },
      ]);
    } else {
      // Find the range with the highest maxDays
      const lastRange = sortedRanges[sortedRanges.length - 1];
      const newMinDays = lastRange.maxDays + 1;
      const newMaxDays = newMinDays + 29; // Default to a 30-day range
      const newPercentage = Math.max(0, lastRange.percentage - 5); // 5% lower than the previous range

      form.setValue("percentageRanges", [
        ...sortedRanges,
        {
          minDays: newMinDays,
          maxDays: newMaxDays,
          percentage: newPercentage,
        },
      ]);
    }
  };

  // Remove a range for percentage-based discount
  const removePercentageRange = (index: number) => {
    const currentRanges = form.getValues("percentageRanges") || [];
    if (currentRanges.length > 1) {
      form.setValue(
        "percentageRanges",
        currentRanges.filter((_, i) => i !== index)
      );
    }
  };

  // Update the addFixedRange function to ensure proper range connections:
  // Replace the existing addFixedRange function with this one:

  const addFixedRange = () => {
    const currentRanges = form.getValues("fixedRanges") || [];

    // Sort the ranges by minDays
    const sortedRanges = [...currentRanges].sort(
      (a, b) => a.minDays - b.minDays
    );

    if (sortedRanges.length === 0) {
      // Add the first range starting from day 1
      form.setValue("fixedRanges", [
        {
          minDays: 1,
          maxDays: 30,
          label: "Bronze Tier",
          price: 100,
          description: "",
        },
      ]);
    } else {
      // Find the range with the highest maxDays
      const lastRange = sortedRanges[sortedRanges.length - 1];
      const newMinDays = lastRange.maxDays + 1;
      const newMaxDays = newMinDays + 29; // Default to a 30-day range

      let newLabel = "Silver Tier";
      if (sortedRanges.length === 1) newLabel = "Silver Tier";
      else if (sortedRanges.length === 2) newLabel = "Gold Tier";
      else if (sortedRanges.length === 3) newLabel = "Platinum Tier";
      else newLabel = `Tier ${sortedRanges.length + 1}`;

      form.setValue("fixedRanges", [
        ...sortedRanges,
        {
          minDays: newMinDays,
          maxDays: newMaxDays,
          label: newLabel,
          price: lastRange.price + 50, // 50 more than the previous tier
          description: "",
        },
      ]);
    }
  };

  // Remove a range for fixed amount discount
  const removeFixedRange = (index: number) => {
    const currentRanges = form.getValues("fixedRanges") || [];
    if (currentRanges.length > 1) {
      form.setValue(
        "fixedRanges",
        currentRanges.filter((_, i) => i !== index)
      );
    }
  };

  // Add a new visit milestone
  const addVisitMilestone = () => {
    const currentMilestones = form.getValues("visitRanges") || [];

    // Sort the milestones by visit count
    const sortedMilestones = [...currentMilestones].sort(
      (a, b) => a.visits - b.visits
    );

    if (sortedMilestones.length === 0) {
      // Add the first milestone
      form.setValue("visitRanges", [
        { visits: 5, label: "First Milestone", price: 100, description: "" },
      ]);
    } else {
      // Find the milestone with the highest visit count
      const lastMilestone = sortedMilestones[sortedMilestones.length - 1];
      const newVisits = lastMilestone.visits + 5; // Default to 5 more visits

      form.setValue("visitRanges", [
        ...sortedMilestones,
        {
          visits: newVisits,
          label: `${sortedMilestones.length + 1}th Visit Milestone`,
          price: lastMilestone.price + 50,
          description: "",
        },
      ]);
    }
  };

  // Remove a visit milestone
  const removeVisitMilestone = (index: number) => {
    const currentMilestones = form.getValues("visitRanges") || [];
    if (currentMilestones.length > 1) {
      form.setValue(
        "visitRanges",
        currentMilestones.filter((_, i) => i !== index)
      );
    }
  };

  // Validate step 1 fields
  const validateStep1 = async () => {
    // Clear previous errors
    setValidationErrors([]);
    const errors: string[] = [];

    // Trigger validation for step 1 fields
    const result = await form.trigger(["name", "description", "loyaltyType"]);

    if (!result) {
      if (form.formState.errors.name) {
        errors.push(form.formState.errors.name.message as string);
      }
      if (form.formState.errors.description) {
        errors.push(form.formState.errors.description.message as string);
      }
    }

    setValidationErrors(errors);
    return result;
  };

  const validateStep2 = async () => {
    // Clear previous errors
    setValidationErrors([]);
    const errors: string[] = [];

    // If "Apply to all branches" is true, no need to validate branches
    if (form.getValues("applyToAllBranches")) {
      setValidationErrors([]);
      return true;
    }

    // Check if at least one branch is selected
    const branches = form.getValues("branches");
    if (!branches || branches.length === 0) {
      errors.push("Please select at least one branch");
      setValidationErrors(errors);
      return false;
    }

    setValidationErrors([]);
    return true;
  };

  // Now, let's update the validateStep3 function to provide clearer error messages
  // Replace the entire validateStep3 function with this enhanced one:

  const validateStep3 = async () => {
    const errors: string[] = [];
    const type = form.getValues("loyaltyType");

    let result = false;

    try {
      // Clear previous errors to avoid stale error states
      setValidationErrors([]);

      switch (type) {
        case "percentage": {
          // Sort percentage ranges by minDays for better validation
          const percentageRanges = form.getValues("percentageRanges") || [];
          const sortedRanges = [...percentageRanges].sort(
            (a, b) => a.minDays - b.minDays
          );
          form.setValue("percentageRanges", sortedRanges);

          result = await form.trigger(["percentageRanges", "maximumAmount"]);

          // Validate each range individually first
          for (let i = 0; i < sortedRanges.length; i++) {
            await form.trigger([
              `percentageRanges.${i}.minDays`,
              `percentageRanges.${i}.maxDays`,
              `percentageRanges.${i}.percentage`,
            ]);

            const minDays = sortedRanges[i].minDays;
            const maxDays = sortedRanges[i].maxDays;

            if (minDays < 1) {
              errors.push(`Range ${i + 1}: Minimum days must be at least 1`);
            }

            if (maxDays < 1) {
              errors.push(`Range ${i + 1}: Maximum days must be at least 1`);
            }

            if (maxDays <= minDays) {
              errors.push(
                `Range ${i + 1}: Maximum days must be greater than minimum days`
              );
            }

            if (
              sortedRanges[i].percentage < 0 ||
              sortedRanges[i].percentage > 100
            ) {
              errors.push(
                `Range ${i + 1}: Percentage must be between 0 and 100`
              );
            }
          }

          // Now validate the relationship between ranges
          for (let i = 0; i < sortedRanges.length - 1; i++) {
            if (sortedRanges[i].maxDays + 1 !== sortedRanges[i + 1].minDays) {
              errors.push(
                `Ranges ${i + 1} and ${
                  i + 2
                }: Max days of one range should equal min days of next range minus 1`
              );
            }

            if (sortedRanges[i].percentage < sortedRanges[i + 1].percentage) {
              errors.push(
                `Ranges ${i + 1} and ${
                  i + 2
                }: Percentage should decrease or stay the same as loyalty duration increases`
              );
            }
          }

          // Validate maximum amount if provided
          const maximumAmount = form.getValues("maximumAmount");
          if (maximumAmount !== undefined && maximumAmount < 1) {
            errors.push("Maximum discount amount must be at least 1");
          }
          break;
        }

        case "fixed": {
          // Sort fixed ranges by minDays for better validation
          const fixedRanges = form.getValues("fixedRanges") || [];
          const sortedRanges = [...fixedRanges].sort(
            (a, b) => a.minDays - b.minDays
          );
          form.setValue("fixedRanges", sortedRanges);

          result = await form.trigger(["fixedRanges"]);

          // Validate each range individually first
          for (let i = 0; i < sortedRanges.length; i++) {
            await form.trigger([
              `fixedRanges.${i}.minDays`,
              `fixedRanges.${i}.maxDays`,
              `fixedRanges.${i}.label`,
              `fixedRanges.${i}.price`,
            ]);

            const minDays = sortedRanges[i].minDays;
            const maxDays = sortedRanges[i].maxDays;

            if (minDays < 1) {
              errors.push(`Tier ${i + 1}: Minimum days must be at least 1`);
            }

            if (maxDays < 1) {
              errors.push(`Tier ${i + 1}: Maximum days must be at least 1`);
            }

            if (maxDays <= minDays) {
              errors.push(
                `Tier ${i + 1}: Maximum days must be greater than minimum days`
              );
            }

            if (!sortedRanges[i].label) {
              errors.push(`Tier ${i + 1}: Label is required`);
            }

            if (sortedRanges[i].price < 1) {
              errors.push(`Tier ${i + 1}: Price must be at least 1`);
            }
          }

          // Now validate the relationship between ranges
          for (let i = 0; i < sortedRanges.length - 1; i++) {
            if (sortedRanges[i].maxDays + 1 !== sortedRanges[i + 1].minDays) {
              errors.push(
                `Tiers ${i + 1} and ${
                  i + 2
                }: Max days of one tier should equal min days of next tier minus 1`
              );
            }
          }
          break;
        }

        case "fixed-reviews": {
          // Sort visit ranges by number of visits for better validation
          const visitRanges = form.getValues("visitRanges") || [];
          const sortedRanges = [...visitRanges].sort(
            (a, b) => a.visits - b.visits
          );
          form.setValue("visitRanges", sortedRanges);

          result = await form.trigger(["visitRanges"]);

          // Validate each milestone individually first
          for (let i = 0; i < sortedRanges.length; i++) {
            await form.trigger([
              `visitRanges.${i}.visits`,
              `visitRanges.${i}.label`,
              `visitRanges.${i}.price`,
            ]);

            if (sortedRanges[i].visits < 1) {
              errors.push(
                `Milestone ${i + 1}: Number of visits must be at least 1`
              );
            }

            if (!sortedRanges[i].label) {
              errors.push(`Milestone ${i + 1}: Label is required`);
            }

            if (sortedRanges[i].price < 1) {
              errors.push(`Milestone ${i + 1}: Price must be at least 1`);
            }
          }

          // Check for duplicate visit counts
          const visitCounts = sortedRanges.map((r) => r.visits);
          const uniqueVisits = new Set(visitCounts);
          if (uniqueVisits.size !== visitCounts.length) {
            errors.push("Each milestone must have a unique visit count");
          }

          // Ensure visit counts are sequential
          for (let i = 0; i < sortedRanges.length - 1; i++) {
            if (sortedRanges[i + 1].visits <= sortedRanges[i].visits) {
              errors.push("Visit milestones should increase in order");
            }
          }
          break;
        }

        case "referral": {
          result = await form.trigger(["referringUser", "referredUser"]);

          // Validate referring user discount
          const referringUser = form.getValues("referringUser");
          if (referringUser.discountType === "percentage") {
            await form.trigger(["referringUser.percentage"]);
            if (
              !referringUser.percentage ||
              referringUser.percentage < 1 ||
              referringUser.percentage > 100
            ) {
              errors.push(
                "Referring user: Percentage must be between 1% and 100%"
              );
            }
          } else {
            await form.trigger(["referringUser.amount"]);
            if (!referringUser.amount || referringUser.amount < 1) {
              errors.push("Referring user: Amount must be at least 1");
            }
          }

          // Validate referred user discount
          const referredUser = form.getValues("referredUser");
          if (referredUser.discountType === "percentage") {
            await form.trigger(["referredUser.percentage"]);
            if (
              !referredUser.percentage ||
              referredUser.percentage < 1 ||
              referredUser.percentage > 100
            ) {
              errors.push(
                "Referred user: Percentage must be between 1% and 100%"
              );
            }
          } else {
            await form.trigger(["referredUser.amount"]);
            if (!referredUser.amount || referredUser.amount < 1) {
              errors.push("Referred user: Amount must be at least 1");
            }
          }

          // Validate maximum amount if percentage discount is used
          if (
            referringUser.discountType === "percentage" ||
            referredUser.discountType === "percentage"
          ) {
            const referralMaximumAmount = form.getValues(
              "referralMaximumAmount"
            );
            if (
              referralMaximumAmount === undefined ||
              referralMaximumAmount < 1
            ) {
              errors.push(
                "Maximum amount must be at least 1 when using percentage discounts"
              );
            }
          }
          break;
        }
      }
    } catch (error) {
      console.error("Validation error:", error);
      errors.push("An unexpected error occurred during validation");
    }

    // Add any form-level errors
    if (form.formState.errors.percentageRanges?.message) {
      errors.push(form.formState.errors.percentageRanges.message as string);
    }
    if (form.formState.errors.fixedRanges?.message) {
      errors.push(form.formState.errors.fixedRanges.message as string);
    }
    if (form.formState.errors.visitRanges?.message) {
      errors.push(form.formState.errors.visitRanges.message as string);
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Update to include a function to handle next step navigation
  const handleNextStep = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission

    if (step === 1) {
      const isValid = await validateStep1();
      if (!isValid) return;

      // Save current step to history
      setPreviousSteps([...previousSteps, step]);

      // Go to branch selection step
      setStep(2);
    } else if (step === 2) {
      const isValid = await validateStep2();
      if (!isValid) return;

      // Save current step to history
      setPreviousSteps([...previousSteps, step]);

      // From branch selection, go to discount configuration
      setStep(3);
    } else if (step === 3) {
      const isValid = await validateStep3();
      if (!isValid) return;
    }
  };

  // Update the back button logic
  const handleBackStep = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    setValidationErrors([]); // Clear validation errors when going back

    if (previousSteps.length > 0) {
      // Pop the last step from history
      const newPreviousSteps = [...previousSteps];
      const lastStep = newPreviousSteps.pop();
      setPreviousSteps(newPreviousSteps);

      // Go back to the previous step
      if (lastStep) {
        setStep(lastStep);
      } else if (step > 1) {
        // Fallback if history is empty but we're not at step 1
        setStep(step - 1);
      }
    } else if (step > 1) {
      // If no history, just go back one step
      setStep(step - 1);
    }
  };

  // Update the onSubmit function to create a new loyalty discount
  async function onSubmit(values: LoyaltyDiscountFormValues) {
    try {
      // Validate all fields before submission
      const isValid = await form.trigger(); // This will trigger validation for all fields
      const isStep3Valid = await validateStep3();

      if (!isValid || !isStep3Valid) {
        // If validation fails, don't proceed with submission
        return;
      }

      // All validation passed, proceed with creating/updating the discount
      const payload: LoyaltyDiscount = {
        id: discountToEdit?.id || `loyalty-${Date.now()}`,
        type: "loyalty",
        status: values.status || "active",
        createdAt: discountToEdit?.createdAt || new Date().toISOString(),
        ...values,
      };

      // Call the onCreateDiscount function to add the new discount
      onCreateDiscount(payload);

      // Show success toast
      toast({
        title: isEditing ? "Updated" : "Created",
        description: `Loyalty discount ${
          isEditing ? "updated" : "created"
        } successfully`,
      });

      // Close the drawer
      onClose();

      // Reset form and step
      form.reset();
      setStep(1);
      setPreviousSteps([]);
      setValidationErrors([]);
    } catch (error) {
      // Use our standardized error handling
      handleError(
        error,
        `Failed to ${isEditing ? "update" : "create"} loyalty discount`
      );
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col h-full"
        >
          <div className="flex-1 overflow-y-auto pb-20">
            <FormErrors errors={validationErrors} />

            {step === 1 && (
              <div className="space-y-4 px-5 pt-5 flex-1 flex flex-col">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Customer Loyalty Program"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This name will be visible to your staff only.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe how this loyalty program works"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide details about how customers can earn and redeem
                        rewards.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="loyaltyType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base">Discount Type</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div
                            className={cn(
                              "flex flex-col items-start space-y-3 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                              loyaltyType === "percentage" && "border-primary"
                            )}
                            onClick={() => {
                              handleLoyaltyTypeChange("percentage");
                              field.onChange("percentage");
                            }}
                          >
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                              <Percent className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium leading-none">
                                Percentage
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Discount as a percentage of the total bill
                              </p>
                            </div>
                          </div>

                          <div
                            className={cn(
                              "flex flex-col items-start space-y-3 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                              loyaltyType === "fixed" && "border-primary"
                            )}
                            onClick={() => {
                              handleLoyaltyTypeChange("fixed");
                              field.onChange("fixed");
                            }}
                          >
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                              <Award className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium leading-none">
                                Fixed Amount
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Set specific fixed discount amounts by days
                              </p>
                            </div>
                          </div>

                          <div
                            className={cn(
                              "flex flex-col items-start space-y-3 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                              loyaltyType === "fixed-reviews" &&
                                "border-primary"
                            )}
                            onClick={() => {
                              handleLoyaltyTypeChange("fixed-reviews");
                              field.onChange("fixed-reviews");
                            }}
                          >
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                              <CalendarDays className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium leading-none">
                                Visit-Based
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Set discounts based on number of visits
                              </p>
                            </div>
                          </div>

                          <div
                            className={cn(
                              "flex flex-col items-start space-y-3 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                              loyaltyType === "referral" && "border-primary"
                            )}
                            onClick={() => {
                              handleLoyaltyTypeChange("referral");
                              field.onChange("referral");
                            }}
                          >
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                              <Users className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium leading-none">
                                Referral
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Reward both referrer and referred customers
                              </p>
                            </div>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 px-5 pt-5 flex-1 flex flex-col">
                <div className="bg-muted/50 p-4 rounded-lg mb-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Branch Selection
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Select which branches this loyalty program will be available
                    at.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="applyToAllBranches"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mb-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Apply to All Branches
                        </FormLabel>
                        <FormDescription>
                          Include all current and future branches
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            if (checked) {
                              // If switching to "all branches", clear the individual branch selection
                              form.setValue("branches", []);
                            }
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="branches"
                  render={({ field }) => (
                    <FormItem>
                      <div
                        className={cn(
                          "grid grid-cols-1 gap-3",
                          form.watch("applyToAllBranches") && "opacity-60"
                        )}
                      >
                        {form.watch("applyToAllBranches") && (
                          <div className="bg-muted/30 p-3 rounded-lg text-sm text-muted-foreground mb-1">
                            All branches are selected when "Apply to All
                            Branches" is enabled
                          </div>
                        )}
                        {actualBranches.map((branch) => (
                          <div
                            key={branch}
                            className={cn(
                              "flex items-center p-4 rounded-lg border transition-colors",
                              field.value?.includes(branch) &&
                                "border-primary bg-primary/5",
                              form.watch("applyToAllBranches")
                                ? "cursor-not-allowed"
                                : "cursor-pointer hover:bg-muted/50"
                            )}
                            onClick={() => {
                              if (form.watch("applyToAllBranches")) return;

                              if (field.value?.includes(branch)) {
                                field.onChange(
                                  field.value?.filter(
                                    (value) => value !== branch
                                  )
                                );
                              } else {
                                field.onChange([
                                  ...(field.value || []),
                                  branch,
                                ]);
                              }
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <Building2
                                className={cn(
                                  "h-5 w-5",
                                  field.value?.includes(branch)
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                )}
                              />
                              <span className="font-medium">{branch}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === 3 && loyaltyType === "percentage" && (
              <div className="space-y-4 px-5 pt-5 flex-1 flex flex-col">
                <div className="bg-muted/50 p-4 rounded-lg mb-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Percent className="h-5 w-5 text-primary" />
                    Percentage-based Loyalty Discount
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Configure percentage discounts based on customer loyalty
                    duration.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium">Discount Ranges</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addPercentageRange}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Range</span>
                    </Button>
                  </div>

                  {form.watch("percentageRanges")?.map((_, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-md space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Range {index + 1}</h4>
                        {form.watch("percentageRanges")?.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePercentageRange(index)}
                            className="h-8 w-8 p-0 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`percentageRanges.${index}.minDays`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Min Days</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {form.formState.errors.percentageRanges?.[index]
                          ?.minDays && (
                          <span className="text-xs text-destructive block mt-1">
                            {
                              form.formState.errors.percentageRanges[index]
                                ?.minDays?.message
                            }
                          </span>
                        )}

                        <FormField
                          control={form.control}
                          name={`percentageRanges.${index}.maxDays`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Days</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {form.formState.errors.percentageRanges?.[index]
                          ?.maxDays && (
                          <span className="text-xs text-destructive block mt-1">
                            {
                              form.formState.errors.percentageRanges[index]
                                ?.maxDays?.message
                            }
                          </span>
                        )}

                        <FormField
                          control={form.control}
                          name={`percentageRanges.${index}.percentage`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Discount Percentage (%)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {form.formState.errors.percentageRanges?.[index]
                          ?.percentage && (
                          <span className="text-xs text-destructive block mt-1">
                            {
                              form.formState.errors.percentageRanges[index]
                                ?.percentage?.message
                            }
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {form.formState.errors.percentageRanges && (
                    <FormField
                      control={form.control}
                      name="percentageRanges"
                      render={() => (
                        <FormItem>
                          {/* This FormMessage displays array-level validation errors for percentageRanges,
                              such as "Ranges must be connected" or "Add at least one discount range" */}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="maximumAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Discount Amount (Rs)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            value={field.value || 0}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum amount that can be discounted regardless of
                          percentage
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {step === 3 && loyaltyType === "fixed" && (
              <div className="space-y-4 px-5 pt-5 flex-1 flex flex-col">
                <div className="bg-muted/50 p-4 rounded-lg mb-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Fixed Amount Loyalty Discount
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Configure fixed amount discounts based on customer loyalty
                    duration.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium">Loyalty Tiers</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addFixedRange}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Tier</span>
                    </Button>
                  </div>

                  {form.watch("fixedRanges")?.map((_, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-md space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Tier {index + 1}</h4>
                        {form.watch("fixedRanges")?.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFixedRange(index)}
                            className="h-8 w-8 p-0 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`fixedRanges.${index}.minDays`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Min Days</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`fixedRanges.${index}.maxDays`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Days</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`fixedRanges.${index}.label`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tier Label</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Silver Member"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`fixedRanges.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fixed Discount Amount (Rs)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`fixedRanges.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe the benefits of this tier..."
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}

                  {form.formState.errors.fixedRanges && (
                    <FormField
                      control={form.control}
                      name="fixedRanges"
                      render={() => (
                        <FormItem>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
            )}

            {step === 3 && loyaltyType === "fixed-reviews" && (
              <div className="space-y-4 px-5 pt-5 flex-1 flex flex-col">
                <div className="bg-muted/50 p-4 rounded-lg mb-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    Visit-Based Loyalty Discount
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Reward customers based on the number of visits.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium">Visit Milestones</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addVisitMilestone}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Milestone</span>
                    </Button>
                  </div>

                  {form.watch("visitRanges")?.map((_, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-md space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Milestone {index + 1}</h4>
                        {form.watch("visitRanges")?.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVisitMilestone(index)}
                            className="h-8 w-8 p-0 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <FormField
                        control={form.control}
                        name={`visitRanges.${index}.visits`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Visits</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`visitRanges.${index}.label`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Milestone Label</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., First Visit Discount"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`visitRanges.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount Amount (Rs)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`visitRanges.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe the reward for this milestone..."
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}

                  {form.formState.errors.visitRanges && (
                    <FormField
                      control={form.control}
                      name="visitRanges"
                      render={() => (
                        <FormItem>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
            )}

            {step === 3 && loyaltyType === "referral" && (
              <div className="space-y-6 px-5 pt-5">
                <div className="bg-muted/50 p-4 rounded-lg mb-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Referral-based Loyalty Discount
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Reward both existing customers who refer others and new
                    customers who are referred.
                  </p>
                </div>

                <div className="grid gap-6">
                  {/* Referring User (Existing Customer) */}
                  <div className="border rounded-lg p-4 space-y-4 bg-card">
                    <h3 className="font-medium text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Referring User (Existing Customer)
                    </h3>

                    <FormField
                      control={form.control}
                      name="referringUser.discountType"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Discount Type</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex gap-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="percentage"
                                  id="referring-percentage"
                                />
                                <label
                                  htmlFor="referring-percentage"
                                  className="font-normal text-sm cursor-pointer"
                                >
                                  Percentage
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="fixed"
                                  id="referring-fixed"
                                />
                                <label
                                  htmlFor="referring-fixed"
                                  className="font-normal text-sm cursor-pointer"
                                >
                                  Fixed Amount
                                </label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("referringUser.discountType") ===
                    "percentage" ? (
                      <FormField
                        control={form.control}
                        name="referringUser.percentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount Percentage (%)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                                  %
                                </span>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={field.value || 0}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                  className="pl-9"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <FormField
                        control={form.control}
                        name="referringUser.amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fixed Amount (Rs)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                                  Rs
                                </span>
                                <Input
                                  type="number"
                                  min="0"
                                  value={field.value || 0}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                  className="pl-9"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  {/* Referred User (New Customer) */}
                  <div className="border rounded-lg p-4 space-y-4 bg-card">
                    <h3 className="font-medium text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Referred User (New Customer)
                    </h3>

                    <FormField
                      control={form.control}
                      name="referredUser.discountType"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Discount Type</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex gap-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="percentage"
                                  id="referred-percentage"
                                />
                                <label
                                  htmlFor="referred-percentage"
                                  className="font-normal text-sm cursor-pointer"
                                >
                                  Percentage
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="fixed"
                                  id="referred-fixed"
                                />
                                <label
                                  htmlFor="referred-fixed"
                                  className="font-normal text-sm cursor-pointer"
                                >
                                  Fixed Amount
                                </label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("referredUser.discountType") ===
                    "percentage" ? (
                      <FormField
                        control={form.control}
                        name="referredUser.percentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount Percentage (%)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                                  %
                                </span>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={field.value || 0}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                  className="pl-9"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <FormField
                        control={form.control}
                        name="referredUser.amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fixed Amount (Rs)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                                  Rs
                                </span>
                                <Input
                                  type="number"
                                  min="0"
                                  value={field.value || 0}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                  className="pl-9"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>

                {(form.watch("referringUser.discountType") === "percentage" ||
                  form.watch("referredUser.discountType") === "percentage") && (
                  <div className="border rounded-lg p-4 space-y-4 bg-card/50 mt-6">
                    <h3 className="font-medium text-base">
                      Maximum Discount Limit
                    </h3>
                    <FormField
                      control={form.control}
                      name="referralMaximumAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Discount Amount (Rs)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2">
                                Rs
                              </span>
                              <Input
                                type="number"
                                min="0"
                                value={field.value || 0}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value) || 0)
                                }
                                className="pl-9"
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Maximum amount that can be discounted regardless of
                            percentage
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            )}
          </div>{" "}
          {/* Close the overflow-y-auto div */}
          <div className="sticky bottom-0 right-0 bg-white border-t py-4 px-4 flex flex-col-reverse sm:flex-row sm:justify-between z-10 shadow-[0_-2px_4px_rgba(0,0,0,0.05)] w-full">
            {step === 1 ? (
              <Button
                variant="outline"
                type="button"
                onClick={onClose}
                className="w-full sm:flex-1"
              >
                Cancel
              </Button>
            ) : (
              <Button
                variant="outline"
                type="button"
                onClick={(e) => handleBackStep(e)}
                className="w-full sm:flex-1"
              >
                Back
              </Button>
            )}
            <div className="sm:ml-2 mb-2 sm:mb-0"></div>
            {step < 3 ? (
              <Button
                type="button"
                onClick={(e) => handleNextStep(e)}
                disabled={
                  step === 2 &&
                  !form.getValues("applyToAllBranches") &&
                  (!form.watch("branches") ||
                    form.watch("branches").length === 0)
                }
                className="w-full sm:flex-1 mb-2 sm:mb-0"
              >
                Next
              </Button>
            ) : (
              <LoadingButton
                type="submit"
                className="w-full sm:flex-1 mb-2 sm:mb-0"
                isLoading={form.formState.isSubmitting}
                loadingText={isEditing ? "Updating..." : "Creating..."}
              >
                {isEditing ? "Update" : "Create"} Loyalty Program
              </LoadingButton>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default LoyaltyDiscountForm;
