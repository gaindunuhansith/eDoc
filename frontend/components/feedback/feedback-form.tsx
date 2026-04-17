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
  doctorName?: string;
  onSubmit: (rating: number, comment: string) => void;
  isLoading?: boolean;
}

export function FeedbackForm({ appointmentId, doctorId, doctorName, onSubmit, isLoading }: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [errors, setErrors] = useState<{rating?: string; comment?: string}>({});

  const validateForm = () => {
    const newErrors: {rating?: string; comment?: string} = {};

    if (rating === 0) {
      newErrors.rating = "Please select a rating";
    }

    if (comment.length > 1000) {
      newErrors.comment = "Comment must be less than 1000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
    // Clear rating error when user selects a rating
    if (errors.rating) {
      setErrors({ ...errors, rating: undefined });
    }
  };

  const handleCommentChange = (value: string) => {
    setComment(value);
    // Clear comment error when user types
    if (errors.comment && value.length <= 1000) {
      setErrors({ ...errors, comment: undefined });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
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
        {doctorName && (
          <p className="text-sm text-gray-600 mt-2">
            For: <span className="font-medium">{doctorName}</span>
          </p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-gray-700 font-medium">Rating *</Label>
            <div className="flex gap-1 mt-2">
              {renderStars()}
            </div>
            <p className={`text-sm mt-1 ${errors.rating ? 'text-red-500' : 'text-gray-500'}`}>
              {errors.rating || (rating > 0 ? `You rated ${rating} star${rating > 1 ? "s" : ""}` : "Please select a rating")}
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
              onChange={(e) => handleCommentChange(e.target.value)}
              className={`mt-2 ${errors.comment ? 'border-red-500' : ''}`}
              rows={4}
            />
            <div className="flex justify-between mt-1">
              {errors.comment && (
                <p className="text-sm text-red-500">{errors.comment}</p>
              )}
              <p className="text-sm text-gray-500 ml-auto">
                {comment.length}/1000 characters
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={rating === 0 || isLoading}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting Feedback...
              </>
            ) : (
              "Submit Feedback"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}