// Build review stats from the vendor reviews already included with the service query.
interface Review {
  rating: number;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

export const calculateReviewStats = (reviews: Review[] = []): ReviewStats => {
  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
    };
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);

  return {
    averageRating: Number((totalRating / reviews.length).toFixed(1)),
    totalReviews: reviews.length,
  };
};