// Build review stats from the vendor reviews already included with the service query.
export const calculateReviewStats = (reviews = []) => {
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