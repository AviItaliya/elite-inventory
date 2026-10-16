import userRepository from "../repositories/userRepository.js";
import AppError from "../utils/AppError.js";
import { hashPassword } from "../utils/password.js";
import auditLogService from "./auditLogService.js";
import userActivityNotificationService from "./userActivityNotificationService.js";

type UserRole = "ADMIN" | "MANAGER" | "STAFF";

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface UpdateUserData {
  name?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
}

class UserService {
  // --------------------------------------------------
  // GET ALL USERS
  // --------------------------------------------------

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

  // --------------------------------------------------
  // GET USER BY ID
  // --------------------------------------------------

  async findById(id: string) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    return user;
  }

  // --------------------------------------------------
  // GET CURRENT ACTOR
  // --------------------------------------------------

  private async getActor(performedBy: string) {
    const actor = await userRepository.findById(performedBy);

    if (!actor || !actor.isActive) {
      throw new AppError("Unauthorized.", 401);
    }

    if (actor.role !== "ADMIN" && actor.role !== "MANAGER") {
      throw new AppError("You do not have permission to manage users.", 403);
    }

    return actor;
  }

  // --------------------------------------------------
  // CREATE USER
  // --------------------------------------------------

  async create(data: CreateUserData, performedBy: string) {
    const actor = await this.getActor(performedBy);

    // Managers can only create STAFF accounts.
    if (actor.role === "MANAGER" && data.role !== "STAFF") {
      throw new AppError("Managers can only create staff users.", 403);
    }

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

    await userActivityNotificationService.notify({
      type: "USER_CREATED",
      userId: user.id,
      userName: user.name,
    });
    return user;
  }

  // --------------------------------------------------
  // UPDATE USER
  // --------------------------------------------------

  async update(id: string, data: UpdateUserData, performedBy: string) {
    const actor = await this.getActor(performedBy);

    const existingUser = await userRepository.findById(id);

    if (!existingUser) {
      throw new AppError("User not found.", 404);
    }

    const isAdmin = actor.role === "ADMIN";
    const isManager = actor.role === "MANAGER";
    const isEditingSelf = performedBy === id;

    // Managers can edit themselves or STAFF users.
    if (isManager) {
      const canEdit = isEditingSelf || existingUser.role === "STAFF";

      if (!canEdit) {
        throw new AppError(
          "Managers can only edit themselves or staff users.",
          403,
        );
      }

      if (data.role !== undefined) {
        throw new AppError("Managers cannot change user roles.", 403);
      }
    }

    // Account status must be changed through updateStatus().
    if (data.isActive !== undefined) {
      throw new AppError(
        "Use the account status endpoint to change user status.",
        400,
      );
    }

    // ADMIN role cannot be changed.
    if (
      existingUser.role === "ADMIN" &&
      data.role !== undefined &&
      data.role !== "ADMIN"
    ) {
      throw new AppError("An admin's role cannot be changed.", 403);
    }

    // Only ADMIN can change roles.
    if (data.role !== undefined && !isAdmin) {
      throw new AppError("Only admins can change user roles.", 403);
    }

    // Prevent promoting users to ADMIN through update.
    if (data.role === "ADMIN" && existingUser.role !== "ADMIN") {
      throw new AppError(
        "Users cannot be promoted to admin through role updates.",
        403,
      );
    }

    // Check duplicate email.
    if (data.email && data.email !== existingUser.email) {
      const emailUser = await userRepository.findByEmail(data.email);

      if (emailUser && emailUser.id !== id) {
        throw new AppError("A user with this email already exists.", 409);
      }
    }

    // Explicitly allow only editable fields.
    const updateData: {
      name?: string;
      email?: string;
      role?: UserRole;
    } = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.email !== undefined) {
      updateData.email = data.email;
    }

    if (data.role !== undefined) {
      updateData.role = data.role;
    }

    const user = await userRepository.update(
      id,
      updateData as Parameters<typeof userRepository.update>[1],
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
      details: `Updated user ${user.email}.`,
    });

    // Role changed notification.
    if (data.role !== undefined && data.role !== existingUser.role) {
      await userActivityNotificationService.notify({
        type: "USER_ROLE_CHANGED",
        userId: user.id,
        userName: user.name,
        role: user.role,
      });
    } else if (
      (data.name !== undefined && data.name !== existingUser.name) ||
      (data.email !== undefined && data.email !== existingUser.email)
    ) {
      await userActivityNotificationService.notify({
        type: "USER_UPDATED",
        userId: user.id,
        userName: user.name,
      });
    }
    return user;
  }

  // --------------------------------------------------
  // UPDATE USER STATUS
  // --------------------------------------------------

  async updateStatus(id: string, isActive: boolean, performedBy: string) {
    const actor = await this.getActor(performedBy);

    const user = await userRepository.findById(id);

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    // Managers can only activate/deactivate STAFF users.
    if (actor.role === "MANAGER" && user.role !== "STAFF") {
      throw new AppError("Managers can only change staff account status.", 403);
    }

    // Prevent self-deactivation.
    if (user.id === performedBy && !isActive) {
      throw new AppError("You cannot deactivate your own account.", 400);
    }

    // Protect last active ADMIN.
    if (user.role === "ADMIN" && !isActive) {
      const adminCount = await userRepository.countAdmins();

      if (adminCount <= 1) {
        throw new AppError("The last active admin cannot be deactivated.", 400);
      }
    }

    const updatedUser = await userRepository.update(id, {
      isActive,
    } as Parameters<typeof userRepository.update>[1]);

    // Revoke refresh tokens when account is deactivated.
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

    await userActivityNotificationService.notify({
      type: "USER_UPDATED",
      userId: id,
      userName: user.name,
    });

    return updatedUser;
  }

  // --------------------------------------------------
  // DELETE USER
  // --------------------------------------------------

  async delete(id: string, performedBy: string) {
    const actor = await this.getActor(performedBy);

    // Only ADMIN can delete users.
    if (actor.role !== "ADMIN") {
      throw new AppError("Only admins can delete users.", 403);
    }

    const user = await userRepository.findById(id);

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    // Prevent self-deletion.
    if (id === performedBy) {
      throw new AppError("You cannot delete your own account.", 400);
    }

    // Protect last ADMIN.
    if (user.role === "ADMIN") {
      const adminCount = await userRepository.countAdmins();

      if (adminCount <= 1) {
        throw new AppError("The last admin cannot be deleted.", 400);
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
      details: `Deleted user ${user.email}.`,
    });

    await userActivityNotificationService.notify({
      type: "USER_DELETED",
      userName: user.name,
    });
  }
}

export default new UserService();
