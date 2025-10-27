"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, CreditCard } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GenericTable } from "@/components/ui/generic-table"
import { PaymentDrawer } from "@/components/payments/payment-drawer"
import { PaymentMethodCard } from "@/components/payments/payment-method-card"
import { formatCurrency } from "@/utils/format"
import { useIsMobile } from "@/hooks/use-mobile"
import { toast } from "@/components/ui/use-toast"

// Define the Invoice type
interface Invoice {
  id: string
  invoiceNumber?: string
  amount: number
  status: string
  dueDate: string
  paidDate: string | null
  description: string
}

// Update the PaymentMethod interface
interface PaymentMethod {
  id: string
  type: string
  last4: string
  expiryDate: string
  brand: string
  isDefault: boolean
}

// Update the component to handle payment methods
export default function PaymentsPage() {
  // Keep existing state variables
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isMethodDrawerOpen, setIsMethodDrawerOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Invoice | null>(null)
  const isMobile = useIsMobile()

  // Add state for payment methods
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "pm-1",
      type: "card",
      last4: "4242",
      expiryDate: "05/25",
      brand: "Visa",
      isDefault: true,
    },
    {
      id: "pm-2",
      type: "card",
      last4: "1234",
      expiryDate: "09/24",
      brand: "Mastercard",
      isDefault: false,
    },
  ])

  // Add functions to handle payment methods
  const handleAddPaymentMethod = () => {
    setIsMethodDrawerOpen(true)
  }

  const handleSavePaymentMethod = (data: any) => {
    // Create a new payment method from the form data
    const newMethod: PaymentMethod = {
      id: `pm-${Date.now()}`, // Generate a unique ID
      type: data.type || "card",
      last4: data.cardNumber ? data.cardNumber.slice(-4) : "0000",
      expiryDate: data.expiryMonth && data.expiryYear ? `${data.expiryMonth}/${data.expiryYear}` : "00/00",
      brand: data.type === "card" ? "Card" : data.type === "easypaisa" ? "Easypaisa" : "JazzCash",
      isDefault: data.isDefault === "on" || false,
    }

    // If the new method is default, update all other methods
    let updatedMethods = [...savedPaymentMethods]

    if (newMethod.isDefault) {
      updatedMethods = updatedMethods.map((method) => ({
        ...method,
        isDefault: false,
      }))
    }

    // Add the new method
    setSavedPaymentMethods([...updatedMethods, newMethod])

    // Show success toast
    toast({
      title: "Payment method added",
      description: `${newMethod.brand} ending in ${newMethod.last4} has been added.`,
    })
  }

  const handleSetDefaultPaymentMethod = (id: string) => {
    // Update payment methods to set the selected one as default
    const updatedMethods = savedPaymentMethods.map((method) => ({
      ...method,
      isDefault: method.id === id,
    }))

    setSavedPaymentMethods(updatedMethods)

    // Show success toast
    const method = savedPaymentMethods.find((m) => m.id === id)
    if (method) {
      toast({
        title: "Default payment method updated",
        description: `${method.brand} ending in ${method.last4} is now your default payment method.`,
      })
    }
  }

  const handleDeletePaymentMethod = (id: string) => {
    // Remove the payment method
    const updatedMethods = savedPaymentMethods.filter((method) => method.id !== id)
    setSavedPaymentMethods(updatedMethods)

    // Show success toast
    toast({
      title: "Payment method removed",
      description: "The payment method has been removed successfully.",
    })
  }

  const handleAddPayment = () => {
    setEditingPayment(null)
    setIsDrawerOpen(true)
  }

  const handleEditPayment = (invoice: Invoice) => {
    setEditingPayment(invoice)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setEditingPayment(null)
  }

  const handleCloseMethodDrawer = () => {
    setIsMethodDrawerOpen(false)
  }

  // Mock data for upcoming payments - using current date for dynamic testing
  const today = new Date()
  const getRelativeDate = (days) => {
    const date = new Date(today)
    date.setDate(today.getDate() + days)
    return date.toISOString().split("T")[0]
  }

  // Mock data for upcoming payments
  const upcomingPayments = [
    {
      id: "up-1",
      amount: 1250.0,
      dueDate: getRelativeDate(2), // Due in 2 days
      description: "Monthly Subscription",
      period: "May 2023",
    },
  ]

  // Mock data for invoices - ordered by month chronologically
  const invoices = [
    {
      id: "inv-003",
      invoiceNumber: "INV-2025-001",
      amount: 1250.0,
      status: "overdue",
      dueDate: "2025-03-30",
      paidDate: null,
      description: "Monthly Subscription - March 2025",
    },
    {
      id: "inv-001",
      invoiceNumber: "INV-2025-002",
      amount: 1250.0,
      status: "paid",
      dueDate: "2025-04-15",
      paidDate: "2025-04-10",
      description: "Monthly Subscription - April 2025",
    },
    {
      id: "inv-002",
      invoiceNumber: "INV-2025-003",
      amount: 1250.0,
      status: "pending",
      dueDate: "2025-05-18",
      paidDate: null,
      description: "Monthly Subscription - May 2025",
    },
    {
      id: "inv-004",
      invoiceNumber: "INV-2025-004",
      amount: 1250.0,
      status: "upcoming",
      dueDate: "2025-06-01",
      paidDate: null,
      description: "Monthly Subscription - June 2025",
    },
  ].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())

  const invoiceColumns = [
    {
      header: "Invoice #",
      accessorKey: "invoiceNumber",
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: (row: Invoice) => (
        <div className="max-w-[200px] truncate" title={row.description}>
          {row.description.split(" - ")[1]}
        </div>
      ),
    },
    {
      header: "Amount",
      accessorKey: "amount",
      cell: (row: Invoice) => formatCurrency(row.amount, "PKR"),
    },
    {
      header: "Due Date",
      accessorKey: "dueDate",
      cell: (row: Invoice) => new Date(row.dueDate).toLocaleDateString(),
      // Hide on mobile
      meta: {
        className: "hidden md:table-cell",
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: Invoice) => {
        const statusMap = {
          paid: { label: "Paid", className: "bg-green-100 text-green-800" },
          pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
          overdue: { label: "Overdue", className: "bg-red-100 text-red-800" },
          upcoming: { label: "Upcoming", className: "bg-gray-100 text-gray-800" },
        }

        const status = statusMap[row.status as keyof typeof statusMap]

        return (
          <Badge variant="outline" className={status.className}>
            {status.label}
          </Badge>
        )
      },
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (row: Invoice) => (
        <Button variant="ghost" size="sm" onClick={() => handleEditPayment(row)}>
          {isMobile ? "View" : "View Details"}
        </Button>
      ),
      meta: {
        hideColumn: true,
      },
    },
  ]

  // Mobile-optimized columns
  const mobileInvoiceColumns = invoiceColumns.filter(
    (col) => col.accessorKey !== "dueDate" && col.accessorKey !== "description" && !col.meta?.hideColumn,
  )

  return (
    <div className="pt-4 md:pt-6 space-y-5 md:space-y-8">
      <div className="grid gap-5 md:grid-cols-2 md:gap-8">
        {/* Upcoming Payment */}
        <Card className="overflow-hidden">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Subscription Payment</CardTitle>
            <CardDescription className="text-xs md:text-sm">Your upcoming platform subscription</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            {upcomingPayments.length > 0 ? (
              <div className="flex flex-col">
                {/* Show subscription payment */}
                {(() => {
                  const payment = upcomingPayments[0]
                  const dueDate = new Date(payment.dueDate)
                  const today = new Date()
                  const isOverdue = dueDate < today
                  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

                  // Determine status and styling
                  const statusConfig = isOverdue
                    ? { label: "Overdue", color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-100" }
                    : daysUntilDue <= 3
                      ? {
                          label: "Due Soon",
                          color: "text-amber-600",
                          bgColor: "bg-amber-50",
                          borderColor: "border-amber-100",
                        }
                      : {
                          label: "Upcoming",
                          color: "text-green-600",
                          bgColor: "bg-green-50",
                          borderColor: "border-green-100",
                        }

                  // Format date string
                  const dateString = isOverdue
                    ? `Due ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? "s" : ""} ago`
                    : daysUntilDue === 0
                      ? "Due today"
                      : daysUntilDue === 1
                        ? "Due tomorrow"
                        : `Due in ${daysUntilDue} days`

                  return (
                    <div key={payment.id} className="space-y-4">
                      {/* Subscription details */}
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="mb-2 md:mb-0">
                          <h3 className="font-medium text-base">Platform Subscription</h3>
                          <p className="text-sm text-muted-foreground">{payment.period}</p>
                        </div>
                        <div className="text-xl font-semibold">{formatCurrency(payment.amount, "PKR")}</div>
                      </div>

                      {/* Payment status card */}
                      <div className={`rounded-lg ${statusConfig.bgColor} ${statusConfig.borderColor} border p-4`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`h-2 w-2 rounded-full ${isOverdue ? "bg-red-500" : daysUntilDue <= 3 ? "bg-amber-500" : "bg-green-500"}`}
                            ></div>
                            <span className={`text-sm font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
                          </div>
                          <div className="text-sm font-medium">
                            {dueDate.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-sm">
                            <span className="text-muted-foreground">{dateString}</span>
                          </div>
                          <Button
                            variant={isOverdue ? "destructive" : "default"}
                            size="sm"
                            className="h-8"
                            onClick={() => handleAddPayment()}
                          >
                            Pay Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-muted-foreground mb-3">No upcoming subscription payment</p>
                  <Button variant="outline" size="sm" onClick={handleAddPayment}>
                    <Plus className="mr-2 h-3 w-3" />
                    Manage Subscription
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Saved Payment Methods */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
            <div>
              <CardTitle className="text-base md:text-lg">Payment Methods</CardTitle>
              <CardDescription className="text-xs md:text-sm">Your saved payment methods</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleAddPaymentMethod}>
              <CreditCard className="mr-2 h-4 w-4" />
              {isMobile ? "Add" : "Add Method"}
            </Button>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            {savedPaymentMethods.length > 0 ? (
              <div className="space-y-3">
                {savedPaymentMethods.map((method) => (
                  <PaymentMethodCard
                    key={method.id}
                    method={method}
                    onEdit={() => handleEditPayment({ id: method.id } as Invoice)}
                    onSetDefault={handleSetDefaultPaymentMethod}
                    onDelete={handleDeletePaymentMethod}
                    compact={isMobile}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[80px] md:h-[100px]">
                <p className="text-muted-foreground text-sm">No payment methods saved</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invoices */}
      <Card className="overflow-hidden">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">Subscription History</CardTitle>
          <CardDescription className="text-xs md:text-sm">Your subscription payment history</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <div className="flex w-full overflow-x-auto hide-scrollbar px-4 md:px-6">
                <TabsTrigger
                  value="all"
                  className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Pending
                </TabsTrigger>
                <TabsTrigger
                  value="paid"
                  className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Paid
                </TabsTrigger>
                <TabsTrigger
                  value="overdue"
                  className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Overdue
                </TabsTrigger>
                <TabsTrigger
                  value="upcoming"
                  className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Upcoming
                </TabsTrigger>
              </div>
            </TabsList>
            <TabsContent value="all" className="m-0">
              {invoices.length > 0 ? (
                <GenericTable
                  data={invoices}
                  columns={(isMobile ? mobileInvoiceColumns : invoiceColumns).filter((col) => !col.meta?.hideColumn)}
                  className="border-none"
                />
              ) : (
                <div className="flex items-center justify-center h-[200px]">
                  <p className="text-muted-foreground text-sm">No subscription history found</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="pending" className="m-0">
              {invoices.filter((i) => i.status === "pending").length > 0 ? (
                <GenericTable
                  data={invoices.filter((i) => i.status === "pending")}
                  columns={(isMobile ? mobileInvoiceColumns : invoiceColumns).filter((col) => !col.meta?.hideColumn)}
                  className="border-none"
                />
              ) : (
                <div className="flex items-center justify-center h-[200px]">
                  <p className="text-muted-foreground text-sm">No pending payments</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="paid" className="m-0">
              {invoices.filter((i) => i.status === "paid").length > 0 ? (
                <GenericTable
                  data={invoices.filter((i) => i.status === "paid")}
                  columns={(isMobile ? mobileInvoiceColumns : invoiceColumns).filter((col) => !col.meta?.hideColumn)}
                  className="border-none"
                />
              ) : (
                <div className="flex items-center justify-center h-[200px]">
                  <p className="text-muted-foreground text-sm">No paid invoices</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="overdue" className="m-0">
              {invoices.filter((i) => i.status === "overdue").length > 0 ? (
                <GenericTable
                  data={invoices.filter((i) => i.status === "overdue")}
                  columns={(isMobile ? mobileInvoiceColumns : invoiceColumns).filter((col) => !col.meta?.hideColumn)}
                  className="border-none"
                />
              ) : (
                <div className="flex items-center justify-center h-[200px]">
                  <p className="text-muted-foreground text-sm">No overdue payments</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="upcoming" className="m-0">
              {invoices.filter((i) => i.status === "upcoming").length > 0 ? (
                <GenericTable
                  data={invoices.filter((i) => i.status === "upcoming")}
                  columns={(isMobile ? mobileInvoiceColumns : invoiceColumns).filter((col) => !col.meta?.hideColumn)}
                  className="border-none"
                />
              ) : (
                <div className="flex items-center justify-center h-[200px]">
                  <p className="text-muted-foreground text-sm">No upcoming payments</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center w-full">
            <p className="text-xs text-muted-foreground md:text-sm">Showing {invoices.length} subscription payments</p>
          </div>
        </CardFooter>
      </Card>

      {/* Payment Drawer */}
      <PaymentDrawer open={isDrawerOpen} onClose={handleCloseDrawer} payment={editingPayment} />

      {/* Payment Method Drawer */}
      <PaymentDrawer
        open={isMethodDrawerOpen}
        onClose={handleCloseMethodDrawer}
        payment={null}
        paymentMethodOnly={true}
        onSave={handleSavePaymentMethod}
      />
    </div>
  )
}
