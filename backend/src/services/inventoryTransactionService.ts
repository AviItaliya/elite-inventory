import type { TransactionType } from "../generated/prisma/enums.js";
<<<<<<< HEAD
import inventoryTransactionRepository from "../repositories/inventoryTransactionRepository.js";
import productRepository from "../repositories/productRepository.js";
import AppError from "../utils/AppError.js";
import auditLogService from "./auditLogService.js";
import { getIO } from "../config/socket.js";
=======

import inventoryTransactionRepository from "../repositories/inventoryTransactionRepository.js";
import productRepository from "../repositories/productRepository.js";

import AppError from "../utils/AppError.js";

import auditLogService from "./auditLogService.js";
>>>>>>> origin/main

class InventoryTransactionService {
  async createTransaction(
    data: {
      productId: string;
      type: TransactionType;
      quantity: number;
      remarks?: string;
    },
<<<<<<< HEAD
    userId: string,
  ) {
    // 1. Validate transaction type
    if (data.type !== "STOCK_IN" && data.type !== "STOCK_OUT") {
      throw new AppError(
        "Transaction type must be STOCK_IN or STOCK_OUT.",
        400,
      );
    }

    // 2. Validate quantity
    if (!Number.isSafeInteger(data.quantity) || data.quantity <= 0) {
      throw new AppError(
        "Transaction quantity must be a positive integer.",
        400,
      );
    }

    // 3. Check product
    const product = await productRepository.findById(data.productId);
=======
    userId: string
  ) {
    const product = await productRepository.findById(data.productId);

>>>>>>> origin/main
    if (!product) {
      throw new AppError("Product not found.", 404);
    }

<<<<<<< HEAD
    // 4. Preliminary stock validation
    // The repository performs the final atomic stock check.
=======
    if (data.quantity <= 0) {
      throw new AppError(
        "Transaction quantity must be greater than 0.",
        400
      );
    }

    if (data.type !== "STOCK_IN" && data.type !== "STOCK_OUT") {
      throw new AppError(
        "Transaction type must be STOCK_IN or STOCK_OUT.",
        400
      );
    }

>>>>>>> origin/main
    if (data.type === "STOCK_OUT" && product.quantity < data.quantity) {
      throw new AppError("Insufficient stock.", 400);
    }

<<<<<<< HEAD
    // 5. Create transaction and persistent notifications
    const result = await inventoryTransactionRepository.createWithStockUpdate({
      productId: data.productId,
      type: data.type,
      quantity: data.quantity,
      ...(data.remarks !== undefined ? { remarks: data.remarks } : {}),
    });
    const { transaction, product: updatedProduct, notifications } = result;

    // 6. Create audit log
    try {
      await auditLogService.createLog({
        user: {
          connect: {
            id: userId,
          },
        },
        action: "CREATE",
        entity: "InventoryTransaction",
        entityId: transaction.id,
        details: `Stock ${
          data.type === "STOCK_IN" ? "in" : "out"
        } transaction created for product "${updatedProduct.name}" with quantity ${
          data.quantity
        }.`,
      });
    } catch (error) {
      // Stock transaction has already committed.
      // Do not report the entire operation as failed.
      console.error("Inventory transaction audit log failed:", error);
    }

    // 7. Emit real-time events
    try {
      const io = getIO();
      // Notify inventory subscribers
      io.to("inventory:subscribers").emit("inventory:updated", {
        transactionId: transaction.id,
        productId: updatedProduct.id,
        productName: updatedProduct.name,
        type: data.type,
        quantity: data.quantity,
        updatedStock: updatedProduct.quantity,
        minStock: updatedProduct.minStock,
        timestamp: new Date().toISOString(),
      });

      // Send each persisted notification to its owner
      for (const notification of notifications) {
        io.to(`user:${notification.userId}`).emit(
          "notification:new",
          notification,
        );
      }

      // Temporary compatibility with existing frontend listeners.
      // Remove this event after migrating the frontend
      // to the persistent notification API.
      const hasLowStockNotification = notifications.some(
        (notification) => notification.type === "LOW_STOCK",
      );

      if (hasLowStockNotification) {
        io.to("role:ADMIN")
          .to("role:MANAGER")
          .emit("inventory:low-stock", {
            productId: updatedProduct.id,
            productName: updatedProduct.name,
            currentStock: updatedProduct.quantity,
            minStock: updatedProduct.minStock,
            message: `${updatedProduct.name} is running low on stock.`,
            timestamp: new Date().toISOString(),
          });
      }
    } catch (error) {
      // Database transaction is already committed.
      // Socket.IO errors must not reverse API success.
      console.error("Failed to emit inventory notifications:", error);
    }

    // 8. Preserve the existing API response shape
    return {
      transaction,
      product: updatedProduct,
    };
  }

  async getTransactions(query: {
    page?: string | number;
    limit?: string | number;
    type?: string;
    productId?: string;
  }) {
    const requestedPage = Number(query.page ?? 1);
    const requestedLimit = Number(query.limit ?? 10);
    const page =
      Number.isSafeInteger(requestedPage) && requestedPage > 0
        ? requestedPage
        : 1;
    const limit =
      Number.isSafeInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, 100)
        : 10;
=======
    const transaction =
      await inventoryTransactionRepository.createWithStockUpdate({
        productId: data.productId,
        type: data.type,
        quantity: data.quantity,
        remarks: data.remarks!,
      });

    await auditLogService.createLog({
      user: {
        connect: {
          id: userId,
        },
      },
      action: "CREATE",
      entity: "InventoryTransaction",
      entityId: transaction.transaction.id,
      details: `Stock ${
        data.type === "STOCK_IN" ? "in" : "out"
      } transaction created for product "${product.name}" with quantity ${
        data.quantity
      }.`,
    });

    return transaction;
  }

  async getTransactions(query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

>>>>>>> origin/main
    const type =
      query.type === "STOCK_IN" || query.type === "STOCK_OUT"
        ? query.type
        : undefined;
<<<<<<< HEAD
    const result = await inventoryTransactionRepository.findAll({
      page,
      limit,
      ...(query.productId !== undefined ? { productId: query.productId } : {}),
      ...(type !== undefined ? { type } : {}),
    });
=======

    const result = await inventoryTransactionRepository.findAll({
      page,
      limit,
      productId: query.productId,
      type,
    });

>>>>>>> origin/main
    return {
      transactions: result.transactions,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async getTransactionById(id: string) {
<<<<<<< HEAD
    const transaction = await inventoryTransactionRepository.findById(id);
    if (!transaction) {
      throw new AppError("Inventory transaction not found.", 404);
    }
    return transaction;
  }
}
export default new InventoryTransactionService();
=======
    const transaction =
      await inventoryTransactionRepository.findById(id);

    if (!transaction) {
      throw new AppError(
        "Inventory transaction not found.",
        404
      );
    }

    return transaction;
  }
}

export default new InventoryTransactionService();
>>>>>>> origin/main
