import prisma from '../config/prisma.js';

// Retrieve top-rated vendors based on average rating and number of reviews
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
        having: {
            rating: {
                _count: {
                    gte: 3,
                }
            }
        },
        take: 3,
    });

    const vendors = await prisma.vendorProfile.findMany({
        where: {
            id: {
                in: reviewStats.map((r) => r.vendorId),
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
            _count: {
                select: {
                    bookings: {
                        where: { status: "COMPLETED" }
                    }
                },
            }
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
                completedJobs: vendor._count.bookings
            },
        ])
    );

    return reviewStats
        .slice(0, 3)
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

// retrieve pinned services for a vendor's profile page
export const pinnedServicesForVendor = async (vendorId) => {
    const services = await prisma.service.findMany({
        where: {
            vendorId: vendorId,
            isPinned: true,
            isArchived: false
        },
        include: {
            category: true,
            images: true,
            vendor: {
                select: {
                    businessName: true,
                    location: true,
                },
            },
            _count: {
                select: {
                    reviews: true,
                },
            },
        }
    });

    return Promise.all(
        services.map(async (service) => {
            const aggregate = await prisma.review.aggregate({
                where: { serviceId: service.id },
                _avg: { rating: true },
            });

            const { _count, ...serviceData } = service;

            return {
                ...serviceData,
                averageRating: Number(aggregate._avg.rating?.toFixed(1) ?? 0),
                reviewCount: _count.reviews,
            }
        })
    ); 
};
