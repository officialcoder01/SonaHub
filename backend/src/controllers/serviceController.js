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

// Pin a service for the authenticated vendor
export const pinService = async (req, res) => {
    const serviceId = req.params.id;
    const { id: userId, role } = req.user;

    try {
        const updatedService = await pinServiceForVendor({ userId, role, serviceId });
        res.status(200).json(updatedService);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
    }
};

// Unpin a service for the authenticated vendor
export const unpinService = async (req, res) => {
    const serviceId = req.params.id;
    const { id: userId, role } = req.user;

    try {
        const updatedService = await unpinServiceForVendor({ userId, role, serviceId });
        res.status(200).json(updatedService);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
    }
};

// Retrieve all services for public listing, including vendor info and images
export const listServices = async (req, res) => {
  try {
    const parsedPage = Number.parseInt(req.query.page, 10);
    const parsedLimit = Number.parseInt(req.query.limit, 10);
    const sort = req.query.sort === "oldest" ? "oldest" : "newest";

    //////////////////////////////////////////////////
    // Keep public listing query validation in the controller
    // before delegating filtering and pagination to the service.
    //////////////////////////////////////////////////
    const filters = {
      category: req.query.category,
      search: req.query.search,
      location: req.query.location,
      sort,
      page: parsedPage > 0 ? parsedPage : 1,
      limit: parsedLimit > 0 ? parsedLimit : 12,
    };

    const { services, pagination } = await getAllServices(filters);

    res.status(200).json({
      services,
      pagination,
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

export const editServiceListing = async (req, res) => {
  try {
    const updatedService = await editService({
      serviceId: req.params.id,
      userId: req.user.id,
      role: req.user.role,
      data: req.body,
      files: req.files,
    });

    res.status(200).json(updatedService);
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Unable to edit service",
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
