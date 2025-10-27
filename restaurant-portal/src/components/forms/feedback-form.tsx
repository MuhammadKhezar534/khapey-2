"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"

export function FeedbackForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackType, setFeedbackType] = useState("suggestion")
  const [feedbackText, setFeedbackText] = useState("")
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      })

      // Reset form
      setFeedbackType("suggestion")
      setFeedbackText("")
      setEmail("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Feedback Type</h2>
        <RadioGroup value={feedbackType} onValueChange={setFeedbackType} className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="suggestion" id="suggestion" />
            <Label htmlFor="suggestion">Suggestion</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="issue" id="issue" />
            <Label htmlFor="issue">Report an Issue</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="other" id="other" />
            <Label htmlFor="other">Other</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="feedback">Your Feedback</Label>
        <Textarea
          id="feedback"
          placeholder="Please share your thoughts..."
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          rows={5}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email (optional)</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <p className="text-sm text-gray-500">Provide your email if you'd like us to follow up with you.</p>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Submitting..." : "Submit Feedback"}
      </Button>
    </form>
  )
}
