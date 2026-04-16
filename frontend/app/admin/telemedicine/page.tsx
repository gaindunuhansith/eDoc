"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SessionCard } from "@/components/telemedicine";
import {
  Video,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Search,
  Filter,
  BarChart3,
  Activity,
  Monitor
} from "lucide-react";

// Mock data - replace with actual API calls
const mockSessions = [
  {
    id: "1",
    appointmentId: "APT-001",
    doctorName: "Dr. Sarah Johnson",
    patientName: "John Doe",
    scheduledDate: "2024-01-15",
    scheduledTime: "10:00 AM",
    status: "scheduled",
    duration: 30,
    notes: "Follow-up consultation"
  },
  {
    id: "2",
    appointmentId: "APT-002",
    doctorName: "Dr. Michael Chen",
    patientName: "Jane Smith",
    scheduledDate: "2024-01-10",
    scheduledTime: "2:30 PM",
    status: "ongoing",
    duration: 25,
    notes: "Skin condition check"
  },
  {
    id: "3",
    appointmentId: "APT-003",
    doctorName: "Dr. Emily Davis",
    patientName: "Mike Johnson",
    scheduledDate: "2024-01-08",
    scheduledTime: "11:15 AM",
    status: "completed",
    duration: 30,
    notes: "Regular checkup"
  },
  {
    id: "4",
    appointmentId: "APT-004",
    doctorName: "Dr. Robert Wilson",
    patientName: "Alice Brown",
    scheduledDate: "2024-01-16",
    scheduledTime: "9:00 AM",
    status: "cancelled",
    duration: 30,
    notes: "Emergency consultation"
  }
];

const mockStats = {
  totalSessions: 156,
  activeSessions: 8,
  completedToday: 23,
  totalDoctors: 12,
  totalPatients: 89,
  averageDuration: 28
};

export default function AdminTelemedicinePage() {
  const [sessions, setSessions] = useState(mockSessions);
  const [stats, setStats] = useState(mockStats);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.appointmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.patientName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || session.status === statusFilter;
    const matchesDoctor = doctorFilter === "all" || session.doctorName === doctorFilter;

    return matchesSearch && matchesStatus && matchesDoctor;
  });

  const upcomingSessions = filteredSessions.filter(session => session.status === "scheduled");
  const ongoingSessions = filteredSessions.filter(session => session.status === "ongoing");
  const completedSessions = filteredSessions.filter(session => session.status === "completed");
  const cancelledSessions = filteredSessions.filter(session => session.status === "cancelled");

  const uniqueDoctors = [...new Set(sessions.map(session => session.doctorName))];

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Monitor className="h-6 w-6 text-blue-600" />
              Telemedicine Administration
            </h1>
            <p className="text-gray-600 mt-1">
              Monitor and manage all telemedicine sessions across the platform
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Generate Report
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule Session
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
              </div>
              <Video className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Now</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeSessions}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completedToday}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Doctors</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalDoctors}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-orange-600">{stats.totalPatients}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.averageDuration}m</p>
              </div>
              <Clock className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search sessions, doctors, or patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={doctorFilter} onValueChange={setDoctorFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by doctor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Doctors</SelectItem>
                {uniqueDoctors.map(doctor => (
                  <SelectItem key={doctor} value={doctor}>{doctor}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Tabs */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Session Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                All ({filteredSessions.length})
              </TabsTrigger>
              <TabsTrigger value="scheduled" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Scheduled ({upcomingSessions.length})
              </TabsTrigger>
              <TabsTrigger value="ongoing" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
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

            <TabsContent value="all" className="mt-6">
              <div className="space-y-4">
                {filteredSessions.length > 0 ? (
                  filteredSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      userRole="admin"
                      onViewDetails={() => {
                        console.log("View details for session:", session.id);
                      }}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
                    <p className="text-gray-600">
                      Try adjusting your search or filter criteria.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="scheduled" className="mt-6">
              <div className="space-y-4">
                {upcomingSessions.length > 0 ? (
                  upcomingSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      userRole="admin"
                      onViewDetails={() => {
                        console.log("View details for session:", session.id);
                      }}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No scheduled sessions</h3>
                    <p className="text-gray-600">
                      All upcoming telemedicine sessions will appear here.
                    </p>
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
                      userRole="admin"
                      onViewDetails={() => {
                        console.log("View details for session:", session.id);
                      }}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No ongoing sessions</h3>
                    <p className="text-gray-600">
                      Active telemedicine sessions will appear here.
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
                      userRole="admin"
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
                      Completed telemedicine sessions will appear here.
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
                      userRole="admin"
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
                      Cancelled telemedicine sessions will appear here.
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