import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/response.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validators/categoryValidation.js";
import categoryService from "../services/categoryService.js";

class CategoryController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const data = createCategorySchema.parse(req.body);

    const category = await categoryService.create(data, req.user!.id);

    return sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "Category created successfully.",
      data: category,
    });
  });

  findAll = asyncHandler(async (req: Request, res: Response) => {
    const categories = await categoryService.findAll();

    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Categories fetched successfully.",
      data: categories,
    });
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.findById(req.params.id as string);

    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Category fetched successfully.",
      data: category,
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const data = updateCategorySchema.parse(req.body);

    const category = await categoryService.update(req.params.id as string, data, req.user!.id);

    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Category updated successfully.",
      data: category,
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await categoryService.delete(req.params.id as string, req.user!.id);

    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Category deleted successfully.",
    });
  });
}

export default new CategoryController();
