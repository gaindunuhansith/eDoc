"use client";

import { useEffect, useState } from "react";
import { FeedbackCard } from "@/components/feedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";

interface Feedback {
  id: number;
  rating: number;
  comment?: string;
  timestamp: string;
  patientName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export default function DoctorFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState(0);

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
          comment: "Dr. Smith was very professional and caring.",
          timestamp: "2024-04-15T10:00:00Z",
          patientName: "John Doe",
          status: "APPROVED",
        },
        {
          id: 2,
          rating: 4,
          comment: "Good consultation, but waiting time was long.",
          timestamp: "2024-04-12T14:30:00Z",
          patientName: "Jane Smith",
          status: "APPROVED",
        },
        {
          id: 3,
          rating: 5,
          comment: "Excellent doctor!",
          timestamp: "2024-04-10T09:15:00Z",
          patientName: "Bob Johnson",
          status: "PENDING",
        },
      ];
      setFeedbacks(mockFeedbacks);

      // Calculate average rating
      const totalRating = mockFeedbacks.reduce((sum, fb) => sum + fb.rating, 0);
      setAverageRating(totalRating / mockFeedbacks.length);
    } catch (err) {
      setError("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24" />
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
        <h1 className="text-2xl font-bold text-gray-900">Patient Feedback</h1>
        <p className="text-gray-600 mt-1">Reviews and ratings from your patients</p>
      </div>

      {/* Average Rating Card */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Average Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {renderStars(Math.round(averageRating))}
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-gray-600">({feedbacks.length} reviews)</span>
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      {feedbacks.length === 0 ? (
        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-6">
            <p className="text-gray-600">No feedback received yet.</p>
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
              patientName={feedback.patientName}
              status={feedback.status}
            />
          ))}
        </div>
      )}
    </div>
  );
}