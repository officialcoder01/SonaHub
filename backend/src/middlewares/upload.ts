///////////////////////////////////
// File upload middleware using Multer
///////////////////////////////////

import multer from "multer";
import type { Request } from "express";

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
): void => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter
});

export default upload;
