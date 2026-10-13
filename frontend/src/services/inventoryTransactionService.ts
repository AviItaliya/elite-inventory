import api from "./api";

export type InventoryTransactionType = | "STOCK_IN" | "STOCK_OUT";

interface CreateInventoryTransactionData {
    productId: string;
    type: InventoryTransactionType;
    quantity: number;
    remarks: string;
}

interface CreateInventoryTransactionResponse {
    success: boolean;
    message: string;
    data: unknown;
}

export interface InventoryTransaction {
    id: string;
    productId: string;
    type: InventoryTransactionType;
    quantity: number;
    remarks: string;
    createdAt: string;
    product: {
        id: string;
        name: string;
        sku: string;
    };
}

interface InventoryTransactionResponse {
    success: boolean;
    message: string;
    data: {
        transactions: InventoryTransaction[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

export const createInventoryTransaction = async (data: CreateInventoryTransactionData) => {
    const res = await api.post<CreateInventoryTransactionResponse>(
        "/api/inventory-transactions", data
    );
    return res.data;
};

export const getInventoryTransactions = async (page: number = 1, limit: number = 10) => {
    const res = await api.get<InventoryTransactionResponse>("/api/inventory-transactions", {
        params: {
            page, limit
        }
    });
    return res.data.data;
};