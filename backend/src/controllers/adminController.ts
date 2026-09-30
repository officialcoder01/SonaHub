import type { Request, Response } from "express";
import type { Role } from "@prisma/client";
import { getAdminDashboard } from "../services/adminService.js";

interface HttpError extends Error {
    status?: number;
}

const getErrorStatus = (error: unknown): number => {
    if (
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        typeof error.status === "number"
    ) {
        return error.status;
    }

    return 500;
};

export const adminDashboard = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
    }

    try {
        const dashboard = await getAdminDashboard({ role: req.user.role as Role });
        return res.status(200).json(dashboard);
    } catch (error: unknown) {
        const typedError = error as HttpError;
        return res.status(getErrorStatus(error)).json({
            message: typedError.message || "Internal Server Error",
        });
    }
};
