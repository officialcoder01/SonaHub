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
import type { Prisma } from "@prisma/client";
import type { Express } from "express";

type ServiceFields = {
  title: string;
  description: string;
  price: number | string;
  categoryId: string;
};

type ServiceError = Error & { status?: number };

type ServiceRequest = {
  userId: string;
  role: string;
  data: ServiceFields;
  files?: Express.Multer.File[];
};

type ServiceOwnerRequest = {
  serviceId: string;
  userId: string;
  role: string;
};

type ServiceListFilters = {
  category?: string;
  search?: string;
  location?: string;
  sort?: "newest" | "oldest";
  page?: number;
  limit?: number;
};

const createError = (message: string, status: number): ServiceError => {
  const error: ServiceError = new Error(message);
  error.status = status;
  return error;
};

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
export const createService = async ({ userId, role, data, files = [] }: ServiceRequest) => {
  assertVendor(role, "Only vendors can create services");

  const validatedData = validateServiceFields(data);

  const vendorProfile = await prisma.vendorProfile.findUnique({
    where: { userId },
  });

  if (!vendorProfile) {
    throw createError("Vendor profile is required to create services", 403);
  }

  const imageUrls = (await uploadServiceImages(files)) as string[];
  const serviceData: Prisma.ServiceUncheckedCreateInput = {
    vendorId: vendorProfile.id,
    title: validatedData.title,
    description: validatedData.description,
    price: validatedData.price,
    categoryId: validatedData.categoryId,
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
export const getVendorServices = async ({ userId, role }: Omit<ServiceRequest, "data" | "files">) => {
  assertVendor(role, "Only vendors can view their services");

  const vendorProfile = await prisma.vendorProfile.findUnique({
    where: { userId },
  });

  if (!vendorProfile) {
    throw createError("Vendor profile is required to view services", 403);
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
export const updateService = async ({ serviceId, userId, role }: ServiceOwnerRequest) => {
  assertVendor(role, "Only vendors can update their services");

  const service = await prisma.service.findUnique({
    where: { id: serviceId, isArchived: false },
    include: {
      vendor: true,
    },
  });

  if (!service) {
    throw createError("Service not found", 404);
  }

  if (service.vendor.userId !== userId) {
    throw createError("You do not have permission to delete this service", 403);
  }

  return prisma.service.update({
    where: { id: serviceId },
    data: {
      isArchived: true,
    },
  });
};

export const editService = async ({ serviceId, userId, role, data, files = [] }: ServiceOwnerRequest & Omit<ServiceRequest, "userId" | "role">) => {
  assertVendor(role, "Only vendors can edit their services");

  const service = await prisma.service.findUnique({
    where: { id: serviceId, isArchived: false },
    include: {
      vendor: {
        select: {
          userId: true,
        }
      },
    },
  });

  if (!service) {
    throw createError("Service not found", 404);
  }

  if (service.vendor.userId !== userId) {
    throw createError("You do not have permission to edit this service", 403);
  }

  const validatedData = validateServiceFields(data);
  const imageUrls = (await uploadServiceImages(files)) as string[];
  const serviceData: Prisma.ServiceUncheckedUpdateInput = {
    title: validatedData.title,
    description: validatedData.description,
    price: validatedData.price,
    categoryId: validatedData.categoryId,
  };

  if (imageUrls.length > 0) {
    serviceData.images = {
      create: imageUrls.map((url) => ({ url })),
    };
  }

  return prisma.service.update({
    where: { id: serviceId },
    data: serviceData,
    include: {
      images: true,
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
}: ServiceListFilters = {}) => {
  const normalizedCategory = typeof category === "string" ? category.trim() : "";
  const normalizedSearch = typeof search === "string" ? search.trim() : "";
  const normalizedLocation = typeof location === "string" ? location.trim() : "";

  //////////////////////////////////////////////////
  // Build one reusable Prisma where clause so the count
  // and paginated query always represent the same result set.
  //////////////////////////////////////////////////
  const where: Prisma.ServiceWhereInput = {
    isArchived: false,
  };

  if (normalizedCategory) {
    where.categoryId = normalizedCategory;
  }

  if (normalizedSearch) {
    where.OR = [
      {
        title: {
          contains: normalizedSearch,
          mode: "insensitive",
        },
      },
      {
        vendor: {
          businessName: {
            contains: normalizedSearch,
            mode: "insensitive",
          },
        },
      },
    ]
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
        category: { select: { id: true, name: true }},
        reviews: { select: { rating: true }},
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

  const servicesWithReviewStats = services.map((service: Prisma.ServiceGetPayload<{
    include: {
      images: true;
      category: { select: { id: true; name: true } };
      reviews: { select: { rating: true } };
      vendor: { select: { businessName: true; location: true } };
    };
  }>) => {
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

const serviceDetailsInclude = {
  images: true,
  category: {
    select: {
      id: true,
      name: true,
    },
  },
  reviews: {
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  },
  vendor: {
    select: {
      id: true,
      businessName: true,
      bio: true,
      location: true,
      status: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      reviews: {
        select: {
          rating: true,
        },
      },
    },
  },
};

const relatedServiceSelect = {
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
    select: {
      rating: true,
    },
  },
  vendor: {
    select: {
      businessName: true,
      location: true,
    },
  },
};

const mapRelatedService = ({ reviews, ...service }: Prisma.ServiceGetPayload<{ select: typeof relatedServiceSelect }>) => ({
  ...service,
  reviewStats: calculateReviewStats(reviews),
});

const mapServiceDetails = (service: Prisma.ServiceGetPayload<{ include: typeof serviceDetailsInclude }>) => {
  const { reviews: vendorReviews, ...vendor } = service.vendor;

  return {
    id: service.id,
    title: service.title,
    description: service.description,
    price: service.price,
    createdAt: service.createdAt,
    images: service.images,
    category: service.category,
    reviews: service.reviews,
    reviewStats: calculateReviewStats(service.reviews),
    vendor: {
      ...vendor,
      reviewStats: calculateReviewStats(vendorReviews),
    },
  };
};

// Retrieve a single public service details payload for the Service Details page.
export const getServiceDetailsById = async (serviceId: string) => {
  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      isArchived: false,
    },
    include: serviceDetailsInclude,
  });

  if (!service) {
    throw createError("Service not found", 404);
  }

  const relatedServices = await prisma.service.findMany({
    where: {
      categoryId: service.categoryId,
      id: { not: service.id },
      isArchived: false
    },
    select: relatedServiceSelect,
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return {
    service: mapServiceDetails(service),
    relatedServices: relatedServices.map(mapRelatedService),
  };
};

// Pin service for a vendor's profile page
export const pinServiceForVendor = async ({ userId, role, serviceId }: ServiceOwnerRequest) => {
    await assertVendor(role, "You are not authorized to pin services for this vendor.");

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const vendor = await tx.vendorProfile.findUnique({
        where: { userId },
      });

      if (!vendor) {
        throw createError("Vendor profile is required to pin services", 403);
      }

      const service = await tx.service.findFirst({
        where: {
          id: serviceId,
          vendorId: vendor.id,
          isArchived: false,
        },
      });

      if (!service) {
        throw createError("Service not found or not owned by vendor", 404);
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
        throw createError("You can only pin up to 5 services at a time.", 400);
      }

      return tx.service.update({
        where: { id: serviceId },
        data: { isPinned: true },
      });
    });
};

// Unpin service for a vendor's profile page
export const unpinServiceForVendor = async ({ userId, role, serviceId }: ServiceOwnerRequest) => {
  await assertVendor(role, "You are not authorized to unpin services for this vendor.");

  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const vendor = await tx.vendorProfile.findUnique({
      where: { userId },
    });

    if (!vendor) {
      throw createError("Vendor profile is required to unpin services", 403);
    }

    const service = await tx.service.findFirst({
      where: {
        id: serviceId,
        vendorId: vendor.id,
        isArchived: false,
      },
    });

    if (!service) {
      throw createError("Service not found or not owned by vendor", 404);
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
