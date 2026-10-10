import userRepository from "../repositories/userRepository.js";
import AppError from "../utils/AppError.js";
import { hashPassword } from "../utils/password.js";
import auditLogService from "./auditLogService.js";

class UserService {
  async findAll(query: any) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
    const search =
      typeof query.search === "string" ? query.search.trim() : undefined;
    const role = typeof query.role === "string" ? query.role : undefined;
    let isActive: boolean | undefined;
    if (query.isActive === "true") {
      isActive = true;
    }
    if (query.isActive === "false") {
      isActive = false;
    }
    const result = await userRepository.findAll({
      skip: (page - 1) * limit,
      take: limit,
      search,
      role,
      ...(isActive !== undefined ? { isActive } : {}),
    });

    return {
      users: result.users,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async findById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError("User not found.", 404);
    }
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async create(
    data: {
      name: string;
      email: string;
      password: string;
      role: "ADMIN" | "MANAGER" | "STAFF";
    },
    performedBy: string,
  ) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError("A user with this email already exists.", 409);
    }
    const hashedPassword = await hashPassword(data.password);
    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
    });

    await auditLogService.createLog({
      user: {
        connect: {
          id: performedBy,
        },
      },
      action: "CREATE",
      entity: "USER",
      entityId: user.id,
      details: `Created user ${user.email} with role ${user.role}.`,
    });
    return user;
  }

  async update(
    id: string,
    data: {
      name?: string;
      email?: string;
      role?: "ADMIN" | "MANAGER" | "STAFF";
      isActive?: boolean;
    },
    performedBy: string,
  ) {
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new AppError("User not found.", 404);
    }
    if (data.email && data.email !== existingUser.email) {
      const emailUser = await userRepository.findByEmail(data.email);
      if (emailUser && emailUser.id !== id) {
        throw new AppError("A user with this email already exists.", 409);
      }
    }
    if (existingUser.role === "ADMIN" && data.role !== "ADMIN") {
      const adminCount = await userRepository.countAdmins();
      if (adminCount <= 1) {
        throw new AppError(
          "The last active admin cannot be changed to another role.",
          400,
        );
      }
    }
    const user = await userRepository.update(
      id,
      data as Parameters<typeof userRepository.update>[1],
    );
    await auditLogService.createLog({
      user: {
        connect: {
          id: performedBy,
        },
      },
      action: "UPDATE",
      entity: "USER",
      entityId: user.id,
      details: `Updated user ${user.email},`,
    });
    return user;
  }

  async updateStatus(id: string, isActive: boolean, performedBy: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError("USer not found.", 404);
    }
    if (user.id === performedBy && !isActive) {
      throw new AppError("You cannot deactivate your own account.", 400);
    }
    if (user.role === "ADMIN" && !isActive) {
      const adminCount = await userRepository.countAdmins();
      if (adminCount <= 1) {
        throw new AppError("The last active admin cannot be deactivated.", 400);
      }
    }

    const updatedUser = await userRepository.update(id, {
      isActive,
    } as Parameters<typeof userRepository.update>[1]);
    if (!isActive) {
      await userRepository.deleteAllRefreshTokens(id);
    }
    await auditLogService.createLog({
      user: {
        connect: {
          id: performedBy,
        },
      },
      action: isActive ? "ACTIVATE" : "DEACTIVATE",
      entity: "USER",
      entityId: user.id,
      details: `User ${user.email} was ${
        isActive ? "activated" : "deactivated"
      }.`,
    });
    return updatedUser;
  }

  async delete(id: string, performedBy: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError("User not found.", 404);
    }
    if (id === performedBy) {
      throw new AppError("You cannot delete our own account.", 400);
    }
    if (user.role === "ADMIN") {
      const adminCount = await userRepository.countAdmins();
      if (adminCount <= 1) {
        throw new AppError("The last admin cannot be delete.", 400);
      }
    }

    await userRepository.deleteAllRefreshTokens(id);
    await userRepository.delete(id);
    await auditLogService.createLog({
      user: {
        connect: {
          id: performedBy,
        },
      },
      action: "DELETE",
      entity: "USER",
      entityId: id,
      details: `Deleted user ${user.email},`,
    });
  }
}

export default new UserService();
