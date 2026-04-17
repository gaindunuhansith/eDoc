"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Star,
  Filter
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
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Mock data for feedback
const mockFeedbacks = [
  {
    id: 1,
    patientId: 1,
    doctorId: 101,
    appointmentId: 201,
    rating: 5,
    comment: "Excellent service! The doctor was very professional and caring.",
    timestamp: "2024-04-15T10:30:00Z",
    status: "APPROVED",
  },
  {
    id: 2,
    patientId: 1,
    doctorId: 102,
    appointmentId: 202,
    rating: 4,
    comment: "Good consultation, but waiting time was a bit long.",
    timestamp: "2024-04-12T14:15:00Z",
    status: "APPROVED",
  },
  {
    id: 3,
    patientId: 1,
    doctorId: 103,
    appointmentId: 203,
    rating: 3,
    comment: "Average experience. Could be better.",
    timestamp: "2024-04-10T09:00:00Z",
    status: "PENDING",
  },
  {
    id: 4,
    patientId: 1,
    doctorId: 104,
    appointmentId: 204,
    rating: 5,
    comment: "Outstanding care! Highly recommend.",
    timestamp: "2024-04-08T11:45:00Z",
    status: "APPROVED",
  },
  {
    id: 5,
    patientId: 1,
    doctorId: 105,
    appointmentId: 205,
    rating: 2,
    comment: "Not satisfied with the service.",
    timestamp: "2024-04-05T16:30:00Z",
    status: "REJECTED",
  },
];

interface FeedbackFormData {
  rating: number;
  comment: string;
}

export default function PatientFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState(mockFeedbacks);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<typeof mockFeedbacks[0] | null>(null);
  const [formData, setFormData] = useState<FeedbackFormData>({
    rating: 5,
    comment: "",
  });

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((feedback) => {
      const matchesSearch = feedback.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           feedback.rating.toString().includes(searchTerm);
      const matchesStatus = statusFilter === "all" || feedback.status === statusFilter;
      const matchesRating = ratingFilter === "all" || feedback.rating.toString() === ratingFilter;
      return matchesSearch && matchesStatus && matchesRating;
    });
  }, [feedbacks, searchTerm, statusFilter, ratingFilter]);

  const handleCreate = () => {
    const newFeedback = {
      id: Math.max(...feedbacks.map(f => f.id)) + 1,
      patientId: 1,
      doctorId: 106,
      appointmentId: 206,
      rating: formData.rating,
      comment: formData.comment,
      timestamp: new Date().toISOString(),
      status: "PENDING" as const,
    };
    setFeedbacks([...feedbacks, newFeedback]);
    setFormData({ rating: 5, comment: "" });
    setIsCreateDialogOpen(false);
  };

  const handleUpdate = () => {
    if (!editingFeedback) return;
    setFeedbacks(feedbacks.map(f =>
      f.id === editingFeedback.id
        ? { ...f, rating: formData.rating, comment: formData.comment }
        : f
    ));
    setEditingFeedback(null);
    setFormData({ rating: 5, comment: "" });
  };

  const handleDelete = (id: number) => {
    setFeedbacks(feedbacks.filter(f => f.id !== id));
  };

  const openEditDialog = (feedback: typeof mockFeedbacks[0]) => {
    setEditingFeedback(feedback);
    setFormData({ rating: feedback.rating, comment: feedback.comment || "" });
  };

  const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
          interactive && "cursor-pointer hover:text-yellow-400"
        )}
        onClick={interactive && onChange ? () => onChange(i + 1) : undefined}
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

  return (
    <div className="w-full h-full p-6 lg:p-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">My Feedback</h1>
          <p className="text-muted-foreground mt-1">Manage your feedback history</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Feedback
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Feedback</DialogTitle>
              <DialogDescription>
                Share your experience with a recent appointment.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rating" className="text-right">
                  Rating
                </Label>
                <div className="col-span-3 flex gap-1">
                  {renderStars(formData.rating, true, (rating) => setFormData({ ...formData, rating }))}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="comment" className="text-right">
                  Comment
                </Label>
                <Textarea
                  id="comment"
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="col-span-3"
                  placeholder="Share your thoughts..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreate}>Submit Feedback</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col space-y-6 w-full">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 w-full">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search feedback..."
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
                      className={cn("font-medium capitalize", getStatusColor(feedback.status))}
                    >
                      {feedback.status.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(feedback)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(feedback.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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

      {/* Edit Dialog */}
      <Dialog open={!!editingFeedback} onOpenChange={(open) => !open && setEditingFeedback(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Feedback</DialogTitle>
            <DialogDescription>
              Update your feedback details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-rating" className="text-right">
                Rating
              </Label>
              <div className="col-span-3 flex gap-1">
                {renderStars(formData.rating, true, (rating) => setFormData({ ...formData, rating }))}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-comment" className="text-right">
                Comment
              </Label>
              <Textarea
                id="edit-comment"
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                className="col-span-3"
                placeholder="Share your thoughts..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleUpdate}>Update Feedback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
