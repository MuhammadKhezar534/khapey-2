"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useBranch, branches } from "@/contexts/branch-context";
import { Award, Coins, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const loyaltyDiscountSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  type: z.enum(["points", "visits", "spending"]),
  branches: z
    .array(z.string())
    .min(1, { message: "Select at least one branch" }),
  // Points specific fields
  pointsPerAmount: z.number().optional(),
  amountPerPoint: z.number().optional(),
  pointsRedemptionThreshold: z.number().optional(),
  pointsRedemptionValue: z.number().optional(),
  // Visits specific fields
  visitsRequired: z.number().optional(),
  visitReward: z.string().optional(),
  // Spending specific fields
  spendingThreshold: z.number().optional(),
  spendingDiscount: z.number().optional(),
});

type LoyaltyDiscountFormValues = z.infer<typeof loyaltyDiscountSchema>;

interface AddLoyaltyDiscountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddLoyaltyDiscountDialog({
  open,
  onOpenChange,
}: AddLoyaltyDiscountDialogProps) {
  const { selectedBranch } = useBranch();
  const [step, setStep] = useState(1);
  const actualBranches = branches.filter((branch) => branch !== "All branches");

  const form = useForm<LoyaltyDiscountFormValues>({
    resolver: zodResolver(loyaltyDiscountSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "points",
      branches: selectedBranch?.branchName ? [selectedBranch?.branchName] : [],
      pointsPerAmount: 1,
      amountPerPoint: 100,
      pointsRedemptionThreshold: 100,
      pointsRedemptionValue: 200,
      visitsRequired: 10,
      visitReward: "Free dessert",
      spendingThreshold: 5000,
      spendingDiscount: 10,
    },
  });

  const selectedType = form.watch("type");

  function onSubmit(values: LoyaltyDiscountFormValues) {
    console.log(values);
    // Here you would typically send the data to your backend
    onOpenChange(false);
    // Reset form and step
    form.reset();
    setStep(1);
  }

  function handleClose() {
    onOpenChange(false);
    // Reset form and step when dialog is closed
    setTimeout(() => {
      form.reset();
      setStep(1);
    }, 300);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6 pb-24">
        <DialogHeader>
          <DialogTitle className="text-xl">Create Loyalty Discount</DialogTitle>
          <DialogDescription>
            Create a loyalty program to reward your regular customers.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
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
                      <FormLabel>Description</FormLabel>
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
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Loyalty Program Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                          <FormItem>
                            <FormLabel asChild>
                              <div
                                className={cn(
                                  "flex flex-col items-start space-y-3 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                                  field.value === "points" && "border-primary"
                                )}
                              >
                                <FormControl>
                                  <RadioGroupItem
                                    value="points"
                                    className="sr-only"
                                  />
                                </FormControl>
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                                  <Coins className="h-5 w-5" />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-medium leading-none">
                                    Points Based
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Customers earn points for purchases and
                                    redeem them for rewards
                                  </p>
                                </div>
                              </div>
                            </FormLabel>
                          </FormItem>
                          <FormItem>
                            <FormLabel asChild>
                              <div
                                className={cn(
                                  "flex flex-col items-start space-y-3 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                                  field.value === "visits" && "border-primary"
                                )}
                              >
                                <FormControl>
                                  <RadioGroupItem
                                    value="visits"
                                    className="sr-only"
                                  />
                                </FormControl>
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                                  <CalendarDays className="h-5 w-5" />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-medium leading-none">
                                    Visit Frequency
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Reward customers based on how often they
                                    visit
                                  </p>
                                </div>
                              </div>
                            </FormLabel>
                          </FormItem>
                          <FormItem>
                            <FormLabel asChild>
                              <div
                                className={cn(
                                  "flex flex-col items-start space-y-3 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                                  field.value === "spending" && "border-primary"
                                )}
                              >
                                <FormControl>
                                  <RadioGroupItem
                                    value="spending"
                                    className="sr-only"
                                  />
                                </FormControl>
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                                  <Award className="h-5 w-5" />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-medium leading-none">
                                    Spending Tiers
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Offer discounts when customers reach
                                    spending thresholds
                                  </p>
                                </div>
                              </div>
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="branches"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">
                          Apply to Branches
                        </FormLabel>
                        <FormDescription>
                          Select which branches this loyalty program will be
                          available at.
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {actualBranches.map((branch) => (
                          <FormField
                            key={branch}
                            control={form.control}
                            name="branches"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={branch}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(branch)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...field.value,
                                              branch,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== branch
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {branch}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === 2 && selectedType === "points" && (
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg mb-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Coins className="h-5 w-5 text-primary" />
                    Points Based Loyalty Program
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Configure how customers earn and redeem points with their
                    purchases.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pointsPerAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Points Earned</FormLabel>
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
                        <FormDescription>
                          Number of points earned per spending amount
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amountPerPoint"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>For Every (Rs)</FormLabel>
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
                        <FormDescription>
                          Amount spent to earn the points above
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pointsRedemptionThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Points Needed to Redeem</FormLabel>
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
                        <FormDescription>
                          Minimum points required for redemption
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pointsRedemptionValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Redemption Value (Rs)</FormLabel>
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
                        <FormDescription>
                          Value in rupees when points are redeemed
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <h4 className="font-medium mb-2">Summary</h4>
                  <p className="text-sm">
                    Customers will earn{" "}
                    <span className="font-medium">
                      {form.watch("pointsPerAmount")} points
                    </span>{" "}
                    for every{" "}
                    <span className="font-medium">
                      Rs {form.watch("amountPerPoint")}
                    </span>{" "}
                    spent. When they accumulate{" "}
                    <span className="font-medium">
                      {form.watch("pointsRedemptionThreshold")} points
                    </span>
                    , they can redeem them for{" "}
                    <span className="font-medium">
                      Rs {form.watch("pointsRedemptionValue")}
                    </span>
                    .
                  </p>
                </div>
              </div>
            )}

            {step === 2 && selectedType === "visits" && (
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg mb-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    Visit Frequency Loyalty Program
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Reward customers based on how frequently they visit your
                    restaurant.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="visitsRequired"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visits Required</FormLabel>
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
                        <FormDescription>
                          Number of visits needed to earn the reward
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="visitReward"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reward</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Free dessert, 20% discount, etc."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          What customers receive after the required visits
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <h4 className="font-medium mb-2">Summary</h4>
                  <p className="text-sm">
                    After{" "}
                    <span className="font-medium">
                      {form.watch("visitsRequired")} visits
                    </span>
                    , customers will receive{" "}
                    <span className="font-medium">
                      {form.watch("visitReward")}
                    </span>
                    .
                  </p>
                </div>
              </div>
            )}

            {step === 2 && selectedType === "spending" && (
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg mb-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Spending Tier Loyalty Program
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Reward customers when they reach specific spending
                    thresholds.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="spendingThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Spending Threshold (Rs)</FormLabel>
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
                        <FormDescription>
                          Amount customers need to spend to qualify
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="spendingDiscount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Percentage (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="100"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Percentage discount on their next purchase
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <h4 className="font-medium mb-2">Summary</h4>
                  <p className="text-sm">
                    When customers spend{" "}
                    <span className="font-medium">
                      Rs {form.watch("spendingThreshold")}
                    </span>{" "}
                    or more, they will receive a{" "}
                    <span className="font-medium">
                      {form.watch("spendingDiscount")}% discount
                    </span>{" "}
                    on their next purchase.
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="fixed bottom-0 left-0 right-0 bg-white border-t py-4 px-4 flex flex-col-reverse sm:flex-row w-full z-10 shadow-[0_-2px_4px_rgba(0,0,0,0.05)]">
              {step === 1 ? (
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleClose}
                  className="w-full sm:flex-1"
                >
                  Cancel
                </Button>
              ) : (
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full sm:flex-1"
                >
                  Back
                </Button>
              )}
              <div className="sm:ml-2 mb-2 sm:mb-0"></div>
              {step === 1 ? (
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full sm:flex-1 mb-2 sm:mb-0"
                >
                  Next
                </Button>
              ) : (
                <Button type="submit" className="w-full sm:flex-1 mb-2 sm:mb-0">
                  Create Loyalty Program
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
