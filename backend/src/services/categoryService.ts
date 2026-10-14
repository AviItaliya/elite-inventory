import categoryRepository from "../repositories/categoryRepository.js";
import AppError from "../utils/AppError.js";
import type { CreateCategoryInput } from "../validators/categoryValidation.js";
import auditLogService from "./auditLogService.js";
<<<<<<< HEAD
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

=======

class CategoryService {
  async create(data: CreateCategoryInput, userId: string) {
    const exists = await categoryRepository.findByName(data.name);
    if (exists) {
      throw new AppError("Category already exists.", 409);
    }
    const category = await categoryRepository.create(data);
>>>>>>> origin/main
    await auditLogService.createLog({
      user: {
        connect: {
          id: userId,
        },
      },
      action: "CREATE",
      entity: "Category",
      entityId: category.id,
<<<<<<< HEAD
      details: `Category "${category.name}" created successfully.`,
    });

    await this.notifyCategoryActivity("CATEGORY_CREATED", category.name);

=======
      details: `Category "${category.name}" created successfully.`
    });
>>>>>>> origin/main
    return category;
  }

  async findAll() {
<<<<<<< HEAD
    return categoryRepository.findAll();
=======
    return await categoryRepository.findAll();
>>>>>>> origin/main
  }

  async findById(id: string) {
    const category = await categoryRepository.findById(id);

    if (!category) {
      throw new AppError("Category not found.", 404);
    }
<<<<<<< HEAD

=======
>>>>>>> origin/main
    return category;
  }

  async update(id: string, data: CreateCategoryInput, userId: string) {
    await this.findById(id);
<<<<<<< HEAD

    const category = await categoryRepository.update(id, data);

=======
    const category = await categoryRepository.update(id, data);
>>>>>>> origin/main
    await auditLogService.createLog({
      user: {
        connect: {
          id: userId,
        },
      },
      action: "UPDATE",
      entity: "Category",
      entityId: category.id,
<<<<<<< HEAD
      details: `Category "${category.name}" updated successfully.`,
    });

    await this.notifyCategoryActivity("CATEGORY_UPDATED", category.name);

=======
      details: `Category "${category.name}" updated successfully.`
    });

>>>>>>> origin/main
    return category;
  }

  async delete(id: string, userId: string) {
    const category = await this.findById(id);
<<<<<<< HEAD

    const deletedCategory = await categoryRepository.delete(id);

=======
    const deletedCategory = await categoryRepository.delete(id);
>>>>>>> origin/main
    await auditLogService.createLog({
      user: {
        connect: {
          id: userId,
        },
      },
      action: "DELETE",
      entity: "Category",
      entityId: category.id,
<<<<<<< HEAD
      details: `Category "${category.name}" deleted successfully.`,
    });

    await this.notifyCategoryActivity("CATEGORY_DELETED", category.name);
=======
      details: `Category "${category.name}" deleted successfully.`
    })
>>>>>>> origin/main

    return deletedCategory;
  }
}
<<<<<<< HEAD

=======
>>>>>>> origin/main
export default new CategoryService();
