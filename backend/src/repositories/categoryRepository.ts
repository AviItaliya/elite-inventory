import prisma from "../config/prisma.js";
import { Prisma, type Category } from "../generated/prisma/client.js";

class CategoryRepository {
  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return prisma.category.create({
      data,
    });
  }
  async findByName(name: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: {
        name,
      },
    });
  }

  async findAll(): Promise<Category[]> {
    return prisma.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: {
        id,
      },
    });
  }

  async update(
    id: string,
    data: Prisma.CategoryUpdateInput,
  ): Promise<Category> {
    return prisma.category.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: string): Promise<Category> {
    return prisma.category.delete({
      where: {
        id,
      },
    });
  }

  async count() {
    return prisma.category.count();
  }
}
export default new CategoryRepository();
