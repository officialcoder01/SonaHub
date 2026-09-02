import { getAdminDashboard } from "../services/adminService.js";

export const adminDashboard = async (req, res) => {
    try {
        const { role } = req.user;
        const dashboard = await getAdminDashboard({ role });

        res.status(200).json(dashboard);
    } catch (err) {
        res.status(err.status || 500).json({
            message: err.message || "Internal Server Error",
        })
    }
}