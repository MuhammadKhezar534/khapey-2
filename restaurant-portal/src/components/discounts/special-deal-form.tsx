"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Clock,
  Plus,
  Trash2,
  Upload,
  ImageIcon,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import type { SpecialDealDiscount } from "@/types/discounts";
import { LoadingButton } from "@/components/ui/loading-button";
import { handleError } from "@/lib/error-handling";
import { FormErrors } from "@/components/ui/form-errors";

interface SpecialDealFormProps {
  onClose: () => void;
  onCreateDiscount: (discount: SpecialDealDiscount) => void;
  discountToEdit?: SpecialDealDiscount;
  isEditing: boolean;
}

export function SpecialDealForm({
  onClose,
  onCreateDiscount,
  discountToEdit,
  isEditing,
}: SpecialDealFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [usePercentage, setUsePercentage] = useState(true);
  const [percentage, setPercentage] = useState(10);
  const [maxAmount, setMaxAmount] = useState<number | undefined>(undefined);
  const [prices, setPrices] = useState<
    { id: string; label: string; price: number }[]
  >([]);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [isAllDay, setIsAllDay] = useState(true);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("22:00");
  const [forKhapeyUsersOnly, setForKhapeyUsersOnly] = useState(false);
  const [applyToAllBranches, setApplyToAllBranches] = useState(true);
  const [branches, setBranches] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [form, setForm] = useState({ formState: { isSubmitting: false } });

  // Mock branches for demo
  const availableBranches = [
    "Gulberg Branch",
    "Downtown Branch",
    "Mall Plaza Branch",
    "University Campus",
    "Airport Terminal",
  ];

  useEffect(() => {
    if (discountToEdit && isEditing) {
      setTitle(discountToEdit.name);
      setDescription(discountToEdit.description);
      setImageUrl(discountToEdit.imageUrl);
      setUsePercentage(discountToEdit.usePercentage);
      if (discountToEdit.percentage) setPercentage(discountToEdit.percentage);
      setMaxAmount(discountToEdit.maxAmount);
      setPrices(discountToEdit.prices || []);
      if (discountToEdit.startDate)
        setStartDate(new Date(discountToEdit.startDate));
      if (discountToEdit.endDate) setEndDate(new Date(discountToEdit.endDate));
      setIsAllDay(discountToEdit.isAllDay);
      setStartTime(discountToEdit.startTime || "10:00");
      setEndTime(discountToEdit.endTime || "22:00");
      setForKhapeyUsersOnly(discountToEdit.forKhapeyUsersOnly);
      setApplyToAllBranches(discountToEdit.applyToAllBranches);
      setBranches(discountToEdit.branches);
    }
  }, [discountToEdit, isEditing]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const newValidationErrors: string[] = [];

    if (!title.trim()) {
      newErrors.title = "Title is required";
      newValidationErrors.push("Title is required");
    }

    if (usePercentage) {
      if (percentage < 1 || percentage > 100) {
        newErrors.percentage = "Percentage must be between 1 and 100";
        newValidationErrors.push("Percentage must be between 1 and 100");
      }
    } else {
      if (prices.length === 0) {
        newErrors.prices = "At least one price option is required";
        newValidationErrors.push("At least one price option is required");
      } else {
        prices.forEach((price, index) => {
          if (!price.label.trim()) {
            newErrors[`price_label_${index}`] = "Label is required";
            newValidationErrors.push(
              `Label for price ${index + 1} is required`
            );
          }
          if (price.price <= 0) {
            newErrors[`price_amount_${index}`] = "Price must be greater than 0";
            newValidationErrors.push(
              `Price for price ${index + 1} must be greater than 0`
            );
          }
        });
      }
    }

    if (startDate && endDate && startDate > endDate) {
      newErrors.endDate = "End date cannot be before start date";
      newValidationErrors.push("End date cannot be before start date");
    }

    if (!isAllDay) {
      const startHour = Number.parseInt(startTime.split(":")[0]);
      const startMinute = Number.parseInt(startTime.split(":")[1]);
      const endHour = Number.parseInt(endTime.split(":")[0]);
      const endMinute = Number.parseInt(endTime.split(":")[1]);

      if (
        startHour > endHour ||
        (startHour === endHour && startMinute >= endMinute)
      ) {
        newErrors.endTime = "End time must be after start time";
        newValidationErrors.push("End time must be after start time");
      }
    }

    setErrors(newErrors);
    setValidationErrors(newValidationErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setForm((prev) => ({
      ...prev,
      formState: { ...prev.formState, isSubmitting: true },
    }));

    try {
      const newDiscount: SpecialDealDiscount = {
        id: discountToEdit?.id || uuidv4(),
        type: "specialDeal",
        name: title,
        description,
        imageUrl,
        usePercentage,
        percentage: usePercentage ? percentage : undefined,
        maxAmount: usePercentage ? maxAmount : undefined,
        prices: !usePercentage ? prices : [],
        status: "active",
        startDate: startDate ? startDate.toISOString() : undefined,
        endDate: endDate ? endDate.toISOString() : undefined,
        isAllDay,
        startTime: !isAllDay ? startTime : undefined,
        endTime: !isAllDay ? endTime : undefined,
        forKhapeyUsersOnly,
        branches: applyToAllBranches ? [] : branches,
        applyToAllBranches,
        createdAt: discountToEdit?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onCreateDiscount(newDiscount);
      onClose();
    } catch (error) {
      handleError(error);
    } finally {
      setForm((prev) => ({
        ...prev,
        formState: { ...prev.formState, isSubmitting: false },
      }));
    }
  };

  const handleAddPrice = () => {
    setPrices([...prices, { id: uuidv4(), label: "", price: 0 }]);
  };

  const handleRemovePrice = (id: string) => {
    setPrices(prices.filter((price) => price.id !== id));
  };

  const handlePriceChange = (
    id: string,
    field: "label" | "price",
    value: string | number
  ) => {
    setPrices(
      prices.map((price) => {
        if (price.id === id) {
          return { ...price, [field]: value };
        }
        return price;
      })
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImagePaste = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith("image/")) {
            const blob = await clipboardItem.getType(type);
            const reader = new FileReader();
            reader.onload = (event) => {
              setImageUrl(event.target?.result as string);
            };
            reader.readAsDataURL(blob);
            return;
          }
        }
      }
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(undefined);
  };

  const toggleBranch = (branch: string) => {
    if (branches.includes(branch)) {
      setBranches(branches.filter((b) => b !== branch));
    } else {
      setBranches([...branches, branch]);
    }
  };

  return (
    <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-10rem)]">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Deal Title</Label>
        <Input
          id="title"
          placeholder="e.g., Weekend Special"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Describe the special deal..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="resize-none h-20"
        />
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <Label>Image (Optional)</Label>
        {imageUrl ? (
          <div className="relative rounded-md overflow-hidden border border-input">
            <img
              src={imageUrl || "/placeholder.svg"}
              alt="Deal"
              className="w-full h-40 object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="border border-dashed border-input rounded-md p-6 flex flex-col items-center justify-center gap-2">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                <Upload className="h-4 w-4" />
                Upload
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={handleImagePaste}
              >
                <ImageIcon className="h-4 w-4" />
                Paste
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Click to browse or paste from clipboard (Ctrl+V)
            </p>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
        )}
      </div>

      {/* Discount Type Toggle */}
      <div className="space-y-2">
        <Label>Discount Type</Label>
        <div className="flex items-center justify-between">
          <span className="text-sm">Use Percentage</span>
          <Switch checked={usePercentage} onCheckedChange={setUsePercentage} />
        </div>
      </div>

      {/* Percentage Discount Fields */}
      {usePercentage && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="percentage">Discount Percentage</Label>
            <div className="flex items-center">
              <Input
                id="percentage"
                type="number"
                min="1"
                max="100"
                value={percentage}
                onChange={(e) => setPercentage(Number.parseInt(e.target.value))}
                className={cn(
                  "w-full",
                  errors.percentage ? "border-red-500" : ""
                )}
              />
              <span className="ml-2 text-lg">%</span>
            </div>
            {errors.percentage && (
              <p className="text-xs text-red-500">{errors.percentage}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxAmount">Maximum Discount Amount (Rs)</Label>
            <div className="flex items-center">
              <span className="mr-2 text-lg">Rs</span>
              <Input
                id="maxAmount"
                type="number"
                min="0"
                placeholder="No maximum limit"
                value={maxAmount || ""}
                onChange={(e) =>
                  setMaxAmount(
                    e.target.value ? Number.parseInt(e.target.value) : undefined
                  )
                }
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Set to 0 for no maximum limit
            </p>
          </div>
        </div>
      )}

      {/* Fixed Price Fields */}
      {!usePercentage && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Fixed Prices</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddPrice}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Price
            </Button>
          </div>
          {errors.prices && (
            <p className="text-xs text-red-500">{errors.prices}</p>
          )}

          <div className="space-y-2">
            {prices.map((price, index) => (
              <div key={price.id} className="flex items-center gap-2">
                <Input
                  placeholder="Label (e.g., Small)"
                  value={price.label}
                  onChange={(e) =>
                    handlePriceChange(price.id, "label", e.target.value)
                  }
                  className={
                    errors[`price_label_${index}`] ? "border-red-500" : ""
                  }
                />
                <div className="flex items-center">
                  <span className="mr-2 text-sm">Rs</span>
                  <Input
                    type="number"
                    min="0"
                    value={price.price}
                    onChange={(e) =>
                      handlePriceChange(
                        price.id,
                        "price",
                        Number.parseInt(e.target.value)
                      )
                    }
                    className={
                      errors[`price_amount_${index}`] ? "border-red-500" : ""
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemovePrice(price.id)}
                  className="h-8 w-8 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Date Range */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="startDate">Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? (
                  format(startDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="endDate">End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        {errors.endDate && (
          <p className="text-xs text-red-500">{errors.endDate}</p>
        )}
      </div>

      {/* Time Range */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Available All Day</Label>
          <Switch checked={isAllDay} onCheckedChange={setIsAllDay} />
        </div>
        <p className="text-xs text-muted-foreground">
          Toggle off to set specific hours
        </p>
      </div>

      {!isAllDay && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTime">End Time</Label>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={errors.endTime ? "border-red-500" : ""}
              />
            </div>
            {errors.endTime && (
              <p className="text-xs text-red-500">{errors.endTime}</p>
            )}
          </div>
        </div>
      )}

      {/* Khapey Users Only */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>For Khapey Users Only</Label>
          <Switch
            checked={forKhapeyUsersOnly}
            onCheckedChange={setForKhapeyUsersOnly}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Limit this deal to Khapey app users
        </p>
      </div>

      {/* Branch Selection */}
      <div className="space-y-4">
        <Label>Branch Selection</Label>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">All Branches</span>
            <Switch
              checked={applyToAllBranches}
              onCheckedChange={setApplyToAllBranches}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Apply to all branches (including future branches)
          </p>
        </div>

        {!applyToAllBranches && (
          <div className="space-y-2">
            <Label>Select specific branches:</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableBranches.map((branch) => (
                <div key={branch} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`branch-${branch}`}
                    checked={branches.includes(branch)}
                    onChange={() => toggleBranch(branch)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor={`branch-${branch}`} className="text-sm">
                    {branch}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Display Validation Errors */}
      <FormErrors errors={validationErrors} />

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <LoadingButton
          type="submit"
          className="w-full sm:flex-1 mb-2 sm:mb-0"
          isLoading={form.formState.isSubmitting}
          loadingText={isEditing ? "Updating..." : "Creating..."}
        >
          {isEditing ? "Update" : "Create"} Special Deal
        </LoadingButton>
      </div>
    </div>
  );
}
