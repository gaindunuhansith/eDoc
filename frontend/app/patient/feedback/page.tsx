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
  Filter,
  Loader2,
  MessageSquare,
  CheckCircle2
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FeedbackErrorBoundary } from "@/components/feedback/error-boundary";
import { useUser } from "@/store/store";
import {
  useGetFeedbackByPatient,
  useSubmitFeedback,
  useUpdateFeedback,
  useDeleteFeedback,
  isFeedbackEditable,
  getEditableUntilLabel,
  type Feedback
} from "@/api/feedbackApi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { mockFeedbacks } from "@/lib/fallback";

interface FeedbackFormData {
  appointmentId?: number;
  doctorId?: number;
  rating: number;
  comment: string;
}

export default function PatientFeedbackPage() {
  return (
    <FeedbackErrorBoundary>
      <PatientFeedbackContent />
    </FeedbackErrorBoundary>
  );
}

function PatientFeedbackContent() {
  const user = useUser();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [formData, setFormData] = useState<FeedbackFormData>({
    rating: 5,
    comment: "",
  });

  // API hooks
  const { data: feedbacks = [], isLoading, error } = useGetFeedbackByPatient(user?.userId || "");
  const submitFeedbackMutation = useSubmitFeedback();
  const updateFeedbackMutation = useUpdateFeedback();
  const deleteFeedbackMutation = useDeleteFeedback();

  const displayFeedbacks = feedbacks.length > 0 ? feedbacks : mockFeedbacks;

  const filteredFeedbacks = useMemo(() => {
    return displayFeedbacks.filter((feedback) => {
      const matchesSearch = feedback.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           feedback.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           feedback.rating.toString().includes(searchTerm);
      const matchesStatus = statusFilter === "all" || feedback.status === statusFilter;
      const matchesRating = ratingFilter === "all" || feedback.rating.toString() === ratingFilter;
      return matchesSearch && matchesStatus && matchesRating;
    });
  }, [displayFeedbacks, searchTerm, statusFilter, ratingFilter]);

  const handleCreate = () => {
    if (!formData.appointmentId || !formData.doctorId) {
      toast.error("Please select an appointment to provide feedback for.");
      return;
    }

    if (formData.rating < 1 || formData.rating > 5) {
      toast.error("Please provide a rating between 1 and 5 stars.");
      return;
    }

    submitFeedbackMutation.mutate(
      {
        appointmentId: formData.appointmentId,
        doctorId: formData.doctorId,
        rating: formData.rating,
        comment: formData.comment || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Feedback submitted successfully!");
          setFormData({ rating: 5, comment: "" });
          setIsCreateDialogOpen(false);
        },
        onError: (error: any) => {
          toast.error(error?.message || "Failed to submit feedback. Please try again.");
          console.error("Submit feedback error:", error);
        },
      }
    );
  };

  const handleUpdate = () => {
    if (!editingFeedback) return;

    if (formData.rating < 1 || formData.rating > 5) {
      toast.error("Please provide a rating between 1 and 5 stars.");
      return;
    }

    updateFeedbackMutation.mutate(
      {
        id: editingFeedback.id.toString(),
        payload: {
          rating: formData.rating,
          comment: formData.comment || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Feedback updated successfully!");
          setEditingFeedback(null);
          setFormData({ rating: 5, comment: "" });
        },
        onError: (error: any) => {
          toast.error(error?.message || "Failed to update feedback. Please try again.");
          console.error("Update feedback error:", error);
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this feedback? This action cannot be undone.")) return;

    deleteFeedbackMutation.mutate(id.toString(), {
      onSuccess: () => {
        toast.success("Feedback deleted successfully!");
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to delete feedback. Please try again.");
        console.error("Delete feedback error:", error);
      },
    });
  };

  const openEditDialog = (feedback: Feedback) => {
    setEditingFeedback(feedback);
    setFormData({
      rating: feedback.rating,
      comment: feedback.comment || "",
    });
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

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-full p-6 lg:p-10 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Error state — still render page with mock data, show non-blocking banner
  if (error && displayFeedbacks.length === 0) {
    return (
      <div className="w-full h-full p-6 lg:p-10 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">My Feedback</h1>
            <p className="text-muted-foreground mt-1">Manage your feedback history</p>
          </div>
        </div>
        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-red-600">
                <p className="font-medium">Failed to load feedback</p>
                <p className="text-sm mt-1">
                  {error?.message || "Please check your connection and try again."}
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  Retry
                </Button>
                <Button
                  onClick={() => router.push("/patient/dashboard")}
                  variant="ghost"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <Label htmlFor="appointmentId" className="text-right">
                  Appointment ID
                </Label>
                <Input
                  id="appointmentId"
                  type="number"
                  value={formData.appointmentId || ""}
                  onChange={(e) => setFormData({ ...formData, appointmentId: Number(e.target.value) })}
                  className="col-span-3"
                  placeholder="Enter appointment ID"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="doctorId" className="text-right">
                  Doctor ID
                </Label>
                <Input
                  id="doctorId"
                  type="number"
                  value={formData.doctorId || ""}
                  onChange={(e) => setFormData({ ...formData, doctorId: Number(e.target.value) })}
                  className="col-span-3"
                  placeholder="Enter doctor ID"
                />
              </div>
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
              <Button
                type="submit"
                onClick={handleCreate}
                disabled={submitFeedbackMutation.isPending}
              >
                {submitFeedbackMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </Button>
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
                    {feedback.doctorName && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Dr. {feedback.doctorName}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="py-4 text-sm text-muted-foreground">
                    {new Date(feedback.createdAt || feedback.timestamp).toLocaleDateString()}
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
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(feedback)}
                          className="h-8 w-8 p-0"
                          disabled={!isFeedbackEditable(feedback)}
                          title={getEditableUntilLabel(feedback)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(feedback.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={!isFeedbackEditable(feedback)}
                          title={getEditableUntilLabel(feedback)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <span className={cn("text-xs", isFeedbackEditable(feedback) ? "text-green-600" : "text-muted-foreground")}>
                        {getEditableUntilLabel(feedback)}
                      </span>
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
              {editingFeedback && (
                <span className={cn("block mt-1 text-xs font-medium", isFeedbackEditable(editingFeedback) ? "text-green-600" : "text-red-500")}>
                  {getEditableUntilLabel(editingFeedback)}
                </span>
              )}
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
            <Button
              type="submit"
              onClick={handleUpdate}
              disabled={updateFeedbackMutation.isPending}
            >
              {updateFeedbackMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Feedback"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Insights */}
      {feedbacks.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Feedback Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border border-gray-200">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">{feedbacks.length}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Rating</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {feedbacks.length > 0
                        ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
                        : "0.0"
                      } ⭐
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approved Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {feedbacks.filter(f => f.status === 'APPROVED').length}
                    </p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rating Distribution */}
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-base font-medium">Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = feedbacks.filter(f => f.rating === rating).length;
                  const percentage = feedbacks.length > 0 ? (count / feedbacks.length) * 100 : 0;
                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <div className="flex items-center gap-1 w-12">
                        <span className="text-sm font-medium">{rating}</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8">{count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
