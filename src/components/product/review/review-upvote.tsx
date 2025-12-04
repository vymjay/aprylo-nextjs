import { useEffect, useState } from "react";
import { ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useToggleReviewUpvoteMutation } from "@/hooks/api/use-reviews";

interface ReviewUpvoteProps {
  reviewId: number;
  upvoted: boolean;
  upvotes: number;
  onUpvoteChange: (isUpvoted: boolean) => void;
}

export default function ReviewUpvote({
  reviewId,
  upvoted,
  upvotes,
  onUpvoteChange,
}: ReviewUpvoteProps) {
  const [currentUpvotes, setCurrentUpvotes] = useState(upvotes);
  const [hasUpvoted, setHasUpvoted] = useState(upvoted);
  const { toast } = useToast();
  const toggleUpvoteMutation = useToggleReviewUpvoteMutation()

  // Update state when props change
  useEffect(() => {
    setHasUpvoted(upvoted);
    setCurrentUpvotes(upvotes);
  }, [upvoted, upvotes]);

  const toggleUpvote = async () => {
    if (toggleUpvoteMutation.isPending) return;

    try {
      await toggleUpvoteMutation.mutateAsync({ 
        reviewId, 
        isUpvoted: hasUpvoted 
      })

      const newUpvoteState = !hasUpvoted
      setCurrentUpvotes((prev) => prev + (newUpvoteState ? 1 : -1));
      setHasUpvoted(newUpvoteState);
      onUpvoteChange(newUpvoteState);
      
      toast({
        title: "Success",
        description: newUpvoteState ? "Thanks for your feedback!" : "Upvote removed",
      });
    } catch (error) {
      console.error("Error toggling upvote:", error);
      if (error instanceof Error) {
        if (error.message === "Authentication required") {
          toast({
            variant: "destructive",
            title: "Authentication Required",
            description: "Please log in to vote on reviews.",
          });
        } else if (error.message === "Already upvoted") {
          toast({
            variant: "default",
            title: "Already Voted",
            description: "You've already voted on this review.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update vote. Please try again.",
          });
        }
      }
    }
  };

  return (
    <Badge variant="outline" className="flex items-center gap-1">
      <span>{currentUpvotes}</span>
      <button
        className={`p-1 rounded-full transition-colors ${
          hasUpvoted
            ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
            : "text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-300"
        }`}
        onClick={toggleUpvote}
        title={hasUpvoted ? "Remove helpful vote" : "Mark as helpful"}
        disabled={toggleUpvoteMutation.isPending}
      >
        <ThumbsUp className="h-4 w-4" />
      </button>
    </Badge>
  );
}
