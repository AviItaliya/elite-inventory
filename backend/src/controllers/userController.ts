import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/response.js";
import userService from "../services/userService.js";
import {
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
} from "../validators/userValidation.js";

class UserController {
  findAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.findAll(req.query);

    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Users fetched successfully.",
      data: result,
    });
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.findById(req.params.id as string);

    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "User fetched successfully.",
      data: user,
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = createUserSchema.parse(req.body);

    const user = await userService.create(data, req.user!.id);

    return sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "User created successfully.",
      data: user,
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const data = updateUserSchema.parse(req.body);
    const updateData = {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.role !== undefined && { role: data.role }),
    };

    const user = await userService.update(
      req.params.id as string,
      updateData,
      req.user!.id,
    );

    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "User updated successfully.",
      data: user,
    });
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const data = updateUserStatusSchema.parse(req.body);

    const user = await userService.updateStatus(
      req.params.id as string,
      data.isActive,
      req.user!.id,
    );

    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: `User ${
        data.isActive ? "activated" : "deactivated"
      } successfully.`,
      data: user,
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await userService.delete(req.params.id as string, req.user!.id);

    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "User deleted successfully.",
    });
  });
}

export default new UserController();
