import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { sendResponse } from "../utils/response.js";
import productImageService from "../services/productImageService.js";

class ProductImageController {
  // ==========================================
  // Upload Product Image
  // ==========================================

  upload = asyncHandler(async (req: Request, res: Response) => {
    const productId = req.params.id;

    if (typeof productId !== "string") {
      throw new AppError("Invalid product ID.", 400);
    }

    if (!req.file) {
      throw new AppError("Product image is required.", 400);
    }

    const product = await productImageService.uploadOrReplace(
      productId,
      req.file,
    );

    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Product image uploaded successfully.",
      data: product,
    });
  });

  // ==========================================
  // Replace Product Image
  // ==========================================

  replace = asyncHandler(async (req: Request, res: Response) => {
    const productId = req.params.id;

    if (typeof productId !== "string") {
      throw new AppError("Invalid product ID.", 400);
    }

    if (!req.file) {
      throw new AppError("Product image is required.", 400);
    }

    const product = await productImageService.uploadOrReplace(
      productId,
      req.file,
    );

    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Product image updated successfully.",
      data: product,
    });
  });

  // ==========================================
  // Delete Product Image
  // ==========================================

  remove = asyncHandler(async (req: Request, res: Response) => {
    const productId = req.params.id;

    if (typeof productId !== "string") {
      throw new AppError("Invalid product ID.", 400);
    }

    const product = await productImageService.deleteImage(productId);

    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Product image deleted successfully.",
      data: product,
    });
  });
}

export default new ProductImageController();
