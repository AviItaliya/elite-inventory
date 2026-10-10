import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/response.js";
import auditLogService from "../services/auditLogService.js";

class AuditLogController {
  findAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await auditLogService.getLogs(req.query);

    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Audit logs fetched successfully.",
      data: result,
    });
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const log = await auditLogService.getLogById(req.params.id as string);

    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Audit log fetched successfully.",
      data: log,
    });
  });
}

export default new AuditLogController();
