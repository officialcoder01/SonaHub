import { getTopRatedVendors } from '../services/recommendationService.js';

export const topRatedVendors = async (req, res) => {
    try {
        const vendors = await getTopRatedVendors();
        res.json(vendors);
    } catch (error) {
        console.error('Error fetching top-rated vendors:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};