"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Star } from "lucide-react";

interface Appointment {
  id: number;
  patientName: string;
  date: string;
  status: "completed" | "upcoming" | "cancelled";
  feedbackRating?: number;
}

export default function AppointmentsPage() {
  // Mock appointments data
  const appointments: Appointment[] = [
    {
      id: 1,
      patientName: "John Doe",
      date: "2024-04-15",
      status: "completed",
      feedbackRating: 5,
    },
    {
      id: 2,
      patientName: "Jane Smith",
      date: "2024-04-20",
      status: "upcoming",
    },
    {
      id: 3,
      patientName: "Bob Johnson",
      date: "2024-04-10",
      status: "completed",
      feedbackRating: 4,
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

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <p className="text-gray-600 mt-1">View and manage your appointments</p>
      </div>

      <div className="grid gap-4">
        {appointments.map((appointment) => (
          <Card key={appointment.id} className="bg-white border border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-gray-900">
                  Appointment with {appointment.patientName}
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
                  {appointment.feedbackRating && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm">Feedback:</span>
                      <div className="flex gap-1">
                        {renderStars(appointment.feedbackRating)}
                      </div>
                      <span className="text-sm text-gray-500">({appointment.feedbackRating}/5)</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {appointment.status === "completed" && (
                    <Link href="/doctor/feedback">
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
