import type { TransactionType } from "../generated/prisma/enums.js";
import inventoryTransactionRepository from "../repositories/inventoryTransactionRepository.js";
import productRepository from "../repositories/productRepository.js";
import AppError from "../utils/AppError.js";
import auditLogService from "./auditLogService.js";
import { Prisma } from "../generated/prisma/client.js";

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

    if (!Number.isInteger(data.quantity) || data.quantity <= 0) {
      throw new AppError("Transaction quantity must be a positive integer.",400);
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
    const requestedPage = Number(query.page ?? 1);
    const requestedLimit = Number(query.limit ?? 10);      
    const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const limit = Number.isInteger(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 100) : 10;
    const type = query.type === "STOCK_IN" || query.type === "STOCK_OUT" ? query.type : undefined; 
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