"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WaitingRoom, VideoCall } from "@/components/telemedicine";
import { Video, ArrowLeft, AlertCircle, Play, Square } from "lucide-react";
import { useTelemedicineSession, useStartSession, useEndSession, useGetSessionToken } from "@/api/telemedicineApi";
import { toast } from "sonner";

export default function DoctorTelemedicineSessionPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;

  const { session, token, isLoading, error } = useTelemedicineSession(appointmentId);
  const startSessionMutation = useStartSession();
  const endSessionMutation = useEndSession();
  const [currentStep, setCurrentStep] = useState<"waiting" | "calling">("waiting");

  useEffect(() => {
    if (session?.status === "ACTIVE") {
      setCurrentStep("calling");
    }
  }, [session?.status]);

  const handleStartSession = async () => {
    try {
      await startSessionMutation.mutateAsync(appointmentId);
      toast.success("Session started successfully");
      setCurrentStep("calling");
    } catch (error) {
      toast.error("Failed to start session");
      console.error("Error starting session:", error);
    }
  };

  const handleJoinCall = async () => {
    if (!token) {
      toast.error("Unable to get video call token");
      return;
    }
    setCurrentStep("calling");
  };

  const handleEndSession = async () => {
    try {
      await endSessionMutation.mutateAsync(appointmentId);
      toast.success("Session ended successfully");
      setCurrentStep("waiting");
      router.push("/doctor/telemedicine");
    } catch (error) {
      toast.error("Failed to end session");
      console.error("Error ending session:", error);
    }
  };

  const handleLeaveCall = () => {
    setCurrentStep("waiting");
    // Optionally navigate back to session list
    // router.push("/doctor/telemedicine");
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
              <p className="text-gray-600 mb-4">{error.message || "Session not found"}</p>
              <Button
                onClick={() => router.push("/doctor/telemedicine")}
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

  if (isLoading || !session) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading session...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === "calling") {
    return (
      <VideoCall
        token={token?.token || ""}
        roomName={token?.roomName || session.roomName || `room-${appointmentId}`}
        onLeaveCall={handleLeaveCall}
        userName={session.doctorName}        appointmentId={appointmentId as string}      />
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/doctor/telemedicine")}
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
          <Badge className={
            session.status === "ACTIVE"
              ? "bg-green-100 text-green-800"
              : "bg-blue-100 text-blue-800"
          }>
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
                <label className="text-sm font-medium text-gray-700">Patient</label>
                <p className="text-gray-900">{session.patientName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Date & Time</label>
                <p className="text-gray-900">
                  {new Date(session.scheduledAt).toLocaleDateString()} at {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                <p className="text-gray-900">{session.notes || "No notes provided"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Controls */}
      {session.status === "SCHEDULED" && (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Session Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={handleStartSession}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                {isLoading ? "Starting..." : "Start Session"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Waiting Room or Join Call */}
      {session.status === "SCHEDULED" && (
        <WaitingRoom
          appointmentId={session.appointmentId}
          doctorName={session.doctorName}
          patientName={session.patientName}
          onJoinCall={handleJoinCall}
          isLoading={startSessionMutation.isPending}
        />
      )}

      {/* End Session Button */}
      {session.status === "ACTIVE" && (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <Button
                onClick={handleEndSession}
                disabled={endSessionMutation.isPending}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                {endSessionMutation.isPending ? "Ending..." : "End Session"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}