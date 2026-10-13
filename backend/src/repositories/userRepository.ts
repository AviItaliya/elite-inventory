import prisma from "../config/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";

class UserRepository {
  async findAll(options: {
    skip: number;
    take: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  }) {
    const { skip, take, search, role, isActive } = options;

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (role) {
      where.role = role as NonNullable<Prisma.UserWhereInput["role"]>;
    }

    // ✅ ADD THIS
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take,
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.user.count({
        where,
      }),
    ]);

    return {
      users,
      total,
    };
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }

  async countAdmins() {
    return prisma.user.count({
      where: {
        role: "ADMIN",
        isActive: true,
      },
    });
  }

  async deleteAllRefreshTokens(userId: string) {
    return prisma.refreshToken.deleteMany({
      where: {
        userId,
      },
    });
  }
}

export default new UserRepository();
