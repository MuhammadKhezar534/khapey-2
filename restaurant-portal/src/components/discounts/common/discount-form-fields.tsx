"use client";
import { useState, useRef, useEffect } from "react";
import type React from "react";

import { Calendar, Clock, Building2, ImageIcon, X } from "lucide-react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useBranch } from "@/contexts/branch-context";
import type { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";

// Days of the week options
const daysOfWeek = [
  { id: "Monday", label: "Monday" },
  { id: "Tuesday", label: "Tuesday" },
  { id: "Wednesday", label: "Wednesday" },
  { id: "Thursday", label: "Thursday" },
  { id: "Friday", label: "Friday" },
  { id: "Saturday", label: "Saturday" },
  { id: "Sunday", label: "Sunday" },
];

interface ImageUploadFieldProps {
  form: UseFormReturn<any>;
  imageField?: string;
}

export function ImageUploadField({
  form,
  imageField = "imageUrl",
}: ImageUploadFieldProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  // Initialize preview if there's an existing value
  useEffect(() => {
    const currentValue = form.getValues(imageField);
    if (currentValue && typeof currentValue === "string") {
      setPreview(currentValue);
    }
  }, [form, imageField]);

  // Handle global paste events
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith("image/")) {
          handleFile(file);
          e.preventDefault();
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, []);

  // Handle file upload (simulated)
  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      form.setValue(imageField, result, {
        shouldValidate: true,
        shouldDirty: true,
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        handleFile(file);
      }
    }
  };

  // Handle manual file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };

  return (
    <FormField
      control={form.control}
      name={imageField}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Image (Optional)</FormLabel>
          <FormControl>
            <div
              ref={dropzoneRef}
              className={cn(
                "border rounded-lg transition-colors cursor-pointer overflow-hidden",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-muted-foreground/50",
                preview ? "p-0" : "p-6"
              )}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              {preview ? (
                <div className="relative group">
                  <img
                    src={preview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full object-cover max-h-48"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <button
                      type="button"
                      className="bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreview(null);
                        form.setValue(imageField, "", {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-10 w-10 mb-2" />
                  <p className="text-sm font-medium text-center">
                    Drop image here or click to upload
                  </p>
                  <p className="text-xs mt-1 text-center text-muted-foreground/70">
                    You can also paste from clipboard
                  </p>
                </div>
              )}
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface DateTimeFieldsProps {
  form: UseFormReturn<any>;
  alwaysActiveField: string;
  startDateField: string;
  endDateField: string;
  allDayField: string;
  startTimeField: string;
  endTimeField: string;
}

export function DateTimeFields({
  form,
  alwaysActiveField,
  startDateField,
  endDateField,
  allDayField,
  startTimeField,
  endTimeField,
}: DateTimeFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <FormField
          control={form.control}
          name={startDateField}
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <FormLabel>Start Date</FormLabel>
              </div>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={endDateField}
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <FormLabel>End Date</FormLabel>
              </div>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-4">
        <FormField
          control={form.control}
          name={startTimeField}
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <FormLabel>Start Time</FormLabel>
              </div>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={endTimeField}
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <FormLabel>End Time</FormLabel>
              </div>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

interface DaysOfWeekFieldProps {
  form: UseFormReturn<any>;
  allWeekField: string;
  daysField: string;
}

export function DaysOfWeekField({
  form,
  allWeekField,
  daysField,
}: DaysOfWeekFieldProps) {
  return (
    <FormField
      control={form.control}
      name={daysField}
      render={() => (
        <FormItem>
          <div className="mb-4 px-5">
            <FormLabel className="text-base">Select Days</FormLabel>
            <FormDescription>
              Choose which days of the week this discount is available
            </FormDescription>
          </div>
          <div className="px-5 mt-2">
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((day) => {
                const dayAbbr = day.label.substring(0, 3);
                const isSelected = form.getValues(daysField)?.includes(day.id);

                return (
                  <button
                    key={day.id}
                    type="button"
                    className={cn(
                      "h-9 px-3 rounded-md text-sm font-medium transition-colors",
                      isSelected
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border border-muted bg-transparent hover:bg-muted/10 text-muted-foreground"
                    )}
                    onClick={() => {
                      const currentDays = form.getValues(daysField) || [];
                      if (isSelected) {
                        form.setValue(
                          daysField,
                          currentDays.filter((value) => value !== day.id),
                          { shouldValidate: true, shouldDirty: true }
                        );
                      } else {
                        form.setValue(daysField, [...currentDays, day.id], {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }
                    }}
                  >
                    {dayAbbr}
                  </button>
                );
              })}
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface KhapeyUsersFieldProps {
  form: UseFormReturn<any>;
}

export function KhapeyUsersField({ form }: KhapeyUsersFieldProps) {
  return (
    <FormField
      control={form.control}
      name="forKhapeyUsersOnly"
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
          <FormControl>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>For Khapey App Users Only</FormLabel>
            <FormDescription>
              Check this if the discount is exclusive to Khapey app users
            </FormDescription>
          </div>
        </FormItem>
      )}
    />
  );
}

interface BranchSelectionFieldProps {
  form: UseFormReturn<any>;
}

export function BranchSelectionField({ form }: BranchSelectionFieldProps) {
  // Get branches from context
  const { actualBranches } = useBranch();

  // Create a safe array of branches to display
  const displayBranches = actualBranches;

  return (
    <FormField
      control={form.control}
      name="branches"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base">Select Branches</FormLabel>
          <div className="grid grid-cols-1 gap-3 mt-2">
            {displayBranches?.map((branch) => {
              // const branchId =
              //   typeof branch === "string"
              //     ? branch
              //     : branch.id || `branch-${index}`;
              // const branchName =
              //   typeof branch === "string"
              //     ? branch
              //     : branch.name || `Branch ${index + 1}`;\

              const { _id, branchName } = branch;

              return (
                <div
                  key={branchName}
                  className={cn(
                    "flex items-center p-4 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50",
                    field.value?.includes(_id) && "border-primary bg-primary/5"
                  )}
                  onClick={() => {
                    if (field.value?.includes(_id)) {
                      field.onChange(
                        field.value?.filter((value: string) => value !== _id)
                      );
                    } else {
                      field.onChange([...(field.value || []), _id]);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Building2
                      className={cn(
                        "h-5 w-5",
                        field.value?.includes(_id)
                          ? "text-primary"
                          : "text-muted-foreground"
                      )}
                    />
                    <span className="font-medium">{branchName}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface DiscountFormBasicFieldsProps {
  form: UseFormReturn<any>;
  nameField?: string;
}

export function DiscountFormBasicFields({
  form,
  nameField = "name",
}: DiscountFormBasicFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name={nameField}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
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
              <Input placeholder="Describe the discount..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
