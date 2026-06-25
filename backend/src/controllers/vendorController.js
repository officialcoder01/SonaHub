import {
  createVendorProfile,
  getVendorProfileByUserId,
  getVendorProfileByVendorId,
  getAllVendors,
} from "../services/vendorService.js";

export const createProfile = async (req, res) => {
  try {
    const profile = await createVendorProfile({
      userId: req.user.id,
      role: req.user.role,
      businessName: req.body.businessName,
      bio: req.body.bio,
      location: req.body.location,
    });

    res.status(201).json(profile);
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Unable to create vendor profile",
    });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const profile = await getVendorProfileByUserId(req.user.id, req.user.role);
    res.status(200).json(profile);
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Unable to fetch vendor profile",
    });
  }
};

export const getVendorPublicProfile = async (req, res) => {
  try {
    const details = await getVendorProfileByVendorId(req.params.id)

    res.status(200).json({ 
      vendorProfile: details
    });
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || "Unable to fetch service",
    });
  }
}

export const listVendors = async (req, res) => {
  try {
    const vendors = await getAllVendors();
    res.status(200).json(vendors);
  } catch (err) {
    res.status(500).json({
      message: "Unable to fetch vendors",
    });
  }
}
