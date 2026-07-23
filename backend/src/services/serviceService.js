////////////////////////////////////////
// Service-related business logic.
// This file contains the core logic for creating 
// and retrieving services, including image uploads 
// and vendor checks.
////////////////////////////////////

import prisma from "../config/prisma.js";
import { calculateReviewStats } from "../utils/ratingUtils.js";
import { uploadServiceImages } from "../utils/imageUploadUtils.js";
import { validateServiceFields } from "../validators/serviceDetailFieldValidator.js";
import { assertVendor } from "../utils/roleCheckUtils.js";

// Retrieve all categories
export const getAllCategories = async () => {
  return await prisma.category.findMany({
    include: {
      _count: {
        select: {
          services: {
            where: {
              isArchived: false,
            },
          }
        }
      }
    },
    orderBy: { name: "asc" },
  });
};

// Service creation logic, including vendor checks and image uploads
export const createService = async ({ userId, role, data, files = [] }) => {
  assertVendor(role, "Only vendors can create services");

  const price = validateServiceFields(data);

  const vendorProfile = await prisma.vendorProfile.findUnique({
    where: { userId },
  });

  if (!vendorProfile) {
    const error = new Error("Vendor profile is required to create services");
    error.status = 403;
    throw error;
  }

  const imageUrls = await uploadServiceImages(files);
  const serviceData = {
    vendorId: vendorProfile.id,
    title: data.title,
    description: data.description,
    price,
    categoryId: data.categoryId,
  };

  if (imageUrls.length > 0) {
    serviceData.images = {
      create: imageUrls.map((url) => ({ url })),
    };
  }

  return prisma.service.create({
    data: serviceData,
    include: {
      images: true,
    },
  });
};

// Retrieve all services with vendor info and images
// this is for authenticated vendors only (private endpoint)
export const getVendorServices = async ({ userId, role }) => {
  assertVendor(role, "Only vendors can view their services");

  const vendorProfile = await prisma.vendorProfile.findUnique({
    where: { userId },
  });

  if (!vendorProfile) {
    const error = new Error("Vendor profile is required to view services");
    error.status = 403;
    throw error;
  }

  return prisma.service.findMany({
    where: {
      vendorId: vendorProfile.id,
      isArchived: false,
    },
    include: {
      images: true,
      category: true,
      vendor: {
        select: {
          businessName: true,
          location: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

// Update service to archieved because deleting the service
// will delete the booking record and reviews
export const updateService = async ({ serviceId, userId, role }) => {
  assertVendor(role, "Only vendors can update their services");

  const service = await prisma.service.findUnique({
    where: { id: serviceId, isArchived: false },
    include: {
      vendor: true,
    },
  });

  if (!service) {
    const error = new Error("Service not found");
    error.status = 404;
    throw error;
  }

  if (service.vendor.userId !== userId) {
    const error = new Error("You do not have permission to delete this service");
    error.status = 403;
    throw error;
  }

  return prisma.service.update({
    where: { id: serviceId },
    data: {
      isArchived: true,
    },
  });
};

// Retrieve paginated public services with vendor info, images, and review stats.
// Prisma handles filtering and pagination so archived services never leak to users.
export const getAllServices = async ({
  category,
  search,
  location,
  sort = "newest",
  page = 1,
  limit = 12,
} = {}) => {
  const normalizedCategory = typeof category === "string" ? category.trim() : "";
  const normalizedSearch = typeof search === "string" ? search.trim() : "";
  const normalizedLocation = typeof location === "string" ? location.trim() : "";

  //////////////////////////////////////////////////
  // Build one reusable Prisma where clause so the count
  // and paginated query always represent the same result set.
  //////////////////////////////////////////////////
  const where = {
    isArchived: false,
  };

  if (normalizedCategory) {
    where.categoryId = normalizedCategory;
  }

  if (normalizedSearch) {
    where.title = {
      contains: normalizedSearch,
      mode: "insensitive",
    };
  }

  if (normalizedLocation) {
    where.vendor = {
      location: {
        contains: normalizedLocation,
        mode: "insensitive",
      },
    };
  }

  const pageSize = limit;
  const currentPage = page;
  const skip = (currentPage - 1) * pageSize;
  const orderBy = {
    createdAt: sort === "oldest" ? "asc" : "desc",
  };

  const [totalItems, services] = await Promise.all([
    prisma.service.count({ where }),
    prisma.service.findMany({
      where,
      include: {
        images: true,
        category: true,
        reviews: true,
        vendor: {
          select: {
            businessName: true,
            location: true,
          },
        },
      },
      orderBy,
      skip,
      take: pageSize,
    }),
  ]);

  const servicesWithReviewStats = services.map((service) => {
    const reviewStats = calculateReviewStats(service.reviews);
    return {
      ...service,
      reviewStats,
    };
  });

  return {
    services: servicesWithReviewStats,
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      currentPage,
      pageSize,
    },
  };
};

// Retrieve a single public service details payload for the Service Details page.
export const getServiceDetailsById = async (serviceId) => {
  const service = await prisma.service.findUnique({
    where: {
      id: serviceId,
      isArchived: false,
    },
    include: {
      images: true,
      category: true,
      vendor: {
        include: {
          user: {
            select: {
              name: true,
            },
          },
          reviews: {
            select: { rating: true }
          }
        },
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
    },
  });

  if (!service) {
    const error = new Error("Service not found");
    error.status = 404;
    throw error;
  }

  const relatedServices = await prisma.service.findMany({
    where: {
      categoryId: service.categoryId,
      id: {
        not: service.id,
      },
      isArchived: false
    },
    select: {
      id: true,
      title: true,
      price: true,
      description: true,
      images: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      reviews: {
        select: { rating: true },
      },
      vendor: {
        select: {
          businessName: true,
          location: true,
        },
      },
    },
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  const relatedServicesWithStats = relatedServices.map((service) => {
    const reviewStats = calculateReviewStats(service.reviews);
    return {
      ...service,
      reviewStats,
    };
  });

  const serviceReviewStats = calculateReviewStats(service.reviews);

  const { reviews, ...vendor } = service.vendor;

  return {
    service: {
      id: service.id,
      title: service.title,
      description: service.description,
      price: service.price,
      createdAt: service.createdAt,
      images: service.images,
      category: {
        id: service.category.id,
        name: service.category.name,
      },
      reviews: service.reviews,
      reviewStats: serviceReviewStats,
      vendor: {
        id: vendor.id,
        businessName: vendor.businessName,
        bio: vendor.bio,
        location: vendor.location,
        isVerified: vendor.isVerified,
        user: vendor.user,
        reviewStats: calculateReviewStats(reviews),
      },
    },
    relatedServices: relatedServicesWithStats,
  };
};

// Pin service for a vendor's profile page
export const pinServiceForVendor = async ({ userId, role, serviceId }) => {
    await assertVendor(role, "You are not authorized to pin services for this vendor.");

    return await prisma.$transaction(async (tx) => {
      const vendor = await tx.vendorProfile.findUnique({
        where: { userId },
      });

      if (!vendor) {
        const error = new Error("Vendor profile is required to pin services");
        error.status = 403;
        throw error;
      }

      const service = await tx.service.findFirst({
        where: {
          id: serviceId,
          vendorId: vendor.id,
          isArchived: false,
        },
      });

      if (!service) {
        const error = new Error("Service not found or not owned by vendor");
        error.status = 404;
        throw error;
      }

      if (service.isPinned) {
        return service;
      }

      const pinCount = await tx.service.count({
        where: {
          vendorId: vendor.id,
          isPinned: true,
          isArchived: false,
        },
      });

      if (pinCount >= 5) {
        const error = new Error("You can only pin up to 5 services at a time.");
        error.status = 400;
        throw error;
      }

      return tx.service.update({
        where: { id: serviceId },
        data: { isPinned: true },
      });
    });
};

// Unpin service for a vendor's profile page
export const unpinServiceForVendor = async ({ userId, role, serviceId }) => {
  await assertVendor(role, "You are not authorized to unpin services for this vendor.");

  return await prisma.$transaction(async (tx) => {
    const vendor = await tx.vendorProfile.findUnique({
      where: { userId },
    });

    if (!vendor) {
      const error = new Error("Vendor profile is required to unpin services");
      error.status = 403;
      throw error;
    }

    const service = await tx.service.findFirst({
      where: {
        id: serviceId,
        vendorId: vendor.id,
        isArchived: false,
      },
    });

    if (!service) {
      const error = new Error("Service not found or not owned by vendor");
      error.status = 404;
      throw error;
    }

    if (!service.isPinned) {
      return service;
    }

    return tx.service.update({
      where: {
        id: serviceId,
      },
      data: {
        isPinned: false,
      },
    });
  })
};
