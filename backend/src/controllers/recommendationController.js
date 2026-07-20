import {
    getTopRatedVendors,
    pinnedServicesForVendor
} from '../services/recommendationService.js';

export const topRatedVendors = async (req, res) => {
    try {
        const vendors = await getTopRatedVendors();
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getPinnedServicesForVendor = async (req, res) => {
    try {
        const userId = req.params.id;
        const services = await pinnedServicesForVendor(userId);
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
