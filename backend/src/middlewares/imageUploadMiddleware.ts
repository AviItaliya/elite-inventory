import multer from "multer";
import AppError from "../utils/AppError.js";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const imageStorage = multer.memoryStorage();

const imageFileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  callback,
) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    callback(new AppError("Only JPG, PNG, and WebP images are allowed.", 400));
    return;
  }

  callback(null, true);
};

export const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: 1,
    fields: 10,
    parts: 11,
  },
}).single("image");
