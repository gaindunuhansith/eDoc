"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Video, User, Calendar, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoCall } from "@/components/telemedicine/video-call";
import { WaitingRoom } from "@/components/telemedicine/waiting-room";

import {
  useGetSessionByAppointmentId,
  useGetSessionToken,
} from "@/api/telemedicineApi";
import { useStore } from "@/store/store";
import { telemedicineWebSocket } from "@/api/utils/telemedicineWebSocket";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  SCHEDULED: { label: "Waiting for Doctor", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  ACTIVE:    { label: "In Progress",        className: "bg-green-100 text-green-800 border-green-200" },
  ENDED:     { label: "Ended",              className: "bg-gray-100 text-gray-700 border-gray-200" },
  CANCELLED: { label: "Cancelled",          className: "bg-red-100 text-red-700 border-red-200" },
};

export default function PatientSessionPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.appointmentId as string;
  const user = useStore((s) => s.user);

  const [isInCall, setIsInCall] = useState(false);

  const {
    data: session,
    isLoading: sessionLoading,
    error: sessionError,
    refetch,
  } = useGetSessionByAppointmentId(appointmentId);

  // Fetch token once session is ACTIVE (or when joining)
  const tokenEnabled = (isInCall || session?.status === "ACTIVE") && !!appointmentId;
  const { data: tokenData, isLoading: tokenLoading } = useGetSessionToken(
    tokenEnabled ? appointmentId : ""
  );

  // Subscribe to WebSocket for real-time updates (doctor starting the session)
  useEffect(() => {
    if (!appointmentId) return;
    let connected = false;

    const connect = async () => {
      try {
        const token = localStorage.getItem("token");
        await telemedicineWebSocket.connect(token || undefined);
        connected = true;
        telemedicineWebSocket.subscribeToSession(appointmentId, (msg) => {
          if (msg.type === "SESSION_STARTED") {
            toast.success("Doctor has started the session! You can now join.");
            refetch();
          } else if (msg.type === "SESSION_ENDED") {
            toast.info("The session has ended.");
            setIsInCall(false);
            refetch();
          }
        });
      } catch {
        // non-critical
      }
    };

    connect();
    return () => {
      if (connected) telemedicineWebSocket.disconnect();
    };
  }, [appointmentId]);

  const handleJoinCall = () => {
    if (!tokenData) {
      toast.error("Unable to get session token. Please try again.");
      return;
    }
    setIsInCall(true);
  };

  const handleLeaveCall = () => {
    setIsInCall(false);
    router.push("/patient/appointments");
  };

  // --- Loading ---
  if (sessionLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // --- Session not yet created ---
  if (sessionError || !session) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => router.push("/patient/appointments")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Appointments
        </Button>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6 flex flex-col items-center gap-3 text-center">
            <AlertCircle className="h-10 w-10 text-yellow-500" />
            <p className="font-semibold text-gray-800">The session hasn&apos;t been set up yet.</p>
            <p className="text-sm text-gray-600">
              Your doctor hasn&apos;t started the telemedicine session. Please check back later or wait for the email notification.
            </p>
            <Button variant="outline" onClick={() => refetch()} className="mt-2">
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusBadge = STATUS_BADGE[session.status] || STATUS_BADGE.SCHEDULED;
  const isEnded = session.status === "ENDED" || session.status === "CANCELLED";

  // --- Active call view ---
  if (isInCall && tokenData) {
    return (
      <VideoCall
        token={tokenData.token}
        roomName={tokenData.roomName}
        appointmentId={appointmentId}
        onLeaveCall={handleLeaveCall}
        userName={user?.name || user?.userId}
      />
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/patient/appointments")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Appointments
        </Button>
        <Badge className={"text-sm " + statusBadge.className}>{statusBadge.label}</Badge>
      </div>

      {/* Session Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Video className="h-5 w-5 text-indigo-600" />
            Video Consultation — Dr. {session.doctorName || "Your Doctor"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <div className="flex flex-wrap gap-6">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-gray-400" />
              Doctor: <strong className="ml-1">Dr. {session.doctorName || "—"}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-gray-400" />
              {new Date(session.scheduledAt).toLocaleDateString("en-US", { dateStyle: "medium" })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-gray-400" />
              {new Date(session.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          {session.notes && (
            <div className="bg-gray-50 p-3 rounded border text-gray-600 italic">
              Reason: {session.notes}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ended state */}
      {isEnded && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="pt-6 text-center text-gray-600 space-y-3">
            <p className="font-semibold">
              This session has {session.status === "CANCELLED" ? "been cancelled" : "ended"}.
            </p>
            <Button variant="outline" onClick={() => router.push("/patient/appointments")}>
              Back to Appointments
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Waiting for doctor to start */}
      {!isEnded && session.status === "SCHEDULED" && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-yellow-400 animate-ping" />
              </div>
            </div>
            <p className="font-semibold text-gray-800">Waiting for your doctor to start the session...</p>
            <p className="text-sm text-gray-500">
              You will receive an email notification and this page will update automatically when the session starts.
            </p>
            <Button variant="outline" onClick={() => refetch()} size="sm">
              Refresh Status
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Session is active — show waiting room to preview camera before joining */}
      {!isEnded && session.status === "ACTIVE" && !isInCall && (
        <>
          <WaitingRoom
            appointmentId={appointmentId}
            doctorName={session.doctorName}
            patientName={session.patientName}
            onJoinCall={handleJoinCall}
            isLoading={tokenLoading}
          />
          <div className="flex justify-center">
            <Button
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 min-w-48 shadow-md"
              onClick={handleJoinCall}
              disabled={tokenLoading || !tokenData}
            >
              <Video className="h-5 w-5 mr-2" />
              {tokenLoading ? "Loading..." : "Join Session"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
