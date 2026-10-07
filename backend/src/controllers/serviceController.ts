import {
  createService,
  getAllServices,
  getVendorServices,
  updateService,
  editService,
  getAllCategories,
  getServiceDetailsById,
  pinServiceForVendor,
  unpinServiceForVendor,
} from "../services/serviceService.js";
import type { Request, Response } from "express";
import type { Role } from "@prisma/client";

interface SendError extends Error {
  status?: number;
}

const getAuthenticatedUser = (req: Request) => {
  if (!req.user) {
    throw new Error("Authentication required");
  }

  return req.user;
};

const getRouteId = (req: Request) => {
  const id = req.params.id;
  return typeof id === "string" ? id : "";
};

const getQueryValue = (value: unknown) => typeof value === "string" ? value : undefined;
const getUploadedFiles = (req: Request) => Array.isArray(req.files) ? req.files : [];

// Create a new service listing, ensuring the requesting user is a vendor
export const createServiceListing = async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const service = await createService({
      userId: user.id,
      role: user.role as Role,
      data: req.body,
      files: getUploadedFiles(req),
    });

    res.status(201).json({
      message: "Service created successfully",
      service,
    });
  } catch (err: unknown) {
    const typedError = err as SendError;
    res.status(typedError.status || 500).json({
      message: typedError.message || "Unable to create service",
    });
  }
};

// Pin a service for the authenticated vendor
export const pinService = async (req: Request, res: Response) => {
    const serviceId = getRouteId(req);

    try {
        const { id: userId, role } = getAuthenticatedUser(req);
        const updatedService = await pinServiceForVendor({
          userId,
          role: role as Role,
          serviceId
        });
        res.status(200).json(updatedService);
    } catch (error: unknown) {
        const typedError = error as SendError;
        res.status(typedError.status || 500).json({
          message: typedError.message || 'Internal server error'
        });
    }
};

// Unpin a service for the authenticated vendor
export const unpinService = async (req: Request, res: Response) => {
    const serviceId = getRouteId(req);

    try {
        const { id: userId, role } = getAuthenticatedUser(req);
        const updatedService = await unpinServiceForVendor({
          userId,
          role: role as Role,
          serviceId
        });
        res.status(200).json(updatedService);
    } catch (error: unknown) {
        const typedError = error as SendError;
        res.status(typedError.status || 500).json({
          message: typedError.message || 'Internal server error'
        });
    }
};

// Retrieve all services for public listing, including vendor info and images
export const listServices = async (req: Request, res: Response) => {
  try {
    const page = getQueryValue(req.query.page);
    const limit = getQueryValue(req.query.limit);
    const parsedPage = Number.parseInt(page ?? "", 10);
    const parsedLimit = Number.parseInt(limit ?? "", 10);
    const sort: "newest" | "oldest" = getQueryValue(req.query.sort) === "oldest" ? "oldest" : "newest";

    //////////////////////////////////////////////////
    // Keep public listing query validation in the controller
    // before delegating filtering and pagination to the service.
    //////////////////////////////////////////////////
    const filters = {
      category: getQueryValue(req.query.category),
      search: getQueryValue(req.query.search),
      location: getQueryValue(req.query.location),
      sort,
      page: parsedPage > 0 ? parsedPage : 1,
      limit: parsedLimit > 0 ? parsedLimit : 12,
    };

    const { services, pagination } = await getAllServices(filters);

    res.status(200).json({
      services,
      pagination,
    });
  } catch (err: unknown) {
    const typedError = err as SendError;
    res.status(typedError.status || 500).json({
      message: typedError.message || "Unable to fetch services",
    });
  }
};

// Retrieve one public service details payload for the marketplace details page
export const getServiceDetails = async (req: Request, res: Response) => {
  try {
    const details = await getServiceDetailsById(getRouteId(req));

    res.status(200).json(details);
  } catch (err: unknown) {
    const typedError = err as SendError;
    res.status(typedError.status || 500).json({
      message: typedError.message || "Unable to fetch service",
    });
  }
};


// Retrieve all services for the authenticated vendor, including images and category info
export const listMyServices = async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const services = await getVendorServices({
      userId: user.id,
      role: user.role as Role,
    });

    res.status(200).json({
      services,
    });
  } catch (err: unknown) {
    const typedError = err as SendError;
    res.status(typedError.status || 500).json({
      message: typedError.message || "Unable to fetch vendor services",
    });
  }
};

// Update a service by ID to become archieved, ensuring the requesting user is the owner vendor
export const updateServiceListing = async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    await updateService({
      serviceId: getRouteId(req),
      userId: user.id,
      role: user.role as Role,
    });

    res.status(200).json({
      message: "Service deleted successfully",
    });
  } catch (err: unknown) {
    const typedError = err as SendError;
    res.status(typedError.status || 500).json({
      message: typedError.message || "Unable to delete service",
    });
  }
};

export const editServiceListing = async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const updatedService = await editService({
      serviceId: getRouteId(req),
      userId: user.id,
      role: user.role as Role,
      data: req.body,
      files: getUploadedFiles(req),
    });

    res.status(200).json(updatedService);
  } catch (err: unknown) {
    const typedError = err as SendError;
    res.status(typedError.status || 500).json({
      message: typedError.message || "Unable to edit service",
    });
  }
};

// Retrieve all categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await getAllCategories();

    res.status(200).json({
      categories,
    });
  } catch (err: unknown) {
    const typedError = err as SendError;
    res.status(typedError.status || 500).json({
      message: typedError.message || "Unable to fetch categories",
    });
  }
};
