"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";

interface Appointment {
  id: number;
  doctorName: string;
  date: string;
  status: "completed" | "upcoming" | "cancelled";
  hasFeedback: boolean;
}

export default function AppointmentsPage() {
  // Mock appointments data
  const appointments: Appointment[] = [
    {
      id: 1,
      doctorName: "Dr. Smith",
      date: "2024-04-15",
      status: "completed",
      hasFeedback: false,
    },
    {
      id: 2,
      doctorName: "Dr. Johnson",
      date: "2024-04-20",
      status: "upcoming",
      hasFeedback: false,
    },
    {
      id: 3,
      doctorName: "Dr. Smith",
      date: "2024-04-10",
      status: "completed",
      hasFeedback: true,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-600 mt-1">View and manage your appointments</p>
      </div>

      <div className="grid gap-4">
        {appointments.map((appointment) => (
          <Card key={appointment.id} className="bg-white border border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-gray-900">
                  Appointment with {appointment.doctorName}
                </CardTitle>
                <Badge className={getStatusColor(appointment.status)}>
                  {appointment.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-gray-600">
                  <p>Date: {new Date(appointment.date).toLocaleDateString()}</p>
                  {appointment.hasFeedback && (
                    <p className="text-sm text-green-600 mt-1">✓ Feedback submitted</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {appointment.status === "completed" && !appointment.hasFeedback && (
                    <Link href={`/patient/feedback/submit/${appointment.id}`}>
                      <Button className="bg-gray-800 hover:bg-gray-700 text-white">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Leave Feedback
                      </Button>
                    </Link>
                  )}
                  {appointment.hasFeedback && (
                    <Link href="/patient/feedback">
                      <Button variant="outline" className="border-gray-300">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        View Feedback
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
