import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

interface imageFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

interface ImageUploadError extends Error {
  status?: number;

}

// Upload a single service image to Cloudinary and return the URL
const uploadServiceImage = async (file: imageFile) => {
  if (!file) return null;

  return new Promise((resolve, reject) => {
    const uploader = cloudinary.uploader;

    if (!uploader?.upload_stream) {
      reject(new Error("Cloudinary upload is not configured"));
      return;
    }

    const uploadStream = uploader.upload_stream(
      {
        folder: "services",
        transformation: [
          { width: 800, height: 600, crop: "limit" },
          { quality: "auto" },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary upload returned no result"));
          return;
        }

        resolve(result.secure_url || result.url);
      }
    );

    if (typeof uploadStream.pipe === "function") {
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    } else if (typeof uploadStream.end === "function") {
      uploadStream.end(file.buffer);
    } else {
      reject(new Error("Cloudinary upload stream is not writable"));
    }
  });
};


// Upload multiple service images and return an array of URLs
export const uploadServiceImages = async (files: imageFile[] = []) => {
  if (files.length > 3) {
    const error = new Error("A service can have a maximum of 3 images") as ImageUploadError;
    error.status = 400;
    throw error;
  }

  return Promise.all(files.map((file) => uploadServiceImage(file)));
};