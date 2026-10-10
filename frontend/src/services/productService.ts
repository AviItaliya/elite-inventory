import api from "./api";

export interface Product {
    id: string;
    name: string;
    description: string;
    sku: string;
    price: string;
    quantity: number;
    minStock: number;
    categoryId: string;
    supplierId: string;
    category: {
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
    };
    supplier: {
        id: string;
        name: string;
        email: string;
        phone: string;
        createdAt: string;
        updatedAt: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface ProductsResponse {
    success: boolean;
    message: string;
    data: {
        products: Product[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            categoryId: string;
            sortBy: string;
            order: string;
        };
    };
}

interface CreateProductData {
    name: string;
    description: string;
    sku: string;
    price: number;
    quantity: number;
    minStock: number;
    categoryId: string;
    supplierId: string;

}

export const getProducts = async (page: number, limit: number, search: string, categoryId: string, supplierId: string, sortBy: string, order: string) => {
    const res = await api.get<ProductsResponse>(
        `/api/products/get-all`, {
            params: {
                page, limit, search, categoryId, supplierId, sortBy, order
            }, 
        }
    );
    return res.data.data;
};

export const createProduct = async (data: CreateProductData): Promise<Product> => {
    const res = await api.post (
        `/api/products/create`, data,  {
        }
    );
    return res.data.data;
};

export const getProductById = async (id: string): Promise<Product> => {
    const res = await api.get(
        `/api/products/${id}`
    );
    return res.data.data;
};

export const updateProduct = async (id: string, data: CreateProductData): Promise<Product> => {
    const res = await api.put(
        `/api/products/${id}`, data
    );
    return res.data.data;
}

export const deleteProduct = async (id: string): Promise<void> => {
    await api.delete(`/api/products/${id}`);
};

export const exportProducts = async (): Promise<Blob> => {
    const res = await api.get(
        "/api/products/export",
        {
            responseType: "blob",
        }
    );

    return res.data;
};

export const importProducts = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/api/products/import", formData);
    return res.data.data;
};

export const downloadProductTemplate = async (): Promise<Blob> => {
        const res = await api.get("/api/products/template", 
            {
                responseType: "blob",
            }
        );
        return res.data;
    };
