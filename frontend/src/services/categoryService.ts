import api from "./api";

export interface Category {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

interface CategoriesResponse {
    success: boolean;
    message: string;
    data: Category[];
}

interface CreateCategoryData {
    name: string;
}

export const getCategories = async (): Promise<Category[]> => {
    const res = await api.get<CategoriesResponse> (`/api/categories/get-all`);
    return res.data.data;
};

export const createCategory = async (data: CreateCategoryData): Promise<Category> => {
    const res = await api.post("/api/categories/create", data);
    return res.data.data;
};

export const getCategoriesById = async (id: string): Promise<Category> => {
    const res = await api.get(`/api/categories/${id}`);
    return res.data.data;
};

export const updateCategory = async (id: string, data: {name: string}): Promise<Category> => {
    const res = await api.put(`/api/categories/${id}`, data);
    return res.data.data;
};

export const deleteCategory = async (id:string): Promise<void> => {
    await api.delete(`/api/categories/${id}`);
};
