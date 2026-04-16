"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Clock, User, Play, Square, Eye } from "lucide-react";

interface Session {
  id: string;
  appointmentId: string;
  doctorName?: string;
  doctorSpecialty?: string;
  patientName?: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  duration: number;
  notes?: string;
}

interface SessionCardProps {
  session: Session;
  userRole: "patient" | "doctor" | "admin";
  onJoinCall?: () => void;
  onViewDetails?: () => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export function SessionCard({
  session,
  userRole,
  onJoinCall,
  onViewDetails,
  onStart,
  onEnd,
}: SessionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "ongoing":
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return <Clock className="h-4 w-4" />;
      case "ongoing":
      case "active":
        return <Video className="h-4 w-4" />;
      case "completed":
        return <Square className="h-4 w-4" />;
      case "cancelled":
        return <Square className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const canJoinCall = () => {
    return session.status === "scheduled" && onJoinCall;
  };

  const canStartCall = () => {
    return userRole === "doctor" && session.status === "scheduled" && onStart;
  };

  const canEndCall = () => {
    return session.status === "ongoing" && onEnd;
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Session #{session.appointmentId}
              </h3>
              <Badge className={getStatusColor(session.status)}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(session.status)}
                  {session.status}
                </div>
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {userRole === "patient" && session.doctorName && (
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4" />
                  <div>
                    <span className="font-medium">Doctor:</span> {session.doctorName}
                    {session.doctorSpecialty && (
                      <span className="text-sm text-gray-500 ml-1">
                        ({session.doctorSpecialty})
                      </span>
                    )}
                  </div>
                </div>
              )}

              {userRole === "doctor" && session.patientName && (
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4" />
                  <div>
                    <span className="font-medium">Patient:</span> {session.patientName}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <div>
                  <span className="font-medium">Date:</span> {session.scheduledDate}
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <div>
                  <span className="font-medium">Time:</span> {session.scheduledTime}
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-600 md:col-span-2">
                <Clock className="h-4 w-4" />
                <div>
                  <span className="font-medium">Duration:</span> {session.duration} minutes
                </div>
              </div>

              {session.notes && (
                <div className="text-gray-600 md:col-span-2">
                  <span className="font-medium">Notes:</span> {session.notes}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t border-gray-100">
          {canJoinCall() && (
            <Button
              onClick={onJoinCall}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Video className="h-4 w-4" />
              Join Call
            </Button>
          )}

          {canStartCall() && (
            <Button
              onClick={onStart}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Start Call
            </Button>
          )}

          {canEndCall() && (
            <Button
              onClick={onEnd}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              End Call
            </Button>
          )}

          {onViewDetails && (
            <Button
              onClick={onViewDetails}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}