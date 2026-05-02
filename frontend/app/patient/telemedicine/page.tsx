"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SessionCard } from "@/components/telemedicine";
import { Video, Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useGetSessions } from "@/api/telemedicineApi";
import { telemedicineWebSocket, WebSocketMessage } from "@/api/utils/telemedicineWebSocket";

export default function PatientTelemedicinePage() {
  const router = useRouter();
  const { data: sessions = [], isLoading, error, refetch } = useGetSessions();
  const [activeTab, setActiveTab] = useState("active");

  // Transform API data to match SessionCard interface
  const transformedSessions = sessions.map(session => ({
    id: session.id,
    appointmentId: session.appointmentId,
    doctorName: session.doctorName,
    doctorSpecialty: undefined, // Not provided by API
    patientName: session.patientName,
    scheduledDate: new Date(session.scheduledAt).toLocaleDateString(),
    scheduledTime: new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: session.status.toLowerCase(),
    duration: session.duration,
    notes: session.notes,
  }));

  const upcomingSessions = transformedSessions.filter(session => session.status === "scheduled");
  const activeSessions = transformedSessions.filter(session => session.status === "active");
  const completedSessions = transformedSessions.filter(session => session.status === "ended");
  const cancelledSessions = transformedSessions.filter(session => session.status === "cancelled");

  useEffect(() => {
    connectWebSocket();
    return () => { telemedicineWebSocket.disconnect(); };
  }, []);

  useEffect(() => {
    if (activeSessions.length > 0) {
      setActiveTab("active");
    }
  }, [activeSessions.length]);

  const connectWebSocket = async () => {
    try {
      const token = localStorage.getItem('token');
      await telemedicineWebSocket.connect(token || undefined);
      sessions.forEach(session => {
        telemedicineWebSocket.subscribeToSession(session.appointmentId, (msg: WebSocketMessage) => {
          if (msg.type === 'SESSION_STARTED' || msg.type === 'SESSION_ENDED' || msg.type === 'SESSION_STATUS_UPDATE') {
            refetch();
          }
        });
      });
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled": return <Clock className="h-4 w-4" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "cancelled": return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Video className="h-6 w-6 text-blue-600" />
              Telemedicine Sessions
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your virtual consultations and appointments
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule New
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold text-green-600">{activeSessions.length}</p>
              </div>
              <Video className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Sessions</p>
                <p className="text-2xl font-bold text-blue-600">{upcomingSessions.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Sessions</p>
                <p className="text-2xl font-bold text-gray-600">{completedSessions.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
              </div>
              <Video className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Tabs */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Session History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="active" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Active {activeSessions.length > 0 && <span className="ml-1 bg-green-500 text-white rounded-full px-1.5 text-xs">{activeSessions.length}</span>}
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Upcoming ({upcomingSessions.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Completed ({completedSessions.length})
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Cancelled ({cancelledSessions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-6">
              <div className="space-y-4">
                {activeSessions.length > 0 ? (
                  activeSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      userRole="patient"
                      onJoinCall={() => router.push(`/patient/telemedicine/session/${session.appointmentId}`)}
                      onViewDetails={() => console.log("View details for session:", session.id)}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No active sessions</h3>
                    <p className="text-gray-600">Your active video sessions will appear here. You'll be notified when your doctor starts a session.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="upcoming" className="mt-6">
              <div className="space-y-4">
                {upcomingSessions.length > 0 ? (
                  upcomingSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      userRole="patient"
                      onViewDetails={() => console.log("View details for session:", session.id)}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming sessions</h3>
                    <p className="text-gray-600 mb-4">
                      You don't have any scheduled telemedicine sessions.
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Schedule a Session
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              <div className="space-y-4">
                {completedSessions.length > 0 ? (
                  completedSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      userRole="patient"
                      onViewDetails={() => {
                        console.log("View details for session:", session.id);
                      }}
                      onJoinCall={undefined} // Completed sessions can't be joined
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No completed sessions</h3>
                    <p className="text-gray-600">
                      Your completed telemedicine sessions will appear here.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="cancelled" className="mt-6">
              <div className="space-y-4">
                {cancelledSessions.length > 0 ? (
                  cancelledSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      userRole="patient"
                      onViewDetails={() => {
                        console.log("View details for session:", session.id);
                      }}
                      onJoinCall={undefined} // Cancelled sessions can't be joined
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No cancelled sessions</h3>
                    <p className="text-gray-600">
                      Your cancelled telemedicine sessions will appear here.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}