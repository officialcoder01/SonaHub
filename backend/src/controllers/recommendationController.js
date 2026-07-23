import {
    getTopRatedVendors,
} from '../services/recommendationService.js';

export const topRatedVendors = async (req, res) => {
    try {
        const vendors = await getTopRatedVendors();
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
