"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SessionCard } from "@/components/telemedicine";
import { Video, Calendar, Clock, CheckCircle, AlertCircle, Play, Square } from "lucide-react";
import { useGetSessions, useStartSession, useEndSession } from "@/api/telemedicineApi";
import { telemedicineWebSocket, WebSocketMessage } from "@/api/utils/telemedicineWebSocket";
import { toast } from "sonner";
import { mockTelemedicineSessions } from "@/lib/fallback";

export default function DoctorTelemedicinePage() {
  const { data: sessions = [], isLoading, error, refetch } = useGetSessions();
  const startSessionMutation = useStartSession();
  const endSessionMutation = useEndSession();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [webSocketConnected, setWebSocketConnected] = useState(false);

  useEffect(() => {
    connectWebSocket();

    return () => {
      telemedicineWebSocket.disconnect();
    };
  }, []);

  const connectWebSocket = async () => {
    try {
      const token = localStorage.getItem('token');
      await telemedicineWebSocket.connect(token || undefined);
      setWebSocketConnected(true);

      // Subscribe to all sessions for real-time updates
      sessions.forEach(session => {
        telemedicineWebSocket.subscribeToSession(session.appointmentId, handleWebSocketMessage);
      });
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  };

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    console.log('Doctor page received WebSocket message:', message);

    switch (message.type) {
      case 'SESSION_STARTED':
        toast.success(`Session ${message.appointmentId} has started`);
        refetch(); // Refresh the sessions list
        break;
      case 'SESSION_ENDED':
        toast.info(`Session ${message.appointmentId} has ended`);
        refetch(); // Refresh the sessions list
        break;
      case 'SESSION_STATUS_UPDATE':
        refetch(); // Refresh the sessions list for status updates
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  };
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

  const displayTransformed = sessions.length > 0 ? transformedSessions : mockTelemedicineSessions;

  const upcomingSessions = displayTransformed.filter(session => session.status === "scheduled");
  const completedSessions = displayTransformed.filter(session => session.status === "ended");
  const cancelledSessions = displayTransformed.filter(session => session.status === "cancelled");
  const ongoingSessions = displayTransformed.filter(session => session.status === "active");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "ongoing": return "bg-green-100 text-green-800";
      case "completed": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled": return <Clock className="h-4 w-4" />;
      case "ongoing": return <Video className="h-4 w-4" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "cancelled": return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const handleStartSession = async (appointmentId: string) => {
    try {
      await startSessionMutation.mutateAsync(appointmentId);
      toast.success("Session started successfully");
      refetch(); // Refresh the sessions list
    } catch (error) {
      toast.error("Failed to start session");
      console.error("Error starting session:", error);
    }
  };

  const handleEndSession = async (appointmentId: string) => {
    try {
      await endSessionMutation.mutateAsync(appointmentId);
      toast.success("Session ended successfully");
      refetch(); // Refresh the sessions list
    } catch (error) {
      toast.error("Failed to end session");
      console.error("Error ending session:", error);
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
              Manage your virtual consultations and patient sessions
            </p>
          </div>
          <div className="flex gap-3">
            <Badge className={webSocketConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              {webSocketConnected ? "Real-time Connected" : "Real-time Disconnected"}
            </Badge>
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
                <p className="text-sm font-medium text-gray-600">Ongoing Sessions</p>
                <p className="text-2xl font-bold text-green-600">{ongoingSessions.length}</p>
              </div>
              <Video className="h-8 w-8 text-green-600" />
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
              <CheckCircle className="h-8 w-8 text-gray-600" />
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
          <CardTitle className="text-gray-900">Session Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="upcoming" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Upcoming ({upcomingSessions.length})
              </TabsTrigger>
              <TabsTrigger value="ongoing" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Ongoing ({ongoingSessions.length})
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

            <TabsContent value="upcoming" className="mt-6">
              <div className="space-y-4">
                {upcomingSessions.length > 0 ? (
                  upcomingSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      userRole="doctor"
                      onStart={() => handleStartSession(session.appointmentId)}
                      onViewDetails={() => {
                        console.log("View details for session:", session.id);
                      }}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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

            <TabsContent value="ongoing" className="mt-6">
              <div className="space-y-4">
                {ongoingSessions.length > 0 ? (
                  ongoingSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      userRole="doctor"
                      onJoinCall={() => {
                        // Navigate to video call page
                        window.location.href = `/doctor/telemedicine/session/${session.appointmentId}`;
                      }}
                      onEnd={() => handleEndSession(session.appointmentId)}
                      onViewDetails={() => {
                        console.log("View details for session:", session.id);
                      }}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No ongoing sessions</h3>
                    <p className="text-gray-600">
                      Your active telemedicine sessions will appear here.
                    </p>
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
                      userRole="doctor"
                      onViewDetails={() => {
                        console.log("View details for session:", session.id);
                      }}
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
                      userRole="doctor"
                      onViewDetails={() => {
                        console.log("View details for session:", session.id);
                      }}
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