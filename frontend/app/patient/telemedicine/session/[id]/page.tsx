"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WaitingRoom, VideoCall } from "@/components/telemedicine";
import { Video, ArrowLeft, AlertCircle } from "lucide-react";

// Mock data - replace with actual API calls
const mockSessionData = {
  id: "1",
  appointmentId: "APT-001",
  doctorName: "Dr. Sarah Johnson",
  doctorSpecialty: "Cardiology",
  patientName: "John Doe",
  scheduledDate: "2024-01-15",
  scheduledTime: "10:00 AM",
  status: "scheduled",
  duration: 30,
  notes: "Follow-up consultation",
  twilioToken: "mock-token", // This would come from backend
  roomName: "room-APT-001"
};

export default function PatientTelemedicineSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState(mockSessionData);
  const [currentStep, setCurrentStep] = useState<"waiting" | "calling">("waiting");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, fetch session data from API
    // For now, using mock data
    if (sessionId !== "1") {
      setError("Session not found");
    }
  }, [sessionId]);

  const handleJoinCall = async () => {
    setIsLoading(true);
    try {
      // In a real app, get Twilio token from backend
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentStep("calling");
    } catch (err) {
      setError("Failed to join call. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveCall = () => {
    setCurrentStep("waiting");
    // Optionally navigate back to session list
    // router.push("/patient/telemedicine");
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button
                onClick={() => router.push("/patient/telemedicine")}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sessions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === "calling") {
    return (
      <VideoCall
        token={session.twilioToken}
        roomName={session.roomName}
        onLeaveCall={handleLeaveCall}
        userName={session.patientName}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/patient/telemedicine")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Video className="h-6 w-6 text-blue-600" />
                Telemedicine Session
              </h1>
              <p className="text-gray-600 mt-1">
                Session #{session.appointmentId}
              </p>
            </div>
          </div>
          <Badge className="bg-blue-100 text-blue-800">
            {session.status}
          </Badge>
        </div>
      </div>

      {/* Session Info */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Session Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Doctor</label>
                <p className="text-gray-900">{session.doctorName}</p>
                <p className="text-sm text-gray-600">{session.doctorSpecialty}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Date & Time</label>
                <p className="text-gray-900">
                  {session.scheduledDate} at {session.scheduledTime}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Duration</label>
                <p className="text-gray-900">{session.duration} minutes</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Notes</label>
                <p className="text-gray-900">{session.notes}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Waiting Room */}
      <WaitingRoom
        appointmentId={session.appointmentId}
        doctorName={session.doctorName}
        patientName={session.patientName}
        onJoinCall={handleJoinCall}
        isLoading={isLoading}
      />
    </div>
  );
}