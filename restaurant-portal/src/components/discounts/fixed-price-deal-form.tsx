"use client"

import type React from "react"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Trash2, Plus, Building2 } from "lucide-react"
import { useBranch } from "@/contexts/branch-context"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import type { FixedPriceDealDiscount } from "@/types/discounts"
import { DaySelector } from "@/components/discounts/common/day-selector"
import { ImageUploader } from "@/components/discounts/common/image-uploader"
import { BranchSelectionField } from "@/components/discounts/common/discount-form-fields"
// Add import for error handling
import { handleError } from "@/lib/error-handling"
// Add import for LoadingButton
import { LoadingButton } from "@/components/ui/loading-button"

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const priceOptionSchema = z.object({
  id: z.string(),
  label: z.string().optional(),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
})

const fixedPriceDealSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    prices: z.array(priceOptionSchema).min(1, "At least one price option is required"),
    isAlwaysActive: z.boolean().default(true),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
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
        return data.startDate && data.endDate && data.startDate <= data.endDate
      }
      return true
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  )
  .refine(
    (data) => {
      if (!data.isAllDay && data.startTime && data.endTime) {
        return data.startTime < data.endTime
      }
      return true
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    },
  )
  .refine(
    (data) => {
      if (!data.isAllWeek && data.daysOfWeek) {
        return data.daysOfWeek.length > 0
      }
      return true
    },
    {
      message: "At least one day must be selected",
      path: ["daysOfWeek"],
    },
  )
  .refine(
    (data) => {
      if (!data.applyToAllBranches && data.branches) {
        return data.branches.length > 0
      }
      return true
    },
    {
      message: "At least one branch must be selected",
      path: ["branches"],
    },
  )

type FixedPriceDealFormValues = z.infer<typeof fixedPriceDealSchema>

interface FixedPriceDealFormProps {
  onClose: () => void
  onCreateDiscount: (discount: FixedPriceDealDiscount) => void
  onUpdateDiscount?: (discount: FixedPriceDealDiscount) => void
  isEditing: boolean
  initialData?: FixedPriceDealDiscount
  startAtFirstStep?: boolean
}

export function FixedPriceDealForm({
  onClose,
  onCreateDiscount,
  onUpdateDiscount,
  isEditing,
  initialData,
  startAtFirstStep = false,
}: FixedPriceDealFormProps) {
  const { actualBranches } = useBranch()
  const [step, setStep] = useState(isEditing && !startAtFirstStep ? 3 : 1)
  const [previousSteps, setPreviousSteps] = useState<number[]>([])
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const form = useForm<FixedPriceDealFormValues>({
    resolver: zodResolver(fixedPriceDealSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          title: initialData.name, // Ensure title is mapped from initialData.name
          startDate: initialData.startDate ? new Date(initialData.startDate) : undefined,
          endDate: initialData.endDate ? new Date(initialData.endDate) : undefined,
        }
      : {
          title: "",
          description: "",
          imageUrl: "",
          prices: [{ id: uuidv4(), label: "", price: 0 }],
          isAlwaysActive: true,
          isAllDay: true,
          isAllWeek: true,
          forKhapeyUsersOnly: false,
          applyToAllBranches: true,
          status: "active",
          daysOfWeek: [],
          branches: [],
        },
  })

  const prices = form.watch("prices")

  const addPriceOption = () => {
    const currentPrices = form.getValues("prices") || []
    form.setValue("prices", [...currentPrices, { id: uuidv4(), label: "", price: 0 }])
  }

  const removePriceOption = (id: string) => {
    const currentPrices = form.getValues("prices") || []
    if (currentPrices.length <= 1) {
      toast({
        title: "Error",
        description: "At least one price option is required",
        variant: "destructive",
      })
      return
    }
    form.setValue(
      "prices",
      currentPrices.filter((option) => option.id !== id),
    )
  }

  // Validate step 1 fields
  const validateStep1 = async () => {
    setValidationErrors([])
    const errors: string[] = []

    const result = await form.trigger(["title", "description", "imageUrl", "prices"])

    if (!result) {
      if (form.formState.errors.title) {
        errors.push(form.formState.errors.title.message as string)
      }
      if (form.formState.errors.prices) {
        errors.push(form.formState.errors.prices.message as string)
      }

      // Check individual price options
      const prices = form.getValues("prices")
      prices.forEach((price, index) => {
        if (form.formState.errors.prices?.[index]?.price) {
          errors.push(`Price option ${index + 1}: ${form.formState.errors.prices[index]?.price?.message}`)
        }
      })
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  // Validate step 2 fields
  const validateStep2 = async () => {
    setValidationErrors([])
    const errors: string[] = []

    const fieldsToValidate = ["isAlwaysActive", "isAllDay", "isAllWeek", "forKhapeyUsersOnly"]

    if (!form.getValues("isAlwaysActive")) {
      fieldsToValidate.push("startDate", "endDate")
    }

    if (!form.getValues("isAllDay")) {
      fieldsToValidate.push("startTime", "endTime")
    }

    if (!form.getValues("isAllWeek")) {
      fieldsToValidate.push("daysOfWeek")
    }

    const result = await form.trigger(fieldsToValidate as any)

    if (!result) {
      // Add specific error messages
      if (!form.getValues("isAlwaysActive")) {
        if (form.formState.errors.startDate) {
          errors.push("Start date is required")
        }
        if (form.formState.errors.endDate) {
          errors.push("End date is required")
        }

        // Check date range
        if (form.getValues("startDate") && form.getValues("endDate")) {
          const startDate = form.getValues("startDate")
          const endDate = form.getValues("endDate")
          if (endDate < startDate) {
            errors.push("End date must be after or equal to start date")
          }
        }
      }

      if (!form.getValues("isAllDay")) {
        if (form.formState.errors.startTime) {
          errors.push("Start time is required")
        }
        if (form.formState.errors.endTime) {
          errors.push("End time is required")
        }

        // Check time range
        if (form.getValues("startTime") && form.getValues("endTime")) {
          if (form.getValues("endTime") <= form.getValues("startTime")) {
            errors.push("End time must be after start time")
          }
        }
      }

      if (!form.getValues("isAllWeek")) {
        if (form.formState.errors.daysOfWeek) {
          errors.push("At least one day of the week must be selected")
        }

        // Check days of week
        const daysOfWeek = form.getValues("daysOfWeek")
        if (!daysOfWeek || daysOfWeek.length === 0) {
          errors.push("At least one day of the week must be selected")
        }
      }
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  // Validate step 3 fields (branch selection)
  const validateStep3 = async () => {
    setValidationErrors([])
    const errors: string[] = []

    // If "Apply to all branches" is true, no need to validate branches
    if (form.getValues("applyToAllBranches")) {
      return true
    }

    // Check if at least one branch is selected
    const branches = form.getValues("branches")
    if (!branches || branches.length === 0) {
      errors.push("Please select at least one branch")
      setValidationErrors(errors)
      return false
    }

    return true
  }

  // Handle next step navigation
  const handleNextStep = async (e: React.MouseEvent) => {
    e.preventDefault()

    if (step === 1) {
      const isValid = await validateStep1()
      if (!isValid) return

      setPreviousSteps([...previousSteps, step])
      setStep(2)
    } else if (step === 2) {
      const isValid = await validateStep2()
      if (!isValid) return

      setPreviousSteps([...previousSteps, step])
      setStep(3)
    }
  }

  // Handle back button
  const handleBackStep = (e: React.MouseEvent) => {
    e.preventDefault()
    setValidationErrors([])

    if (previousSteps.length > 0) {
      const newPreviousSteps = [...previousSteps]
      const lastStep = newPreviousSteps.pop()
      setPreviousSteps(newPreviousSteps)

      if (lastStep) {
        setStep(lastStep)
      } else if (step > 1) {
        setStep(step - 1)
      }
    } else if (step > 1) {
      setStep(step - 1)
    }
  }

  // Update the onSubmit function to use our error handling
  const onSubmit = async (values: FixedPriceDealFormValues) => {
    try {
      // Validate all fields before submission
      const isValid = await form.trigger()
      let isStepValid = true

      if (step === 2) {
        isStepValid = await validateStep2()
      } else if (step === 3) {
        isStepValid = await validateStep3()
      }

      if (!isValid || !isStepValid) {
        return
      }

      // Format dates as ISO strings for storage
      const formattedValues = {
        ...values,
        startDate: values.startDate ? values.startDate.toISOString().split("T")[0] : undefined,
        endDate: values.endDate ? values.endDate.toISOString().split("T")[0] : undefined,
      }

      // Create the discount object
      const discount: FixedPriceDealDiscount = {
        id: initialData?.id || uuidv4(),
        type: "fixedPriceDeal",
        name: formattedValues.title,
        description: formattedValues.description || "",
        imageUrl: formattedValues.imageUrl,
        prices: formattedValues.prices,
        isAlwaysActive: formattedValues.isAlwaysActive,
        startDate: formattedValues.startDate,
        endDate: formattedValues.endDate,
        isAllDay: formattedValues.isAllDay,
        startTime: formattedValues.startTime,
        endTime: formattedValues.endTime,
        isAllWeek: formattedValues.isAllWeek,
        daysOfWeek: formattedValues.daysOfWeek || [],
        forKhapeyUsersOnly: formattedValues.forKhapeyUsersOnly,
        applyToAllBranches: formattedValues.applyToAllBranches,
        branches: formattedValues.branches || [],
        status: formattedValues.status,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      if (isEditing && onUpdateDiscount) {
        onUpdateDiscount(discount)
      } else {
        onCreateDiscount(discount)
      }

      onClose()
    } catch (error) {
      // Use our standardized error handling
      handleError(error, "Failed to save discount")
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-6 overflow-y-auto">
          {validationErrors.length > 0 && (
            <div className="bg-destructive/10 border border-destructive text-destructive p-3 rounded-md">
              <p className="font-semibold mb-2">Please fix the following errors:</p>
              <ul className="list-disc pl-5 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 pb-28 pt-5 px-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deal Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Weekend Special" {...field} />
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
                      <Textarea placeholder="Describe the fixed price deal..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image (Optional)</FormLabel>
                    <FormControl>
                      <ImageUploader value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} />
                    </FormControl>
                    <FormDescription>Upload an image to promote your deal</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <h3 className="font-medium">Price Options</h3>
                <div className="space-y-4">
                  {prices.map((option, index) => (
                    <Card key={option.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-sm">Price Option {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removePriceOption(option.id)}
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`prices.${index}.label`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Label (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Small, Medium, Large" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`prices.${index}.price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price (Rs)</FormLabel>
                                <FormControl>
                                  <Input type="number" min="1" placeholder="Enter price" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button type="button" variant="outline" onClick={addPriceOption} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Price Option
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 pb-36 px-5 pt-5">
              {/* Date Restrictions Section */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="isAlwaysActive"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-row items-center justify-between gap-4 w-full">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Always Active</FormLabel>
                          <FormDescription>
                            Toggle on if this discount is always active without date restrictions
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                              <Input
                                type="date"
                                value={field.value ? field.value.toISOString().split("T")[0] : ""}
                                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                              />
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
                              <Input
                                type="date"
                                value={field.value ? field.value.toISOString().split("T")[0] : ""}
                                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                              />
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

              {/* Days of Week Section */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="isAllWeek"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between w-full">
                      <FormLabel className="text-base">Available All Week</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {!form.watch("isAllWeek") && (
                  <div>
                    <FormField
                      control={form.control}
                      name="daysOfWeek"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <DaySelector selectedDays={field.value || []} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Time Restrictions Section */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="isAllDay"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between w-full">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Available All Day</FormLabel>
                        <FormDescription>Toggle on if this discount is available throughout the day</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                    <FormItem className="flex flex-row items-center justify-between w-full">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Khapey App Users Only</FormLabel>
                        <FormDescription>Toggle on if this discount is exclusive to Khapey app users</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {step === 3 && (
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
                      <FormLabel className="text-base">Apply to All Branches</FormLabel>
                      <FormDescription>Include all current and future branches</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked)
                          if (checked) {
                            // If switching to "all branches", clear the individual branch selection
                            form.setValue("branches", [])
                          }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {!form.watch("applyToAllBranches") && <BranchSelectionField form={form} />}
            </div>
          )}

          <div className="fixed bottom-0 right-0 bg-white border-t py-4 px-4 flex flex-col-reverse sm:flex-row sm:justify-between z-10 shadow-[0_-2px_4px_rgba(0,0,0,0.05)] w-full sm:w-[512px]">
            {step === 1 ? (
              <Button variant="outline" type="button" onClick={onClose} className="w-full sm:flex-1">
                Cancel
              </Button>
            ) : (
              <Button variant="outline" type="button" onClick={handleBackStep} className="w-full sm:flex-1">
                Back
              </Button>
            )}
            <div className="sm:ml-2 mb-2 sm:mb-0"></div>
            {step < 3 ? (
              <Button type="button" onClick={handleNextStep} className="w-full sm:flex-1 mb-2 sm:mb-0">
                Next
              </Button>
            ) : (
              <LoadingButton
                type="submit"
                className="w-full sm:flex-1 mb-2 sm:mb-0"
                isLoading={form.formState.isSubmitting}
                loadingText={isEditing ? "Updating..." : "Creating..."}
              >
                {isEditing ? "Update" : "Create"} Fixed Price Deal
              </LoadingButton>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
