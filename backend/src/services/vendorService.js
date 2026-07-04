import prisma from "../config/prisma.js";
import { calculateReviewStats } from "../utils/ratingUtils.js";

// Helper function to ensure only vendors 
// can create or view vendor profiles
const assertVendor = (role) => {
  if (role !== "VENDOR") {
    const error = new Error("Only vendors can access vendor profiles");
    error.status = 403;
    throw error;
  }
};

// Create a vendor profile for 
// the authenticated user (private endpoint for vendors only)
export const createVendorProfile = async ({
  userId,
  role,
  businessName,
  bio,
  location,
}) => {
  assertVendor(role);

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
  assertVendor(role);

  return prisma.vendorProfile.findUnique({
    where: { userId },
  });
};

// Retrive vendor profile by vendor ID for public vendor profile page
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

  return {
    ...vendor,
    reviewStats: vendorReviewStat,
    services
  };
};

// Retrieve all vendors for public listing
export const getAllVendors = async () => {
  const vendors = await prisma.vendorProfile.findMany({
    include: {
      user: {
        select: {
          name: true,
        },
      },
      reviews: true,
    },
  });

  const vendorsWithReviewStats = vendors.map((vendor) => {
    const reviewStat = calculateReviewStats(vendor.reviews);
    return {
      ...vendor,
      reviewStat
    };
  })

  return vendorsWithReviewStats;
};
