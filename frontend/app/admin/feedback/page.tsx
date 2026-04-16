"use client";

import { useEffect, useState } from "react";
import { FeedbackCard } from "@/components/feedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface Feedback {
  id: number;
  rating: number;
  comment?: string;
  timestamp: string;
  patientName: string;
  doctorName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    filterFeedbacks();
  }, [feedbacks, statusFilter]);

  const fetchFeedbacks = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockFeedbacks: Feedback[] = [
        {
          id: 1,
          rating: 5,
          comment: "Excellent service!",
          timestamp: "2024-04-15T10:00:00Z",
          patientName: "John Doe",
          doctorName: "Dr. Smith",
          status: "APPROVED",
        },
        {
          id: 2,
          rating: 4,
          comment: "Good experience overall.",
          timestamp: "2024-04-12T14:30:00Z",
          patientName: "Jane Smith",
          doctorName: "Dr. Johnson",
          status: "PENDING",
        },
        {
          id: 3,
          rating: 2,
          comment: "Not satisfied with the consultation.",
          timestamp: "2024-04-10T09:15:00Z",
          patientName: "Bob Johnson",
          doctorName: "Dr. Smith",
          status: "PENDING",
        },
        {
          id: 4,
          rating: 5,
          comment: "Very professional doctor.",
          timestamp: "2024-04-08T11:45:00Z",
          patientName: "Alice Brown",
          doctorName: "Dr. Johnson",
          status: "REJECTED",
        },
      ];
      setFeedbacks(mockFeedbacks);
    } catch (err) {
      setError("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  const filterFeedbacks = () => {
    if (statusFilter === "ALL") {
      setFilteredFeedbacks(feedbacks);
    } else {
      setFilteredFeedbacks(feedbacks.filter(fb => fb.status === statusFilter));
    }
  };

  const handleApprove = async (id: number) => {
    try {
      // Mock API call
      console.log("Approving feedback:", id);
      setFeedbacks(prev =>
        prev.map(fb => fb.id === id ? { ...fb, status: "APPROVED" as const } : fb)
      );
    } catch (error) {
      console.error("Failed to approve feedback:", error);
    }
  };

  const handleReject = async (id: number) => {
    try {
      // Mock API call
      console.log("Rejecting feedback:", id);
      setFeedbacks(prev =>
        prev.map(fb => fb.id === id ? { ...fb, status: "REJECTED" as const } : fb)
      );
    } catch (error) {
      console.error("Failed to reject feedback:", error);
    }
  };

  const getStatusCounts = () => {
    const counts = { PENDING: 0, APPROVED: 0, REJECTED: 0 };
    feedbacks.forEach(fb => {
      counts[fb.status]++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-16" />
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-white border border-gray-200">
        <CardContent className="pt-6">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Feedback Management</h1>
        <p className="text-gray-600 mt-1">Review and moderate patient feedback</p>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.PENDING}</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.APPROVED}</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Approved</Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.REJECTED}</p>
              </div>
              <Badge className="bg-red-100 text-red-800">Rejected</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Filter Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Feedback</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      {filteredFeedbacks.length === 0 ? (
        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-6">
            <p className="text-gray-600">No feedback found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredFeedbacks.map((feedback) => (
            <FeedbackCard
              key={feedback.id}
              id={feedback.id}
              rating={feedback.rating}
              comment={feedback.comment}
              timestamp={feedback.timestamp}
              patientName={feedback.patientName}
              doctorName={feedback.doctorName}
              status={feedback.status}
              onApprove={feedback.status === "PENDING" ? () => handleApprove(feedback.id) : undefined}
              onReject={feedback.status === "PENDING" ? () => handleReject(feedback.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}