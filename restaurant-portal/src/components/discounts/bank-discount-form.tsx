"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useBranch } from "@/contexts/branch-context";
import type { BankDiscount, BankCardType } from "@/types/discounts";
import {
  ImageUploadField,
  DaysOfWeekField,
  BranchSelectionField,
} from "./common/discount-form-fields";
import {
  Building2,
  CreditCard,
  Check,
  ChevronDown,
  Search,
} from "lucide-react";
import { pakistaniBanks } from "@/data/banks";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { handleError } from "@/lib/error-handling";
import { FormErrors } from "@/components/ui/form-errors";

// Add import for LoadingButton
import { LoadingButton } from "@/components/ui/loading-button";

// Schema for bank discounts
const bankDiscountSchema = z
  .object({
    title: z
      .string()
      .min(3, { message: "Title must be at least 3 characters" }),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    discountPercentage: z
      .number()
      .min(1, { message: "Discount percentage must be at least 1%" })
      .max(100, { message: "Discount percentage cannot exceed 100%" }),
    maxAmount: z.number().optional(),
    selectedBanks: z
      .array(z.string())
      .min(1, { message: "At least one bank must be selected" }),
    selectedCardTypes: z.record(z.array(z.string())),
    isAlwaysActive: z.boolean().default(true),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isAllDay: z.boolean().default(true),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    isAllWeek: z.boolean().default(true),
    daysOfWeek: z.array(z.string()).optional(),
    forKhapeyUsersOnly: z.boolean().default(false),
    applyToAllBranches: z.boolean().default(true),
    branches: z.array(z.string()).optional(),
    status: z.enum(["active", "inactive"]).default("active"),
  })
  .refine(
    (data) => {
      if (!data.isAlwaysActive) {
        return data.startDate && data.endDate;
      }
      return true;
    },
    {
      message: "Start date and end date are required when not always active",
      path: ["isAlwaysActive"],
    }
  )
  .refine(
    (data) => {
      if (!data.isAlwaysActive && data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: "End date must be after or equal to start date",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      if (!data.isAllDay && data.startTime && data.endTime) {
        return data.endTime > data.startTime;
      }
      return true;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  )
  .refine(
    (data) => {
      if (!data.isAllWeek) {
        return data.daysOfWeek && data.daysOfWeek.length > 0;
      }
      return true;
    },
    {
      message:
        "At least one day of the week must be selected when not available all week",
      path: ["isAllWeek"],
    }
  )
  .refine(
    (data) => {
      // Check if each selected bank has at least one card type selected
      for (const bankId of data.selectedBanks) {
        const bankCardTypes = data.selectedCardTypes[bankId] || [];
        if (bankCardTypes.length === 0) {
          return false;
        }
      }
      return true;
    },
    {
      message: "Each selected bank must have at least one card type selected",
      path: ["selectedCardTypes"],
    }
  );

type BankDiscountFormValues = z.infer<typeof bankDiscountSchema>;

interface BankDiscountFormProps {
  onClose: () => void;
  onCreateDiscount: (discount: BankDiscount) => void;
  discountToEdit?: BankDiscount | null;
  isEditing: boolean;
  startAtFirstStep?: boolean;
}

export function BankDiscountForm({
  onClose,
  onCreateDiscount,
  discountToEdit,
  isEditing,
  startAtFirstStep = false,
}: BankDiscountFormProps) {
  const { selectedBranch } = useBranch();

  // Update the step initialization to respect startAtFirstStep
  const [step, setStep] = useState(isEditing && !startAtFirstStep ? 4 : 1);
  const [previousSteps, setPreviousSteps] = useState<number[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedBanks, setExpandedBanks] = useState<Record<string, boolean>>(
    {}
  );

  // Convert existing discount data to form values
  const getInitialValues = (): BankDiscountFormValues => {
    if (!discountToEdit) {
      return {
        title: "",
        description: "",
        imageUrl: "",
        discountPercentage: 10,
        maxAmount: undefined,
        selectedBanks: [],
        selectedCardTypes: {},
        isAlwaysActive: true,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        isAllDay: true,
        startTime: "10:00",
        endTime: "22:00",
        isAllWeek: true,
        daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        forKhapeyUsersOnly: false,
        applyToAllBranches: true,
        branches: selectedBranch?.branchName
          ? [selectedBranch?.branchName]
          : [],
        status: "active",
      };
    }

    // Initialize selectedBanks and selectedCardTypes from BankCardType[] array
    const selectedBanks: string[] = [];
    const selectedCardTypes: Record<string, string[]> = {};

    discountToEdit.bankCards.forEach((bankCard) => {
      selectedBanks.push(bankCard.bankId);
      selectedCardTypes[bankCard.bankId] = bankCard.cardTypeIds;
    });

    return {
      title: discountToEdit.title || "",
      description: discountToEdit.description || "",
      imageUrl: discountToEdit.imageUrl || "",
      discountPercentage: discountToEdit.discountPercentage || 10,
      maxAmount: discountToEdit.maxAmount,
      selectedBanks,
      selectedCardTypes,
      isAlwaysActive:
        discountToEdit.isAlwaysActive !== undefined
          ? discountToEdit.isAlwaysActive
          : true,
      startDate:
        discountToEdit.startDate || new Date().toISOString().split("T")[0],
      endDate:
        discountToEdit.endDate ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      isAllDay:
        discountToEdit.isAllDay !== undefined ? discountToEdit.isAllDay : true,
      startTime: discountToEdit.startTime || "10:00",
      endTime: discountToEdit.endTime || "22:00",
      isAllWeek:
        discountToEdit.isAllWeek !== undefined
          ? discountToEdit.isAllWeek
          : true,
      daysOfWeek: discountToEdit.daysOfWeek || [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ],
      forKhapeyUsersOnly: discountToEdit.forKhapeyUsersOnly || false,
      applyToAllBranches:
        discountToEdit.applyToAllBranches !== undefined
          ? discountToEdit.applyToAllBranches
          : true,
      branches:
        discountToEdit.branches ||
        (selectedBranch?.branchName ? [selectedBranch?.branchName] : []),
      status: discountToEdit.status || "active",
    };
  };

  // Initialize form with either the discount to edit or default values
  const form = useForm<BankDiscountFormValues>({
    resolver: zodResolver(bankDiscountSchema),
    defaultValues: getInitialValues(),
    mode: "onChange",
  });

  // Get the currently selected banks from form
  const selectedBanks = form.watch("selectedBanks") || [];
  const selectedCardTypes = form.watch("selectedCardTypes") || {};

  // Initialize selectedCardTypes record when banks are selected
  useEffect(() => {
    const existingTypes = { ...selectedCardTypes };

    // Add entry for newly selected banks
    selectedBanks.forEach((bankId) => {
      if (!existingTypes[bankId]) {
        existingTypes[bankId] = [];
      }
    });

    // Remove entries for deselected banks
    Object.keys(existingTypes).forEach((bankId) => {
      if (!selectedBanks.includes(bankId)) {
        delete existingTypes[bankId];
      }
    });

    form.setValue("selectedCardTypes", existingTypes);
  }, [selectedBanks, form]);

  // Auto-expand newly selected banks
  useEffect(() => {
    const newExpandedState = { ...expandedBanks };
    selectedBanks.forEach((bankId) => {
      if (newExpandedState[bankId] === undefined) {
        newExpandedState[bankId] = true;
      }
    });
    setExpandedBanks(newExpandedState);
  }, [selectedBanks]);

  // Validate step 1 fields (Basic Info)
  const validateStep1 = async () => {
    setValidationErrors([]);
    const errors: string[] = [];

    const result = await form.trigger([
      "title",
      "description",
      "imageUrl",
      "discountPercentage",
      "maxAmount",
    ]);

    if (!result) {
      if (form.formState.errors.title) {
        errors.push(form.formState.errors.title.message as string);
      }
      if (form.formState.errors.discountPercentage) {
        errors.push(form.formState.errors.discountPercentage.message as string);
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Validate step 2 fields (Bank Selection)
  const validateStep2 = async () => {
    setValidationErrors([]);
    const errors: string[] = [];

    const result = await form.trigger(["selectedBanks", "selectedCardTypes"]);

    if (!result) {
      if (form.formState.errors.selectedBanks) {
        errors.push(form.formState.errors.selectedBanks.message as string);
      }
      if (form.formState.errors.selectedCardTypes) {
        errors.push(form.formState.errors.selectedCardTypes.message as string);
      }

      // Check if each bank has card types selected
      selectedBanks.forEach((bankId) => {
        const cardTypes = selectedCardTypes[bankId] || [];
        const bank = pakistaniBanks.find((b) => b.id === bankId);
        if (cardTypes.length === 0) {
          errors.push(
            `Please select at least one card type for ${bank?.name || bankId}`
          );
        }
      });
    }

    if (selectedBanks.length === 0) {
      errors.push("Please select at least one bank");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Validate step 3 fields (Availability)
  const validateStep3 = async () => {
    setValidationErrors([]);
    const errors: string[] = [];

    const fieldsToValidate = [
      "isAlwaysActive",
      "isAllDay",
      "isAllWeek",
      "forKhapeyUsersOnly",
    ];

    if (!form.getValues("isAlwaysActive")) {
      fieldsToValidate.push("startDate", "endDate");
    }

    if (!form.getValues("isAllDay")) {
      fieldsToValidate.push("startTime", "endTime");
    }

    if (!form.getValues("isAllWeek")) {
      fieldsToValidate.push("daysOfWeek");
    }

    const result = await form.trigger(fieldsToValidate as any);

    if (!result) {
      // Add specific error messages
      if (!form.getValues("isAlwaysActive")) {
        if (form.formState.errors.startDate) {
          errors.push(form.formState.errors.startDate.message as string);
        }
        if (form.formState.errors.endDate) {
          errors.push(form.formState.errors.endDate.message as string);
        }

        // Check date range
        if (form.getValues("startDate") && form.getValues("endDate")) {
          const startDate = new Date(form.getValues("startDate"));
          const endDate = new Date(form.getValues("endDate"));
          if (endDate < startDate) {
            errors.push("End date must be after or equal to start date");
          }
        }
      }

      if (!form.getValues("isAllDay")) {
        if (form.formState.errors.startTime) {
          errors.push(form.formState.errors.startTime.message as string);
        }
        if (form.formState.errors.endTime) {
          errors.push(form.formState.errors.endTime.message as string);
        }

        // Check time range
        if (form.getValues("startTime") && form.getValues("endTime")) {
          if (form.getValues("endTime") <= form.getValues("startTime")) {
            errors.push("End time must be after start time");
          }
        }
      }

      if (!form.getValues("isAllWeek")) {
        if (form.formState.errors.daysOfWeek) {
          errors.push(form.formState.errors.daysOfWeek.message as string);
        }

        // Check days of week
        const daysOfWeek = form.getValues("daysOfWeek");
        if (!daysOfWeek || daysOfWeek.length === 0) {
          errors.push("At least one day of the week must be selected");
        }
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Validate step 4 fields (branch selection)
  const validateStep4 = async () => {
    setValidationErrors([]);
    const errors: string[] = [];

    // If "Apply to all branches" is true, no need to validate branches
    if (form.getValues("applyToAllBranches")) {
      return true;
    }

    // Check if at least one branch is selected
    const branches = form.getValues("branches");
    if (!branches || branches.length === 0) {
      errors.push("Please select at least one branch");
      setValidationErrors(errors);
      return false;
    }

    return true;
  };

  // Handle next step navigation
  const handleNextStep = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (step === 1) {
      const isValid = await validateStep1();
      if (!isValid) return;

      setPreviousSteps([...previousSteps, step]);
      setStep(2);
    } else if (step === 2) {
      const isValid = await validateStep2();
      if (!isValid) return;

      setPreviousSteps([...previousSteps, step]);
      setStep(3);
    } else if (step === 3) {
      const isValid = await validateStep3();
      if (!isValid) return;

      setPreviousSteps([...previousSteps, step]);
      setStep(4);
    }
  };

  // Handle back button
  const handleBackStep = (e: React.MouseEvent) => {
    e.preventDefault();
    setValidationErrors([]);

    if (previousSteps.length > 0) {
      const newPreviousSteps = [...previousSteps];
      const lastStep = newPreviousSteps.pop();
      setPreviousSteps(newPreviousSteps);

      if (lastStep) {
        setStep(lastStep);
      } else if (step > 1) {
        setStep(step - 1);
      }
    } else if (step > 1) {
      setStep(step - 1);
    }
  };

  // Get all selected card types count
  const getSelectedCardTypesCount = () => {
    let count = 0;
    Object.values(selectedCardTypes).forEach((cardTypes) => {
      count += cardTypes.length;
    });
    return count;
  };

  // Get bank name by ID
  const getBankName = (bankId: string) => {
    const bank = pakistaniBanks.find((b) => b.id === bankId);
    return bank?.name || bankId;
  };

  // Get card type count for a bank
  const getCardTypeCount = (bankId: string) => {
    return (selectedCardTypes[bankId] || []).length;
  };

  // Toggle bank selection
  const toggleBankSelect = (bankId: string) => {
    const currentBanks = [...selectedBanks];
    if (currentBanks.includes(bankId)) {
      form.setValue(
        "selectedBanks",
        currentBanks.filter((id) => id !== bankId)
      );
    } else {
      form.setValue("selectedBanks", [...currentBanks, bankId]);
    }
  };

  // Toggle bank expansion
  const toggleBankExpansion = (bankId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedBanks({
      ...expandedBanks,
      [bankId]: !expandedBanks[bankId],
    });
  };

  // Handle card type selection
  const handleCardTypeSelect = (bankId: string, cardTypeId: string) => {
    const currentCardTypes = { ...selectedCardTypes };
    const values = currentCardTypes[bankId] || [];

    if (values.includes(cardTypeId)) {
      currentCardTypes[bankId] = values.filter((id) => id !== cardTypeId);
    } else {
      currentCardTypes[bankId] = [...values, cardTypeId];
    }

    form.setValue("selectedCardTypes", currentCardTypes);
  };

  // Handle select all card types for a bank
  const handleSelectAllCardTypes = (bankId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const bank = pakistaniBanks.find((b) => b.id === bankId);
    if (!bank) return;

    const allCardTypeIds = bank.cardTypes.map((ct) => ct.id);
    const currentCardTypes = { ...selectedCardTypes };

    // Check if all types are already selected
    const allSelected = allCardTypeIds.every((id) =>
      (currentCardTypes[bankId] || []).includes(id)
    );

    // If all are selected, deselect all. Otherwise, select all.
    if (allSelected) {
      currentCardTypes[bankId] = [];
    } else {
      currentCardTypes[bankId] = [...allCardTypeIds];
    }

    form.setValue("selectedCardTypes", currentCardTypes);
  };

  // Filter banks based on search term
  const filteredBanks = pakistaniBanks.filter((bank) =>
    bank.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Form submission
  async function onSubmit(values: BankDiscountFormValues) {
    try {
      // Validate all fields before submission
      const isValid = await form.trigger();
      let isStepValid = true;

      if (step === 1) {
        isStepValid = await validateStep1();
      } else if (step === 2) {
        isStepValid = await validateStep2();
      } else if (step === 3) {
        isStepValid = await validateStep3();
      } else if (step === 4) {
        isStepValid = await validateStep4();
      }

      if (!isValid || !isStepValid) {
        return;
      }

      // Format the bank cards data
      const bankCards: BankCardType[] = values.selectedBanks.map((bankId) => {
        const bank = pakistaniBanks.find((b) => b.id === bankId);
        return {
          bankId,
          bankName: bank?.name || "",
          cardTypeIds: values.selectedCardTypes[bankId] || [],
        };
      });

      // Create the discount object
      const payload: BankDiscount = {
        id: discountToEdit?.id || `bank-discount-${Date.now()}`,
        type: "bankDiscount",
        title: values.title,
        description: values.description || "",
        imageUrl: values.imageUrl,
        discountPercentage: values.discountPercentage,
        maxAmount: values.maxAmount,
        bankCards,
        isAlwaysActive: values.isAlwaysActive,
        startDate: !values.isAlwaysActive ? values.startDate : undefined,
        endDate: !values.isAlwaysActive ? values.endDate : undefined,
        isAllDay: values.isAllDay,
        startTime: !values.isAllDay ? values.startTime : undefined,
        endTime: !values.isAllDay ? values.endTime : undefined,
        isAllWeek: values.isAllWeek,
        daysOfWeek: !values.isAllWeek ? values.daysOfWeek : undefined,
        forKhapeyUsersOnly: values.forKhapeyUsersOnly,
        applyToAllBranches: values.applyToAllBranches,
        branches: !values.applyToAllBranches ? values.branches || [] : [],
        status: values.status,
        createdAt: discountToEdit?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Call the onCreateDiscount function
      onCreateDiscount(payload);
      onClose();
    } catch (error) {
      handleError(error, "Failed to save bank discount");
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 space-y-6 overflow-y-auto"
        >
          <FormErrors errors={validationErrors} />

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6 pb-28 pt-5 px-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deal Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Bank Card Weekend Offer"
                        {...field}
                      />
                    </FormControl>
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
                      <Input
                        placeholder="Describe the bank discount..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <ImageUploadField form={form} imageField="imageUrl" />

              <FormField
                control={form.control}
                name="discountPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Percentage</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                        <span className="ml-2 text-lg">%</span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Discount Amount (Rs)</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <span className="mr-2 text-lg">Rs</span>
                        <Input
                          type="number"
                          min="0"
                          placeholder="No maximum limit"
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Set to 0 for no maximum limit
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 2: Bank and Card Selection */}
          {step === 2 && (
            <div className="space-y-6 pb-40">
              <div className="sticky top-0 z-10 bg-white px-5 pb-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search banks..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3 px-5">
                {filteredBanks.map((bank) => {
                  const isSelected = selectedBanks.includes(bank.id);
                  const isExpanded = expandedBanks[bank.id];
                  const cardTypesSelected = getCardTypeCount(bank.id);
                  const allCardTypesSelected =
                    cardTypesSelected === bank.cardTypes.length &&
                    cardTypesSelected > 0;

                  return (
                    <div
                      key={bank.id}
                      className="border rounded-lg overflow-hidden"
                    >
                      <div
                        className={cn(
                          "flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30",
                          isSelected && "bg-primary/5 border-primary"
                        )}
                        onClick={() => toggleBankSelect(bank.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-5 h-5 rounded-sm border flex items-center justify-center",
                              isSelected
                                ? "bg-primary border-primary text-white"
                                : "border-muted-foreground"
                            )}
                          >
                            {isSelected && <Check className="h-3.5 w-3.5" />}
                          </div>
                          <div>
                            <p className="font-medium">{bank.name}</p>
                            {isSelected && (
                              <p className="text-xs text-muted-foreground">
                                {cardTypesSelected} of {bank.cardTypes.length}{" "}
                                card types selected
                              </p>
                            )}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-xs"
                              onClick={(e) =>
                                handleSelectAllCardTypes(bank.id, e)
                              }
                            >
                              {allCardTypesSelected
                                ? "Deselect All"
                                : "Select All"}
                            </Button>
                            <ChevronDown
                              className={cn(
                                "h-5 w-5 transition-transform",
                                isExpanded && "transform rotate-180"
                              )}
                              onClick={(e) => toggleBankExpansion(bank.id, e)}
                            />
                          </div>
                        )}
                      </div>

                      {isSelected && isExpanded && (
                        <div className="p-3 pt-0 border-t bg-muted/5">
                          <div className="flex flex-wrap gap-2 mt-3">
                            {bank.cardTypes.map((cardType) => {
                              const isCardSelected = (
                                selectedCardTypes[bank.id] || []
                              ).includes(cardType.id);
                              return (
                                <Badge
                                  key={cardType.id}
                                  variant={
                                    isCardSelected ? "default" : "outline"
                                  }
                                  className={cn(
                                    "flex items-center gap-1 px-3 py-1.5 cursor-pointer",
                                    isCardSelected
                                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                                      : "hover:bg-muted/50"
                                  )}
                                  onClick={() =>
                                    handleCardTypeSelect(bank.id, cardType.id)
                                  }
                                >
                                  <CreditCard className="h-3.5 w-3.5 mr-1" />
                                  <span>{cardType.name}</span>
                                  {isCardSelected && (
                                    <Check className="h-3 w-3 ml-1" />
                                  )}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {filteredBanks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No banks found matching "{searchTerm}"
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Availability Settings */}
          {step === 3 && (
            <div className="space-y-6 pb-36">
              {/* Date Restrictions Section */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="isAlwaysActive"
                  render={({ field }) => (
                    <FormItem className="px-5">
                      <div className="flex flex-row items-center justify-between gap-4 w-full">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Always Active
                          </FormLabel>
                          <FormDescription>
                            Toggle on if this discount is always active without
                            date restrictions
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!form.watch("isAlwaysActive") && (
                  <div className="pl-3 pt-2 ml-2">
                    <div className="grid gap-2 pr-4">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Days of Week Section - MOVED UP */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="isAllWeek"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between w-full px-5">
                      <FormLabel className="text-base">
                        Available All Week
                      </FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {!form.watch("isAllWeek") && (
                  <div>
                    <DaysOfWeekField
                      form={form}
                      allWeekField="isAllWeek"
                      daysField="daysOfWeek"
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Time Restrictions Section - MOVED DOWN */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="isAllDay"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between w-full px-5">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Available All Day
                        </FormLabel>
                        <FormDescription>
                          Toggle on if this discount is available throughout the
                          day
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {!form.watch("isAllDay") && (
                  <div className="pl-4 pt-2 ml-2">
                    <div className="grid gap-2 pr-4">
                      <FormField
                        control={form.control}
                        name="startTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="endTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Khapey Users Section */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="forKhapeyUsersOnly"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between w-full px-5">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Khapey App Users Only
                        </FormLabel>
                        <FormDescription>
                          Toggle on if this discount is exclusive to Khapey app
                          users
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Step 4: Branch Selection */}
          {step === 4 && (
            <div className="space-y-6 pb-28 pt-5 px-5">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Branch Selection
              </h3>

              <FormField
                control={form.control}
                name="applyToAllBranches"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between w-full">
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

              {!form.watch("applyToAllBranches") && (
                <div className="mt-4">
                  <BranchSelectionField form={form} />
                </div>
              )}
            </div>
          )}

          {/* Replace the submit button with LoadingButton */}
          <div className="fixed bottom-0 right-0 bg-white border-t py-4 px-4 flex flex-col-reverse sm:flex-row sm:justify-between z-10 shadow-[0_-2px_4px_rgba(0,0,0,0.05)] w-full sm:w-[512px]">
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
                onClick={handleBackStep}
                className="w-full sm:flex-1"
              >
                Back
              </Button>
            )}
            <div className="sm:ml-2 mb-2 sm:mb-0"></div>
            {step < 4 ? (
              <Button
                type="button"
                onClick={handleNextStep}
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
                {isEditing ? "Update" : "Create"} Bank Discount
              </LoadingButton>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
