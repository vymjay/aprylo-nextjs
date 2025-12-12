import React from "react"
import { Star, StarHalf } from "lucide-react"

interface StarRatingProps {
  rating: number
  maxStars?: number
}

export default function StarRating({ rating, maxStars = 5 }: StarRatingProps) {
  const stars: React.ReactElement[] = []

  for (let i = 1; i <= maxStars; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<Star key={i} className="text-yellow-400" />)
    } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
      stars.push(<StarHalf key={i} className="text-yellow-400" />)
    } else {
      stars.push(<Star key={i} className="text-gray-300" />)
    }
  }

  return <div className="flex gap-1">{stars}</div>
}