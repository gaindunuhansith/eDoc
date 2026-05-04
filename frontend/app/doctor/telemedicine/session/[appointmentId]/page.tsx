"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Video, User, Calendar, Clock, PhoneOff, Play } from "lucide-react";
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
  useStartSession,
  useEndSession,
} from "@/api/telemedicineApi";
import { useStore } from "@/store/store";
import { telemedicineWebSocket } from "@/api/utils/telemedicineWebSocket";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  SCHEDULED: { label: "Scheduled", className: "bg-blue-100 text-blue-800 border-blue-200" },
  ACTIVE:    { label: "Active",    className: "bg-green-100 text-green-800 border-green-200" },
  ENDED:     { label: "Ended",     className: "bg-gray-100 text-gray-700 border-gray-200" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-700 border-red-200" },
};

export default function DoctorSessionPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.appointmentId as string;
  const user = useStore((s) => s.user);

  const [isInCall, setIsInCall] = useState(false);

  const { data: session, isLoading: sessionLoading, error: sessionError, refetch } =
    useGetSessionByAppointmentId(appointmentId);

  // Only fetch token when we're about to join
  const { data: tokenData, isLoading: tokenLoading } = useGetSessionToken(
    isInCall || session?.status === "ACTIVE" ? appointmentId : ""
  );

  const startSessionMutation = useStartSession();
  const endSessionMutation = useEndSession();

  // Subscribe to WebSocket for real-time session status updates
  useEffect(() => {
    if (!appointmentId) return;
    let connected = false;

    const connect = async () => {
      try {
        const token = localStorage.getItem("token");
        await telemedicineWebSocket.connect(token || undefined);
        connected = true;
        telemedicineWebSocket.subscribeToSession(appointmentId, (msg) => {
          if (msg.type === "SESSION_ENDED") {
            setIsInCall(false);
            refetch();
          } else if (msg.type === "SESSION_STARTED") {
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

  const handleStartSession = () => {
    startSessionMutation.mutate(appointmentId, {
      onSuccess: () => {
        // Email notification to patient is triggered automatically in backend
        toast.success("Session started — patient has been notified by email");
        setIsInCall(true);
        refetch();
      },
      onError: (err: any) => {
        toast.error(err?.message || "Failed to start session");
      },
    });
  };

  const handleEndSession = () => {
    endSessionMutation.mutate(appointmentId, {
      onSuccess: () => {
        setIsInCall(false);
        refetch();
      },
      onError: (err: any) => {
        toast.error(err?.message || "Failed to end session");
      },
    });
  };

  const handleLeaveCall = () => {
    // Doctor leaving without ending — just go back; call remains active
    router.push("/doctor/appointments");
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

  // --- Error / not found ---
  if (sessionError || !session) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => router.push("/doctor/appointments")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Appointments
        </Button>
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            <p>Session not found for this appointment.</p>
            <p className="text-sm mt-1">Return to appointments and click "Go to Video Session" again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusBadge = STATUS_BADGE[session.status] || STATUS_BADGE.SCHEDULED;

  // --- Active call view ---
  if (isInCall && tokenData) {
    return (
      <div className="relative">
        {/* Floating End Session button */}
        <div className="absolute top-4 right-4 z-50">
          <Button
            variant="destructive"
            onClick={handleEndSession}
            disabled={endSessionMutation.isPending}
            className="shadow-lg"
          >
            <PhoneOff className="h-4 w-4 mr-2" />
            {endSessionMutation.isPending ? "Ending..." : "End Session"}
          </Button>
        </div>
        <VideoCall
          token={tokenData.token}
          roomName={tokenData.roomName}
          appointmentId={appointmentId}
          onLeaveCall={handleLeaveCall}
          userName={user?.name || user?.userId}
        />
      </div>
    );
  }

  // --- Waiting / pre-session view ---
  const isEnded = session.status === "ENDED" || session.status === "CANCELLED";

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/doctor/appointments")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Appointments
        </Button>
        <Badge className={"text-sm " + statusBadge.className}>{statusBadge.label}</Badge>
      </div>

      {/* Session Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Video className="h-5 w-5 text-blue-600" />
            Video Session — {session.patientName || "Patient"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <div className="flex flex-wrap gap-6">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-gray-400" />
              Patient: <strong className="ml-1">{session.patientName || "—"}</strong>
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
          <CardContent className="pt-6 text-center text-gray-600">
            <p className="font-semibold">This session has {session.status === "CANCELLED" ? "been cancelled" : "ended"}.</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push("/doctor/appointments")}>
              Back to Appointments
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Already active but token still loading */}
      {!isEnded && session.status === "ACTIVE" && !isInCall && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6 text-center space-y-3">
            <p className="text-green-700 font-semibold">Session is active.</p>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setIsInCall(true)}
              disabled={tokenLoading || !tokenData}
            >
              <Video className="h-4 w-4 mr-2" />
              {tokenLoading ? "Loading token..." : "Rejoin Session"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Scheduled — show waiting room + Start button */}
      {!isEnded && session.status === "SCHEDULED" && (
        <>
          <WaitingRoom
            appointmentId={appointmentId}
            patientName={session.patientName}
            doctorName={session.doctorName}
            onJoinCall={handleStartSession}
            isLoading={startSessionMutation.isPending}
          />
          <div className="flex justify-center">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 min-w-48 shadow-md"
              onClick={handleStartSession}
              disabled={startSessionMutation.isPending}
            >
              <Play className="h-5 w-5 mr-2" />
              {startSessionMutation.isPending ? "Starting..." : "Start Session"}
            </Button>
          </div>
          <p className="text-center text-sm text-gray-500">
            Patient will receive an email notification to join once you start the session.
          </p>
        </>
      )}
    </div>
  );
}
