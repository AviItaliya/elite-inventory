import categoryRepository from "../repositories/categoryRepository.js";
import AppError from "../utils/AppError.js";
import type { CreateCategoryInput } from "../validators/categoryValidation.js";
import auditLogService from "./auditLogService.js";
import activityNotificationService from "./activityNotificationService.js";

type CategoryActivityType =
  | "CATEGORY_CREATED"
  | "CATEGORY_UPDATED"
  | "CATEGORY_DELETED";

class CategoryService {
  private async notifyCategoryActivity(
    type: CategoryActivityType,
    categoryName: string,
  ) {
    const titles = {
      CATEGORY_CREATED: "New Category Added",
      CATEGORY_UPDATED: "Category Updated",
      CATEGORY_DELETED: "Category Deleted",
    };

    const messages = {
      CATEGORY_CREATED: `New category "${categoryName}" was created.`,
      CATEGORY_UPDATED: `Category "${categoryName}" was updated.`,
      CATEGORY_DELETED: `Category "${categoryName}" was deleted.`,
    };

    const notifications =
      await activityNotificationService.createActivityNotifications({
        type,
        title: titles[type],
        message: messages[type],
        recipientRoles: ["ADMIN", "MANAGER"],
      });

    activityNotificationService.emitNotifications(notifications);
  }

  async create(data: CreateCategoryInput, userId: string) {
    const exists = await categoryRepository.findByName(data.name);

    if (exists) {
      throw new AppError("Category already exists.", 409);
    }

    const category = await categoryRepository.create(data);

    await auditLogService.createLog({
      user: {
        connect: {
          id: userId,
        },
      },
      action: "CREATE",
      entity: "Category",
      entityId: category.id,
      details: `Category "${category.name}" created successfully.`,
    });

    await this.notifyCategoryActivity("CATEGORY_CREATED", category.name);

    return category;
  }

  async findAll() {
    return categoryRepository.findAll();
  }

  async findById(id: string) {
    const category = await categoryRepository.findById(id);

    if (!category) {
      throw new AppError("Category not found.", 404);
    }

    return category;
  }

  async update(id: string, data: CreateCategoryInput, userId: string) {
    await this.findById(id);

    const category = await categoryRepository.update(id, data);

    await auditLogService.createLog({
      user: {
        connect: {
          id: userId,
        },
      },
      action: "UPDATE",
      entity: "Category",
      entityId: category.id,
      details: `Category "${category.name}" updated successfully.`,
    });

    await this.notifyCategoryActivity("CATEGORY_UPDATED", category.name);

    return category;
  }

  async delete(id: string, userId: string) {
    const category = await this.findById(id);

    const deletedCategory = await categoryRepository.delete(id);

    await auditLogService.createLog({
      user: {
        connect: {
          id: userId,
        },
      },
      action: "DELETE",
      entity: "Category",
      entityId: category.id,
      details: `Category "${category.name}" deleted successfully.`,
    });

    await this.notifyCategoryActivity("CATEGORY_DELETED", category.name);

    return deletedCategory;
  }
}

export default new CategoryService();
