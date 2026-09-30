import prisma from "../config/prisma.js";
import { assertAdmin } from "../utils/roleCheckUtils.js";
import type { Activity, Role, VendorProfile } from "@prisma/client";

interface GetAdminDashboardInput {
    role: Role;
}

type PendingVendor = VendorProfile & {
    user: {
        name: string;
        email: string;
    };
};

type ServiceCategory = {
    id: string;
    name: string;
    _count: {
        services: number;
    };
};

export interface AdminDashboard {
    stats: {
        totalUsers: number;
        pendingVerification: number;
        verifiedVendors: number;
        totalServices: number;
    };
    pendingVendors: PendingVendor[];
    recentActivities: Activity[];
    servicesByCategory: ServiceCategory[];
}

export const getAdminDashboard = async (
    { role }: GetAdminDashboardInput
): Promise<AdminDashboard> => {
    assertAdmin(role, "You don't have permission!");

    const [
        totalUsers,
        pendingVerification,
        verifiedVendors,
        totalServices,
        pendingVendors,
        recentActivities,
        servicesByCategory
    ]: [
        number,
        number,
        number,
        number,
        PendingVendor[],
        Activity[],
        ServiceCategory[]
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
            take: 5,
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
