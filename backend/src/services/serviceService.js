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

// Helper function to ensure only vendors can create or view services
const assertVendor = (role) => {
  if (role !== "VENDOR") {
    const error = new Error("Only vendors can access services");
    error.status = 403;
    throw error;
  }
};

// Retrieve all categories
export const getAllCategories = async () => {
  return prisma.category.findMany({
    include: {
      services: true
    },
    orderBy: { name: "asc" },
  });
};

// Service creation logic, including vendor checks and image uploads
export const createService = async ({ userId, role, data, files = [] }) => {
  assertVendor(role);

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
  assertVendor(role);

  const vendorProfile = await prisma.vendorProfile.findUnique({
    where: { userId },
  });

  if (!vendorProfile) {
    const error = new Error("Vendor profile is required to view services");
    error.status = 403;
    throw error;
  }

  return prisma.service.findMany({
    where: { vendorId: vendorProfile.id },
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

// Delete service by ID, ensuring the requesting user is the owner vendor
export const deleteService = async ({ serviceId, userId, role }) => {
  assertVendor(role);

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
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

  return prisma.service.delete({
    where: { id: serviceId },
  });
};

// Retrieve all services with vendor info and images
// this is for public listing (no authentication required)
export const getAllServices = async () => {
  const services = await prisma.service.findMany({
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
    orderBy: { createdAt: "desc" },
  });

  const servicesWithReviewStats = services.map((service) => {
    const reviewStats = calculateReviewStats(service.reviews);
    return {
      ...service,
      reviewStats,
    };
  });

  return servicesWithReviewStats;
};

// Retrieve a single public service details payload for the Service Details page.
export const getServiceDetailsById = async (serviceId) => {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
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
          reviews: true
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
      reviews: true,
      vendor: {
        select: {
          businessName: true,
          location: true,
        },
      },
    },
    take: 4,
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
