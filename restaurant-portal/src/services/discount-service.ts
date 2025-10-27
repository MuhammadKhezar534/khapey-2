import { v4 as uuidv4 } from "uuid"
import type { Discount, LoyaltyDiscount, PercentageDealDiscount, BankDiscount } from "@/types/discounts"

// Initial discount data
const initialDiscounts: Discount[] = [
  // Loyalty Discount - Percentage Type (Active)
  {
    id: "loyalty-1",
    type: "loyalty",
    loyaltyType: "percentage",
    name: "Regular Customer Rewards",
    description: "Earn discounts based on how long you've been our customer",
    totalUsage: 42,
    totalAmount: 12600,
    averageDiscount: 300,
    createdAt: "2023-10-15T10:30:00Z",
    updatedAt: "2023-11-01T14:20:00Z",
    lastUsed: "2023-12-10T14:22:00Z",
    status: "active",
    createdBy: "Muhammad Ali",
    branch: "Gulberg, DHA Phase 5",
    branches: ["Gulberg", "DHA Phase 5"],
    applyToAllBranches: false,
    isAlwaysActive: false,
    startDate: "2023-10-15",
    endDate: "2024-10-15",
    isAllDay: true,
    forKhapeyUsersOnly: true,
    percentageRanges: [
      { minDays: 30, maxDays: 60, percentage: 5 },
      { minDays: 61, maxDays: 120, percentage: 10 },
      { minDays: 121, maxDays: 365, percentage: 15 },
    ],
    maximumAmount: 1000,
  },
  // Loyalty Discount - Fixed Type (Inactive)
  {
    id: "loyalty-2",
    type: "loyalty",
    loyaltyType: "fixed",
    name: "VIP Member Benefits",
    description: "Special fixed discounts for our loyal members",
    totalUsage: 28,
    totalAmount: 14000,
    averageDiscount: 500,
    createdAt: "2023-09-05T08:15:00Z",
    updatedAt: "2023-09-05T08:15:00Z",
    lastUsed: "2023-12-09T18:45:00Z",
    status: "inactive",
    createdBy: "Fatima Khan",
    branch: "All Branches",
    branches: [],
    applyToAllBranches: true,
    isAlwaysActive: true,
    forKhapeyUsersOnly: false,
    fixedRanges: [
      { minDays: 30, maxDays: 90, label: "Silver", price: 200 },
      { minDays: 91, maxDays: 180, label: "Gold", price: 500 },
      { minDays: 181, maxDays: 365, label: "Platinum", price: 1000 },
    ],
  },
  // Percentage Deal Discount - Active
  {
    id: "percent-1",
    type: "percentageDeal",
    title: "Weekend Special",
    description: "Get 20% off on all menu items during weekends",
    totalUsage: 87,
    totalAmount: 26100,
    averageDiscount: 300,
    createdAt: "2023-11-10T09:45:00Z",
    updatedAt: "2023-11-10T09:45:00Z",
    lastUsed: "2023-12-10T20:10:00Z",
    status: "active",
    createdBy: "Ahmed Hassan",
    branch: "Gulberg, Johar Town",
    branches: ["Gulberg", "Johar Town"],
    applyToAllBranches: false,
    isAlwaysActive: false,
    startDate: "2023-11-10",
    endDate: "2024-01-31",
    isAllDay: false,
    startTime: "17:00",
    endTime: "22:00",
    isAllWeek: false,
    daysOfWeek: ["friday", "saturday", "sunday"],
    forKhapeyUsersOnly: false,
    percentage: 20,
    maxAmount: 500,
  },
  // Percentage Deal Discount - Inactive
  {
    id: "percent-2",
    type: "percentageDeal",
    title: "Happy Hour Discount",
    description: "15% off on all beverages during happy hours",
    totalUsage: 64,
    totalAmount: 12800,
    averageDiscount: 200,
    createdAt: "2023-08-20T11:30:00Z",
    updatedAt: "2023-10-05T16:45:00Z",
    lastUsed: "2023-12-11T19:45:00Z",
    status: "inactive",
    createdBy: "Zainab Malik",
    branch: "All Branches",
    branches: [],
    applyToAllBranches: true,
    isAlwaysActive: false,
    startDate: "2023-08-20",
    endDate: "2023-12-31",
    isAllDay: false,
    startTime: "16:00",
    endTime: "19:00",
    isAllWeek: true,
    forKhapeyUsersOnly: false,
    percentage: 15,
    maxAmount: 300,
  },
  // Fixed Price Deal - Active
  {
    id: "fixed-1",
    type: "fixedPriceDeal",
    name: "Lunch Combo Deals",
    description: "Special fixed price lunch combos",
    totalUsage: 112,
    totalAmount: 33600,
    averageDiscount: 300,
    createdAt: "2023-11-25T13:20:00Z",
    updatedAt: "2023-11-25T13:20:00Z",
    lastUsed: "2023-12-11T13:20:00Z",
    status: "active",
    createdBy: "Imran Ahmed",
    branch: "MM Alam Road",
    branches: ["MM Alam Road"],
    applyToAllBranches: false,
    isAlwaysActive: false,
    startDate: "2023-11-25",
    endDate: "2024-02-28",
    isAllDay: false,
    startTime: "11:00",
    endTime: "15:00",
    isAllWeek: true,
    forKhapeyUsersOnly: false,
    prices: [
      { id: "combo-1", label: "Lunch Combo A", price: 599, image: null },
      { id: "combo-2", label: "Lunch Combo B", price: 799, image: null },
      { id: "combo-3", label: "Executive Lunch", price: 999, image: null },
    ],
  },
  // Fixed Price Deal - Active (Upcoming)
  {
    id: "fixed-2",
    type: "fixedPriceDeal",
    name: "Holiday Special Menu",
    description: "Fixed price holiday specials coming soon",
    totalUsage: 45,
    totalAmount: 22500,
    averageDiscount: 500,
    createdAt: "2023-11-01T10:00:00Z",
    updatedAt: "2023-11-01T10:00:00Z",
    lastUsed: "2023-12-09T19:15:00Z",
    status: "active",
    createdBy: "Ayesha Siddiqui",
    branch: "All Branches",
    branches: [],
    applyToAllBranches: true,
    isAlwaysActive: false,
    startDate: "2023-12-15",
    endDate: "2024-01-15",
    isAllDay: true,
    isAllWeek: true,
    forKhapeyUsersOnly: false,
    prices: [
      { id: "holiday-1", label: "Holiday Feast", price: 1499, image: null },
      { id: "holiday-2", label: "Family Package", price: 2499, image: null },
    ],
  },
  // Bank Discount - Active
  {
    id: "bank-1",
    type: "bankDiscount",
    title: "HBL Card Offer",
    description: "Special discount for HBL card holders",
    totalUsage: 53,
    totalAmount: 15900,
    averageDiscount: 300,
    createdAt: "2023-10-10T14:30:00Z",
    updatedAt: "2023-10-10T14:30:00Z",
    lastUsed: "2023-12-10T21:05:00Z",
    status: "active",
    createdBy: "Usman Khan",
    branch: "Gulberg, DHA Phase 5, Johar Town",
    branches: ["Gulberg", "DHA Phase 5", "Johar Town"],
    applyToAllBranches: false,
    isAlwaysActive: false,
    startDate: "2023-10-10",
    endDate: "2024-04-10",
    isAllDay: true,
    isAllWeek: true,
    forKhapeyUsersOnly: false,
    discountPercentage: 15,
    maxAmount: 1000,
    bankCards: [{ bankId: "hbl-1", bankName: "HBL" }],
  },
  // Bank Discount - Active
  {
    id: "bank-2",
    type: "bankDiscount",
    title: "MCB Weekend Offer",
    description: "Special weekend discount for MCB card holders",
    totalUsage: 38,
    totalAmount: 11400,
    averageDiscount: 300,
    createdAt: "2023-08-25T09:15:00Z",
    updatedAt: "2023-08-25T09:15:00Z",
    lastUsed: "2023-12-10T18:30:00Z",
    status: "active",
    createdBy: "Saima Rashid",
    branch: "All Branches",
    branches: [],
    applyToAllBranches: true,
    isAlwaysActive: false,
    startDate: "2023-08-25",
    endDate: "2024-02-25",
    isAllDay: true,
    isAllWeek: false,
    daysOfWeek: ["Friday", "Saturday", "Sunday"],
    forKhapeyUsersOnly: false,
    discountPercentage: 10,
    maxAmount: 750,
    bankCards: [{ bankId: "mcb-1", bankName: "MCB" }],
  },
  // Loyalty Discount - Referral Type (Active)
  {
    id: "loyalty-3",
    type: "loyalty",
    name: "Friend Referral Rewards",
    description: "Earn special rewards when you refer a friend or when you're referred by someone",
    status: "active",
    branches: ["Gulberg", "DHA Phase 5"],
    applyToAllBranches: false,
    createdAt: "2023-10-15T10:30:00Z",
    updatedAt: "2023-11-01T14:20:00Z",
    lastUsed: "2023-12-08T16:45:00Z",
    totalUsage: 31,
    totalAmount: 9300,
    averageDiscount: 300,
    loyaltyType: "referral",
    referringUser: {
      discountType: "percentage",
      percentage: 15,
      amount: 200,
    },
    referredUser: {
      discountType: "percentage",
      percentage: 10,
      amount: 150,
    },
    referralMaximumAmount: 500,
    image: "/placeholder.svg?height=200&width=300",
  },
]

// Store for discount applications
interface DiscountApplication {
  id: string
  discountId: string
  timestamp: string
  customerName: string
  customerPhone: string
  orderId: string
  branch: string
  orderAmount: number
  discountAmount: number
  server: string
  time: string
  bankCard?: string
}

// Initial applications data
const discountApplications: DiscountApplication[] = []

// Generate initial applications data
const generateInitialApplications = () => {
  const branches = ["Gulberg", "DHA Phase 5", "Johar Town", "MM Alam Road", "Bahria Town"]
  const customerNames = [
    "Ali Ahmed",
    "Fatima Khan",
    "Hassan Malik",
    "Ayesha Siddiqui",
    "Usman Qureshi",
    "Sana Javed",
    "Bilal Mahmood",
    "Zara Iqbal",
    "Omar Farooq",
    "Hira Shahid",
  ]
  const servers = ["Muhammad Ali", "Fatima Khan", "Ahmed Hassan", "Zainab Malik", "Imran Ahmed", "Ayesha Siddiqui"]
  const bankCardTypes = {
    HBL: ["HBL Platinum Card", "HBL Gold Card", "HBL Classic Card", "HBL Titanium Card", "HBL Premier Card"],
    MCB: ["MCB Visa Gold", "MCB Mastercard Platinum", "MCB World Elite", "MCB Titanium Debit", "MCB Premier Debit"],
  }

  // For each discount, generate some applications
  initialDiscounts.forEach((discount) => {
    const count = 5 + Math.floor(Math.random() * 10) // 5-15 applications per discount

    for (let i = 0; i < count; i++) {
      const date = new Date()
      date.setDate(date.getDate() - Math.floor(Math.random() * 30)) // Last 30 days

      const orderAmount = 1000 + Math.floor(Math.random() * 5000)
      let discountAmount = 0

      if (discount.type === "percentageDeal") {
        discountAmount = Math.floor(orderAmount * ((discount as PercentageDealDiscount).percentage / 100))
      } else if (discount.type === "fixedPriceDeal") {
        discountAmount = 300 + Math.floor(Math.random() * 700)
      } else if (discount.type === "bankDiscount") {
        discountAmount = Math.floor(orderAmount * ((discount as BankDiscount).discountPercentage / 100))
      } else if (discount.type === "loyalty") {
        if ((discount as LoyaltyDiscount).loyaltyType === "percentage") {
          discountAmount = Math.floor(orderAmount * 0.15) // Assume 15% discount
        } else {
          discountAmount = 200 + Math.floor(Math.random() * 800)
        }
      }

      // Cap discount amount if there's a maximum
      if (discount.type === "percentageDeal" && (discount as PercentageDealDiscount).maxAmount) {
        discountAmount = Math.min(discountAmount, (discount as PercentageDealDiscount).maxAmount || 0)
      } else if (discount.type === "bankDiscount" && (discount as BankDiscount).maxAmount) {
        discountAmount = Math.min(discountAmount, (discount as BankDiscount).maxAmount || 0)
      } else if (discount.type === "loyalty" && (discount as LoyaltyDiscount).maximumAmount) {
        discountAmount = Math.min(discountAmount, (discount as LoyaltyDiscount).maximumAmount || 0)
      }

      // Select branch
      let branch = ""
      if (discount.applyToAllBranches) {
        branch = branches[Math.floor(Math.random() * branches.length)]
      } else if (discount.branches && discount.branches.length > 0) {
        branch = discount.branches[Math.floor(Math.random() * discount.branches.length)]
      } else {
        branch = branches[Math.floor(Math.random() * branches.length)]
      }

      const application: DiscountApplication = {
        id: `${discount.id}-app-${i + 1}`,
        discountId: discount.id,
        timestamp: date.toISOString(),
        customerName: customerNames[Math.floor(Math.random() * customerNames.length)],
        customerPhone: `+92 ${Math.floor(300 + Math.random() * 100)}-${Math.floor(1000000 + Math.random() * 900000)}`,
        orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        branch,
        orderAmount,
        discountAmount,
        server: servers[Math.floor(Math.random() * servers.length)],
        time: new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "numeric", hour12: true }).format(date),
      }

      // Add bank card info for bank discounts
      if (discount.type === "bankDiscount") {
        const bankName = (discount as BankDiscount).bankCards?.[0]?.bankName || "HBL"
        const cardTypes = bankCardTypes[bankName as keyof typeof bankCardTypes] || bankCardTypes.HBL
        application.bankCard = cardTypes[Math.floor(Math.random() * cardTypes.length)]
      }

      discountApplications.push(application)
    }
  })
}

// Generate initial applications
generateInitialApplications()

// Discount Service
class DiscountService {
  private static instance: DiscountService
  private discounts: Discount[] = [...initialDiscounts]
  private applications: DiscountApplication[] = [...discountApplications]
  private listeners: (() => void)[] = []

  private constructor() {}

  public static getInstance(): DiscountService {
    if (!DiscountService.instance) {
      DiscountService.instance = new DiscountService()
    }
    return DiscountService.instance
  }

  // Subscribe to changes
  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  // Notify all listeners
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener())
  }

  // Get all discounts
  public getDiscounts(): Discount[] {
    return [...this.discounts]
  }

  // Get discount by ID
  public getDiscountById(id: string): Discount | undefined {
    return this.discounts.find((d) => d.id === id)
  }

  // Create a new discount
  public createDiscount(discount: Discount): Discount {
    const newDiscount = {
      ...discount,
      id: discount.id || `discount-${uuidv4()}`,
      createdAt: discount.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalUsage: discount.totalUsage || 0,
      totalAmount: discount.totalAmount || 0,
      averageDiscount: discount.averageDiscount || 0,
      lastUsed: discount.lastUsed || null,
    }

    // If it's a loyalty discount and active, deactivate other loyalty discounts
    if (discount.type === "loyalty" && discount.status === "active") {
      this.discounts = this.discounts.map((d) =>
        d.type === "loyalty" && d.status === "active"
          ? { ...d, status: "inactive", updatedAt: new Date().toISOString() }
          : d,
      )
    }

    this.discounts.push(newDiscount)
    this.notifyListeners()
    return newDiscount
  }

  // Update an existing discount
  public updateDiscount(id: string, updatedDiscount: Discount): Discount | null {
    const index = this.discounts.findIndex((d) => d.id === id)
    if (index === -1) return null

    // If it's a loyalty discount and being activated, deactivate other loyalty discounts
    if (updatedDiscount.type === "loyalty" && updatedDiscount.status === "active") {
      this.discounts = this.discounts.map((d) =>
        d.type === "loyalty" && d.status === "active" && d.id !== id
          ? { ...d, status: "inactive", updatedAt: new Date().toISOString() }
          : d,
      )
    }

    const discount = {
      ...updatedDiscount,
      updatedAt: new Date().toISOString(),
    }

    this.discounts[index] = discount
    this.notifyListeners()
    return discount
  }

  // Delete a discount
  public deleteDiscount(id: string): boolean {
    const initialLength = this.discounts.length
    this.discounts = this.discounts.filter((d) => d.id !== id)

    if (this.discounts.length !== initialLength) {
      // Also remove all applications for this discount
      this.applications = this.applications.filter((a) => a.discountId !== id)
      this.notifyListeners()
      return true
    }

    return false
  }

  // Get applications for a discount
  public getDiscountApplications(
    discountId: string,
    options?: {
      startDate?: Date
      endDate?: Date
      branch?: string
    },
  ): DiscountApplication[] {
    let applications = this.applications.filter((a) => a.discountId === discountId)

    if (options?.startDate && options?.endDate) {
      applications = applications.filter((app) => {
        const appDate = new Date(app.timestamp)
        return appDate >= options.startDate! && appDate <= options.endDate!
      })
    }

    if (options?.branch && options.branch !== "all") {
      applications = applications.filter((app) => app.branch === options.branch)
    }

    // Sort by date, newest first
    return applications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  // Apply a discount (record a new application)
  public applyDiscount(
    discountId: string,
    applicationData: {
      customerName: string
      customerPhone: string
      branch: string
      orderAmount: number
      discountAmount: number
      server?: string
      bankCard?: string
    },
  ): DiscountApplication | null {
    const discount = this.getDiscountById(discountId)
    if (!discount) return null

    const now = new Date()
    const application: DiscountApplication = {
      id: `app-${uuidv4()}`,
      discountId,
      timestamp: now.toISOString(),
      customerName: applicationData.customerName,
      customerPhone: applicationData.customerPhone,
      orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      branch: applicationData.branch,
      orderAmount: applicationData.orderAmount,
      discountAmount: applicationData.discountAmount,
      server: applicationData.server || "Staff Member",
      time: new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "numeric", hour12: true }).format(now),
      bankCard: applicationData.bankCard,
    }

    this.applications.push(application)

    // Update discount stats
    const discountIndex = this.discounts.findIndex((d) => d.id === discountId)
    if (discountIndex !== -1) {
      const updatedDiscount = { ...this.discounts[discountIndex] }
      updatedDiscount.totalUsage = (updatedDiscount.totalUsage || 0) + 1
      updatedDiscount.totalAmount = (updatedDiscount.totalAmount || 0) + applicationData.discountAmount
      updatedDiscount.averageDiscount = Math.round(updatedDiscount.totalAmount / updatedDiscount.totalUsage)
      updatedDiscount.lastUsed = now.toISOString()
      updatedDiscount.updatedAt = now.toISOString()

      this.discounts[discountIndex] = updatedDiscount
    }

    this.notifyListeners()
    return application
  }
}

export default DiscountService
