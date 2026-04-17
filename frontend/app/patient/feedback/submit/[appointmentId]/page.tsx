"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FeedbackForm } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAppointmentById } from "@/api/appointmentApi";
import { useGetMyPatientProfile } from "@/api/patientApi";
import { useSubmitFeedback } from "@/api/feedbackApi";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function SubmitFeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentIdStr = params.appointmentId as string;
  const [submitted, setSubmitted] = useState(false);

  // Get data from URL params or search params
  const doctorId = searchParams.get('doctorId');
  const doctorName = searchParams.get('doctorName');

  const { data: appointment, isLoading: apptLoading } =
    useGetAppointmentById(appointmentIdStr);
  const { data: patient, isLoading: profileLoading } = useGetMyPatientProfile();
  const { mutate: submitFeedback, isPending } = useSubmitFeedback();

  const isLoading = apptLoading || profileLoading;

  const handleSubmit = (rating: number, comment: string) => {
    if (!patient?.id) {
      toast.error("Patient profile not loaded. Please refresh and try again.");
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error("Please provide a rating between 1 and 5 stars.");
      return;
    }

    const finalDoctorId = doctorId ? Number(doctorId) : (appointment ? Number(appointment.doctorId) : null);
    if (!finalDoctorId) {
      toast.error("Doctor information not available. Please try again.");
      return;
    }

    submitFeedback(
      {
        appointmentId: Number(appointmentIdStr),
        doctorId: finalDoctorId,
        rating,
        comment: comment || undefined,
      },
      {
        onSuccess: () => setSubmitted(true),
        onError: (error: any) => {
          toast.error(error?.message || "Failed to submit feedback. Please try again.");
          console.error("Submit feedback error:", error);
        },
      }
    );
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <CardTitle className="text-gray-900">Feedback Submitted!</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Thank you for your feedback. It helps us improve our services.
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

  if (isLoading) {
    return (
      <div className="space-y-4 p-6 max-w-2xl mx-auto">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="p-6">
        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-red-600">
                <p className="font-medium">Appointment not found</p>
                <p className="text-sm mt-1">
                  The appointment you're trying to provide feedback for doesn't exist or has been removed.
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => router.push("/patient/appointments")}
                  variant="outline"
                >
                  View My Appointments
                </Button>
                <Button
                  onClick={() => router.back()}
                  variant="ghost"
                >
                  Go Back
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
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
          <p className="text-gray-600 mt-1">
            Share your experience with {appointment.doctorName}
          </p>
        </div>
      </div>

      <FeedbackForm
        appointmentId={Number(appointmentIdStr)}
        doctorId={doctorId ? Number(doctorId) : Number(appointment.doctorId)}
        doctorName={doctorName || appointment.doctorName}
        onSubmit={handleSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
