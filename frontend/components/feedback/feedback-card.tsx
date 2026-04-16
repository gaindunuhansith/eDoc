"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, User } from "lucide-react";

interface FeedbackCardProps {
  id: number;
  rating: number;
  comment?: string;
  timestamp: string;
  patientName?: string;
  doctorName?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  onApprove?: () => void;
  onReject?: () => void;
}

export function FeedbackCard({
  rating,
  comment,
  timestamp,
  patientName,
  doctorName,
  status,
  onApprove,
  onReject,
}: FeedbackCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-900">
              {patientName || doctorName}
            </span>
          </div>
          <Badge className={getStatusColor(status)}>{status}</Badge>
        </div>
        <div className="flex items-center gap-1 mt-2">
          {renderStars(rating)}
          <span className="text-sm text-gray-600 ml-2">({rating}/5)</span>
        </div>
      </CardHeader>
      <CardContent>
        {comment && (
          <p className="text-gray-700 mb-3">{comment}</p>
        )}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{new Date(timestamp).toLocaleDateString()}</span>
          {onApprove && onReject && status === "PENDING" && (
            <div className="flex gap-2">
              <button
                onClick={onApprove}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
              >
                Approve
              </button>
              <button
                onClick={onReject}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}