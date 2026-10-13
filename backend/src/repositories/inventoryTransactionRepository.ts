import prisma from "../config/prisma.js";
import {
  Prisma,
  type InventoryTransaction,
} from "../generated/prisma/client.js";
import activityNotificationService from "../services/activityNotificationService.js";
import notificationService from "../services/notificationService.js";
import AppError from "../utils/AppError.js";

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
      // 1. Validate transaction quantity
      if (!Number.isSafeInteger(data.quantity) || data.quantity <= 0) {
        throw new AppError("Quantity must be a positive integer.", 400);
      }

      // 2. Validate transaction type
      if (data.type !== "STOCK_IN" && data.type !== "STOCK_OUT") {
        throw new Error("Invalid transaction type.");
      }

      // 3. Find product
      const product = await tx.product.findUnique({
        where: {
          id: data.productId,
        },
      });

      if (!product) {
        throw new Error("Product not found.");
      }

      // 4. Calculate financial snapshots
      const purchasePrice = new Prisma.Decimal(product.purchasePrice);
      const sellingPrice = new Prisma.Decimal(product.price);
      const quantity = new Prisma.Decimal(data.quantity);
      const purchasePriceSnapshot = purchasePrice;
      const sellingPriceSnapshot =
        data.type === "STOCK_OUT" ? sellingPrice : null;
      const revenue =
        data.type === "STOCK_OUT" ? sellingPrice.mul(quantity) : null;
      const costOfGoods =
        data.type === "STOCK_OUT" ? purchasePrice.mul(quantity) : null;
      const grossProfit =
        data.type === "STOCK_OUT"
          ? sellingPrice.sub(purchasePrice).mul(quantity)
          : null;

      // 5. Atomic stock update
      let updatedProduct;
      if (data.type === "STOCK_IN") {
        updatedProduct = await tx.product.update({
          where: {
            id: data.productId,
          },
          data: {
            quantity: {
              increment: data.quantity,
            },
          },
        });
      } else {
        const result = await tx.product.updateMany({
          where: {
            id: data.productId,
            quantity: {
              gte: data.quantity,
            },
          },
          data: {
            quantity: {
              decrement: data.quantity,
            },
          },
        });

        if (result.count === 0) {
          const currentProduct = await tx.product.findUnique({
            where: {
              id: data.productId,
            },
            select: {
              quantity: true,
            },
          });

          if (!currentProduct) {
            throw new AppError("Product not found.", 404);
          }

          throw new AppError(
            `Insufficient stock. Available: ${currentProduct.quantity}, Requested: ${data.quantity}.`,
            400,
          );
        }

        updatedProduct = await tx.product.findUniqueOrThrow({
          where: {
            id: data.productId,
          },
        });
      }

      // 6. Calculate previous stock
      const previousStock =
        data.type === "STOCK_IN"
          ? updatedProduct.quantity - data.quantity
          : updatedProduct.quantity + data.quantity;

      // 7. Check whether stock crossed minimum threshold
      const shouldNotify =
        data.type === "STOCK_OUT" &&
        previousStock > updatedProduct.minStock &&
        updatedProduct.quantity <= updatedProduct.minStock;

      // 8. Create inventory transaction
      const transaction = await tx.inventoryTransaction.create({
        data: {
          product: {
            connect: {
              id: data.productId,
            },
          },
          type: data.type,
          quantity: data.quantity,
          purchasePriceSnapshot,
          sellingPriceSnapshot,
          revenue,
          costOfGoods,
          grossProfit,
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

      // 9. Create activity notifications inside the transaction

      const activityType = data.type === "STOCK_IN" ? "STOCK_IN" : "STOCK_OUT";

      const activityTitle =
        data.type === "STOCK_IN" ? "Stock Added" : "Stock Removed";

      const activityMessage =
        data.type === "STOCK_IN"
          ? `${data.quantity} units of ${updatedProduct.name} were added. Current stock: ${updatedProduct.quantity}.`
          : `${data.quantity} units of ${updatedProduct.name} were removed. Current stock: ${updatedProduct.quantity}.`;

      const activityNotifications =
        await activityNotificationService.createActivityNotifications(
          {
            type: activityType,
            title: activityTitle,
            message: activityMessage,
            recipientRoles: ["ADMIN", "MANAGER"],
            productId: updatedProduct.id,
            currentStock: updatedProduct.quantity,
            minStock: updatedProduct.minStock,
          },
          tx,
        );

      // 10. Preserve existing low-stock notifications

      let lowStockNotifications: Awaited<
        ReturnType<typeof notificationService.createLowStockNotifications>
      > = [];

      if (shouldNotify && updatedProduct.quantity > 0) {
        lowStockNotifications =
          await notificationService.createLowStockNotifications(
            {
              productId: updatedProduct.id,
              productName: updatedProduct.name,
              currentStock: updatedProduct.quantity,
              minStock: updatedProduct.minStock,
            },
            tx,
          );
      }

      // 11. Create out-of-stock notifications when stock reaches zero

      let outOfStockNotifications: typeof activityNotifications = [];

      if (
        data.type === "STOCK_OUT" &&
        previousStock > 0 &&
        updatedProduct.quantity === 0
      ) {
        outOfStockNotifications =
          await activityNotificationService.createActivityNotifications(
            {
              type: "OUT_OF_STOCK",
              title: "Out of Stock Alert",
              message: `${updatedProduct.name} is now out of stock.`,
              recipientRoles: ["ADMIN", "MANAGER"],
              productId: updatedProduct.id,
              currentStock: 0,
              minStock: updatedProduct.minStock,
            },
            tx,
          );
      }

      // 12. Combine notifications

      const notifications = [
        ...activityNotifications,
        ...lowStockNotifications,
        ...outOfStockNotifications,
      ];

      // 13. Return transaction result
      return {
        transaction,
        product: updatedProduct,
        notifications,
      };
    });
  }
}
export default new InventoryTransactionRepository();
