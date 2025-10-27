import { redirect } from "next/navigation"

export default function ReportingPage() {
  // This redirects from /reporting to /reporting/discounts
  redirect("/reporting/discounts")
}
