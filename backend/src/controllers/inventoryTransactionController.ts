import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import inventoryTransactionService from "../services/inventoryTransactionService.js";
import { sendResponse } from "../utils/response.js";

class InventoryTransactionController {
    create = asyncHandler(async (req:Request, res: Response) => {
        const {productId, type, quantity, remarks} = req.body;
        if(!productId) {
            throw new AppError("Product ID is required.", 400);
        }
        if(!type) {
            throw new AppError("Transaction type is required.", 400);
        }
        if(!quantity) {
            throw new AppError("Transaction quantity is required.", 400);
        }
        if(type !== "STOCK_IN" && type !== "STOCK_OUT") {
            throw new AppError("Transaction type must be STOCK_IN ot STOCK_OUT.", 400);
        }
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError("Authenticated user is required.", 401);
        }
        const transaction = await inventoryTransactionService.createTransaction({
            productId,
            type,
            quantity: Number(quantity),
            remarks
        }, userId);
        return sendResponse(res, {
            success: true,
            statusCode: 201,
            message: "Inventory transaction created successfully.",
            data: transaction
        });
    });

    findAll = asyncHandler(async (req:Request, res:Response) => {
        const result = await inventoryTransactionService.getTransactions(req.query);
        return sendResponse(res, {
            success: true,
            statusCode: 200,
            message: "Inventory transactions fetcjed successfully.",
            data: result
        });
    });

    findById = asyncHandler(async (req:Request, res:Response) => {
        const {id} = req.params;
        if(!id) {
            throw new AppError("Transaction ID is required.", 400);
        }
        const transaction = await inventoryTransactionService.getTransactionById(id as string);
        return sendResponse(res, {
            success: true,
            statusCode: 200,
            message: "Inventory transaction fetched successfully.",
            data: transaction
        });
    });

}

export default new InventoryTransactionController();