"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FeedbackForm } from "@/components/feedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function SubmitFeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = parseInt(params.appointmentId as string);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (rating: number, comment: string) => {
    setIsLoading(true);
    try {
      // Mock API call - replace with actual submission
      console.log("Submitting feedback:", { appointmentId, rating, comment });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Feedback Submitted!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Thank you for your feedback. It has been submitted successfully.
            </p>
            <Button
              onClick={() => router.push("/patient/feedback")}
              className="bg-gray-800 hover:bg-gray-700 text-white"
            >
              View My Feedback
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submit Feedback</h1>
          <p className="text-gray-600 mt-1">Share your experience for Appointment #{appointmentId}</p>
        </div>
      </div>

      <FeedbackForm
        appointmentId={appointmentId}
        doctorId={1} // This would come from appointment data
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}