import { Request, Response } from 'express';
import {
    getTopRatedVendors,
} from '../services/recommendationService.js';

export const topRatedVendors = async (req: Request, res: Response) => {
    try {
        const vendors = await getTopRatedVendors();
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
