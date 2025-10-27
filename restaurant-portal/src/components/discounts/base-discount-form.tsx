"use client";

import type React from "react";
import { useState } from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { z as zod } from "zod"; // Import z as zod to avoid naming conflicts
import { validateForm, commonSchemas } from "@/lib/form-validation";
import { FormErrors } from "@/components/ui/form-errors";
import { LoadingButton } from "@/components/ui/loading-button";
import { handleError } from "@/lib/error-handling";

interface FormSection {
  title: string;
  description?: string;
  component: React.ReactNode;
}

interface BaseDiscountFormProps<T extends zod.ZodType> {
  form: UseFormReturn<zod.infer<T>>;
  onSubmit: (values: zod.infer<T>) => void;
  onClose: () => void;
  isEditing: boolean;
  formTitle: string;
  steps: FormSection[][];
  validationErrors?: string[];
  setValidationErrors?: (errors: string[]) => void;
  startAtFirstStep?: boolean;
}

// Define the schema using our common schemas
const discountFormSchema = zod.object({
  title: commonSchemas.nonEmptyString,
  description: zod.string().optional(),
  discountType: zod.enum(["percentage", "fixed", "loyalty"]),
  startDate: commonSchemas.date,
  endDate: commonSchemas.date,
  // Add other fields as needed
});

export function BaseDiscountForm<T extends zod.ZodType>({
  form,
  onSubmit,
  onClose,
  isEditing,
  formTitle,
  steps,
  validationErrors = [],
  setValidationErrors = () => {},
  startAtFirstStep = false,
}: BaseDiscountFormProps<T>) {
  // Update the step initialization to respect startAtFirstStep
  const [currentStep, setCurrentStep] = useState(
    isEditing && !startAtFirstStep ? steps.length - 1 : 0
  );
  const [previousSteps, setPreviousSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validateCurrentStep = async () => {
    // Each form must implement this based on step-specific validation logic
    // This is a placeholder - the actual implementation would be passed from each form
    try {
      await form.trigger();
      return Object.keys(form.formState.errors).length === 0;
    } catch (error) {
      console.error("Validation error:", error);
      return false;
    }
  };

  const handleNextStep = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (currentStep < steps.length - 1) {
      const isValid = await validateCurrentStep();
      if (!isValid) return;

      setPreviousSteps([...previousSteps, currentStep]);
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBackStep = (e: React.MouseEvent) => {
    e.preventDefault();
    setValidationErrors([]);

    if (previousSteps.length > 0) {
      const newPreviousSteps = [...previousSteps];
      const lastStep = newPreviousSteps.pop();
      setPreviousSteps(newPreviousSteps);

      if (lastStep !== undefined) {
        setCurrentStep(lastStep);
      } else if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
      }
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setErrors([]);

    try {
      // Extract form data
      const data = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        discountType: formData.get("discountType") as string,
        startDate: new Date(formData.get("startDate") as string),
        endDate: new Date(formData.get("endDate") as string),
        // Add other fields as needed
      };

      // Validate using our standardized validation
      const validation = validateForm(discountFormSchema, data);

      if (!validation.success) {
        setErrors(validation.errors);
        return;
      }

      // Submit the form
      // ...
    } catch (error) {
      // Use our standardized error handling
      const appError = handleError(error, "Failed to save discount");
      setErrors([appError.message]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 space-y-6 pb-20 overflow-y-auto"
        >
          {validationErrors.length > 0 && (
            <Alert
              variant="destructive"
              className="mb-4 border-2 border-destructive animate-pulse-once"
            >
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="mt-2">
                <h4 className="font-semibold text-destructive mb-2">
                  Please fix the following errors:
                </h4>
                <ul className="list-disc pl-5 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm">
                      {error}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Show form errors using our standardized component */}
          <FormErrors errors={errors} className="mb-4" />

          {/* Current step content */}
          <div className="space-y-6">{steps[currentStep]}</div>

          {/* Form fields */}

          {/* Form navigation controls */}
          <div className="fixed bottom-0 right-0 bg-white border-t py-4 px-4 flex flex-col-reverse sm:flex-row sm:justify-between z-10 shadow-[0_-2px_4px_rgba(0,0,0,0.05)] w-full sm:w-[512px]">
            {currentStep === 0 ? (
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
            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={handleNextStep}
                className="w-full sm:flex-1 mb-2 sm:mb-0"
              >
                Next
              </Button>
            ) : (
              // Submit button using our standardized loading button
              <LoadingButton
                type="submit"
                isLoading={isSubmitting}
                loadingText="Saving..."
                className="w-full sm:flex-1 mb-2 sm:mb-0"
              >
                {isEditing ? "Update" : "Create"} {formTitle}
              </LoadingButton>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
