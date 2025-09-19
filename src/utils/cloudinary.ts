import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!, 
  api_key: process.env.CLOUDINARY_API_KEY!, 
  api_secret: process.env.CLOUDINARY_API_SECRET!
});

// Upload function
const uploadOnCloudinary = async (
  localFilePath: string
): Promise<UploadApiResponse | null> => {
  try {
    if (!localFilePath) return null;

    const response: UploadApiResponse = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // Remove local file after successful upload
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath); // Clean up even on failure
    }
    console.error("Error uploading to Cloudinary:", error);
    return null;
  }
};

// Delete function
const deleteFromCloudinary = async (
  publicId: string
): Promise<UploadApiResponse | UploadApiErrorResponse | null> => {
  try {
    if (!publicId) return null;

    const response = await cloudinary.uploader.destroy(publicId);

    return response;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
