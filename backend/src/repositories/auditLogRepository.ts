import prisma from "../config/prisma.js";
import type { AuditLog, Prisma } from "../generated/prisma/client.js";

class AuditLogRepository {
  async create(data: Prisma.AuditLogCreateInput): Promise<AuditLog> {
    return prisma.auditLog.create({ data });
  }

  async findAll(options: {
    page: number;
    limit: number;
    action?: string;
    entity?: string;
    userId?: string;
  }) {
    const { page, limit, action, entity, userId } = options;
    const where: Prisma.AuditLogWhereInput = {};
    if (action) {
      where.action = action;
    }
    if (entity) {
      where.entity = entity;
    }
    if (userId) {
      where.userId = userId;
    }
    const [logs, total] = await prisma.$transaction([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.auditLog.count({
        where,
      }),
    ]);
    return {
      logs,
      total,
    };
  }

  async findById(id: string) {
    return prisma.auditLog.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }
}
export default new AuditLogRepository();
