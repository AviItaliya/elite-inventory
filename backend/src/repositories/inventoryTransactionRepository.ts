import prisma from "../config/prisma.js";
import type {
  InventoryTransaction,
  Prisma,
} from "../generated/prisma/client.js";

class InventoryTransactionRepository {
  async create(
    data: Prisma.InventoryTransactionCreateInput,
  ): Promise<InventoryTransaction> {
    return prisma.inventoryTransaction.create({
      data,
      include: {
        product: true,
      },
    });
  }

  async findAll(options: {
    page: number;
    limit: number;
    productId?: string;
    type?: "STOCK_IN" | "STOCK_OUT";
  }) {
    const { page, limit, productId, type } = options;
    const where: Prisma.InventoryTransactionWhereInput = {};
    if (productId) {
      where.productId = productId;
    }
    if (type) {
      where.type = type;
    }
    const [transactions, total] = await prisma.$transaction([
      prisma.inventoryTransaction.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.inventoryTransaction.count({
        where,
      }),
    ]);
    return {
      transactions,
      total,
    };
  }

  async findById(id: string) {
    return prisma.inventoryTransaction.findUnique({
      where: {
        id,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
    });
  }

  async createWithStockUpdate(data: {
    productId: string;
    type: "STOCK_IN" | "STOCK_OUT";
    quantity: number;
    remarks?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: {
          id: data.productId,
        },
      });

      if (!product) {
        throw new Error("Product not found.");
      }

      let newQuantity = product.quantity;

      if (data.type === "STOCK_IN") {
        newQuantity = product.quantity + data.quantity;
      }

      if (data.type === "STOCK_OUT") {
        if (product.quantity < data.quantity) {
          throw new Error("Insufficient stock.");
        }

        newQuantity = product.quantity - data.quantity;
      }

      const updatedProduct = await tx.product.update({
        where: {
          id: product.id,
        },
        data: {
          quantity: newQuantity,
        },
      });

      const transaction = await tx.inventoryTransaction.create({
        data: {
          product: {
            connect: {
              id: product.id,
            },
          },
          type: data.type,
          quantity: data.quantity,
          remarks: data.remarks ?? null,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },
      });

      return {
        transaction,
        product: updatedProduct,
      };
    });
  }
}

export default new InventoryTransactionRepository();
