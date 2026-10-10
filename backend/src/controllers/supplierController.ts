import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { createSupplierSchema, updateSupplierSchema } from "../validators/supplierValidation.js";
import supplierService from "../services/supplierService.js";
import { sendResponse } from "../utils/response.js";

class SupplierController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const data = createSupplierSchema.parse(req.body);
    const supplier = await supplierService.create(data, req.user!.id);
    return sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "Supplier created successfully.",
      data: supplier,
    });
  });

  findAll = asyncHandler(async (req: Request, res: Response) => {
    const suppliers = await supplierService.findAll();
    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Suppliers fetched successfully.",
      data: suppliers,
    });
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const supplier = await supplierService.findById(req.params.id as string);
    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Supplier fetched successfully.",
      data: supplier,
    });
  });

  update = asyncHandler(async(req:Request, res:Response) => {
    const data = updateSupplierSchema.parse(req.body);
    const supplier = await supplierService.update(req.params.id as string, data, req.user!.id);
    return sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Supplier updated successfully.",
        data: supplier
    });
  });

  delete = asyncHandler(async(req:Request, res:Response) => {
    await supplierService.delete(req.params.id as string, req.user!.id);
    return sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Supplier deleted successfully."
    });
  });
}

export default new SupplierController();
