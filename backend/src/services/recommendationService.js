import prisma from '../config/prisma.js';

export const getTopRatedVendors = async () => {
    const reviewStats = await prisma.review.groupBy({
        by: ["vendorId"],
        _avg: {
            rating: true,
        },
        _count: {
            rating: true,
        },
        orderBy: [
            {
                _avg: {
                    rating: "desc",
                },
            },
            {
                _count: {
                    rating: "desc",
                },
            },
        ],
        take: 3,
    });

    const topReviewStats = [...reviewStats]
        .sort((a, b) => {
            const ratingDiff = (b._avg.rating ?? 0) - (a._avg.rating ?? 0);
            if (ratingDiff !== 0) {
                return ratingDiff;
            }

            return (b._count.rating ?? 0) - (a._count.rating ?? 0);
        })
        .slice(0, 3);

    const vendors = await prisma.vendorProfile.findMany({
        where: {
            id: {
                in: topReviewStats.map((r) => r.vendorId),
            },
        },
        select: {
            id: true,
            businessName: true,
            location: true,
            isVerified: true,
            user: {
                select: {
                    name: true,
                },
            },
        },
    });

    const vendorMap = new Map(
        vendors.map((vendor) => [
            vendor.id,
            {
                id: vendor.id,
                businessName: vendor.businessName,
                location: vendor.location,
                isVerified: vendor.isVerified,
                user: vendor.user,
            },
        ])
    );

    return topReviewStats
        .map((stat) => {
            const vendor = vendorMap.get(stat.vendorId);
            if (!vendor) {
                return null;
            }

            return {
                ...vendor,
                averageRating: Number(stat._avg.rating?.toFixed(1) ?? 0),
                reviewCount: stat._count.rating,
            };
        })
        .filter(Boolean);
};