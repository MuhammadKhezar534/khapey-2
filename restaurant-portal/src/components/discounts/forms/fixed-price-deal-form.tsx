"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useBranch } from "@/contexts/branch-context";
import type { FixedPriceDealDiscount } from "@/types/discounts";
import { ImageUploadField } from "@/components/discounts/common/discount-form-fields";
import { v4 as uuidv4 } from "uuid";

// Schema for fixed price deal discounts
const fixedPriceDealSchema = z.object({
  name: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  prices: z
    .array(
      z.object({
        id: z.string(),
        label: z.string().optional(),
        price: z
          .number({ invalid_type_error: "Price must be a number" })
          .min(1, { message: "Price must be at least 1" }),
      })
    )
    .min(1, { message: "At least one price option is required" }),
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
});

type FixedPriceDealFormValues = z.infer<typeof fixedPriceDealSchema>;

interface FixedPriceDealFormProps {
  onClose: () => void;
  onCreateDiscount: (discount: FixedPriceDealDiscount) => void;
  discountToEdit?: FixedPriceDealDiscount | null;
  isEditing: boolean;
}

export function FixedPriceDealForm({
  onClose,
  onCreateDiscount,
  discountToEdit,
  isEditing,
}: FixedPriceDealFormProps) {
  const { selectedBranch } = useBranch();

  const form = useForm<FixedPriceDealFormValues>({
    resolver: zodResolver(fixedPriceDealSchema),
    defaultValues: {
      name: discountToEdit?.name || "",
      description: discountToEdit?.description || "",
      imageUrl: discountToEdit?.imageUrl || "",
      prices: discountToEdit?.prices || [{ id: uuidv4(), label: "", price: 0 }],
      isAlwaysActive:
        discountToEdit?.isAlwaysActive !== undefined
          ? discountToEdit.isAlwaysActive
          : true,
      startDate:
        discountToEdit?.startDate || new Date().toISOString().split("T")[0],
      endDate:
        discountToEdit?.endDate ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      isAllDay:
        discountToEdit?.isAllDay !== undefined ? discountToEdit.isAllDay : true,
      startTime: discountToEdit?.startTime || "10:00",
      endTime: discountToEdit?.endTime || "22:00",
      isAllWeek:
        discountToEdit?.isAllWeek !== undefined
          ? discountToEdit.isAllWeek
          : true,
      daysOfWeek: discountToEdit?.daysOfWeek || [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ],
      forKhapeyUsersOnly: discountToEdit?.forKhapeyUsersOnly || false,
      applyToAllBranches:
        discountToEdit?.applyToAllBranches !== undefined
          ? discountToEdit.applyToAllBranches
          : true,
      branches:
        discountToEdit?.branches ||
        (selectedBranch?.branchName ? [selectedBranch?.branchName] : []),
      status: discountToEdit?.status || "active",
    },
  });

  async function onSubmit(values: FixedPriceDealFormValues) {
    const payload: FixedPriceDealDiscount = {
      id: discountToEdit?.id || `fixed-price-deal-${Date.now()}`,
      type: "fixedPriceDeal",
      name: values.name,
      description: values.description || "",
      imageUrl: values.imageUrl,
      prices: values.prices,
      isAlwaysActive: values.isAlwaysActive,
      startDate: values.startDate,
      endDate: values.endDate,
      isAllDay: values.isAllDay,
      startTime: values.startTime,
      endTime: values.endTime,
      isAllWeek: values.isAllWeek,
      daysOfWeek: values.daysOfWeek || [],
      forKhapeyUsersOnly: values.forKhapeyUsersOnly,
      applyToAllBranches: values.applyToAllBranches,
      branches: values.branches || [],
      status: values.status,
      createdAt: discountToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onCreateDiscount(payload);
    onClose();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
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
                <Input
                  placeholder="Describe the fixed price deal..."
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
          name="prices"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prices</FormLabel>
              <FormControl>
                {field.value?.map((price, index) => (
                  <div key={price.id}>
                    <Input
                      type="number"
                      placeholder="Price"
                      value={price.price}
                      onChange={(e) => {
                        const newPrices = [...field.value];
                        newPrices[index].price = Number(e.target.value);
                        field.onChange(newPrices);
                      }}
                    />
                  </div>
                ))}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isAlwaysActive"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Always Active</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Create Fixed Price Deal</Button>
      </form>
    </Form>
  );
}
