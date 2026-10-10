import categoryRepository from "../repositories/categoryRepository.js";
import AppError from "../utils/AppError.js";
import type { CreateCategoryInput } from "../validators/categoryValidation.js";
import auditLogService from "./auditLogService.js";

class CategoryService {
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
      details: `Category "${category.name}" created successfully.`
    });
    return category;
  }

  async findAll() {
    return await categoryRepository.findAll();
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
      details: `Category "${category.name}" updated successfully.`
    });

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
      details: `Category "${category.name}" deleted successfully.`
    })

    return deletedCategory;
  }
}
export default new CategoryService();
