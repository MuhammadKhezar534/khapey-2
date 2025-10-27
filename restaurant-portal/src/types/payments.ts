interface Invoice {
  id: string
  invoiceNumber: string
  amount: number
  status: "draft" | "pending" | "paid" | "overdue"
  dueDate: string
  paidDate: string | null
  recipient: string
  description: string
}

interface PaymentMethod {
  id: string
  type: "card" | "easypaisa" | "jazzcash"
  last4: string
  expiryDate?: string
  brand?: string
  accountName?: string
  isDefault: boolean
}

interface UpcomingPayment {
  id: string
  amount: number
  dueDate: string
  description: string
}
