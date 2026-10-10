import type { TransactionType } from "../generated/prisma/enums.js";

import inventoryTransactionRepository from "../repositories/inventoryTransactionRepository.js";
import productRepository from "../repositories/productRepository.js";

import AppError from "../utils/AppError.js";

import auditLogService from "./auditLogService.js";

class InventoryTransactionService {
  async createTransaction(
    data: {
      productId: string;
      type: TransactionType;
      quantity: number;
      remarks?: string;
    },
    userId: string
  ) {
    const product = await productRepository.findById(data.productId);

    if (!product) {
      throw new AppError("Product not found.", 404);
    }

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

    if (data.type === "STOCK_OUT" && product.quantity < data.quantity) {
      throw new AppError("Insufficient stock.", 400);
    }

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

    const type =
      query.type === "STOCK_IN" || query.type === "STOCK_OUT"
        ? query.type
        : undefined;

    const result = await inventoryTransactionRepository.findAll({
      page,
      limit,
      productId: query.productId,
      type,
    });

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