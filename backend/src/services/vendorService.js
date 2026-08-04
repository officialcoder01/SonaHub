import prisma from "../config/prisma.js";
import { calculateReviewStats } from "../utils/ratingUtils.js";
import { assertVendor } from "../utils/roleCheckUtils.js";

// Create a vendor profile for 
// the authenticated user (private endpoint for vendors only)
export const createVendorProfile = async ({
  userId,
  role,
  businessName,
  bio,
  location,
}) => {
  assertVendor(role, "Only vendors can create a vendor profile");

  const existingProfile = await prisma.vendorProfile.findUnique({
    where: { userId },
  });

  if (existingProfile) {
    const error = new Error("Vendor profile already exists");
    error.status = 409;
    throw error;
  }

  return prisma.vendorProfile.create({
    data: {
      userId,
      businessName,
      bio,
      location,
    },
  });
};

// Retrieve vendor profile by user ID (private endpoint for vendors only)
export const getVendorProfileByUserId = async (userId, role) => {
  assertVendor(role, "Only vendors can access their vendor profile");

  // 1. Fetch vendor data and basic counts directly from DB
  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId },
    include: {
      services: {
        where: { isArchived: false },
      },
      reviews: true, // Kept to calculate vendorReviewStat metrics
      _count: {
        select: {
          services: { where: { isArchived: false } },
          bookings: true,
        },
      },
    },
  });

  if (!vendor) {
    const error = new Error("Vendor not found");
    error.status = 404;
    throw error;
  }

  // 2. Fetch specific booking status counts efficiently in parallel
  const statusCounts = await prisma.booking.groupBy({
    by: ["status"],
    where: { vendorId: vendor.id, status: { in: ["COMPLETED", "PENDING"] } },
    _count: { status: true },
  });

  // 3. Map the database aggregation results array into a clean key-value object
  const countsMap = statusCounts.reduce((acc, curr) => {
    acc[curr.status] = curr._count.status;
    return acc;
  }, { COMPLETED: 0, PENDING: 0 });

  // 4. Extract data and compute review statistics
  const { _count, reviews, ...vendorData } = vendor;
  const vendorReviewStat = calculateReviewStats(reviews);

  // 5. Return clean structured payload without data bloat
  return {
    ...vendorData,
    reviews,
    servicesCount: _count.services,
    totalBookingsCount: _count.bookings,
    completedBookingsCount: countsMap.COMPLETED,
    pendingBookingsCount: countsMap.PENDING,
    reviewStats: vendorReviewStat,
  };
};

// Retrieve vendor profile by vendor ID for public vendor profile page
export const getVendorProfileByVendorId = async (vendorId) => {
  const vendor = await prisma.vendorProfile.findUnique({
    where: { id: vendorId },
    include: {
      user: {
        select: {
          name: true,
        }
      },
      services: {
        where: {
          isArchived: false,
        },
        include: {
          images: true,
          category: true,
          reviews: true,
          vendor: {
            select: {
              businessName: true,
              location: true,
            }
          }
        }
      },
      reviews: {
        include: {
          user: {
            select: {
              name: true,
            }
          }
        }
      },
    }
  })

  if (!vendor) {
    const error = new Error("Vendor not found");
    error.status = 404;
    throw error;
  }

  const vendorReviewStat = calculateReviewStats(vendor.reviews);
  const services = vendor.services.map((service) => ({
    ...service,
    reviewStats: calculateReviewStats(service.reviews),
  }));

  const pinnedServices = services.filter((service) => service.isPinned);

  return {
    ...vendor,
    reviewStats: vendorReviewStat,
    pinnedServices,
    services
  };
};

// Retrieve all vendors for public listing
export const getAllVendors = async () => {
  const vendors = await prisma.vendorProfile.findMany({
    select: {
      id: true,
      businessName: true,
      location: true,
      isVerified: true,
      user: {
        select: {
          name: true,
        }
      },
      reviews: true,
      _count: {
        select: {
          bookings: {
            where: { status: "COMPLETED" }
          }
        },
      },
    },
  });

 return vendors.map((vendor) => ({
    ...vendor,
    completedJobs: vendor._count?.bookings,
    reviewStats: calculateReviewStats(vendor.reviews),
  }));
};
