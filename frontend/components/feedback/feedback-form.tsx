"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";

interface FeedbackFormProps {
  appointmentId: number;
  doctorId: number;
  onSubmit: (rating: number, comment: string) => void;
  isLoading?: boolean;
}

export function FeedbackForm({ appointmentId, doctorId, onSubmit, isLoading }: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    onSubmit(rating, comment);
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const starRating = i + 1;
      return (
        <button
          key={i}
          type="button"
          onClick={() => handleStarClick(starRating)}
          onMouseEnter={() => setHoverRating(starRating)}
          onMouseLeave={() => setHoverRating(0)}
          className="focus:outline-none"
        >
          <Star
            className={`h-8 w-8 ${
              starRating <= (hoverRating || rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            } hover:scale-110 transition-transform`}
          />
        </button>
      );
    });
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-gray-900">Leave Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-gray-700 font-medium">Rating *</Label>
            <div className="flex gap-1 mt-2">
              {renderStars()}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {rating > 0 ? `You rated ${rating} star${rating > 1 ? "s" : ""}` : "Please select a rating"}
            </p>
          </div>

          <div>
            <Label htmlFor="comment" className="text-gray-700 font-medium">
              Comment (Optional)
            </Label>
            <Textarea
              id="comment"
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>

          <Button
            type="submit"
            disabled={rating === 0 || isLoading}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white"
          >
            {isLoading ? "Submitting..." : "Submit Feedback"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}