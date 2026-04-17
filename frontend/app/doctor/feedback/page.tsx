"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Star,
  Filter,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Mock data for doctor feedback (feedback from patients)
const mockFeedbacks = [
  {
    id: 1,
    patientId: 1,
    patientName: "John Doe",
    appointmentId: 201,
    rating: 5,
    comment: "Dr. Smith was very professional and caring. Excellent service!",
    timestamp: "2024-04-15T10:30:00Z",
    status: "APPROVED",
  },
  {
    id: 2,
    patientId: 2,
    patientName: "Jane Smith",
    appointmentId: 202,
    rating: 4,
    comment: "Good consultation, but waiting time was a bit long.",
    timestamp: "2024-04-12T14:15:00Z",
    status: "APPROVED",
  },
  {
    id: 3,
    patientId: 3,
    patientName: "Bob Johnson",
    appointmentId: 203,
    rating: 3,
    comment: "Average experience. Could be better.",
    timestamp: "2024-04-10T09:00:00Z",
    status: "PENDING",
  },
  {
    id: 4,
    patientId: 4,
    patientName: "Alice Brown",
    appointmentId: 204,
    rating: 5,
    comment: "Outstanding care! Highly recommend.",
    timestamp: "2024-04-08T11:45:00Z",
    status: "APPROVED",
  },
  {
    id: 5,
    patientId: 5,
    patientName: "Charlie Wilson",
    appointmentId: 205,
    rating: 2,
    comment: "Not satisfied with the service.",
    timestamp: "2024-04-05T16:30:00Z",
    status: "REJECTED",
  },
  {
    id: 6,
    patientId: 6,
    patientName: "Diana Davis",
    appointmentId: 206,
    rating: 4,
    comment: "Very knowledgeable doctor. Explained everything clearly.",
    timestamp: "2024-04-03T13:20:00Z",
    status: "APPROVED",
  },
];

export default function DoctorFeedbackPage() {
  const [feedbacks] = useState(mockFeedbacks);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [selectedFeedback, setSelectedFeedback] = useState<typeof mockFeedbacks[0] | null>(null);

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((feedback) => {
      const matchesSearch = feedback.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           feedback.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           feedback.rating.toString().includes(searchTerm);
      const matchesStatus = statusFilter === "all" || feedback.status === statusFilter;
      const matchesRating = ratingFilter === "all" || feedback.rating.toString() === ratingFilter;
      return matchesSearch && matchesStatus && matchesRating;
    });
  }, [feedbacks, searchTerm, statusFilter, ratingFilter]);

  const averageRating = useMemo(() => {
    if (feedbacks.length === 0) return 0;
    return feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
  }, [feedbacks]);

  const handleStatusChange = (feedbackId: number, newStatus: "APPROVED" | "REJECTED") => {
    // In a real app, this would call an API
    console.log(`Changing feedback ${feedbackId} status to ${newStatus}`);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        )}
      />
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-4 w-4" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full h-full p-6 lg:p-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Patient Feedback</h1>
          <p className="text-muted-foreground mt-1">Reviews and ratings from your patients</p>
        </div>
      </div>

      {/* Average Rating Card */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Overall Rating</CardTitle>
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

      <div className="flex flex-col space-y-6 w-full">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 w-full">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search feedback or patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 border-border/60 bg-background hover:border-border transition-colors h-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] border-border/60 bg-background hover:bg-muted/50 transition-colors h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-[140px] border-border/60 bg-background hover:bg-muted/50 transition-colors h-10">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="w-full">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-border/60 bg-muted/20 hover:bg-muted/20">
                <TableHead className="w-12 text-center px-4">
                  <Checkbox className="border-border/60 w-4 h-4" />
                </TableHead>
                <TableHead className="text-muted-foreground font-medium py-4">Patient</TableHead>
                <TableHead className="text-muted-foreground font-medium py-4">Rating</TableHead>
                <TableHead className="text-muted-foreground font-medium py-4">Comment</TableHead>
                <TableHead className="text-muted-foreground font-medium py-4">Date</TableHead>
                <TableHead className="text-muted-foreground font-medium py-4">Status</TableHead>
                <TableHead className="text-muted-foreground font-medium py-4 w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeedbacks.map((feedback) => (
                <TableRow key={feedback.id} className="border-border/60 hover:bg-muted/10 transition-colors group">
                  <TableCell className="text-center px-4">
                    <Checkbox className="border-border/60 w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="font-medium text-foreground">
                      {feedback.patientName}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-1">
                      {renderStars(feedback.rating)}
                      <span className="text-sm text-muted-foreground ml-2">({feedback.rating})</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 max-w-xs">
                    <p className="text-sm text-foreground truncate" title={feedback.comment}>
                      {feedback.comment || "No comment"}
                    </p>
                  </TableCell>
                  <TableCell className="py-4 text-sm text-muted-foreground">
                    {new Date(feedback.timestamp).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge
                      variant="outline"
                      className={cn("font-medium capitalize flex items-center gap-1", getStatusColor(feedback.status))}
                    >
                      {getStatusIcon(feedback.status)}
                      {feedback.status.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFeedback(feedback)}
                        className="h-8 w-8 p-0"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                      {feedback.status === "PENDING" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(feedback.id, "APPROVED")}
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(feedback.id, "REJECTED")}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-border/40">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredFeedbacks.length}</span> of <span className="font-medium text-foreground">{feedbacks.length}</span> feedbacks
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-9 w-9 border-border/60 bg-background hover:bg-muted/50 transition-colors disabled:opacity-50" disabled>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1">
              <Button variant="secondary" size="sm" className="h-9 w-9 p-0 font-medium">1</Button>
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9 border-border/60 bg-background hover:bg-muted/50 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Feedback Detail Dialog */}
      <Dialog open={!!selectedFeedback} onOpenChange={(open) => !open && setSelectedFeedback(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
            <DialogDescription>
              Review from {selectedFeedback?.patientName}
            </DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Patient:</span>
                <span>{selectedFeedback.patientName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Rating:</span>
                <div className="flex items-center gap-1">
                  {renderStars(selectedFeedback.rating)}
                  <span className="ml-2">({selectedFeedback.rating}/5)</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Date:</span>
                <span>{new Date(selectedFeedback.timestamp).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Status:</span>
                <Badge
                  variant="outline"
                  className={cn("font-medium capitalize flex items-center gap-1", getStatusColor(selectedFeedback.status))}
                >
                  {getStatusIcon(selectedFeedback.status)}
                  {selectedFeedback.status.toLowerCase()}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Comment:</span>
                <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded">
                  {selectedFeedback.comment || "No comment provided"}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedFeedback(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}