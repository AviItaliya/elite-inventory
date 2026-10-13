import { Readable } from "node:stream";
import { fileTypeFromBuffer } from "file-type";
import cloudinary from "../config/cloudinary.js";

export type ImageFolder = "products" | "profiles";

interface UploadedImage {
  url: string;
  publicId: string;
}

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

class ImageService {
  async uploadImage(
    file: Express.Multer.File,
    folder: ImageFolder,
  ): Promise<UploadedImage> {
    if (!file?.buffer) {
      throw new Error("Image file is required.");
    }

    const detectedType = await fileTypeFromBuffer(file.buffer);

    if (!detectedType || !allowedMimeTypes.has(detectedType.mime)) {
      throw new Error(
        "Invalid image content. Only JPG, PNG, and WebP are allowed.",
      );
    }

    return new Promise<UploadedImage>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `elite-inventory/${folder}`,
          resource_type: "image",
          overwrite: false,
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) {
            reject(new Error("Cloudinary upload failed."));
            return;
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    if (!publicId) {
      return;
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });

    if (result.result !== "ok" && result.result !== "not found") {
      throw new Error("Failed to delete image from Cloudinary.");
    }
  }
}

export default new ImageService();
