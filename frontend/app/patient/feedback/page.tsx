"use client";

import { useEffect, useState } from "react";
import { FeedbackCard } from "@/components/feedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Feedback {
  id: number;
  rating: number;
  comment?: string;
  timestamp: string;
  doctorName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export default function PatientFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockFeedbacks: Feedback[] = [
        {
          id: 1,
          rating: 5,
          comment: "Excellent service!",
          timestamp: "2024-04-15T10:00:00Z",
          doctorName: "Dr. Smith",
          status: "APPROVED",
        },
        {
          id: 2,
          rating: 4,
          comment: "Good experience overall.",
          timestamp: "2024-04-10T14:30:00Z",
          doctorName: "Dr. Johnson",
          status: "PENDING",
        },
      ];
      setFeedbacks(mockFeedbacks);
    } catch (err) {
      setError("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
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
    <div className="space-y-6 p-6">
      <div>
        <p className="text-gray-600 mt-1">View feedback you've submitted for appointments</p>
      </div>

      {feedbacks.length === 0 ? (
        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-6">
            <p className="text-gray-600">No feedback submitted yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {feedbacks.map((feedback) => (
            <FeedbackCard
              key={feedback.id}
              id={feedback.id}
              rating={feedback.rating}
              comment={feedback.comment}
              timestamp={feedback.timestamp}
              doctorName={feedback.doctorName}
              status={feedback.status}
            />
          ))}
        </div>
      )}
    </div>
  );
}