"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Check, X } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

interface Feedback {
  id: number;
  rating: number;
  comment?: string;
  timestamp: string;
  patientName: string;
  doctorName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

const createColumns = (handleApprove: (id: number) => void, handleReject: (id: number) => void): ColumnDef<Feedback>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="font-medium">#{row.getValue("id")}</div>,
  },
  {
    accessorKey: "patientName",
    header: "Patient",
    cell: ({ row }) => <div className="font-medium">{row.getValue("patientName")}</div>,
  },
  {
    accessorKey: "doctorName",
    header: "Doctor",
    cell: ({ row }) => <div className="font-medium">{row.getValue("doctorName")}</div>,
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => {
      const rating = row.getValue("rating") as number;
      return (
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }`}
            />
          ))}
          <span className="text-sm text-muted-foreground ml-1">({rating}/5)</span>
        </div>
      );
    },
  },
  {
    accessorKey: "comment",
    header: "Comment",
    cell: ({ row }) => {
      const comment = row.getValue("comment") as string;
      return (
        <div className="max-w-xs truncate" title={comment}>
          {comment || "No comment"}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const getStatusColor = (status: string) => {
        switch (status) {
          case "APPROVED":
            return "bg-green-100 text-green-800 hover:bg-green-200";
          case "REJECTED":
            return "bg-red-100 text-red-800 hover:bg-red-200";
          default:
            return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
        }
      };
      return <Badge className={getStatusColor(status)}>{status}</Badge>;
    },
  },
  {
    accessorKey: "timestamp",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("timestamp"));
      return <div className="text-sm text-muted-foreground">{date.toLocaleDateString()}</div>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const feedback = row.original;

      if (feedback.status !== "PENDING") {
        return null;
      }

      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
            onClick={() => handleApprove(feedback.id)}
            title="Approve"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => handleReject(feedback.id)}
            title="Reject"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

export default function AdminFeedbackPage() {
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
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-16 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
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

      {/* Feedback Table */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">All Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={createColumns(handleApprove, handleReject)}
            data={feedbacks}
            searchKey="patientName"
            searchPlaceholder="Search by patient name..."
          />
        </CardContent>
      </Card>
    </div>
  );
}