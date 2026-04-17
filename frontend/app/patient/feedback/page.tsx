"use client";

import { FeedbackCard } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMyPatientProfile } from "@/api/patientApi";
import { useGetFeedbackByPatient } from "@/api/feedbackApi";
import { MessageSquarePlus, Star } from "lucide-react";
import Link from "next/link";

export default function PatientFeedbackPage() {
  const { data: patient, isLoading: profileLoading } = useGetMyPatientProfile();
  const patientId = patient?.id ? String(patient.id) : "";

  const {
    data: feedbacks,
    isLoading: feedbackLoading,
    isError,
  } = useGetFeedbackByPatient(patientId);

  const isLoading = profileLoading || (!!patientId && feedbackLoading);

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-6">
            <p className="text-red-600">Failed to load feedback. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalRating = feedbacks?.length
    ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
    : 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 mt-1">Feedback you've submitted for appointments</p>
        </div>
        {feedbacks && feedbacks.length > 0 && (
          <div className="flex items-center gap-1 text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1.5">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{totalRating.toFixed(1)}</span>
            <span className="text-gray-400">avg · {feedbacks.length} review{feedbacks.length !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      {!feedbacks || feedbacks.length === 0 ? (
        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-10 pb-10 flex flex-col items-center gap-3 text-center">
            <MessageSquarePlus className="h-10 w-10 text-gray-300" />
            <p className="text-gray-500 font-medium">No feedback submitted yet</p>
            <p className="text-sm text-gray-400">
              After completing an appointment, you can leave feedback from your appointments page.
            </p>
            <Link href="/patient/appointments">
              <Button variant="outline" className="mt-2">
                View Appointments
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {feedbacks.map((feedback) => (
            <FeedbackCard
              key={feedback.id}
              id={feedback.id}
              rating={feedback.rating}
              comment={feedback.comment}
              timestamp={feedback.timestamp}
              status={feedback.status}
            />
          ))}
        </div>
      )}
    </div>
  );
}
