import { useState } from "react";
import { Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditReviewButtonProps {
  reviewId: number;
  onEdit: () => void;
}

export default function EditReviewButton({ reviewId, onEdit }: EditReviewButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onEdit}
      title="Edit review"
      className="text-gray-500 hover:bg-gray-50"
    >
      <Edit2 className="h-5 w-5" />
    </Button>
  );
}
