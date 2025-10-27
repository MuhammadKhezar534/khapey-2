import { FeedbackForm } from "@/components/forms/feedback-form"

export default function FeedbackPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Feedback</h1>
      </div>

      <div className="max-w-md mx-auto">
        <FeedbackForm />
      </div>
    </div>
  )
}
