import {
  createService,
  getAllServices,
  getVendorServices,
  updateService,
  getAllCategories,
  getServiceDetailsById,
} from "../services/serviceService.js";

// Create a new service listing, ensuring the requesting user is a vendor
export const createServiceListing = async (req, res) => {
  try {
    const service = await createService({
      userId: req.user.id,
      role: req.user.role,
      data: req.body,
      files: req.files,
    });

    res.status(201).json({
      message: "Service created successfully",
      service,
    });
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Unable to create service",
    });
  }
};

// Retrieve all services for public listing, including vendor info and images
export const listServices = async (req, res) => {
  try {
    const services = await getAllServices();

    res.status(200).json({
      services,
    });
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Unable to fetch services",
    });
  }
};

// Retrieve one public service details payload for the marketplace details page
export const getServiceDetails = async (req, res) => {
  try {
    const details = await getServiceDetailsById(req.params.id);

    res.status(200).json(details);
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Unable to fetch service",
    });
  }
};


// Retrieve all services for the authenticated vendor, including images and category info
export const listMyServices = async (req, res) => {
  try {
    const services = await getVendorServices({
      userId: req.user.id,
      role: req.user.role,
    });

    res.status(200).json({
      services,
    });
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Unable to fetch vendor services",
    });
  }
};

// Update a service by ID to become archieved, ensuring the requesting user is the owner vendor
export const updateServiceListing = async (req, res) => {
  try {
    await updateService({
      serviceId: req.params.id,
      userId: req.user.id,
      role: req.user.role,
    });

    res.status(200).json({
      message: "Service deleted successfully",
    });
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Unable to delete service",
    });
  }
};


// Retrieve all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await getAllCategories();

    res.status(200).json({
      categories,
    });
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Unable to fetch categories",
    });
  }
};
