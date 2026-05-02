"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useGetMyDoctorFeedback, type Feedback } from "@/api/feedbackApi";

export default function DoctorFeedbackPage() {
  const { data: feedbacks = [], isLoading } = useGetMyDoctorFeedback();
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((feedback) => {
      const matchesSearch = feedback.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           feedback.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           feedback.rating.toString().includes(searchTerm);
      const matchesRating = ratingFilter === "all" || feedback.rating.toString() === ratingFilter;
      return matchesSearch && matchesRating;
    });
  }, [feedbacks, searchTerm, ratingFilter]);

  const averageRating = useMemo(() => {
    if (feedbacks.length === 0) return 0;
    return feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
  }, [feedbacks]);

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

  return (
    <div className="w-full h-full p-6 lg:p-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Patient Feedback</h1>
          <p className="text-muted-foreground mt-1">Reviews and ratings from your patients</p>
        </div>
      </div>

      {isLoading && (
        <p className="text-muted-foreground text-sm">Loading feedback...</p>
      )}

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
                      {feedback.patientName ?? "—"}
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
                    {new Date(feedback.timestamp ?? feedback.createdAt).toLocaleDateString()}
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
                <span>{new Date(selectedFeedback.timestamp ?? selectedFeedback.createdAt).toLocaleDateString()}</span>
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