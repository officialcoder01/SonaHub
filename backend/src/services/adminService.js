import prisma from "../config/prisma.js";
import { assertAdmin } from "../utils/roleCheckUtils.js";

export const getAdminDashboard = async ({role}) => {
    assertAdmin(role, "You don't have permission!");

    const [
        totalUsers,
        pendingVerification,
        verifiedVendors,
        totalServices,
        pendingVendors,
        recentActivities,
        servicesByCategory
    ] = await Promise.all([
        prisma.user.count(),

        prisma.vendorProfile.count({
            where: { status: "PENDING" },
        }),

        prisma.vendorProfile.count({
            where: { status: "VERIFIED" },
        }),

        prisma.service.count({
            where: { isArchived: false },
        }),

        prisma.vendorProfile.findMany({
            where: {
                status: "PENDING",
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 5,
        }),

        prisma.activity.findMany({
            orderBy: {
                createdAt: "desc",
            },
            take: 8,
        }),

        prisma.category.findMany({
            include: {
                _count: {
                    select: {
                        services: {
                            where: { isArchived: false },
                        },
                    }
                }
            },
        })
    ]);

    return {
        stats: {
            totalUsers,
            pendingVerification,
            verifiedVendors,
            totalServices,
        },
        pendingVendors,
        recentActivities,
        servicesByCategory: servicesByCategory
            .sort((firstCategory, secondCategory) =>
                secondCategory._count.services - firstCategory._count.services
            )
            .slice(0, 5)
    }
}
