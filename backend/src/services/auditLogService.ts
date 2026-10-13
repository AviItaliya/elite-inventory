import auditLogRepository from "../repositories/auditLogRepository.js";
import type { Prisma } from "../generated/prisma/client.js";
import AppError from "../utils/AppError.js";

type AuditLogQuery = {
  page?: string;
  limit?: string;
  action?: string;
  entity?: string;
  userId?: string;
};

class AuditLogService {
  async createLog(data: Prisma.AuditLogCreateInput) {
    return auditLogRepository.create(data);
  }

  async getLogs(query: AuditLogQuery = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const result = await auditLogRepository.findAll({
      page,
      limit,
      ...(query.action !== undefined && { action: query.action }),
      ...(query.entity !== undefined && { entity: query.entity }),
      ...(query.userId !== undefined && { userId: query.userId }),
    });

    return {
      logs: result.logs,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async getLogById(id: string) {
    const log = await auditLogRepository.findById(id);

    if (!log) {
      throw new AppError("Audit log not found.", 404);
    }

    return log;
  }
}

export default new AuditLogService();
