import { assertAdmin } from "../utils/roleCheckUtils";

const getAdminDashboard = async (role) => {
    assertAdmin(role, "You don't have permission!")
    const [
        totalUsers,
        pendingVerification,
        verifiedVendors,
        totalServices,
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

        prisma.activity.findMany({
            orderBy: {
                createdAt: "desc",
            },
            take: 10,
        }),

        prisma.category.findMany({
            _count: {
                service: {
                    where: { isArchived: false },
                }
            },
        })
    ])
}
