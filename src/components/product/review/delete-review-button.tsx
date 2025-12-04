import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeleteReviewMutation } from "@/hooks/api/use-reviews";

interface DeleteReviewButtonProps {
  reviewId: number;
  productId: number; // Add productId as required prop
  onDelete: () => void;
}

export default function DeleteReviewButton({ reviewId, productId, onDelete }: DeleteReviewButtonProps) {
  const { toast } = useToast();
  const deleteReviewMutation = useDeleteReviewMutation();

  const handleDelete = async () => {
    // Prevent multiple deletions
    if (deleteReviewMutation.isPending) {
      return;
    }

    try {
      await deleteReviewMutation.mutateAsync({ reviewId, productId });

      toast({
        title: "Review deleted",
        description: "Your review was deleted successfully.",
        variant: "default",
      });
      onDelete();
    } catch (error: any) {
      // Only show error if it's not a 404 (review already deleted)
      if (!error.message?.includes('404') && !error.message?.includes('not found')) {
        toast({
          title: "Delete failed",
          description: error instanceof Error ? error.message : "Failed to delete review",
          variant: "destructive",
        });
        console.error("Delete review error:", error);
      } else {
        // Review was already deleted, just update UI
        onDelete();
      }
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={deleteReviewMutation.isPending}
      title="Delete review"
      className="text-red-500 hover:bg-red-50"
    >
      <Trash2 className="h-5 w-5" />
    </Button>
  );
}
