import api from "./api";

export interface Supplier {
    id: string;
    name: string;
    email: string;
    phone: string;
    createdAt: string;
    updatedAt: string;
}

interface SuppliersResponse {
    success: boolean;
    message: string;
    data: Supplier[];
}

interface CreateSupplierData {
    name: string;
    email: string;
    phone: string;
}

export const getSuppliers = async (): Promise<Supplier[]> => {
    const res = await api.get<SuppliersResponse>(
        `/api/suppliers/get-all`
    );
    return res.data.data;
};

export const createSupplier = async (data: CreateSupplierData): Promise<Supplier> => {
    const res = await api.post("/api/suppliers/create", data);
    return res.data.data;
};

export const getSupplierById = async (id:string): Promise<Supplier> => {
    const res = await api.get(`/api/suppliers/${id}`);
    return res.data.data;
};

export const updateSupplier = async (id: string, data: {
    name: string;
    email: string;
    phone: string;
}): Promise<Supplier> => {
    const res = await api.put(`/api/suppliers/${id}`, data);
    return res.data.data;
};

export const deleteSupplier = async (id: string): Promise<void> => {
    await api.delete(`/api/suppliers/${id}`);
};
