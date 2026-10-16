import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { sendResponse } from "../utils/response.js";
import prisma from "../config/prisma.js";
import imageService from "../services/imageService.js";

const safeUser = (user: {
  id: string;
  name: string;
  email: string;
  role: string;
  imageUrl: string | null;
  createdAt: Date;
  isActive: boolean;
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  imageUrl: user.imageUrl,
  createdAt: user.createdAt,
  isActive: user.isActive,
});

export const uploadProfileImage = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) throw new AppError("Profile image is required.", 400);
    const id = req.user!.id;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError("User not found.", 404);
    const uploaded = await imageService.uploadImage(req.file, "profiles");
    let updated;
    try {
      updated = await prisma.user.update({
        where: { id },
        data: { imageUrl: uploaded.url, imagePublicId: uploaded.publicId },
      });
    } catch (error) {
      await imageService.deleteImage(uploaded.publicId).catch(() => undefined);
      throw error;
    }
    if (user.imagePublicId)
      await imageService
        .deleteImage(user.imagePublicId)
        .catch((error) =>
          console.error("Old profile image cleanup failed", error),
        );
    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Profile image saved.",
      data: safeUser(updated),
    });
  },
);

export const deleteProfileImage = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.user!.id;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError("User not found.", 404);
    const updated = await prisma.user.update({
      where: { id },
      data: { imageUrl: null, imagePublicId: null },
    });
    if (user.imagePublicId)
      await imageService
        .deleteImage(user.imagePublicId)
        .catch((error) => console.error("Profile image cleanup failed", error));
    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Profile image removed.",
      data: safeUser(updated),
    });
  },
);
