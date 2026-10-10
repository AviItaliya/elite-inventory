import prisma from "../config/prisma.js";
import type { Prisma, Supplier } from "../generated/prisma/client.js";

class SupplierRepository {
  async create(data: Prisma.SupplierCreateInput): Promise<Supplier> {
    return prisma.supplier.create({
      data,
    });
  }
  async findAll(): Promise<Supplier[]> {
    return prisma.supplier.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: string): Promise<Supplier | null> {
    return prisma.supplier.findUnique({
      where: {
        id,
      },
    });
  }

  async findByEmail(email: string): Promise<Supplier | null> {
    return prisma.supplier.findFirst({
      where: {
        email,
      },
    });
  }

  async update(
    id: string,
    data: Prisma.SupplierUpdateInput,
  ): Promise<Supplier> {
    return prisma.supplier.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: string): Promise<Supplier> {
    return prisma.supplier.delete({
      where: {
        id,
      },
    });
  }

  async count() {
    return prisma.supplier.count();
  }
}
export default new SupplierRepository();
